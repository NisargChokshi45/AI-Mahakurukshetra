/**
 * AI Risk Event Summary API
 * Generate AI-powered risk event analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRiskEventSummary } from '@/lib/ai/client';
import { createClient } from '@/lib/supabase/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

const requestSchema = z.object({
  riskEventId: z.string().uuid(),
});

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
        message: 'Unauthorized AI risk event summary request.',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { riskEventId } = requestSchema.parse(body);

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

    // Fetch risk event data
    const { data: event, error: eventError } = await supabase
      .from('risk_events')
      .select(
        `
        id,
        title,
        description,
        event_type,
        severity,
        affected_regions
      `,
      )
      .eq('id', riskEventId)
      .eq('organization_id', orgId)
      .single();

    if (eventError || !event) {
      logRequestResponse(requestLog, {
        status: 404,
        level: 'warn',
        message: 'Risk event not found.',
        metadata: {
          user_id: user.id,
          org_id: orgId,
          risk_event_id: riskEventId,
        },
      });
      return NextResponse.json(
        { error: 'Risk event not found' },
        { status: 404 },
      );
    }

    // Count impacted suppliers
    const { count: supplierCount } = await supabase
      .from('disruptions')
      .select('*', { count: 'exact', head: true })
      .eq('risk_event_id', riskEventId)
      .eq('organization_id', orgId);

    // Generate AI summary
    const result = await generateRiskEventSummary(orgId, {
      eventType: event.event_type,
      severity: event.severity,
      title: event.title,
      description: event.description || '',
      affectedRegions: event.affected_regions || [],
      impactedSuppliers: supplierCount || 0,
    });

    if (!result.success) {
      logRequestResponse(requestLog, {
        status: 503,
        level: 'warn',
        message: 'AI generation failed.',
        metadata: {
          org_id: orgId,
          user_id: user.id,
          risk_event_id: riskEventId,
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
      message: 'Risk event summary generated successfully.',
      metadata: {
        org_id: orgId,
        user_id: user.id,
        risk_event_id: riskEventId,
        provider: result.data.provider,
        model: result.data.model,
      },
    });

    return NextResponse.json({
      summary: result.data.content,
      provider: result.data.provider,
      model: result.data.model,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logRequestResponse(requestLog, {
        status: 400,
        level: 'warn',
        message: 'Invalid request.',
        metadata: {
          error: error.issues,
        },
      });
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 },
      );
    }

    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Risk event summary API error.',
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
