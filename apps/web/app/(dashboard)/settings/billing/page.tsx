import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Billing Settings | Supply Chain Risk Intelligence Platform',
  description: 'Billing and subscription UI placeholder for the platform.',
};

const plans = [
  { name: 'Starter', suppliers: 'Up to 25 suppliers', status: 'inactive' },
  { name: 'Professional', suppliers: 'Up to 100 suppliers', status: 'active' },
  {
    name: 'Enterprise',
    suppliers: 'Unlimited visibility',
    status: 'available',
  },
];

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Billing and plan usage"
        description="Stretch UI for the Stripe-backed subscription model described in the plan."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          eyebrow="Usage"
          title="Current plan"
          description="Supplier-monitored pricing aligns with the MVP monetization strategy."
        >
          <div className="space-y-4">
            <div className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="text-muted-foreground text-sm font-semibold tracking-[0.24em] uppercase">
                Active plan
              </p>
              <p className="mt-3 text-3xl font-semibold">Professional</p>
              <p className="text-muted-foreground mt-2 text-sm">
                42 of 100 monitored suppliers in use this cycle.
              </p>
            </div>
            <button type="button" className={buttonStyles('primary')}>
              Open billing portal
            </button>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Plans"
          title="Available tiers"
          description="Placeholder pricing cards for the future Stripe checkout flow."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  <StatusBadge status={plan.status} />
                </div>
                <p className="text-muted-foreground mt-3 text-sm">
                  {plan.suppliers}
                </p>
                <button
                  type="button"
                  className={`${buttonStyles('secondary')} mt-4 w-full`}
                >
                  Choose plan
                </button>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
