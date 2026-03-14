import Link from 'next/link';
import { BellDot, Search, ShieldCheck } from 'lucide-react';
import { organization } from '@/lib/demo-data';
import { DashboardNavigation } from './navigation';
import { buttonStyles } from './ui';

type AppShellProps = Readonly<{
  children: React.ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_rgba(251,253,252,1),_rgba(242,247,244,1))]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <aside className="hidden lg:flex lg:flex-col lg:gap-5">
          <div className="border-border/70 bg-card/85 rounded-[30px] border p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.55)] backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
                  Risk OS
                </p>
                <h1 className="text-lg font-semibold tracking-tight">
                  {organization.name}
                </h1>
              </div>
            </div>
            <div className="text-muted-foreground mt-6 space-y-2 text-sm">
              <p>{organization.workspace}</p>
              <p>{organization.coverage}</p>
              <p>{organization.responseWindow}</p>
            </div>
          </div>

          <DashboardNavigation />

          <div className="border-border/70 rounded-[30px] border bg-[linear-gradient(180deg,rgba(15,118,110,0.1),rgba(15,23,42,0.02))] p-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
              Command Center
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              Phase 4 seeded demo workspace
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              This shell is ready for Supabase-backed analytics, incident
              actions, and organization-aware routing in later phases.
            </p>
            <Link
              href="/reports"
              className={`${buttonStyles('secondary')} mt-5`}
            >
              Open reporting queue
            </Link>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col gap-5">
          <header className="border-border/70 bg-card/80 rounded-[30px] border px-5 py-4 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.5)] backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                    Supply Chain Risk Intelligence Platform
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Live workspace snapshot for judges and stakeholders
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className={buttonStyles('secondary')} type="button">
                    <Search className="mr-2 h-4 w-4" />
                    Search suppliers
                  </button>
                  <button className={buttonStyles('secondary')} type="button">
                    <BellDot className="mr-2 h-4 w-4" />5 active alerts
                  </button>
                </div>
              </div>
              <div className="lg:hidden">
                <DashboardNavigation compact />
              </div>
            </div>
          </header>
          <main className="pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
