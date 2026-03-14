import Link from 'next/link';
import { signOutAction } from '@/app/(auth)/actions';
import { requireOrganizationContext } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const navigation = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings/members', label: 'Members' },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await requireOrganizationContext();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-sm font-semibold tracking-[0.28em] text-emerald-700 uppercase">
              {context.organization.organizationName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as {context.profile?.displayName ?? context.user.email}{' '}
              · {context.organization.role}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">{children}</main>
    </div>
  );
}
