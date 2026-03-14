import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signUpAction } from '@/app/(auth)/actions';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Signup',
  description: 'Create a new workspace account.',
};

export const dynamic = 'force-dynamic';

type SignupPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const params = (await searchParams) ?? {};
  const error = readMessage(params.error);

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 md:px-10">
      <div className="grid w-full gap-8 rounded-[2rem] border border-black/10 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] md:grid-cols-[0.95fr_1.05fr] md:p-12">
        <div className="rounded-[1.75rem] bg-emerald-50 p-6 md:p-8">
          <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
            Phase 2 Onboarding
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            Create your account, then bootstrap the first organization.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            The setup flow creates the auth identity first and provisions the
            org after the session is established.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 p-6 md:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-950">
              Create an account
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Use a work email so you can be invited into an existing workspace
              later if needed.
            </p>
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={signUpAction} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Display name
              </span>
              <input
                required
                name="displayName"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Maya Chen"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="maya@company.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                required
                type="password"
                name="password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="At least 8 characters"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-slate-950">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
