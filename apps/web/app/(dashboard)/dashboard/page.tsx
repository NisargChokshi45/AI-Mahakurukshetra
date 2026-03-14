import type { Metadata } from 'next';
import Link from 'next/link';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { consumeFlash } from '@/lib/flash';
import { AIDashboardInsights } from '@/components/dashboard/ai-dashboard-insights';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Organization overview for supply chain risk operations.',
};

export const dynamic = 'force-dynamic';

type AlertRow = {
  id: string;
  severity: string;
  title: string;
  status: string;
};

type SupplierRow = {
  id: string;
  slug: string | null;
  name: string;
  tier: string | null;
  current_risk_score: number | null;
};

type IncidentRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

type MetricRow = {
  recorded_at: string;
  at_risk_suppliers: number;
  false_positive_rate: number | string;
  mttr_hours: number | string;
  open_incidents: number;
  total_suppliers: number;
};

type DisruptionImpactRow = {
  id: string;
  financial_impact_usd: number | string | null;
};

function formatTierLabel(tier: string | null) {
  if (!tier) {
    return 'Unknown tier';
  }

  return tier.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRiskScore(score: number | null) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return '--';
  }

  return Math.round(score).toString();
}

function parseNumericValue(value: number | string | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 1,
    notation: 'compact',
    style: 'currency',
  }).format(value);
}

function formatTrendDelta(
  current: number | null,
  previous: number | null,
  unitLabel: string,
) {
  if (current === null || previous === null) {
    return 'Waiting for enough historical samples.';
  }

  const delta = current - previous;
  const absoluteDelta = Math.abs(delta);

  if (absoluteDelta < 0.05) {
    return `No material change vs previous ${unitLabel}.`;
  }

  const direction = delta > 0 ? 'up' : 'down';
  return `${direction} ${absoluteDelta.toFixed(1)}${unitLabel} vs previous sample.`;
}

