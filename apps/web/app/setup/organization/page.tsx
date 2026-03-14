import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createOrganizationAction } from '@/app/setup/organization/actions';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Organization Setup',
  description: 'Create your first organization workspace.',
};

export const dynamic = 'force-dynamic';

type SetupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrganizationSetupPage({
  searchParams,
}: SetupPageProps) {
  const context = await requireUser();

  if (context.organization) {
    redirect('/dashboard');
  }

  const params = (await searchParams) ?? {};
  const error = readMessage(params.error);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(236,253,245,1),_rgba(248,250,252,1))] px-6 py-20 md:px-10">
      <section className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] md:grid-cols-[1fr_0.9fr] md:p-12">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
            Workspace Bootstrap
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            Create the first organization for{' '}
            {context.profile?.displayName ?? context.user.email}.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            This provisions the tenant record, creates the owner membership,
            seeds default risk weights, and sets your active org for JWT claims.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 p-6 md:p-8">
          {error ? (
            <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={createOrganizationAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Organization name
              </span>
              <input
                required
                name="name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none"
                placeholder="Apex Resilience"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Industry
              </span>
              <input
                name="industry"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none"
                placeholder="Electronics"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Headquarters country
              </span>
              <input
                name="headquartersCountry"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none"
                placeholder="United States"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create workspace
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
