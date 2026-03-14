import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { buttonStyles } from '@/components/dashboard/ui';

type AuthShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}>;

export function AuthShell({
  eyebrow,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_520px] lg:items-center">
        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground inline-flex h-14 w-14 items-center justify-center rounded-3xl shadow-[0_20px_50px_-30px_rgba(5,46,22,0.8)]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.28em] uppercase">
              {eyebrow}
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-7">
              {description}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Real-time alerting and supplier watchlists',
              'Incident coordination with clear ownership',
              'Reports, assessments, and dependency visibility',
            ].map((item) => (
              <article
                key={item}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.5)]"
              >
                <p className="text-sm leading-6">{item}</p>
              </article>
            ))}
          </div>
          <Link href="/" className={buttonStyles('ghost')}>
            Back to overview
          </Link>
        </div>

        <div className="border-border/70 bg-card/88 rounded-[32px] border p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.55)] backdrop-blur lg:p-8">
          {children}
          <div className="border-border/70 text-muted-foreground mt-6 border-t pt-5 text-sm">
            {footer}
          </div>
        </div>
      </section>
    </main>
  );
}
