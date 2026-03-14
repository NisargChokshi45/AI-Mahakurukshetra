import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Auth Callback | Supply Chain Risk Intelligence Platform',
  description:
    'Completing authentication and organization bootstrap for the workspace.',
};

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-16">
        <PageHeader
          eyebrow="Auth callback"
          title="Completing sign-in and organization bootstrap."
          description="This route is a UI placeholder for the Supabase callback handler. It explains the expected redirect states while backend session wiring is still pending."
        />

        <SectionCard
          eyebrow="Status"
          title="Current callback states"
          description="Use this surface to render loading, success, and failure outcomes once the real auth flow is connected."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Validate auth token and establish session',
              'Check organization membership or create a new workspace',
              'Seed demo data and redirect to /dashboard',
            ].map((item) => (
              <article
                key={item}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4 text-sm leading-6"
              >
                {item}
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonStyles('primary')}>
              Continue to dashboard
            </Link>
            <Link href="/login" className={buttonStyles('secondary')}>
              Back to login
            </Link>
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
