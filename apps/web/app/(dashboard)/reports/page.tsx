import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  SelectField,
  buttonStyles,
  selectStyles,
} from '@/components/dashboard/ui';
import { reports } from '@/lib/demo-data';
import { ReportPreviewCard } from './_components/report-preview-card';

type ReportsPageProps = Readonly<{
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export const metadata: Metadata = {
  title: 'Reports | Supply Chain Risk Intelligence Platform',
  description:
    'Reports workspace with generation entry points and export-ready list items.',
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = (await searchParams) ?? {};
  const previewParam = params.preview;
  const previewId = Array.isArray(previewParam)
    ? previewParam[0]
    : previewParam;
  const selectedPreviewReport = previewId
    ? reports.find((report) => report.id === previewId)
    : undefined;
  const defaultPreviewReport =
    reports.find((report) => report.status === 'completed') ?? reports[0];
  const featuredReport = selectedPreviewReport ?? defaultPreviewReport;
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const pdfPreviewTarget = stripeConfigured ? undefined : '_blank';
  const pdfPreviewLabel = 'Preview PDF';

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Generate polished executive digests and preview output before exporting."
        description="The reports workspace includes a realistic preview pane so teams can validate content quality and urgency before sharing with stakeholders."
        actions={
          <>
            <Link href="/incidents" className={buttonStyles('secondary')}>
              Open incidents
            </Link>
            <Link href="/suppliers" className={buttonStyles('secondary')}>
              Supplier directory
            </Link>
            <Link href="/dashboard" className={buttonStyles('primary')}>
              Dashboard
            </Link>
          </>
        }
      />

      {!stripeConfigured ? (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Stripe secret key is not configured. Report PDF previews are running
            in preview mode for local testing.
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <SectionCard
          eyebrow="Generate"
          title="Create a report"
          description="Choose report type, coverage, and audience before pushing an export."
        >
          <form
            className="space-y-4"
            aria-label="Generate report"
            method="get"
            action="/reports#report-preview"
          >
            <label
              htmlFor="report-type"
              className="grid gap-2 text-sm font-medium"
            >
              Report type
              <SelectField
                id="report-type"
                name="preview"
                defaultValue={featuredReport.id}
              >
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.type}
                  </option>
                ))}
              </SelectField>
            </label>

            <label
              htmlFor="report-scope"
              className="grid gap-2 text-sm font-medium"
            >
              Scope
              <input
                id="report-scope"
                placeholder="Global operations"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                defaultValue="Global operations"
              />
            </label>

            <label
              htmlFor="report-audience"
              className="grid gap-2 text-sm font-medium"
            >
              Audience
              <input
                id="report-audience"
                placeholder="Executive leadership, procurement, response team"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                defaultValue="Executive leadership and procurement leads"
              />
            </label>

            <label
              htmlFor="report-note"
              className="grid gap-2 text-sm font-medium"
            >
              Summary note
              <input
                id="report-note"
                placeholder="Highlight disruption priorities for this cycle"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm transition outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                defaultValue="Highlight risk hot-spots, active incidents, and mitigation ownership updates."
              />
            </label>

            <div className="bg-muted/45 border-border/70 rounded-2xl border p-4">
              <p className="text-sm font-medium">Distribution mode</p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Send as quick digest immediately or schedule CSV/PDF export for
                the next leadership sync.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" className={buttonStyles('primary')}>
                Generate preview
              </button>
              <button type="button" className={buttonStyles('secondary')}>
                Schedule export
              </button>
            </div>
          </form>
        </SectionCard>

        <div id="report-preview" className="scroll-mt-28">
          <ReportPreviewCard report={featuredReport} />
        </div>
      </div>

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
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={report.status} />
                    <span className="text-muted-foreground text-sm">
                      {report.type}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      #{report.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {report.title}
                  </h3>
                  <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                    <span>Owner: {report.owner}</span>
                    <span>{report.scope}</span>
                    <span>{report.generatedAt}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form
                    action="/api/reports/export"
                    method="get"
                    target={pdfPreviewTarget}
                  >
                    <input type="hidden" name="reportId" value={report.id} />
                    <input type="hidden" name="format" value="pdf" />
                    <button type="submit" className={buttonStyles('secondary')}>
                      {pdfPreviewLabel}
                    </button>
                  </form>
                  <a
                    href={`/api/reports/export?reportId=${encodeURIComponent(report.id)}`}
                    className={buttonStyles('primary')}
                  >
                    Export CSV
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
