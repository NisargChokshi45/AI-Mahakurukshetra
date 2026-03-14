import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSupplierAlerts,
  getSupplierById,
  getSupplierIncidents,
  getSupplierRiskEvents,
  type Supplier,
} from '@/lib/demo-data';
import { createClient } from '@/lib/supabase/server';
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

const TIER_LABEL: Record<string, Supplier['tier']> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};

const STATUS_LABEL: Record<string, Supplier['status']> = {
  watchlist: 'watchlist',
  active: 'stable',
  inactive: 'stable',
};

export async function generateMetadata({
  params,
}: SupplierDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  // Try demo-data first (handles slug-based IDs like "aurora-electronics")
  const demo = getSupplierById(id);
  if (demo) {
    return {
      title: `${demo.name} | Supply Chain Risk Intelligence Platform`,
      description: demo.summary,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('suppliers')
    .select('name, notes')
    .eq('slug', id)
    .maybeSingle();

  if (!data) {
    return {
      title: 'Supplier not found | Supply Chain Risk Intelligence Platform',
    };
  }

  return {
    title: `${data.name} | Supply Chain Risk Intelligence Platform`,
    description: data.notes ?? undefined,
  };
}

export default async function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  const { id } = await params;

  // --- Try demo-data first (for seeded demo entries) ---
  const demoSupplier = getSupplierById(id);
  if (demoSupplier) {
    const supplierAlerts = getSupplierAlerts(demoSupplier.id);
    const supplierIncidents = getSupplierIncidents(demoSupplier.id);
    const supplierEvents = getSupplierRiskEvents(demoSupplier.id);
    return (
      <SupplierDetailView
        supplier={demoSupplier}
        alerts={supplierAlerts}
        incidents={supplierIncidents}
        events={supplierEvents}
      />
    );
  }

  // --- Fall back to Supabase lookup by slug ---
  const supabase = await createClient();
  const { data: row } = await supabase
    .from('suppliers')
    .select(
      'id, slug, name, tier, status, country, current_risk_score, primary_contact_email, notes',
    )
    .eq('slug', id)
    .maybeSingle();

  if (!row) notFound();

  const supplier: Supplier = {
    id: row.slug ?? row.id,
    name: row.name,
    tier: TIER_LABEL[row.tier] ?? 'Tier 1',
    region: '—',
    country: row.country,
    riskScore: Math.round(Number(row.current_risk_score)),
    status: STATUS_LABEL[row.status] ?? 'stable',
    primaryContact: row.primary_contact_email ?? '—',
    activeAlerts: 0,
    openIncidents: 0,
    lastAssessment: '—',
    leadTimeDays: 0,
    resilienceScore: 0,
    summary: row.notes ?? '',
    categories: [],
  };

  return (
    <SupplierDetailView
      supplier={supplier}
      alerts={[]}
      incidents={[]}
      events={[]}
    />
  );
}

type AlertShape = {
  id: string;
  severity: import('@/lib/demo-data').Severity;
  createdAt: string;
  title: string;
};
type IncidentShape = {
  id: string;
  severity: import('@/lib/demo-data').Severity;
  status: string;
  title: string;
  owner: string;
};
type EventShape = { id: string; title: string };

function SupplierDetailView({
  supplier,
  alerts,
  incidents,
  events,
}: {
  supplier: Supplier;
  alerts: AlertShape[];
  incidents: IncidentShape[];
  events: EventShape[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supplier detail"
        title={supplier.name}
        description={
          supplier.summary || `${supplier.country} · ${supplier.tier}`
        }
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
                {supplier.region !== '—' && (
                  <p>
                    {supplier.region} • {supplier.country}
                  </p>
                )}
                {supplier.region === '—' && <p>{supplier.country}</p>}
                <p>{supplier.tier}</p>
                <p>Primary contact: {supplier.primaryContact}</p>
                {supplier.leadTimeDays > 0 && (
                  <p>Lead time: {supplier.leadTimeDays} days</p>
                )}
              </div>
            </div>
            {supplier.resilienceScore > 0 ? (
              <div className="border-border/70 bg-background/80 rounded-[24px] border p-5">
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                  Resilience score
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {supplier.resilienceScore}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  Built to contrast supplier continuity posture with current
                  risk level.
                </p>
              </div>
            ) : (
              <div className="border-border/70 bg-background/60 text-muted-foreground rounded-[24px] border border-dashed p-5 text-sm">
                Resilience score not yet calculated for this supplier.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Breakdown"
          title="Risk score by category"
          description="Weighted category components that drive the overall score."
        >
          <div className="grid gap-3">
            {supplier.categories.length > 0 ? (
              supplier.categories.map((category) => (
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
              ))
            ) : (
              <div className="border-border/70 bg-background/60 text-muted-foreground rounded-[22px] border border-dashed p-4 text-sm">
                Category breakdown will appear once the scoring pipeline has run
                for this supplier.
              </div>
            )}
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
            {alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active alerts. This supplier is currently running within the
                expected risk envelope.
              </p>
            ) : (
              alerts.map((alert) => (
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
                {supplier.lastAssessment !== '—'
                  ? `Last assessed ${supplier.lastAssessment}`
                  : 'No assessments recorded yet'}
              </p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Phase 3 can wire this card to historical risk score records and
                assessment documents.
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
            {incidents.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No linked incidents. Maintain watchlist monitoring only.
              </p>
            ) : (
              incidents.map((incident) => (
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
            {events.length > 0 && (
              <div className="border-border/70 bg-background/80 rounded-[22px] border p-4">
                <p className="font-semibold">Related disruption signals</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {events.map((event) => (
                    <span
                      key={event.id}
                      className="border-border/70 text-muted-foreground rounded-full border px-3 py-2 text-sm"
                    >
                      {event.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
