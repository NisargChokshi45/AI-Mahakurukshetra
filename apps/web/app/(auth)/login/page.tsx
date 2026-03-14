import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signInAction, signInWithGoogleAction } from '@/app/(auth)/actions';
import { PasswordInput } from '@/components/auth/password-input';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your organization workspace.',
};

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const params = (await searchParams) ?? {};
  const error = readMessage(params.error);
  const message = readMessage(params.message);

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 md:px-10">
      <div className="grid w-full gap-10 rounded-[2rem] border border-black/10 bg-white/90 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.4)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-12">
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
              Supply Chain Risk Intelligence
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Sign in to monitor suppliers, disruptions, and incidents in one
              workspace.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Email/password and Google OAuth are wired for the org-scoped Phase
              2 auth flow.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              Protected dashboard routes with session refresh middleware.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              First-login org bootstrap and member invite flow.
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white md:p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm leading-6 text-slate-300">
              Use your organization credentials to continue.
            </p>
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {message}
            </p>
          ) : null}

          <form action={signInAction} className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white ring-0 outline-none placeholder:text-slate-500"
                placeholder="you@company.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <PasswordInput required name="password" placeholder="••••••••" />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Sign in
            </button>
          </form>

          <form action={signInWithGoogleAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            New here?{' '}
            <Link href="/signup" className="font-semibold text-white">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
