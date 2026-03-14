import type { Metadata } from 'next';
import Link from 'next/link';
import {
  type DependencyCheck,
  getServiceStatusReport,
} from '@/lib/api/service-status';
import {
  MetricCard,
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Service Status | Supply Chain Risk Intelligence Platform',
  description:
    'Operational service status with database and Redis checks, latency diagnostics, and uptime metadata.',
};

function getStatusTone(status: DependencyCheck['status']) {
  if (status === 'up') {
    return {
      badge: 'bg-emerald-100 text-emerald-800',
      label: 'Operational',
    };
  }

  if (status === 'unconfigured') {
    return {
      badge: 'bg-amber-100 text-amber-800',
      label: 'Not configured',
    };
  }

  return {
    badge: 'bg-rose-100 text-rose-800',
    label: 'Down',
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export default async function ServiceStatusPage() {
  const report = await getServiceStatusReport();
  const generatedAt = new Date(report.timestamp).toLocaleString();
  const statusClass =
    report.status === 'ok'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-amber-200 bg-amber-50 text-amber-900';

  const dependencies = [
    {
      key: 'database',
      label: 'Supabase Postgres',
      check: report.checks.database,
    },
    { key: 'redis', label: 'Upstash Redis', check: report.checks.redis },
  ] as const;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(246,247,250,1))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 md:py-8">
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
            aria-label="Document navigation"
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
            eyebrow="Service Reliability"
            title="Live platform dependency status"
            description="Operational view of critical runtime dependencies. This page converts health payloads into a readable diagnostic panel for on-call and integration teams."
            actions={
              <>
                <Link href="/api/docs" className={buttonStyles('ghost')}>
                  Back to API docs
                </Link>
              </>
            }
          />

          <section className={`rounded-[24px] border px-5 py-4 ${statusClass}`}>
            <p className="text-xs font-semibold tracking-[0.24em] uppercase">
              Global status
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {report.status === 'ok'
                ? 'All required services are operational.'
                : 'Platform is degraded. One or more critical checks need attention.'}
            </p>
            <p className="mt-1 text-sm opacity-80">
              Snapshot generated at {generatedAt}
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="App version"
              value={report.version}
              detail="Version currently serving health checks."
            />
            <MetricCard
              label="Uptime"
              value={formatUptime(report.uptime_seconds)}
              detail="Process uptime since last restart."
            />
            <MetricCard
              label="Dependencies up"
              value={String(
                dependencies.filter(
                  (dependency) => dependency.check.status === 'up',
                ).length,
              )}
              detail={`${dependencies.length} critical dependencies monitored.`}
            />
          </section>

          <SectionCard
            eyebrow="Dependency Diagnostics"
            title="Component health breakdown"
            description="Latency and state detail for each backing service used by the API runtime."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {dependencies.map((dependency) => {
                const tone = getStatusTone(dependency.check.status);

                return (
                  <article
                    key={dependency.key}
                    className="border-border/70 bg-background/80 rounded-[20px] border p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {dependency.label}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Key: {dependency.key}
                        </p>
                      </div>
                      <span
                        className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold ${tone.badge}`}
                      >
                        {tone.label}
                      </span>
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Latency</dt>
                        <dd className="font-medium text-slate-900">
                          {dependency.check.latency_ms === null
                            ? 'N/A'
                            : `${dependency.check.latency_ms} ms`}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">
                          Status code impact
                        </dt>
                        <dd className="font-medium text-slate-900">
                          {dependency.check.status === 'down'
                            ? 'Contributes to 503'
                            : 'Healthy response path'}
                        </dd>
                      </div>
                    </dl>

                    {dependency.check.detail ? (
                      <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                        {dependency.check.detail}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}
