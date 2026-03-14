'use client';

import { useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type PublicSessionRedirectProps = Readonly<{
  redirectTo?: string;
}>;

const REDIRECT_EVENTS = new Set([
  'INITIAL_SESSION',
  'SIGNED_IN',
  'TOKEN_REFRESHED',
  'USER_UPDATED',
]);

export function PublicSessionRedirect({
  redirectTo = '/dashboard',
}: PublicSessionRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const redirectIfSignedIn = () => {
      if (pathname !== redirectTo) {
        router.replace(redirectTo);
      }
      router.refresh();
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        redirectIfSignedIn();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && REDIRECT_EVENTS.has(event)) {
        redirectIfSignedIn();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, redirectTo, router, supabase]);

  return null;
}
