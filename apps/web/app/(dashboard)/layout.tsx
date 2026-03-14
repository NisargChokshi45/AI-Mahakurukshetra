import Link from 'next/link';
import { Bell, LayoutDashboard, Settings } from 'lucide-react';
import { HeaderUserMenu } from '@/components/dashboard/header-user-menu';
import { requireOrganizationContext } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const primaryNavigation = [
  { href: '/suppliers', label: 'Suppliers' },
  { href: '/map', label: 'Map' },
  { href: '/assessments', label: 'Assessments' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/mitigation', label: 'Mitigation' },
  { href: '/reports', label: 'Reports' },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await requireOrganizationContext();
  const currentYear = new Date().getFullYear();
  const displayName =
    context.profile?.displayName ?? context.user.email ?? 'User';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 md:px-10 md:py-4">
          {/* Brand */}
          <div className="min-w-0 shrink-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.28em] text-emerald-700 uppercase transition hover:text-emerald-600"
            >
              <LayoutDashboard
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span className="hidden truncate sm:inline">
                {context.organization.organizationName}
              </span>
            </Link>
          </div>

          {/* Primary nav — hidden on mobile */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/settings/profile"
              aria-label="Settings"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 p-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:py-2"
            >
              <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <Link
              href="/risk-events"
              aria-label="Risk events"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 p-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:py-2"
            >
              <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Risk events</span>
            </Link>
            <HeaderUserMenu
              displayName={displayName}
              roleLabel={context.organization.role}
              userInitials={userInitials}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 md:px-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <p>
            © {currentYear} {context.organization.organizationName} · Risk OS
          </p>
          <p>Supply Chain Risk Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
