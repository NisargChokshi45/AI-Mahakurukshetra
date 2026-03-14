import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { resetPasswordAction } from '@/app/(auth)/actions';
import { PasswordInput } from '@/components/auth/password-input';
import { consumeFlash } from '@/lib/flash';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your account.',
};

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No active recovery session — send to forgot-password
  if (!user) {
    redirect('/forgot-password');
  }

  const { error, message } = await consumeFlash();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 md:px-10">
      <div className="grid w-full gap-8 rounded-[2rem] border border-black/5 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] md:grid-cols-[1.05fr_0.95fr] md:p-12">
        <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-emerald-50 p-6 md:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
              Account Recovery
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Set a new password to regain access to your workspace.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Choose a strong, unique password. Once updated, you&apos;ll be
              signed in and returned to your dashboard automatically.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.5em] text-slate-400 uppercase">
              New credentials
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Set a new password
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Choose a strong password — at least 8 characters.
            </p>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <form action={resetPasswordAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                New password
              </span>
              <PasswordInput required name="password" placeholder="••••••••" />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Update password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
