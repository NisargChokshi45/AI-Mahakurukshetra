import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PublicSessionRedirect } from '@/components/auth/public-session-redirect';
import { LandingPage } from '@/components/landing/landing-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'SignalChain | Supply Chain Risk Intelligence',
  description:
    'Detect disruption risk early, assess supplier impact, and coordinate mitigation actions from one unified command center.',
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <PublicSessionRedirect />
      <LandingPage />
    </>
  );
}
