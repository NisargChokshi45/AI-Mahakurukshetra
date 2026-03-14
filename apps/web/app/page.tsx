import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const highlights = [
  'Dashboard with alert severity, trend cards, disruption feed, and supplier watchlist',
  'Supplier directory, supplier detail workspaces, and risk event monitoring surfaces',
  'Incident board, incident workspace, dependency map, reports, and assessments queue',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-20 md:px-10">
        <div className="flex flex-col gap-8">
          <span className="border-border bg-background/80 text-muted-foreground inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium backdrop-blur">
            Phase 4 core UI shipped
          </span>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <div className="bg-primary text-primary-foreground inline-flex h-14 w-14 items-center justify-center rounded-3xl shadow-[0_20px_50px_-30px_rgba(5,46,22,0.8)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                Supply Chain Risk Intelligence for live disruption monitoring
                and response.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
                The platform now includes the core operator shell from Phase 4:
                seeded dashboard views, supplier drill-downs, disruption
                monitoring, incident workflows, reports, assessments, and a
                dependency map.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="bg-primary text-primary-foreground inline-flex min-h-11 items-center rounded-full px-5 py-2 text-sm font-semibold shadow-[0_16px_40px_-24px_rgba(5,46,22,0.8)] transition hover:opacity-90"
                >
                  Enter dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/suppliers"
                  className="border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-sm font-semibold transition"
                >
                  Browse suppliers
                </Link>
                <Link
                  href="/login"
                  className="border-border bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-sm font-semibold transition"
                >
                  Open auth UI
                </Link>
              </div>
            </div>

            <div className="border-border/70 bg-background/85 rounded-[32px] border p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                Demo coverage
              </p>
              <div className="mt-5 space-y-4">
                {highlights.map((item) => (
                  <article
                    key={item}
                    className="border-border/70 bg-card/80 rounded-[24px] border p-4"
                  >
                    <p className="text-sm leading-7">{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
