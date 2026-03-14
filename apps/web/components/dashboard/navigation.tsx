'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  ClipboardCheck,
  LayoutDashboard,
  Map,
  Settings2,
  ShieldAlert,
  Siren,
  Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/suppliers', label: 'Suppliers', icon: Users2 },
  { href: '/risk-events', label: 'Risk Events', icon: ShieldAlert },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/incidents', label: 'Incidents', icon: Siren },
  { href: '/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { href: '/settings/profile', label: 'Settings', icon: Settings2 },
];

type DashboardNavigationProps = Readonly<{
  compact?: boolean;
}>;

export function DashboardNavigation({
  compact = false,
}: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex gap-2',
        compact
          ? 'overflow-x-auto pb-2'
          : 'border-border/70 bg-background/80 flex-col rounded-[28px] border p-3',
      )}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'focus-visible:outline-ring inline-flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2',
              compact &&
                'border-border/70 bg-background/80 shrink-0 rounded-full border',
              isActive
                ? 'bg-primary text-primary-foreground shadow-[0_16px_44px_-28px_rgba(5,46,22,0.75)]'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
