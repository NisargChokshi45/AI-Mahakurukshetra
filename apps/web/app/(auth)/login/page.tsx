import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signInAction } from '@/app/(auth)/actions';
import { PasswordInput } from '@/components/auth/password-input';
import { createClient } from '@/lib/supabase/server';
import { consumeFlash } from '@/lib/flash';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your organization workspace.',
};

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const demoAccounts = [
    {
      role: 'Owner',
      email: 'owner@apex-resilience.demo',
      name: 'Sarah Chen',
    },
    {
      role: 'Admin',
      email: 'admin@apex-resilience.demo',
      name: 'Marcus Webb',
    },
    {
      role: 'Risk Manager',
      email: 'risk@apex-resilience.demo',
      name: 'Priya Nair',
    },
    {
      role: 'Procurement Lead',
      email: 'procurement@apex-resilience.demo',
      name: 'Daniel Park',
    },
    {
      role: 'Viewer',
      email: 'cfo@apex-resilience.demo',
      name: 'Elena Romero',
    },
  ];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const { error, message } = await consumeFlash();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 md:px-10">
      <div className="grid w-full gap-8 rounded-[2rem] border border-black/5 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] md:grid-cols-[1.05fr_0.95fr] md:p-12">
        <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-emerald-50 p-6 md:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
              Supply Chain Risk Intelligence
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Sign in to monitor suppliers, disruptions, and incidents in one
              workspace.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Every organization gets alerted, triaged, and resolved inside a
              single workspace-stay aligned by signing in with your organization
              identity.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.5em] text-slate-400 uppercase">
              Workspace access
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Welcome back
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Use your organization credentials to continue.
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <form action={signInAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition duration-150 ease-in-out outline-none placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200/70"
                placeholder="yourname@company.com"
              />
            </label>

            <label className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-slate-500 hover:text-slate-950"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput required name="password" placeholder="••••••••" />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
          </form>

          <p className="text-sm text-slate-500">
            New here?{' '}
            <Link href="/signup" className="font-semibold text-slate-950">
              Create an account
            </Link>
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 md:col-span-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
              Demo access
            </p>
            <p className="text-sm text-slate-600">
              Jump into the Apex Resilience workspace with a single click.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {demoAccounts.map((account) => (
              <form key={account.email} action={signInAction}>
                <input type="hidden" name="email" value={account.email} />
                <input type="hidden" name="password" value="DemoPass123!" />
                <button
                  type="submit"
                  className="flex shrink-0 items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:px-4 sm:py-3 sm:text-sm"
                >
                  <span>{account.role}</span>
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
