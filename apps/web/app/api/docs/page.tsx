import type { Metadata } from 'next';
import Link from 'next/link';
import { SwaggerUi } from '@/components/api/swagger-ui';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'API Docs | Supply Chain Risk Intelligence Platform',
  description:
    'Interactive API documentation for developers and integration teams.',
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 md:py-8">
        <header className="border-border/70 bg-background/86 flex items-center justify-between rounded-full border px-4 py-3 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]"
            />
            SupplySense AI
          </Link>
          <nav
            aria-label="Primary"
            className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex"
          >
            <Link
              href="/#capabilities"
              className="transition hover:text-slate-900"
            >
              Capabilities
            </Link>
            <Link href="/#workflow" className="transition hover:text-slate-900">
              Workflow
            </Link>
            <Link href="/#outcomes" className="transition hover:text-slate-900">
              Outcomes
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="flex w-full flex-col gap-6 py-10 md:py-12">
          <PageHeader
            eyebrow="Developer Docs"
            title="Explore and test the API in one place"
            description="Use this interactive reference to browse endpoints, inspect request and response schemas, and try calls directly from your browser."
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/api/docs/openapi"
                  className={buttonStyles('secondary')}
                >
                  OpenAPI analysis
                </Link>
                <Link
                  href="/api/docs/service-status"
                  className={buttonStyles('ghost')}
                >
                  Service status
                </Link>
              </div>
            }
          />

          <section className="grid gap-4 md:grid-cols-3">
            <article className="border-border/70 bg-card/80 rounded-[24px] border p-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
                Step 1
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                Pick an endpoint
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Navigate by tags to quickly find auth, monitoring, reporting,
                and other API groups.
              </p>
              <div className="mt-4">
                <Link
                  href="/api/docs/openapi"
                  className={buttonStyles('secondary')}
                >
                  Open API analysis
                </Link>
              </div>
            </article>

            <article className="border-border/70 bg-card/80 rounded-[24px] border p-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
                Step 2
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                Review schema details
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Check required headers, payload fields, and example responses
                before integrating.
              </p>
              <div className="mt-4">
                <Link
                  href="/api/docs/openapi"
                  className={buttonStyles('ghost')}
                >
                  Inspect schema coverage
                </Link>
              </div>
            </article>

            <article className="border-border/70 bg-card/80 rounded-[24px] border p-5">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
                Step 3
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">
                Try requests safely
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Use the interactive controls to test calls and validate
                responses in real time.
              </p>
              <div className="mt-4">
                <Link href="#swagger-ui" className={buttonStyles('secondary')}>
                  Launch API explorer
                </Link>
              </div>
            </article>
          </section>

          <SectionCard
            eyebrow="Interactive Reference"
            title="API explorer"
            description="Browse operations, inspect schemas, and execute requests from the embedded Swagger UI."
            className="overflow-hidden"
          >
            <SwaggerUi />
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
