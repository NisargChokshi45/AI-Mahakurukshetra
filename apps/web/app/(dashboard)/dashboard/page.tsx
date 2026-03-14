import type { Metadata } from 'next';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

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
  name: string;
  tier: string;
  current_risk_score: number;
};

type IncidentRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

type MetricRow = {
  at_risk_suppliers: number;
  open_incidents: number;
  total_suppliers: number;
};

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const context = await requireOrganizationContext();
  const params = (await searchParams) ?? {};
  const message = readMessage(params.message);
  const supabase = await createClient();

  const [
    { data: alerts },
    { data: suppliers },
    { data: incidents },
    { data: metrics },
  ] = await Promise.all([
    supabase
      .from('alerts')
      .select('id, severity, title, status')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('suppliers')
      .select('id, name, tier, current_risk_score')
      .order('current_risk_score', { ascending: false })
      .limit(5),
    supabase
      .from('incidents')
      .select('id, title, status, priority')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('metrics')
      .select('total_suppliers, at_risk_suppliers, open_incidents')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const latestMetrics = metrics as MetricRow | null;

  return (
    <div className="space-y-6">
      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total suppliers</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">
            {latestMetrics?.total_suppliers ?? suppliers?.length ?? 0}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">At-risk suppliers</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">
            {latestMetrics?.at_risk_suppliers ?? 0}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Open incidents</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">
            {latestMetrics?.open_incidents ?? incidents?.length ?? 0}
          </p>
        </article>
      </section>

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
              <article
                key={supplier.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-slate-950">{supplier.name}</p>
                  <p className="text-sm text-slate-500">{supplier.tier}</p>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  Risk {supplier.current_risk_score}
                </span>
              </article>
            ))}

            {!suppliers?.length ? (
              <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
                No suppliers yet. Run the seed or onboard data to populate the
                dashboard.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.28em] text-slate-500 uppercase">
              Active Alerts
            </p>
            <div className="mt-4 space-y-3">
              {((alerts ?? []) as AlertRow[]).map((alert) => (
                <article
                  key={alert.id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">{alert.title}</p>
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-red-700 uppercase">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{alert.status}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.28em] text-slate-500 uppercase">
              Incident Queue
            </p>
            <div className="mt-4 space-y-3">
              {((incidents ?? []) as IncidentRow[]).map((incident) => (
                <article
                  key={incident.id}
                  className="rounded-2xl border border-slate-200 px-4 py-4"
                >
                  <p className="font-medium text-slate-950">{incident.title}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {incident.status} · {incident.priority}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
