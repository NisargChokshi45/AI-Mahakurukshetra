import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { buttonStyles } from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Signup | Supply Chain Risk Intelligence Platform',
  description:
    'Create an organization workspace for the Supply Chain Risk Intelligence Platform.',
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      title="Create a seeded workspace in minutes."
      description="This signup page is structured around the onboarding flow from the plan: create an account, bootstrap an organization, seed demo data, and land directly in the dashboard."
      footer={
        <p>
          Already have access?{' '}
          <Link href="/login" className="text-foreground font-semibold">
            Sign in instead
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Create your workspace
          </h2>
          <p className="text-muted-foreground text-sm">
            Seeded demo data will appear right after onboarding completes.
          </p>
        </div>

        <form className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Full name
            <input
              placeholder="Aarav Mehta"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Organization name
            <input
              placeholder="Helix Global Manufacturing"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Work email
            <input
              type="email"
              placeholder="you@company.com"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Password
            <input
              type="password"
              placeholder="Create a password"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
            />
          </label>
          <label className="border-border/70 bg-background/70 text-muted-foreground flex items-start gap-3 rounded-[24px] border p-4 text-sm">
            <input
              type="checkbox"
              className="border-border mt-1 h-4 w-4 rounded"
            />
            <span>
              Create my organization, assign me as owner, and seed the default
              demo network so I can land directly in the dashboard.
            </span>
          </label>
          <button type="button" className={buttonStyles('primary')}>
            Create workspace
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
