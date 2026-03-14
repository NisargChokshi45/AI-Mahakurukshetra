import type { Metadata } from 'next';
import Link from 'next/link';
import { RiskEventList } from '@/components/risk/risk-event-list';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { riskEvents } from '@/lib/demo-data';

export const metadata: Metadata = {
  title: 'Risk Events | Supply Chain Risk Intelligence Platform',
  description:
    'Risk monitoring feed with event filters, severity/status controls, and manual ingestion entry point.',
};

export default function RiskEventsPage() {
  return (
    <div className="space-y-6">
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
        <RiskEventList events={riskEvents} />
        <SectionCard
          eyebrow="Triage"
          title="Escalation logic preview"
          description="UI placeholders for the scoring and alert engine planned in Phase 3."
        >
          <div className="grid gap-4">
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="font-semibold">Critical trigger</p>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Events affecting more than three suppliers can auto-create a
                critical alert card and open a triage checklist.
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
