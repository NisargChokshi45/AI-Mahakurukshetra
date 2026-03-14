/**
 * AI Supplier Summary API
 * Generate AI-powered supplier health summaries
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateSupplierSummary } from '@/lib/ai/client';
import { createClient } from '@/lib/supabase/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

const requestSchema = z.object({
  supplierId: z.string().uuid(),
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
        message: 'Unauthorized AI supplier summary request.',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { supplierId } = requestSchema.parse(body);

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

    // Fetch supplier data
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select(
        `
        id,
        name,
        tier,
        status,
        current_risk_score,
        country,
        risk_scores (
          created_at,
          composite_score
        )
      `,
      )
      .eq('id', supplierId)
      .eq('organization_id', orgId)
      .single();

    if (supplierError || !supplier) {
      logRequestResponse(requestLog, {
        status: 404,
        level: 'warn',
        message: 'Supplier not found.',
        metadata: { user_id: user.id, org_id: orgId, supplier_id: supplierId },
      });
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 },
      );
    }

    // Get recent risk events affecting this supplier
    const { data: recentEvents } = await supabase
      .from('disruptions')
      .select(
        `
        risk_events (
          title,
          event_type
        )
      `,
      )
      .eq('supplier_id', supplierId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Get open incidents
    const { data: incidents } = await supabase
      .from('incidents')
      .select('id')
      .eq('supplier_id', supplierId)
      .eq('organization_id', orgId)
      .in('status', ['new', 'investigating', 'mitigating']);

    // Generate AI summary
    const result = await generateSupplierSummary(orgId, {
      supplierName: supplier.name,
      tier: supplier.tier,
      currentRiskScore: supplier.current_risk_score,
      status: supplier.status,
      country: supplier.country,
      recentEvents:
        recentEvents
          ?.map(
            (d) => (d.risk_events as { title: string }[] | null)?.[0]?.title,
          )
          .filter((t): t is string => Boolean(t)) || [],
      openIncidents: incidents?.length || 0,
    });

    if (!result.success) {
      logRequestResponse(requestLog, {
        status: 503,
        level: 'warn',
        message: 'AI generation failed.',
        metadata: {
          org_id: orgId,
          user_id: user.id,
          supplier_id: supplierId,
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
      message: 'Supplier summary generated successfully.',
      metadata: {
        org_id: orgId,
        user_id: user.id,
        supplier_id: supplierId,
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
      message: 'Supplier summary API error.',
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
