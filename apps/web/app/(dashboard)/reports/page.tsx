import type { Metadata } from 'next';
import { reports } from '@/lib/demo-data';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Reports | Supply Chain Risk Intelligence Platform',
  description:
    'Reports workspace with generation entry points and export-ready list items.',
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Generate executive summaries and supplier scorecards without leaving the workspace."
        description="This Phase 4 page focuses on output surfaces judges can understand quickly: report types, owners, status, and clear export actions."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          eyebrow="Generate"
          title="Create a report"
          description="UI scaffold for later server actions and CSV export handlers."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Report type
              <select className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none">
                <option>Executive Summary</option>
                <option>Supplier Scorecard</option>
                <option>Regional Heatmap</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Scope
              <input
                placeholder="Global operations"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={buttonStyles('primary')}>
                Generate now
              </button>
              <button type="button" className={buttonStyles('secondary')}>
                Queue export CSV
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Queue"
          title="Report queue"
          description="Recent generated outputs and scheduled exports."
        >
          <div className="grid gap-4">
            {reports.map((report) => (
              <article
                key={report.id}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="text-muted-foreground text-sm">
                        {report.type}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">
                      {report.title}
                    </h3>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-sm">
                      <span>Owner: {report.owner}</span>
                      <span>{report.scope}</span>
                      <span>{report.generatedAt}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className={buttonStyles('secondary')}>
                      Preview
                    </button>
                    <button type="button" className={buttonStyles('primary')}>
                      Export CSV
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
