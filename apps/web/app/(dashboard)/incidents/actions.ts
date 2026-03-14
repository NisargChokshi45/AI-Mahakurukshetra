'use server';

import { redirect } from 'next/navigation';
import { requireOrganizationContext } from '@/lib/auth/session';
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

function getErrorRedirect(pathname: string, message: string): string {
  return `${pathname}?error=${encodeURIComponent(message)}`;
}

export async function createIncidentAction(formData: FormData): Promise<void> {
  const context = await requireOrganizationContext();
  if (!canManageIncidents(context.organization.role)) {
    redirect(
      getErrorRedirect(
        '/incidents',
        'You are not authorized to create incidents.',
      ),
    );
  }

  const parsed = createIncidentSchema.safeParse({
    priority: getString(formData, 'priority'),
    summary: getString(formData, 'summary'),
    title: getString(formData, 'title'),
  });

  if (!parsed.success) {
    redirect(
      getErrorRedirect(
        '/incidents',
        parsed.error.issues[0]?.message ?? 'Incident validation failed.',
      ),
    );
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
    redirect(
      getErrorRedirect(
        '/incidents',
        error?.message ?? 'Unable to create incident. Please retry.',
      ),
    );
  }

  redirect(`/incidents/${data.id}?created=1`);
}

export async function resolveIncidentAction(formData: FormData): Promise<void> {
  const context = await requireOrganizationContext();
  if (!canManageIncidents(context.organization.role)) {
    redirect(
      getErrorRedirect(
        '/incidents',
        'You are not authorized to resolve incidents.',
      ),
    );
  }

  const parsed = resolveIncidentSchema.safeParse({
    incidentId: getString(formData, 'incident_id'),
  });

  if (!parsed.success) {
    redirect(getErrorRedirect('/incidents', 'Invalid incident identifier.'));
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
    redirect(
      getErrorRedirect(
        `/incidents/${parsed.data.incidentId}`,
        error?.message ?? 'Unable to resolve incident.',
      ),
    );
  }

  redirect(`/incidents/${parsed.data.incidentId}?resolved=1`);
}
