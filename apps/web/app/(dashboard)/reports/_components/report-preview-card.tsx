import { StatusBadge } from '@/components/dashboard/ui';
import type { Report } from '@/lib/demo-data';

const previewHighlights = [
  {
    label: 'At-risk suppliers',
    value: '18',
    detail: '+3 week-over-week',
  },
  {
    label: 'Open incidents',
    value: '7',
    detail: '2 marked mitigated today',
  },
  {
    label: 'Regional exposure',
    value: '3 zones',
    detail: 'East Asia highest concentration',
  },
] as const;

const riskDrivers = [
  {
    name: 'Freight bottlenecks',
    score: '84',
    change: '+9',
    widthClassName: 'w-[84%]',
  },
  {
    name: 'Export-control volatility',
    score: '78',
    change: '+6',
    widthClassName: 'w-[78%]',
  },
  {
    name: 'Weather-linked delays',
    score: '65',
    change: '+4',
    widthClassName: 'w-[65%]',
  },
] as const;

const responseTimeline = [
  {
    time: '07:40 IST',
    text: 'Risk watchlist rebalance published to procurement and operations.',
  },
  {
    time: '09:05 IST',
    text: 'Aurora Electronics mitigation owner assigned with 24-hour SLA.',
  },
  {
    time: '11:20 IST',
    text: 'Regional contingency review scheduled with logistics leads.',
  },
] as const;

type ReportPreviewCardProps = Readonly<{
  report: Report;
}>;

export function ReportPreviewCard({ report }: ReportPreviewCardProps) {
  return (
    <section className="border-border/70 from-card via-card/90 to-background/90 rounded-[28px] border bg-gradient-to-br p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)]">
      <div className="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <span className="text-muted-foreground text-sm">{report.type}</span>
          <span className="text-muted-foreground text-sm">#{report.id}</span>
        </div>
        <span className="text-muted-foreground text-xs font-medium">
          Generated {report.generatedAt}
        </span>
      </div>

      <div className="space-y-6 pt-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            {report.title}
          </h3>
          <p className="text-muted-foreground max-w-2xl text-sm leading-6">
            Executive preview: risk concentration remains elevated across APAC
            supplier lanes, with mitigation momentum improving after
            today&apos;s incident triage updates.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {previewHighlights.map((highlight) => (
            <article
              key={highlight.label}
              className="border-border/70 bg-background/80 rounded-2xl border p-4"
            >
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                {highlight.label}
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {highlight.value}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {highlight.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-3">
            <h4 className="text-sm font-semibold tracking-[0.16em] uppercase">
              Primary risk drivers
            </h4>
            <div className="space-y-3">
              {riskDrivers.map((driver) => (
                <div
                  key={driver.name}
                  className="border-border/70 bg-background/70 rounded-2xl border p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{driver.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Score {driver.score} ({driver.change})
                    </p>
                  </div>
                  <div className="bg-muted mt-3 h-2.5 overflow-hidden rounded-full">
                    <div
                      className={`from-primary/70 to-primary h-full rounded-full bg-gradient-to-r ${driver.widthClassName}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="space-y-3">
            <h4 className="text-sm font-semibold tracking-[0.16em] uppercase">
              Mitigation timeline
            </h4>
            <ol className="space-y-3">
              {responseTimeline.map((timelineItem) => (
                <li
                  key={timelineItem.time}
                  className="border-border/70 bg-background/70 rounded-2xl border p-3"
                >
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                    {timelineItem.time}
                  </p>
                  <p className="mt-2 text-sm leading-6">{timelineItem.text}</p>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </div>
    </section>
  );
}
