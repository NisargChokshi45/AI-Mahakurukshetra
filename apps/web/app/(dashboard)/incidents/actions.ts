'use server';

import { redirect } from 'next/navigation';
import { requireOrganizationContext } from '@/lib/auth/session';
import { setFlash } from '@/lib/flash';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/validations/auth';
import {
  createIncidentSchema,
  resolveIncidentSchema,
} from '@/lib/validations/incidents';

const INCIDENT_WRITE_ROLES: AppRole[] = ['owner', 'admin', 'risk_manager'];

function canManageIncidents(role: AppRole): boolean {
  return INCIDENT_WRITE_ROLES.includes(role);
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function createIncidentAction(formData: FormData): Promise<void> {
  const context = await requireOrganizationContext();
  if (!canManageIncidents(context.organization.role)) {
    await setFlash({ error: 'You are not authorized to create incidents.' });
    redirect('/incidents');
  }

  const parsed = createIncidentSchema.safeParse({
    priority: getString(formData, 'priority'),
    summary: getString(formData, 'summary'),
    title: getString(formData, 'title'),
  });

  if (!parsed.success) {
    await setFlash({
      error: parsed.error.issues[0]?.message ?? 'Incident validation failed.',
    });
    redirect('/incidents');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      created_by: context.user.id,
      organization_id: context.organization.organizationId,
      owner_user_id: context.user.id,
      priority: parsed.data.priority,
      status: 'new',
      summary: parsed.data.summary,
      title: parsed.data.title,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    await setFlash({
      error: error?.message ?? 'Unable to create incident. Please retry.',
    });
    redirect('/incidents');
  }

  await setFlash({ message: 'Incident created successfully.' });
  redirect(`/incidents/${data.id}`);
}

export async function resolveIncidentAction(formData: FormData): Promise<void> {
  const context = await requireOrganizationContext();
  if (!canManageIncidents(context.organization.role)) {
    await setFlash({ error: 'You are not authorized to resolve incidents.' });
    redirect('/incidents');
  }

  const parsed = resolveIncidentSchema.safeParse({
    incidentId: getString(formData, 'incident_id'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Invalid incident identifier.' });
    redirect('/incidents');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'resolved',
    })
    .eq('id', parsed.data.incidentId)
    .eq('organization_id', context.organization.organizationId)
    .select('id')
    .maybeSingle();

  if (error || !data?.id) {
    await setFlash({
      error: error?.message ?? 'Unable to resolve incident.',
    });
    redirect(`/incidents/${parsed.data.incidentId}`);
  }

  await setFlash({ message: 'Incident resolved successfully.' });
  redirect(`/incidents/${parsed.data.incidentId}`);
}
