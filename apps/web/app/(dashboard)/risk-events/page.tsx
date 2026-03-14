import type { Metadata } from 'next';
import Link from 'next/link';
import { RiskEventList } from '@/components/risk/risk-event-list';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { riskEvents as demoRiskEvents } from '@/lib/demo-data';
import type { RiskEvent } from '@/lib/demo-data';
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
  summary: string | null;
  detected_at: string | null;
  resolved_at: string | null;
};

function mapDbRowToRiskEvent(row: DbRiskEventRow): RiskEvent {
  const status: RiskEvent['status'] = row.resolved_at ? 'resolved' : 'active';

  return {
    id: row.id,
    title: row.title,
    type: row.event_type,
    region: 'Unknown',
    severity: (row.severity as RiskEvent['severity']) ?? 'low',
    status,
    date: row.detected_at
      ? row.detected_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    affectedSupplierIds: [],
    summary: row.summary ?? '',
  };
}

export default async function RiskEventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const successParam = Array.isArray(params.success)
    ? params.success[0]
    : params.success;
  const updatedParam = Array.isArray(params.updated)
    ? params.updated[0]
    : params.updated;
  const showSuccess = successParam === '1';
  const showUpdated = updatedParam === '1';

  let events: RiskEvent[] = demoRiskEvents;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('risk_events')
      .select(
        'id, title, event_type, severity, source, summary, detected_at, resolved_at',
      )
      .order('detected_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      events = (data as DbRiskEventRow[]).map(mapDbRowToRiskEvent);
    }
  } catch {
    // Fall back to demo data if the DB is unavailable.
  }

  return (
    <div className="space-y-6">
      {showSuccess ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Risk event created and scoring pipeline triggered successfully.
        </p>
      ) : null}
      {showUpdated ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Risk event updated and scoring pipeline re-run successfully.
        </p>
      ) : null}

      <PageHeader
        eyebrow="Monitoring"
        title="A disruption feed designed to move cleanly into alerting and incident response."
        description="This list covers the most important Phase 4 need: risk events can be scanned, filtered, and escalated from one place."
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

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RiskEventList events={events} />
        <SectionCard
          eyebrow="Triage"
          title="Escalation logic"
          description="Risk scores are recalculated automatically when events are ingested. Alerts are raised when composite scores cross the configured threshold."
        >
          <div className="grid gap-4">
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="font-semibold">Critical trigger</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Events affecting suppliers with a composite score at or above
                the org threshold automatically generate a new alert in the
                alert queue.
              </p>
            </article>
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="font-semibold">Regional clustering</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Future scoring hooks can highlight region clusters when multiple
                disruption classes hit the same network segment.
              </p>
            </article>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
