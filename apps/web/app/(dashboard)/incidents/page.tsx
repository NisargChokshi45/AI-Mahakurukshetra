import type { Metadata } from 'next';
import Link from 'next/link';
import { incidents } from '@/lib/demo-data';
import {
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

const columns = [
  { key: 'new', title: 'New' },
  { key: 'investigating', title: 'Investigating' },
  { key: 'mitigating', title: 'Mitigating' },
  { key: 'resolved', title: 'Resolved' },
] as const;

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Response board"
        title="Incident management organized around workflow state, not buried inside tables."
        description="This kanban board keeps the Phase 4 response story concrete: new issues enter triage, teams investigate, mitigation actions run, and resolved items remain visible for learning."
        actions={
          <>
            <Link href="/risk-events" className={buttonStyles('secondary')}>
              View source events
            </Link>
            <Link
              href={`/incidents/${incidents[0]?.id ?? ''}`}
              className={buttonStyles('primary')}
            >
              Open live incident
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-4">
        {columns.map((column) => {
          const columnIncidents = incidents.filter(
            (incident) => incident.status === column.key,
          );

          return (
            <SectionCard
              key={column.key}
              eyebrow="Workflow"
              title={column.title}
              description={`${columnIncidents.length} incident${columnIncidents.length === 1 ? '' : 's'} in this lane`}
            >
              <div className="grid gap-4">
                {columnIncidents.length === 0 ? (
                  <div className="border-border/70 bg-background/60 text-muted-foreground rounded-[24px] border border-dashed p-4 text-sm">
                    No incidents in this lane right now.
                  </div>
                ) : (
                  columnIncidents.map((incident) => (
                    <Link
                      key={incident.id}
                      href={`/incidents/${incident.id}`}
                      className="border-border/70 bg-background/80 block rounded-[24px] border p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={incident.severity} />
                        <StatusBadge status={incident.status} />
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight">
                        {incident.title}
                      </h3>
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {incident.summary}
                      </p>
                      <div className="text-muted-foreground mt-3 text-sm">
                        <p>Owner: {incident.owner}</p>
                        <p>{incident.eta}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
