import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveIncidentAction } from '@/app/(dashboard)/incidents/actions';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/validations/auth';
import type {
  IncidentPriority,
  IncidentStatus,
} from '@/lib/validations/incidents';
import {
  PageHeader,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

type IncidentWorkspacePageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export const dynamic = 'force-dynamic';

type IncidentRow = {
  id: string;
  organization_id: string;
  title: string;
  summary: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  owner_user_id: string | null;
  risk_event_id: string | null;
  created_at: string;
  updated_at: string;
};

type IncidentActionRow = {
  id: string;
  description: string;
  status: string;
  due_date: string | null;
};

const INCIDENT_WRITE_ROLES: AppRole[] = ['owner', 'admin', 'risk_manager'];

function canManageIncidents(role: AppRole): boolean {
  return INCIDENT_WRITE_ROLES.includes(role);
}

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function mapPriorityToSeverity(priority: IncidentPriority) {
  return priority;
}

export async function generateMetadata({
  params,
}: IncidentWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Incident ${id.slice(0, 8)} | Supply Chain Risk Intelligence Platform`,
  };
}

export default async function IncidentWorkspacePage({
  params,
  searchParams,
}: IncidentWorkspacePageProps) {
  const context = await requireOrganizationContext();
  const { id } = await params;
  const paramsData = (await searchParams) ?? {};
  const createdMessage = readParam(paramsData.created);
  const resolvedMessage = readParam(paramsData.resolved);
  const errorMessage = readParam(paramsData.error);
  const supabase = await createClient();

  const { data: incidentData } = await supabase
    .from('incidents')
    .select(
      'id, organization_id, title, summary, status, priority, owner_user_id, risk_event_id, created_at, updated_at',
    )
    .eq('id', id)
    .eq('organization_id', context.organization.organizationId)
    .maybeSingle();

  const incident = incidentData as IncidentRow | null;
  if (!incident) {
    notFound();
  }

  const [{ data: riskEventData }, { data: actionData }] = await Promise.all([
    incident.risk_event_id
      ? supabase
          .from('risk_events')
          .select('title')
          .eq('id', incident.risk_event_id)
          .eq('organization_id', context.organization.organizationId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('incident_actions')
      .select('id, description, status, due_date')
      .eq('incident_id', incident.id)
      .eq('organization_id', context.organization.organizationId)
      .order('created_at', { ascending: true }),
  ]);

  const incidentActions = (actionData ?? []) as IncidentActionRow[];
  const canResolve =
    canManageIncidents(context.organization.role) &&
    incident.status !== 'resolved';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incident workspace"
        title={incident.title}
        description={incident.summary}
        actions={
          <>
            <Link href="/incidents" className={buttonStyles('secondary')}>
              Back to board
            </Link>
            {canResolve ? (
              <form action={resolveIncidentAction}>
                <input type="hidden" name="incident_id" value={incident.id} />
                <button
                  type="submit"
                  data-testid="resolve-incident-submit"
                  className={buttonStyles('primary')}
                >
                  Mark as resolved
                </button>
              </form>
            ) : null}
          </>
        }
      />

      {createdMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Incident created successfully.
        </p>
      ) : null}

      {resolvedMessage ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Incident resolved successfully.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Summary"
          title="Owner, linked signal, and readiness state"
          description="A compact decision panel for the team running the incident."
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge
                severity={mapPriorityToSeverity(incident.priority)}
              />
              <StatusBadge status={incident.status} />
            </div>
            <div className="text-muted-foreground grid gap-2 text-sm">
              <p>Owner: {incident.owner_user_id ?? 'Unassigned'}</p>
              <p>
                Linked event:{' '}
                {riskEventData && 'title' in riskEventData
                  ? riskEventData.title
                  : 'No linked event'}
              </p>
              <p>Opened: {new Date(incident.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(incident.updated_at).toLocaleString()}</p>
              <p data-testid="incident-status-value">
                Current status: {incident.status}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Checklist"
          title="Action items and mitigation plan"
          description="Action items persisted in `incident_actions` for this incident."
        >
          {incidentActions.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No action items yet. Add action rows in the database or extend
              this workspace with create/update actions.
            </p>
          ) : (
            <div className="grid gap-3">
              {incidentActions.map((action) => (
                <article
                  key={action.id}
                  className="border-border/70 bg-background/80 rounded-[22px] border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{action.description}</p>
                    <StatusBadge status={action.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Due: {action.due_date ?? 'No due date'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
