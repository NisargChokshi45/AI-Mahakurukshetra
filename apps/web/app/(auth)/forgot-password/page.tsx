import type { Metadata } from 'next';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/(auth)/actions';
import { consumeFlash } from '@/lib/flash';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link.',
};

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage() {
  const { error, message } = await consumeFlash();

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-20 md:px-10">
      <div className="grid w-full gap-8 rounded-[2rem] border border-black/5 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] md:grid-cols-[1.05fr_0.95fr] md:p-12">
        <div className="flex flex-col justify-between gap-6 rounded-[1.75rem] bg-emerald-50 p-6 md:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.3em] text-emerald-700 uppercase">
              Account recovery
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Locked out? We&apos;ll get you back in.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              Enter the email address linked to your workspace and we&apos;ll
              send a secure reset link. The link is single-use and expires after
              1 hour.
            </p>
            <p className="max-w-lg text-base leading-7 text-slate-600">
              If you don&apos;t see the email within a few minutes, check your
              spam folder or contact your organization admin.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.5em] text-slate-400 uppercase">
              Password reset
            </p>
            <h2 className="text-2xl font-semibold text-slate-950">
              Forgot your password?
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Enter your email and we&apos;ll send you a reset link.
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

          <form action={forgotPasswordAction} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                required
                type="email"
                name="email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition duration-150 ease-in-out outline-none placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-200/70"
                placeholder="yourname@company.com"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Send reset link
            </button>
          </form>

          <p className="text-sm text-slate-500">
            Remembered it?{' '}
            <Link href="/login" className="font-semibold text-slate-950">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
