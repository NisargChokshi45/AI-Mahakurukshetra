import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createDisruptionsForSuppliers,
  runRiskPipelineForEvent,
} from '@/lib/risk-pipeline';
import { getServerEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { monitoringWebhookSchema } from '@/lib/validations/risk';

const orgHeaderSchema = z.string().uuid();

function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const env = getServerEnv();
  const secret = env.MONITORING_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: 'MONITORING_WEBHOOK_SECRET is not configured' },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-hub-signature-256') ?? '';
  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const receivedHex = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : '';

  if (!receivedHex || !timingSafeCompare(expectedHex, receivedHex)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = monitoringWebhookSchema
    .omit({ hmac_signature: true })
    .safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Validation failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const rawOrgId = request.headers.get('x-org-id') ?? '';
  const orgIdParsed = orgHeaderSchema.safeParse(rawOrgId);
  if (!orgIdParsed.success) {
    return NextResponse.json(
      { error: 'x-org-id header must be a valid organization UUID' },
      { status: 400 },
    );
  }

  const organizationId = orgIdParsed.data;
  const admin = createAdminClient();

  const { data: newEvent, error: insertError } = await admin
    .from('risk_events')
    .insert({
      organization_id: organizationId,
      title: parsed.data.title,
      event_type: parsed.data.event_type,
      severity: parsed.data.severity,
      source: parsed.data.source,
      source_url: parsed.data.source_url || null,
      summary: parsed.data.summary,
      detected_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError || !newEvent) {
    return NextResponse.json(
      { error: 'Failed to persist risk event' },
      { status: 500 },
    );
  }

  const supplierIds = parsed.data.supplier_ids ?? [];

  try {
    await createDisruptionsForSuppliers({
      organizationId,
      riskEventId: newEvent.id,
      supplierIds,
      title: parsed.data.title,
      impactSummary: parsed.data.summary,
    });

    const pipelineResult = await runRiskPipelineForEvent({
      organizationId,
      riskEventId: newEvent.id,
      eventType: parsed.data.event_type,
      severity: parsed.data.severity,
      eventTitle: parsed.data.title,
      eventSummary: parsed.data.summary,
      supplierIds,
      isNewEvent: true,
      ingestionSource: 'monitoring_webhook',
      actorUserId: null,
    });

    return NextResponse.json(
      {
        id: newEvent.id,
        alerts_created: pipelineResult.alertsCreated,
        scores_inserted: pipelineResult.scoresInserted,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Risk pipeline failed after event creation' },
      { status: 500 },
    );
  }
}
