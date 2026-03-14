import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSupplierAlerts,
  getSupplierById,
  getSupplierIncidents,
  getSupplierRiskEvents,
} from '@/lib/demo-data';
import {
  PageHeader,
  RiskScoreBadge,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

type SupplierDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata({
  params,
}: SupplierDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = getSupplierById(id);

  if (!supplier) {
    return {
      title: 'Supplier not found | Supply Chain Risk Intelligence Platform',
    };
  }

  return {
    title: `${supplier.name} | Supply Chain Risk Intelligence Platform`,
    description: supplier.summary,
  };
}

export default async function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = await params;
  const supplier = getSupplierById(id);

  if (!supplier) {
    notFound();
  }

  const supplierAlerts = getSupplierAlerts(supplier.id);
  const supplierIncidents = getSupplierIncidents(supplier.id);
  const supplierEvents = getSupplierRiskEvents(supplier.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supplier detail"
        title={supplier.name}
        description={supplier.summary}
        actions={
          <>
            <Link href="/incidents" className={buttonStyles('secondary')}>
              View related incidents
            </Link>
            <Link href="/assessments" className={buttonStyles('primary')}>
              Launch assessment
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Profile"
          title="Operational profile"
          description="Core supplier details, resilience context, and engagement lead."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-border/70 bg-background/80 rounded-[24px] border p-5">
              <div className="flex flex-wrap items-center gap-3">
                <RiskScoreBadge score={supplier.riskScore} />
                <StatusBadge status={supplier.status} />
              </div>
              <div className="text-muted-foreground mt-4 grid gap-2 text-sm">
                <p>
                  {supplier.region} • {supplier.country}
                </p>
                <p>{supplier.tier}</p>
                <p>Primary contact: {supplier.primaryContact}</p>
                <p>Lead time: {supplier.leadTimeDays} days</p>
              </div>
            </div>
            <div className="border-border/70 bg-background/80 rounded-[24px] border p-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                Resilience score
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {supplier.resilienceScore}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Built to contrast supplier continuity posture with current risk
                level.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Breakdown"
          title="Risk score by category"
          description="Weighted category components that can later map directly to the scoring engine."
        >
          <div className="grid gap-3">
            {supplier.categories.map((category) => (
              <article
                key={category.label}
                className="border-border/70 bg-background/80 rounded-[22px] border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{category.label}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Delta {category.delta} over the last review cycle
                    </p>
                  </div>
                  <RiskScoreBadge score={category.score} />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          eyebrow="Alerts"
          title="Active alerts"
          description="Signals and watch items associated with this supplier."
        >
          <div className="grid gap-3">
            {supplierAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active alerts. This supplier is currently running within the
                expected risk envelope.
              </p>
            ) : (
              supplierAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className="border-border/70 bg-background/80 rounded-[22px] border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <p className="text-muted-foreground text-sm">
                      {alert.createdAt}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 font-semibold">
                    {alert.title}
                  </p>
                </article>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="History"
          title="Assessment history"
          description="The current design expects a time-series of reviews and score changes."
        >
          <div className="space-y-3">
            <article className="border-border/70 bg-background/80 rounded-[22px] border p-4">
              <p className="font-semibold">
                Last assessed {supplier.lastAssessment}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Current workspace uses seeded data. Phase 3 and 6 can wire this
                card to historical risk score records and assessment documents.
              </p>
            </article>
            <article className="border-border/70 bg-background/60 text-muted-foreground rounded-[22px] border border-dashed p-4 text-sm">
              Next assessment window should focus on operational continuity and
              second-source readiness.
            </article>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Incidents"
          title="Linked incidents and risk events"
          description="Response history associated with this supplier."
        >
          <div className="space-y-3">
            {supplierIncidents.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No linked incidents. Maintain watchlist monitoring only.
              </p>
            ) : (
              supplierIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="border-border/70 bg-background/80 block rounded-[22px] border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <p className="mt-3 font-semibold">{incident.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {incident.owner}
                  </p>
                </Link>
              ))
            )}
            <div className="border-border/70 bg-background/80 rounded-[22px] border p-4">
              <p className="font-semibold">Related disruption signals</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {supplierEvents.map((event) => (
                  <span
                    key={event.id}
                    className="border-border/70 text-muted-foreground rounded-full border px-3 py-2 text-sm"
                  >
                    {event.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
