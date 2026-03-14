import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PublicSessionRedirect } from '@/components/auth/public-session-redirect';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <PublicSessionRedirect />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-20 md:px-10">
        <div className="flex flex-col gap-8">
          <span className="border-border bg-background/80 text-muted-foreground inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium backdrop-blur">
            Phase 2 database and auth implementation
          </span>
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Supply Chain Risk Intelligence for real-world disruption response.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
              The app now includes Supabase schema migrations, org-scoped auth,
              protected dashboard routing, and onboarding flows for first-login
              workspace creation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Create account
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            'Timestamped Supabase migrations for orgs, suppliers, risk engine, incidents, integrations, and billing',
            'Email/password and Google OAuth flows with callback exchange and protected dashboard layout',
            'First-login organization bootstrap plus member invitation built on RLS-aware org memberships',
          ].map((item) => (
            <article
              key={item}
              className="border-border bg-background/85 rounded-3xl border p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
            >
              <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">
                Foundation
              </p>
              <p className="text-foreground mt-4 text-lg leading-7">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