export default async function DashboardPage() {
  const context = await requireOrganizationContext();
  const organizationId = context.organization.organizationId;
  const { message } = await consumeFlash();
  const supabase = await createClient();

  const [
    { data: alerts },
    { data: suppliers },
    { data: incidents },
    { data: metricsSamples },
    { count: totalSuppliersCount },
    { count: atRiskSuppliersCount },
    { count: criticalRiskSuppliersCount },
    { count: tierOneSuppliersCount },
    { count: unresolvedAlertsCount },
    { count: newAlertsCount },
    { count: openIncidentsCount },
    { count: criticalOpenIncidentsCount },
    { data: activeDisruptions },
  ] = await Promise.all([
    supabase
      .from('alerts')
      .select('id, severity, title, status')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('suppliers')
      .select('id, slug, name, tier, current_risk_score')
      .eq('organization_id', organizationId)
      .order('current_risk_score', { ascending: false })
      .limit(5),
    supabase
      .from('incidents')
      .select('id, title, status, priority')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('metrics')
      .select(
        'recorded_at, total_suppliers, at_risk_suppliers, open_incidents, mttr_hours, false_positive_rate',
      )
      .eq('organization_id', organizationId)
      .order('recorded_at', { ascending: false })
      .limit(2),
    supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId),
    supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('current_risk_score', 70),
    supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('current_risk_score', 80),
    supabase
      .from('suppliers')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('tier', 'tier_1'),
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['new', 'acknowledged']),
    supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'new'),
    supabase
      .from('incidents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .neq('status', 'resolved'),
    supabase
      .from('incidents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .neq('status', 'resolved')
      .eq('priority', 'critical'),
    supabase
      .from('disruptions')
      .select('id, financial_impact_usd')
      .eq('organization_id', organizationId)
      .is('ended_at', null),
  ]);

  const [latestMetric, previousMetric] = (metricsSamples ?? []) as MetricRow[];
  const totalSuppliers =
    totalSuppliersCount ??
    latestMetric?.total_suppliers ??
    suppliers?.length ??
    0;
  const atRiskSuppliers =
    atRiskSuppliersCount ?? latestMetric?.at_risk_suppliers ?? 0;
  const atRiskShare =
    totalSuppliers > 0
      ? Math.round((atRiskSuppliers / totalSuppliers) * 100)
      : 0;

  const openIncidents =
    openIncidentsCount ??
    latestMetric?.open_incidents ??
    incidents?.length ??
    0;
  const criticalOpenIncidents = criticalOpenIncidentsCount ?? 0;
  const unresolvedAlerts = unresolvedAlertsCount ?? 0;
  const newAlerts = newAlertsCount ?? 0;
  const tierOneSuppliers = tierOneSuppliersCount ?? 0;
  const criticalRiskSuppliers = criticalRiskSuppliersCount ?? 0;

  const disruptionRows = (activeDisruptions ?? []) as DisruptionImpactRow[];
  const activeDisruptionCount = disruptionRows.length;
  const activeDisruptionImpact = disruptionRows.reduce((sum, disruption) => {
    const impactValue = parseNumericValue(disruption.financial_impact_usd) ?? 0;
    return sum + impactValue;
  }, 0);

  const mttrHours = parseNumericValue(latestMetric?.mttr_hours);
  const previousMttrHours = parseNumericValue(previousMetric?.mttr_hours);
  const falsePositiveRate = parseNumericValue(
    latestMetric?.false_positive_rate,
  );
  const previousFalsePositiveRate = parseNumericValue(
    previousMetric?.false_positive_rate,
  );

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/suppliers"
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Supplier Risk Exposure
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {atRiskSuppliers}/{totalSuppliers}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            suppliers above risk threshold ({atRiskShare}%)
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-slate-500">Critical risk (80+)</p>
              <p className="mt-1 font-semibold text-slate-900">
                {criticalRiskSuppliers}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2">
              <p className="text-slate-500">Tier-1 footprint</p>
              <p className="mt-1 font-semibold text-slate-900">
                {tierOneSuppliers}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Open supplier matrix →
          </p>
        </Link>
        <Link
          href="/risk-events"
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Live Disruption Cost
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {formatCurrencyCompact(activeDisruptionImpact)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            estimated direct impact across active disruptions
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">
              {activeDisruptionCount} active disruption
              {activeDisruptionCount === 1 ? '' : 's'}
            </p>
            <p className="mt-1">
              Prioritize suppliers tied to open events with unresolved
              downstream impact.
            </p>
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Review risk events →
          </p>
        </Link>
        <Link
          href="/risk-events"
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Alert Pressure
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {newAlerts}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            new alerts currently awaiting first triage
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">
              {unresolvedAlerts} alerts still unresolved
            </p>
            <p className="mt-1">
              Includes alerts in <span className="font-medium">new</span> and{' '}
              <span className="font-medium">acknowledged</span> states.
            </p>
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Open alert queue →
          </p>
        </Link>
        <Link
          href="/incidents"
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
        >
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Response Performance
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {mttrHours === null ? '--' : `${mttrHours.toFixed(1)}h`}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            mean time to resolve incidents (latest sample)
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-900">
              {openIncidents} open incident
              {openIncidents === 1 ? '' : 's'} · {criticalOpenIncidents}{' '}
              critical
            </p>
            <p className="mt-1">
              {formatTrendDelta(mttrHours, previousMttrHours, 'h')}
            </p>
            <p className="mt-1">
              False-positive rate:{' '}
              {falsePositiveRate === null
                ? '--'
                : `${falsePositiveRate.toFixed(1)}%`}{' '}
              (
              {formatTrendDelta(
                falsePositiveRate,
                previousFalsePositiveRate,
                '%',
              )}
              )
            </p>
          </div>
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Open incident board →
          </p>
        </Link>
      </section>

      {/* AI Insights Section */}
      <AIDashboardInsights />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.28em] text-emerald-700 uppercase">
                Supplier Watchlist
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {context.organization.organizationName}
              </h1>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              {context.organization.role}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {((suppliers ?? []) as SupplierRow[]).map((supplier) => (
              <Link
                key={supplier.id}
                href={`/suppliers/${supplier.slug ?? supplier.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-950">{supplier.name}</p>
                  <p className="text-sm text-slate-500">
                    {formatTierLabel(supplier.tier)}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  Risk {formatRiskScore(supplier.current_risk_score)}
                </span>
              </Link>
            ))}

            {!suppliers?.length ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
                No suppliers yet. Run the seed or onboard data to populate the
                dashboard.
              </p>
            ) : null}
          </div>

          <div className="mt-4">
            <Link
              href="/suppliers"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              View all suppliers →
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.28em] text-slate-500 uppercase">
                Active Alerts
              </p>
              <Link
                href="/risk-events"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {((alerts ?? []) as AlertRow[]).map((alert) => (
                <Link
                  key={alert.id}
                  href="/risk-events"
                  className="block rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{alert.title}</p>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-red-700 uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{alert.status}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.28em] text-slate-500 uppercase">
                Incident Queue
              </p>
              <Link
                href="/incidents"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                View all →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {((incidents ?? []) as IncidentRow[]).map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="block rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-950">{incident.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {incident.status} · {incident.priority}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
