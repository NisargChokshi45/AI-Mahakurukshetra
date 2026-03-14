import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { buttonStyles } from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Login | Supply Chain Risk Intelligence Platform',
  description:
    'Sign in to the Supply Chain Risk Intelligence Platform workspace.',
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Sign in"
      title="Enter the risk operations workspace."
      description="This login surface is ready for Supabase email/password and Google OAuth wiring in Phase 2. The layout already supports enterprise positioning and clear auth choices."
      footer={
        <p>
          New to the platform?{' '}
          <Link href="/signup" className="text-foreground font-semibold">
            Create your organization workspace
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm">
            Use your organization credentials to continue.
          </p>
        </div>

        <form className="grid gap-4">
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
              placeholder="Enter your password"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
            />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="text-muted-foreground flex items-center gap-2">
              <input
                type="checkbox"
                className="border-border h-4 w-4 rounded"
              />
              Keep me signed in
            </label>
            <button type="button" className="text-foreground font-medium">
              Forgot password?
            </button>
          </div>
          <button type="button" className={buttonStyles('primary')}>
            Sign in
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="bg-border/70 h-px flex-1" />
          <span className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
            or
          </span>
          <div className="bg-border/70 h-px flex-1" />
        </div>

        <button type="button" className={buttonStyles('secondary')}>
          Continue with Google
        </button>
      </div>
    </AuthShell>
  );
}
