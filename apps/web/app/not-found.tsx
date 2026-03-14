import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonStyles } from '@/components/dashboard/ui';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: '404 · Not Found | SupplySense AI',
  description:
    'The page you requested is not implemented yet. Return to the dashboard or explore the core workspaces instead.',
};

const documentNav = [
  { label: 'Capabilities', href: '/#capabilities' },
  { label: 'Workflow', href: '/#workflow' },
  { label: 'Outcomes', href: '/#outcomes' },
];

const dashboardActions = [
  { label: 'Go to dashboard', href: '/dashboard', variant: 'primary' as const },
  {
    label: 'Open incidents board',
    href: '/dashboard#incidents',
    variant: 'secondary' as const,
  },
  {
    label: 'View reports & exports',
    href: '/dashboard#reports',
    variant: 'ghost' as const,
  },
];

function NotFoundHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
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

      {!isLoggedIn && (
        <nav
          aria-label="Document navigation"
          className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex"
        >
          {documentNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className={buttonStyles('secondary')}>
              Dashboard
            </Link>
            <Link href="/logout" className={buttonStyles('ghost')}>
              Log out
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className={buttonStyles('ghost')}>
              Log in
            </Link>
            <Link href="/signup" className={buttonStyles('secondary')}>
              Start free
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default async function NotFoundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(247,249,252,1))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 md:py-8">
        <NotFoundHeader isLoggedIn={Boolean(user)} />

        <section className="border-border/60 flex w-full flex-col gap-6 rounded-[32px] border bg-white/80 p-8 shadow-[0_40px_80px_-44px_rgba(15,23,42,0.8)] backdrop-blur">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.4em] uppercase">
            404 · Page missing
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Well... this page seems to have taken a different route.
          </h1>
          <p className="text-muted-foreground max-w-3xl text-base leading-7">
            The page you are trying to reach has not been built yet. Return to
            your core workspace to continue triaging alerts, monitoring
            suppliers, or reviewing reports while we prepare this experience.
          </p>

          <div className="flex flex-wrap gap-3">
            {Boolean(user) &&
              dashboardActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={buttonStyles(action.variant)}
                >
                  {action.label}
                </Link>
              ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Command center',
                description:
                  'Dashboard is the fastest way back into alerts, risk trends, and mitigation workspaces.',
                href: '/dashboard',
              },
              {
                title: 'Incidents',
                description:
                  'Head straight to incident timelines to keep response teams aligned when something changes.',
                href: '/dashboard#incidents',
              },
              {
                title: 'Reports',
                description:
                  'Review executive summaries and exports from the reports workspace for stakeholder updates.',
                href: '/dashboard#reports',
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-[20px] border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 transition hover:border-slate-200"
              >
                <p className="font-semibold">{card.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
