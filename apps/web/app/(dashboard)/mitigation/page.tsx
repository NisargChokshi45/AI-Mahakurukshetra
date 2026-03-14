import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Mitigation Plans | Supply Chain Risk Intelligence Platform',
  description:
    'Mitigation plan management workspace for formal response actions.',
};

const plans = [
  {
    name: 'Aurora air-freight contingency',
    owner: 'Arjun Rao',
    status: 'active',
    note: 'Expedite two partial loads and rebalance inventory across APAC plants.',
  },
  {
    name: 'Northwind resin alternate lot validation',
    owner: 'Meera Khanna',
    status: 'monitoring',
    note: 'Increase sampling and qualify backup resin blend for two product families.',
  },
  {
    name: 'Mexico broker pre-clearance package',
    owner: 'Sofia Patel',
    status: 'draft',
    note: 'Standardize customs packets for high-volume forged components.',
  },
];

export default function MitigationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mitigation"
        title="Formal response plans for recurring or high-impact supply risk."
        description="This stretch page turns recurring incident actions into reusable mitigation plans with ownership and status tracking."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          eyebrow="Create"
          title="New mitigation plan"
          description="Structured placeholder for the formal mitigation workflow."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Plan name
              <input
                placeholder="Regional rerouting fallback"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Owner
              <input
                placeholder="Risk manager"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Summary
              <textarea
                placeholder="Capture the mitigation approach, dependencies, and expected outcome."
                className="border-border/70 bg-background/85 min-h-28 rounded-[24px] border px-4 py-3 text-sm outline-none"
              />
            </label>
            <button type="button" className={buttonStyles('primary')}>
              Save plan draft
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Library"
          title="Mitigation plans"
          description="Active and draft plans linked to supplier risk patterns."
        >
          <div className="grid gap-4">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Owner: {plan.owner}
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {plan.note}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
