import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ingestRiskEventTransactional,
  resolveOrganizationSupplierIds,
} from '@/lib/risk-pipeline';
import { getServerEnv } from '@/lib/env';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
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
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const respond = (
    status: number,
    payload: Record<string, string | number>,
    options?: {
      level?: 'error' | 'info' | 'warn';
      message?: string;
      metadata?: Record<string, unknown>;
    },
  ) => {
    const response = NextResponse.json(payload, { status });
    response.headers.set('x-request-id', requestLog.requestId);
    logRequestResponse(requestLog, {
      status,
      level: options?.level,
      message: options?.message ?? 'Monitoring webhook handled.',
      metadata: options?.metadata,
    });
    return response;
  };

  const env = getServerEnv();
  const secret = env.MONITORING_WEBHOOK_SECRET;

  if (!secret) {
    return respond(
      500,
      { error: 'MONITORING_WEBHOOK_SECRET is not configured' },
      {
        level: 'error',
        message: 'Monitoring webhook misconfigured.',
      },
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
    return respond(401, { error: 'Invalid signature' }, { level: 'warn' });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return respond(400, { error: 'Invalid JSON body' }, { level: 'warn' });
  }

  const parsed = monitoringWebhookSchema
    .omit({ hmac_signature: true })
    .safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Validation failed.';
    return respond(400, { error: message }, { level: 'warn' });
  }

  const rawOrgId = request.headers.get('x-org-id') ?? '';
  const orgIdParsed = orgHeaderSchema.safeParse(rawOrgId);
  if (!orgIdParsed.success) {
    return respond(
      400,
      { error: 'x-org-id header must be a valid organization UUID' },
      { level: 'warn' },
    );
  }

  const organizationId = orgIdParsed.data;
  const supplierResolution = await resolveOrganizationSupplierIds(
    organizationId,
    parsed.data.supplier_ids ?? [],
  );

  if (supplierResolution.invalidSupplierIds.length > 0) {
    return respond(
      400,
      {
        error:
          'One or more supplier_ids are invalid for the provided organization.',
      },
      {
        level: 'warn',
        metadata: {
          invalid_supplier_ids: supplierResolution.invalidSupplierIds.length,
          organization_id: organizationId,
        },
      },
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

    return respond(
      201,
      {
        id: result.riskEventId,
        alerts_created: result.alertsCreated,
        scores_inserted: result.scoresInserted,
      },
      {
        message: 'Monitoring webhook ingested successfully.',
        metadata: {
          alerts_created: result.alertsCreated,
          organization_id: organizationId,
          risk_event_id: result.riskEventId,
          scores_inserted: result.scoresInserted,
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Risk pipeline transaction failed';
    return respond(
      500,
      { error: message },
      {
        level: 'error',
        metadata: {
          organization_id: organizationId,
        },
      },
    );
  }
}
