import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ingestRiskEventTransactional,
  resolveOrganizationSupplierIds,
} from '@/lib/risk-pipeline';
import { getServerEnv } from '@/lib/env';
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
  const supplierResolution = await resolveOrganizationSupplierIds(
    organizationId,
    parsed.data.supplier_ids ?? [],
  );

  if (supplierResolution.invalidSupplierIds.length > 0) {
    return NextResponse.json(
      {
        error:
          'One or more supplier_ids are invalid for the provided organization.',
      },
      { status: 400 },
    );
  }

  const validatedSupplierIds = supplierResolution.validSupplierIds;

  try {
    const result = await ingestRiskEventTransactional({
      organizationId,
      title: parsed.data.title,
      eventType: parsed.data.event_type,
      severity: parsed.data.severity,
      source: parsed.data.source,
      sourceUrl: parsed.data.source_url || null,
      summary: parsed.data.summary,
      supplierIds: validatedSupplierIds,
      ingestionSource: 'monitoring_webhook',
      actorUserId: null,
      riskEventId: null,
    });

    return NextResponse.json(
      {
        id: result.riskEventId,
        alerts_created: result.alertsCreated,
        scores_inserted: result.scoresInserted,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Risk pipeline transaction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
