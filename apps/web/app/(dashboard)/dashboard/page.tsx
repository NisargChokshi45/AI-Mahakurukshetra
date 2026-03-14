import type { Metadata } from 'next';
import Link from 'next/link';
import {
  alerts,
  dashboardMetrics,
  getSupplierName,
  incidents,
  riskEvents,
  topRiskSuppliers,
  trendSeries,
} from '@/lib/demo-data';
import {
  MetricCard,
  PageHeader,
  RiskScoreBadge,
  SectionCard,
  SeverityBadge,
  Sparkline,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Dashboard | Supply Chain Risk Intelligence Platform',
  description:
    'Operational dashboard with alert severity, top at-risk suppliers, disruption feed, and trend monitoring.',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Command center"
        title="Real-time visibility into supplier disruption, alerting, and incident readiness."
        description="The core dashboard prioritizes what judges need to see first: severity counts, top supplier risk, active disruptions, and response momentum across the operating network."
        actions={
          <>
            <Link href="/incidents" className={buttonStyles('secondary')}>
              Review incidents
            </Link>
            <Link href="/risk-events/new" className={buttonStyles('primary')}>
              Add risk event
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="Watchlist"
          title="Top 5 at-risk suppliers"
          description="Ranked by composite risk score so operations can triage exposure first."
        >
          <div className="grid gap-4">
            {topRiskSuppliers.map((supplier, index) => (
              <article
                key={supplier.id}
                className="border-border/70 bg-background/70 grid gap-4 rounded-[24px] border p-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="bg-muted flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="hover:text-primary text-lg font-semibold tracking-tight"
                    >
                      {supplier.name}
                    </Link>
                    <StatusBadge status={supplier.status} />
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {supplier.summary}
                  </p>
                  <div className="text-muted-foreground mt-3 flex flex-wrap gap-3 text-sm">
                    <span>
                      {supplier.region} • {supplier.country}
                    </span>
                    <span>{supplier.activeAlerts} active alerts</span>
                    <span>{supplier.openIncidents} open incidents</span>
                  </div>
                </div>
                <RiskScoreBadge
                  score={supplier.riskScore}
                  className="justify-self-start lg:justify-self-end"
                />
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Trend"
          title="Risk trend sparklines"
          description="A compact, presentation-friendly summary for executive reviews."
        >
          <div className="grid gap-4">
            {trendSeries.map((series) => (
              <article
                key={series.label}
                className="border-border/70 bg-background/75 rounded-[24px] border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                      {series.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold">{series.value}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {series.change}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <Sparkline values={series.values} />
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Feed"
          title="Disruption and alert feed"
          description="Fresh signals affecting lead times, quality, and continuity."
        >
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="border-border/70 bg-background/75 rounded-[24px] border p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <SeverityBadge severity={alert.severity} />
                  <p className="text-muted-foreground text-sm">
                    {alert.createdAt}
                  </p>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {alert.title}
                </h3>
                <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-sm">
                  <span>{getSupplierName(alert.supplierId)}</span>
                  <span>{alert.type}</span>
                  <span>{alert.response}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Response"
          title="Incident snapshot"
          description="Action ownership and mitigation progress across active incidents."
        >
          <div className="grid gap-4">
            {incidents.slice(0, 3).map((incident) => (
              <article
                key={incident.id}
                className="border-border/70 bg-background/75 rounded-[24px] border p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/incidents/${incident.id}`}
                    className="hover:text-primary text-lg font-semibold tracking-tight"
                  >
                    {incident.title}
                  </Link>
                  <p className="text-muted-foreground text-sm leading-6">
                    {incident.summary}
                  </p>
                  <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                    <span>Owner: {incident.owner}</span>
                    <span>{incident.eta}</span>
                  </div>
                </div>
              </article>
            ))}
            <div className="border-border/70 bg-background/60 text-muted-foreground rounded-[24px] border border-dashed p-4 text-sm">
              {riskEvents.length} active or recently resolved risk events are
              currently feeding the incident workflow.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
