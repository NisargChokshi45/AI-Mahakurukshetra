'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Blocks,
  Building2,
  CreditCard,
  PlugZap,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/settings/profile', label: 'Profile', icon: UserRound },
  { href: '/settings/organization', label: 'Organization', icon: Building2 },
  { href: '/settings/members', label: 'Members', icon: Blocks },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings/integrations', label: 'Integrations', icon: PlugZap },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="border-border/70 bg-card/80 flex gap-2 overflow-x-auto rounded-[26px] border p-3"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'focus-visible:outline-ring inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2',
              isActive
                ? 'bg-primary text-primary-foreground shadow-[0_16px_40px_-24px_rgba(5,46,22,0.8)]'
                : 'border-border/70 bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground border',
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
