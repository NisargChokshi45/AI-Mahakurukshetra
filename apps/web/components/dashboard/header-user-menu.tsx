'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Building2, CreditCard, LogOut, User } from 'lucide-react';

type HeaderUserMenuProps = Readonly<{
  displayName: string;
  roleLabel: string;
  userInitials: string;
}>;

const accountNavigation = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/organization', label: 'Organization', icon: Building2 },
  { href: '/settings/billing', label: 'Billing', icon: CreditCard },
];

type PopupPosition = {
  left: number;
  top: number;
};

export function HeaderUserMenu({
  displayName,
  roleLabel,
  userInitials,
}: HeaderUserMenuProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopupPosition>({ left: 0, top: 0 });

  const updatePosition = useCallback(() => {
    const trigger = buttonRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const popupWidth = 256;
    const padding = 12;

    const left = Math.min(
      Math.max(padding, rect.right - popupWidth),
      window.innerWidth - popupWidth - padding,
    );

    setPosition({
      left,
      top: rect.bottom + 8,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, updatePosition]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 transition hover:bg-slate-50 sm:gap-3 sm:px-3 sm:py-2"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white sm:h-9 sm:w-9">
          {userInitials || 'U'}
        </span>
        <span className="hidden max-w-[140px] text-left sm:block">
          <span className="block truncate text-sm font-semibold text-slate-900">
            {displayName}
          </span>
          <span className="block truncate text-xs text-slate-500">
            {roleLabel}
          </span>
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
            aria-label="Close account menu"
          />
          <div
            role="menu"
            className="fixed z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
            style={{ left: `${position.left}px`, top: `${position.top}px` }}
          >
            {accountNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/logout"
              onClick={() => setIsOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
