import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getIncidentById,
  getRiskEventById,
  getSupplierById,
} from '@/lib/demo-data';
import {
  PageHeader,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

type IncidentWorkspacePageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata({
  params,
}: IncidentWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const incident = getIncidentById(id);

  return {
    title: incident
      ? `${incident.title} | Supply Chain Risk Intelligence Platform`
      : 'Incident not found | Supply Chain Risk Intelligence Platform',
  };
}

export default async function IncidentWorkspacePage({
  params,
}: IncidentWorkspacePageProps) {
  const { id } = await params;
  const incident = getIncidentById(id);

  if (!incident) {
    notFound();
  }

  const supplier = getSupplierById(incident.supplierId);
  const riskEvent = getRiskEventById(incident.linkedRiskEventId);

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
            <button type="button" className={buttonStyles('primary')}>
              Assign owner
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          eyebrow="Summary"
          title="Owner, linked signal, and readiness state"
          description="A compact decision panel for the team running the incident."
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div className="text-muted-foreground grid gap-2 text-sm">
              <p>Owner: {incident.owner}</p>
              <p>Supplier: {supplier?.name ?? 'Unknown supplier'}</p>
              <p>Linked event: {riskEvent?.title ?? 'No linked event'}</p>
              <p>Opened: {incident.createdAt}</p>
              <p>ETA: {incident.eta}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Checklist"
          title="Action items and mitigation plan"
          description="A response workspace designed for active coordination."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {incident.checklist.map((item) => (
                <div
                  key={item.label}
                  className="border-border/70 bg-background/80 flex items-start gap-3 rounded-[22px] border p-4"
                >
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-full border ${item.done ? 'border-primary bg-primary' : 'border-border bg-background'}`}
                  />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.done ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {incident.mitigationPlans.map((plan) => (
                <article
                  key={plan}
                  className="border-border/70 bg-background/80 rounded-[22px] border p-4"
                >
                  <p className="font-medium">{plan}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Timeline"
        title="Incident activity timeline"
        description="Chronological updates, decisions, and handoffs."
      >
        <div className="grid gap-4">
          {incident.timeline.map((entry) => (
            <article
              key={`${entry.time}-${entry.title}`}
              className="border-border/70 bg-background/80 grid gap-3 rounded-[24px] border p-4 md:grid-cols-[120px_minmax(0,1fr)]"
            >
              <p className="text-muted-foreground text-sm font-semibold">
                {entry.time}
              </p>
              <div>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {entry.note}
                </p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
