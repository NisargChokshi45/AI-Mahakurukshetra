import type { Metadata } from 'next';
import Link from 'next/link';
import { createIncidentAction } from '@/app/(dashboard)/incidents/actions';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/validations/auth';
import type {
  IncidentPriority,
  IncidentStatus,
} from '@/lib/validations/incidents';
import {
  EmptyState,
  PageHeader,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Incidents | Supply Chain Risk Intelligence Platform',
  description:
    'Kanban-style incident board for new, investigating, mitigating, and resolved workflows.',
};

export const dynamic = 'force-dynamic';

const INCIDENT_WRITE_ROLES: AppRole[] = ['owner', 'admin', 'risk_manager'];

type IncidentRow = {
  id: string;
  title: string;
  summary: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  created_at: string;
  owner_user_id: string | null;
};

type IncidentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function canManageIncidents(role: AppRole): boolean {
  return INCIDENT_WRITE_ROLES.includes(role);
}

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function mapPriorityToSeverity(priority: IncidentPriority) {
  return priority;
}

export default async function IncidentsPage({
  searchParams,
}: IncidentsPageProps) {
  const context = await requireOrganizationContext();
  const params = (await searchParams) ?? {};
  const errorMessage = readParam(params.error);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('incidents')
    .select('id, title, summary, status, priority, owner_user_id, created_at')
    .eq('organization_id', context.organization.organizationId)
    .order('created_at', { ascending: false });

  const incidents = (data ?? []) as IncidentRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Response board"
        title="Incident management organized around workflow state, not buried inside tables."
        description="This kanban board keeps the response story concrete: new issues enter triage, teams investigate, mitigation actions run, and resolved items remain visible for learning."
        actions={
          <>
            <Link href="/risk-events" className={buttonStyles('secondary')}>
              View source events
            </Link>
          </>
        }
      />

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {error ? (
        <EmptyState
          title="Unable to load incidents"
          description={error.message}
          actionHref="/dashboard"
          actionLabel="Back to dashboard"
        />
      ) : null}

      {canManageIncidents(context.organization.role) ? (
        <SectionCard
          eyebrow="Create incident"
          title="Open a new incident"
          description="Use this form to create an incident that appears immediately on the board."
        >
          <form
            action={createIncidentAction}
            className="grid gap-4 lg:grid-cols-2"
          >
            <label className="grid gap-2 text-sm font-medium">
              Incident title
              <input
                required
                minLength={5}
                maxLength={180}
                name="title"
                data-testid="incident-title-input"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
                placeholder="Escalate alternate source qualification"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Priority
              <select
                name="priority"
                data-testid="incident-priority-select"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
                defaultValue="medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium lg:col-span-2">
              Summary
              <textarea
                required
                minLength={10}
                maxLength={2000}
                name="summary"
                data-testid="incident-summary-input"
                className="border-border/70 bg-background/85 min-h-28 rounded-[24px] border px-4 py-3 text-sm outline-none"
                placeholder="Describe business impact, current blockers, and first response action."
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                data-testid="create-incident-submit"
                className={buttonStyles('primary')}
              >
                Create incident
              </button>
            </div>
          </form>
        </SectionCard>
      ) : (
        <SectionCard
          eyebrow="Permissions"
          title="Incident creation is restricted"
          description="Only owner, admin, and risk_manager roles can create or resolve incidents."
        >
          <p className="text-muted-foreground text-sm">
            Your role is <strong>{context.organization.role}</strong>. You can
            still view incident state and timelines.
          </p>
        </SectionCard>
      )}

      <SectionCard
        eyebrow="Board"
        title="All incidents"
        description={`${incidents.length} incident${incidents.length === 1 ? '' : 's'} across all workflow states`}
      >
        {incidents.length === 0 ? (
          <EmptyState
            title="No incidents yet"
            description="Create an incident above to start tracking response workflows."
          />
        ) : (
          <div className="border-border/70 overflow-hidden rounded-[24px] border">
            <div className="border-border/70 bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr] gap-4 border-b px-4 py-3 text-xs font-semibold tracking-[0.2em] uppercase lg:grid">
              <span>Incident</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Owner</span>
              <span>Opened</span>
            </div>
            <div className="divide-border/70 divide-y">
              {incidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  data-testid={`incident-card-${incident.id}`}
                  className="hover:bg-muted/20 grid gap-4 px-4 py-4 transition lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr] lg:items-center"
                >
                  <div>
                    <p className="font-semibold tracking-tight">
                      {incident.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {incident.summary}
                    </p>
                  </div>
                  <SeverityBadge
                    severity={mapPriorityToSeverity(incident.priority)}
                  />
                  <StatusBadge status={incident.status} />
                  <p className="text-muted-foreground text-sm">
                    {incident.owner_user_id
                      ? `${incident.owner_user_id.slice(0, 8)}…`
                      : 'Unassigned'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
