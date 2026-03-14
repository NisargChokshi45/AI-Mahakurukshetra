/**
 * AI Dashboard Insights API
 * Generate AI-powered executive insights for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDashboardInsights } from '@/lib/ai/client';
import { createClient } from '@/lib/supabase/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

export async function POST(request: NextRequest) {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logRequestResponse(requestLog, {
        status: 401,
        level: 'warn',
        message: 'Unauthorized AI insights request.',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's org
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      logRequestResponse(requestLog, {
        status: 403,
        level: 'warn',
        message: 'No organization found for user.',
        metadata: { user_id: user.id },
      });
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 403 },
      );
    }

    const orgId = membership.organization_id;

    // Gather dashboard data
    const [
      { count: totalSuppliers },
      { count: atRiskSuppliers },
      { count: activeIncidents },
      { data: recentEvents },
      { data: topRiskSuppliers },
    ] = await Promise.all([
      // Total suppliers
      supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active'),

      // At-risk suppliers (score >= 60)
      supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .gte('current_risk_score', 60),

      // Active incidents
      supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['new', 'investigating', 'mitigating']),

      // Recent risk events
      supabase
        .from('risk_events')
        .select('title, event_type, severity')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(5),

      // Top risk suppliers
      supabase
        .from('suppliers')
        .select('name, current_risk_score')
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .order('current_risk_score', { ascending: false })
        .limit(5),
    ]);

    // Generate AI insights
    const result = await generateDashboardInsights(orgId, {
      totalSuppliers: totalSuppliers || 0,
      atRiskSuppliers: atRiskSuppliers || 0,
      activeIncidents: activeIncidents || 0,
      recentEvents:
        recentEvents?.map((e) => ({
          type: e.event_type,
          severity: e.severity,
          title: e.title,
        })) || [],
      topRiskSuppliers:
        topRiskSuppliers?.map((s) => ({
          name: s.name,
          score: s.current_risk_score,
        })) || [],
    });

    if (!result.success) {
      logRequestResponse(requestLog, {
        status: 503,
        level: 'warn',
        message: 'AI generation failed.',
        metadata: {
          org_id: orgId,
          user_id: user.id,
          error: result.error.message,
          error_code: result.error.code,
          provider: result.error.provider,
        },
      });

      return NextResponse.json(
        {
          error: result.error.message,
          errorCode: result.error.code,
          provider: result.error.provider,
        },
        { status: 503 },
      );
    }

    logRequestResponse(requestLog, {
      status: 200,
      message: 'Dashboard insights generated successfully.',
      metadata: {
        org_id: orgId,
        user_id: user.id,
        provider: result.data.provider,
        model: result.data.model,
      },
    });

    return NextResponse.json({
      insights: result.data.content,
      provider: result.data.provider,
      model: result.data.model,
    });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Dashboard insights API error.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
