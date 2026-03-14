import type { Metadata } from 'next';
import Link from 'next/link';
import {
  RiskEventList,
  type RiskEventFeedItem,
} from '@/components/risk/risk-event-list';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { consumeFlash } from '@/lib/flash';
import { riskEvents as demoRiskEvents } from '@/lib/demo-data';
import type { RiskEvent } from '@/lib/demo-data';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Risk Events | Supply Chain Risk Intelligence Platform',
  description:
    'Risk monitoring feed with event filters, severity/status controls, and manual ingestion entry point.',
};

export const dynamic = 'force-dynamic';

type DbRiskEventRow = {
  id: string;
  title: string;
  event_type: string;
  severity: string;
  source: string | null;
  source_url: string | null;
  summary: string | null;
  detected_at: string | null;
  resolved_at: string | null;
  region_id: string | null;
  regions: { name: string } | { name: string }[] | null;
};

type DbDisruptionRow = {
  risk_event_id: string;
  supplier_id: string | null;
};

function resolveRegionName(
  regions: DbRiskEventRow['regions'],
  regionId: string | null,
): string {
  if (!regions) {
    return regionId ? `Region ${regionId.slice(0, 8)}` : 'Unassigned region';
  }

  const region = Array.isArray(regions) ? regions[0] : regions;
  return region?.name ?? 'Unassigned region';
}

function normalizeSeverity(severity: string): RiskEventFeedItem['severity'] {
  if (
    severity === 'critical' ||
    severity === 'high' ||
    severity === 'medium' ||
    severity === 'low'
  ) {
    return severity;
  }

  return 'low';
}

function mapDbRowToRiskEvent(
  row: DbRiskEventRow,
  affectedSupplierIds: string[],
): RiskEventFeedItem {
  const status: RiskEventFeedItem['status'] = row.resolved_at
    ? 'resolved'
    : 'active';

  return {
    affectedSupplierIds,
    date: row.detected_at ? row.detected_at.slice(0, 10) : 'Unknown',
    id: row.id,
    region: resolveRegionName(row.regions, row.region_id),
    severity: normalizeSeverity(row.severity),
    source: row.source ?? 'Unknown source',
    sourceUrl: row.source_url,
    status,
    summary: row.summary ?? '',
    title: row.title,
    type: row.event_type,
  };
}

function mapDemoRiskEvent(event: RiskEvent): RiskEventFeedItem {
  return {
    affectedSupplierIds: event.affectedSupplierIds,
    date: event.date,
    id: event.id,
    region: event.region,
    severity: event.severity,
    source: 'Demo feed',
    sourceUrl: null,
    status: event.status,
    summary: event.summary,
    title: event.title,
    type: event.type,
  };
}

export default async function RiskEventsPage() {
  const context = await requireOrganizationContext();
  const { error, message } = await consumeFlash();

  let events: RiskEventFeedItem[] = demoRiskEvents.map(mapDemoRiskEvent);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('risk_events')
      .select(
        'id, title, event_type, severity, source, source_url, summary, detected_at, resolved_at, region_id, regions(name)',
      )
      .eq('organization_id', context.organization.organizationId)
      .order('detected_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      const riskEventRows = data as DbRiskEventRow[];
      const riskEventIds = riskEventRows.map((event) => event.id);
      const affectedSupplierIdsByEvent = new Map<string, string[]>();

      if (riskEventIds.length > 0) {
        const { data: disruptionRows } = await supabase
          .from('disruptions')
          .select('risk_event_id, supplier_id')
          .eq('organization_id', context.organization.organizationId)
          .in('risk_event_id', riskEventIds);

        for (const row of (disruptionRows ?? []) as DbDisruptionRow[]) {
          if (!row.supplier_id) {
            continue;
          }

          const existing =
            affectedSupplierIdsByEvent.get(row.risk_event_id) ?? [];
          if (!existing.includes(row.supplier_id)) {
            affectedSupplierIdsByEvent.set(row.risk_event_id, [
              ...existing,
              row.supplier_id,
            ]);
          }
        }
      }

      events = riskEventRows.map((row) =>
        mapDbRowToRiskEvent(row, affectedSupplierIdsByEvent.get(row.id) ?? []),
      );
    }
  } catch {
    // Fall back to demo data if the DB is unavailable.
  }

  const activeEvents = events.filter(
    (event) => event.status !== 'resolved',
  ).length;
  const criticalActiveEvents = events.filter(
    (event) => event.status !== 'resolved' && event.severity === 'critical',
  ).length;
  const resolvedEvents = events.filter(
    (event) => event.status === 'resolved',
  ).length;
  const supplierLinkedEvents = events.filter(
    (event) => event.affectedSupplierIds.length > 0,
  ).length;
  const trackedRegions = new Set(events.map((event) => event.region)).size;
  const trackedEventTypes = new Set(events.map((event) => event.type)).size;

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <PageHeader
        eyebrow="Monitoring"
        title="Risk-event command center for triage, escalation, and response handoff"
        description="Use this stream to scan fresh signals, isolate highest-severity disruptions, and route supplier-linked events directly into incident response workflows."
        actions={
          <>
            <Link href="/dashboard" className={buttonStyles('secondary')}>
              Back to dashboard
            </Link>
            <Link href="/risk-events/new" className={buttonStyles('primary')}>
              Manual ingestion
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Active signals
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeEvents}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            events currently requiring active monitoring or triage
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Critical active
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {criticalActiveEvents}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            priority signals expected to escalate into incident workflows
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Supplier-linked
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {supplierLinkedEvents}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            events with direct supplier impact mapped in disruption records
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-slate-500 uppercase">
            Coverage footprint
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {trackedRegions} regions
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {trackedEventTypes} signal types · {resolvedEvents} resolved entries
          </p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RiskEventList events={events} />
        <div className="space-y-6">
          <SectionCard
            eyebrow="Triage playbook"
            title="Escalation rules in plain language"
            description="Keep these checks tight to avoid noisy handoffs and keep incident response focused on business impact."
          >
            <div className="grid gap-4">
              <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  1) Classify and validate source reliability
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Confirm severity and source confidence before escalation.
                  Events with unverifiable sources should remain in monitoring
                  until validated.
                </p>
              </article>
              <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  2) Escalate supplier-linked critical signals immediately
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Critical events with supplier impact should move directly into
                  incident creation to preserve response-time SLAs.
                </p>
              </article>
              <article className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  3) Close the loop with resolved evidence
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Mark events resolved only after mitigation signals are
                  observed and linked incidents show stable outcomes.
                </p>
              </article>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Workspace"
            title="Feed posture"
            description="A compact summary of what this route is actively tracking right now."
          >
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span>Total events loaded</span>
                <span className="font-semibold text-slate-900">
                  {events.length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span>Active + monitoring</span>
                <span className="font-semibold text-slate-900">
                  {activeEvents}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span>Resolved archive</span>
                <span className="font-semibold text-slate-900">
                  {resolvedEvents}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span>Supplier-linked events</span>
                <span className="font-semibold text-slate-900">
                  {supplierLinkedEvents}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
