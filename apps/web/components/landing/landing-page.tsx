import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  ChartNoAxesCombined,
  CircleCheckBig,
  Factory,
  Globe2,
  ShieldCheck,
  Siren,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';

type LandingPageProps = {
  isLoggedIn?: boolean;
};

export function LandingPage({ isLoggedIn = false }: LandingPageProps) {
  const brandHref = isLoggedIn ? '/dashboard' : '/';

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,_rgba(245,251,249,0.92)_0%,_rgba(238,247,253,0.86)_50%,_rgba(255,255,255,1)_100%)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[-10rem] h-[30rem] bg-[radial-gradient(circle_at_20%_40%,rgba(16,185,129,0.26),transparent_40%),radial-gradient(circle_at_80%_35%,rgba(14,165,233,0.22),transparent_34%)]"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 pt-6 pb-20 md:px-10 md:pb-24">
        <header className="border-border/70 bg-background/80 sticky top-4 z-20 flex items-center justify-between rounded-full border px-4 py-3 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur md:px-6">
          <Link
            href={brandHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]"
            />
            SupplySense AI
          </Link>
          <nav
            aria-label="Primary"
            className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex"
          >
            <Link
              href="/#capabilities"
              className="transition hover:text-slate-900"
            >
              Capabilities
            </Link>
            <Link href="/#workflow" className="transition hover:text-slate-900">
              Workflow
            </Link>
            <Link href="/#outcomes" className="transition hover:text-slate-900">
              Outcomes
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full border border-slate-950 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-muted-foreground inline-flex w-fit items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase">
              Live disruption intelligence for enterprise supply chains
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-950 md:text-6xl">
                Predict disruption risk before your suppliers miss critical
                delivery windows.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
                SupplySense AI unifies supplier exposure, regional threats, and
                incident response into one operations cockpit so teams can act
                in hours, not days.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Launch workspace
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Explore dashboard
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <article
                  key={stat.label}
                  className="border-border/80 bg-background/80 rounded-2xl border p-4"
                >
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 leading-6">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="border-border/70 bg-background/88 rounded-[2rem] border p-5 shadow-[0_30px_80px_-45px_rgba(14,116,144,0.55)] backdrop-blur md:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Operations Pulse
              </p>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Stable ingestion
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {pulseItems.map((item) => (
                <div
                  key={item.title}
                  className="border-border/70 bg-background/90 rounded-2xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm leading-6">
                        {item.description}
                      </p>
                    </div>
                    <item.icon
                      className="h-5 w-5 text-slate-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section
          id="capabilities"
          className="scroll-mt-28 space-y-6 md:scroll-mt-32"
        >
          <div className="max-w-2xl space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
              Capabilities
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              The complete risk loop from signal to mitigation.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {capabilityCards.map((card) => (
              <article
                key={card.title}
                className="border-border/80 bg-background/92 rounded-3xl border p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.52)]"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                  {card.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-7">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="grid scroll-mt-28 gap-6 md:scroll-mt-32 lg:grid-cols-[0.86fr_1.14fr]"
        >
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
              Workflow
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Designed for daily use by risk, procurement, and ops teams.
            </h2>
          </div>
          <div className="grid gap-3">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="border-border/80 bg-background/92 flex items-start gap-4 rounded-2xl border p-5"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-7">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="outcomes"
          className="border-border/80 scroll-mt-28 rounded-[2rem] border bg-[linear-gradient(120deg,_rgba(255,255,255,0.92),rgba(232,246,242,0.88))] p-6 shadow-[0_28px_85px_-52px_rgba(15,23,42,0.5)] md:scroll-mt-32 md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.22em] uppercase">
                Outcomes
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Run incident response with confidence and audit-ready context.
              </h2>
              <p className="text-muted-foreground text-sm leading-7 md:text-base">
                Every score update, disruption link, and alert escalation is
                tied to organization context and policy checks, giving leaders a
                reliable chain of evidence from detection to resolution.
              </p>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Build your demo workspace
              </Link>
            </div>
            <div className="grid gap-3">
              {outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="border-border/80 bg-background/80 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium text-slate-800"
                >
                  <CircleCheckBig
                    className="h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  {outcome}
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-border/80 grid gap-8 border-t pt-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:pt-10">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]"
              />
              SupplySense AI
            </p>
            <p className="text-muted-foreground max-w-md text-sm leading-7">
              Supply chain risk intelligence for teams that need clear signals,
              coordinated response, and audit-ready decisions.
            </p>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SupplySense AI. All rights reserved.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Product
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/#capabilities"
                className="text-slate-700 hover:text-slate-950"
              >
                Capabilities
              </Link>
              <Link
                href="/#workflow"
                className="text-slate-700 hover:text-slate-950"
              >
                Workflow
              </Link>
              <Link
                href="/#outcomes"
                className="text-slate-700 hover:text-slate-950"
              >
                Outcomes
              </Link>
              <Link
                href="/api/docs"
                className="text-slate-700 hover:text-slate-950"
              >
                API docs
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Access
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-950"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-slate-700 hover:text-slate-950"
              >
                Start free
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-700 hover:text-slate-950"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

type HeroStat = {
  label: string;
  value: string;
};

type PulseItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type CapabilityCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type WorkflowStep = {
  title: string;
  description: string;
};

const heroStats: HeroStat[] = [
  { value: '< 5 min', label: 'from alert to triage-ready incident' },
  { value: '100%', label: 'org-scoped access with RLS guardrails' },
  { value: '1 view', label: 'for suppliers, events, and mitigation' },
];

const pulseItems: PulseItem[] = [
  {
    title: 'Live Supplier Risk Scores',
    description:
      'Composite scoring across financial, geopolitical, operational, and delivery dimensions.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Escalation Alerts',
    description:
      'Threshold crossings and high-blast events are elevated automatically for response teams.',
    icon: Siren,
  },
  {
    title: 'Incident Workboard',
    description:
      'Assign owners, track mitigation actions, and close the loop with status transitions.',
    icon: Workflow,
  },
];

const capabilityCards: CapabilityCard[] = [
  {
    title: 'Supplier Visibility',
    description:
      'Monitor suppliers across tiers, facilities, and regions with current risk posture and linked disruptions.',
    icon: Factory,
  },
  {
    title: 'Regional Threat Detection',
    description:
      'Surface events by severity and geography, then map likely business impact before disruptions spread.',
    icon: Globe2,
  },
  {
    title: 'Secure Operational Control',
    description:
      'Role-gated mutations, transactional ingestion, and signed webhooks protect critical workflows.',
    icon: ShieldCheck,
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: 'Detect signals early',
    description:
      'Ingest events from monitoring feeds or manual submissions and instantly score affected suppliers.',
  },
  {
    title: 'Prioritize by impact',
    description:
      'Focus on disruptions with the highest business risk using severity, threshold rules, and supplier exposure.',
  },
  {
    title: 'Coordinate response',
    description:
      'Move incidents through investigation and mitigation with owner assignment, action tracking, and reports.',
  },
];

const outcomes: string[] = [
  'Clear ownership across every incident stage',
  'Fewer false positives through threshold-cross alerts',
  'Fast executive reporting with timeline evidence',
  'Org-isolated data by default for multi-tenant safety',
];
