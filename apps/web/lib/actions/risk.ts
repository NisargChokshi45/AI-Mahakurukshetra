'use server';

import { redirect } from 'next/navigation';
import {
  ingestRiskEventTransactional,
  resolveOrganizationSupplierIds,
} from '@/lib/risk-pipeline';
import { requireOrganizationContext } from '@/lib/auth/session';
import { setFlash } from '@/lib/flash';
import type { AppRole } from '@/lib/validations/auth';
import {
  createRiskEventSchema,
  riskEventPayloadSchema,
  updateRiskEventSchema,
} from '@/lib/validations/risk';

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function parseSupplierIds(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
}

const RISK_EVENT_WRITE_ROLES: AppRole[] = ['owner', 'admin', 'risk_manager'];

function canManageRiskEvents(role: AppRole): boolean {
  return RISK_EVENT_WRITE_ROLES.includes(role);
}

function readRiskEventPayload(formData: FormData) {
  const sourceUrl = getString(formData, 'source_url');

  return {
    title: getString(formData, 'title'),
    event_type: getString(formData, 'event_type'),
    severity: getString(formData, 'severity'),
    source: getString(formData, 'source'),
    source_url: sourceUrl || undefined,
    summary: getString(formData, 'summary'),
    supplier_ids: parseSupplierIds(getString(formData, 'supplier_ids')),
  };
}

async function runIngestionFlow(
  organizationId: string,
  userId: string,
  payload: ReturnType<typeof readRiskEventPayload>,
  validatedSupplierIds: string[],
  riskEventId?: string,
): Promise<void> {
  const parsed = (
    riskEventId ? updateRiskEventSchema : createRiskEventSchema
  ).safeParse({
    ...payload,
    supplier_ids:
      validatedSupplierIds.length > 0 ? validatedSupplierIds : undefined,
    ...(riskEventId ? { risk_event_id: riskEventId } : {}),
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? 'Validation failed. Check all fields.',
    );
  }

  await ingestRiskEventTransactional({
    organizationId,
    title: parsed.data.title,
    eventType: parsed.data.event_type,
    severity: parsed.data.severity,
    source: parsed.data.source,
    sourceUrl: parsed.data.source_url || null,
    summary: parsed.data.summary,
    supplierIds: parsed.data.supplier_ids ?? [],
    ingestionSource: 'manual_ingestion',
    actorUserId: userId,
    riskEventId: riskEventId ?? null,
  });
}

export async function createRiskEventAction(formData: FormData): Promise<void> {
  const context = await requireOrganizationContext();
  const organizationId = context.organization.organizationId;

  if (!canManageRiskEvents(context.organization.role)) {
    await setFlash({
      error: 'You are not authorized to create or update risk events.',
    });
    redirect('/risk-events/new');
  }

  const payload = readRiskEventPayload(formData);
  const riskEventId = getString(formData, 'risk_event_id');

  const payloadParsed = riskEventPayloadSchema.safeParse({
    ...payload,
    supplier_ids:
      payload.supplier_ids.length > 0 ? payload.supplier_ids : undefined,
  });

  if (!payloadParsed.success) {
    const message =
      payloadParsed.error.issues[0]?.message ??
      'Validation failed. Check all fields.';
    await setFlash({ error: message });
    redirect('/risk-events/new');
  }

  const supplierResolution = await resolveOrganizationSupplierIds(
    organizationId,
    payloadParsed.data.supplier_ids ?? [],
  );

  if (supplierResolution.invalidSupplierIds.length > 0) {
    await setFlash({
      error:
        'One or more selected suppliers are invalid for your organization.',
    });
    redirect('/risk-events/new');
  }

  const validatedSupplierIds = supplierResolution.validSupplierIds;

  try {
    if (riskEventId) {
      await runIngestionFlow(
        organizationId,
        context.user.id,
        payload,
        validatedSupplierIds,
        riskEventId,
      );
      await setFlash({
        message: 'Risk event updated and scoring pipeline re-run successfully.',
      });
      redirect('/risk-events');
    }

    await runIngestionFlow(
      organizationId,
      context.user.id,
      payload,
      validatedSupplierIds,
    );
    await setFlash({
      message:
        'Risk event created and scoring pipeline triggered successfully.',
    });
    redirect('/risk-events');
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Risk event ingestion failed. Please retry.';
    await setFlash({ error: message });
    redirect('/risk-events/new');
  }
}
