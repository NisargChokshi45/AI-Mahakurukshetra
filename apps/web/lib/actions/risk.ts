'use server';

import { redirect } from 'next/navigation';
import {
  createDisruptionsForSuppliers,
  runRiskPipelineForEvent,
} from '@/lib/risk-pipeline';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import {
  createRiskEventSchema,
  riskEventPayloadSchema,
  updateRiskEventSchema,
} from '@/lib/validations/risk';

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getErrorRedirect(pathname: string, message: string): string {
  return `${pathname}?error=${encodeURIComponent(message)}`;
}

function parseSupplierIds(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
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

async function runCreateFlow(
  organizationId: string,
  userId: string,
  payload: ReturnType<typeof readRiskEventPayload>,
): Promise<void> {
  const parsed = createRiskEventSchema.safeParse({
    ...payload,
    supplier_ids:
      payload.supplier_ids.length > 0 ? payload.supplier_ids : undefined,
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? 'Validation failed. Check all fields.';
    redirect(getErrorRedirect('/risk-events/new', message));
  }

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
      created_by: userId,
      detected_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError || !newEvent) {
    redirect(
      getErrorRedirect('/risk-events/new', 'Failed to save risk event.'),
    );
  }

  try {
    const supplierIds = parsed.data.supplier_ids ?? [];
    await createDisruptionsForSuppliers({
      organizationId,
      riskEventId: newEvent.id,
      supplierIds,
      title: parsed.data.title,
      impactSummary: parsed.data.summary,
    });

    await runRiskPipelineForEvent({
      organizationId,
      riskEventId: newEvent.id,
      eventType: parsed.data.event_type,
      severity: parsed.data.severity,
      eventTitle: parsed.data.title,
      eventSummary: parsed.data.summary,
      supplierIds,
      isNewEvent: true,
      ingestionSource: 'manual_ingestion',
      actorUserId: userId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Risk scoring pipeline failed. Please retry.';
    redirect(getErrorRedirect('/risk-events/new', message));
  }
}

type DisruptionSupplierRow = {
  supplier_id: string | null;
};

async function runUpdateFlow(
  organizationId: string,
  userId: string,
  payload: ReturnType<typeof readRiskEventPayload>,
  riskEventId: string,
): Promise<void> {
  const parsed = updateRiskEventSchema.safeParse({
    ...payload,
    supplier_ids:
      payload.supplier_ids.length > 0 ? payload.supplier_ids : undefined,
    risk_event_id: riskEventId,
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? 'Validation failed. Check all fields.';
    redirect(getErrorRedirect('/risk-events/new', message));
  }

  const admin = createAdminClient();

  const { data: existingEvent, error: eventLookupError } = await admin
    .from('risk_events')
    .select('id')
    .eq('id', parsed.data.risk_event_id)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (eventLookupError || !existingEvent) {
    redirect(
      getErrorRedirect(
        '/risk-events/new',
        'Risk event not found for this organization.',
      ),
    );
  }

  const { data: disruptionRows } = await admin
    .from('disruptions')
    .select('supplier_id')
    .eq('organization_id', organizationId)
    .eq('risk_event_id', parsed.data.risk_event_id);

  const previousSupplierIds = (disruptionRows ?? [])
    .map((row) => (row as DisruptionSupplierRow).supplier_id)
    .filter((supplierId): supplierId is string => Boolean(supplierId));

  const { error: updateError } = await admin
    .from('risk_events')
    .update({
      title: parsed.data.title,
      event_type: parsed.data.event_type,
      severity: parsed.data.severity,
      source: parsed.data.source,
      source_url: parsed.data.source_url || null,
      summary: parsed.data.summary,
      detected_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.risk_event_id)
    .eq('organization_id', organizationId);

  if (updateError) {
    redirect(
      getErrorRedirect(
        '/risk-events/new',
        'Failed to update existing risk event.',
      ),
    );
  }

  const { error: deleteDisruptionsError } = await admin
    .from('disruptions')
    .delete()
    .eq('organization_id', organizationId)
    .eq('risk_event_id', parsed.data.risk_event_id);

  if (deleteDisruptionsError) {
    redirect(
      getErrorRedirect(
        '/risk-events/new',
        'Failed to refresh disruption links for risk event.',
      ),
    );
  }

  try {
    const nextSupplierIds = parsed.data.supplier_ids ?? [];
    await createDisruptionsForSuppliers({
      organizationId,
      riskEventId: parsed.data.risk_event_id,
      supplierIds: nextSupplierIds,
      title: parsed.data.title,
      impactSummary: parsed.data.summary,
    });

    const allImpactedSupplierIds = Array.from(
      new Set([...previousSupplierIds, ...nextSupplierIds]),
    );

    await runRiskPipelineForEvent({
      organizationId,
      riskEventId: parsed.data.risk_event_id,
      eventType: parsed.data.event_type,
      severity: parsed.data.severity,
      eventTitle: parsed.data.title,
      eventSummary: parsed.data.summary,
      supplierIds: allImpactedSupplierIds,
      isNewEvent: false,
      ingestionSource: 'manual_ingestion',
      actorUserId: userId,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Risk scoring pipeline failed during update.';
    redirect(getErrorRedirect('/risk-events/new', message));
  }
}

export async function createRiskEventAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const organizationId = user.app_metadata?.org_id as string | undefined;
  if (!organizationId) {
    redirect(
      getErrorRedirect(
        '/risk-events/new',
        'Organization context missing. Contact support.',
      ),
    );
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
    redirect(getErrorRedirect('/risk-events/new', message));
  }

  if (riskEventId) {
    await runUpdateFlow(organizationId, user.id, payload, riskEventId);
    redirect('/risk-events?updated=1');
  }

  await runCreateFlow(organizationId, user.id, payload);
  redirect('/risk-events?success=1');
}
