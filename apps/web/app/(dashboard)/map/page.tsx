import type { Metadata } from 'next';
import { dependencyMap } from '@/lib/demo-data';
import {
  PageHeader,
  RiskScoreBadge,
  SectionCard,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Supply Chain Map | Supply Chain Risk Intelligence Platform',
  description:
    'Dependency graph view with tiered supplier nodes and risk-coded visibility.',
};

const tiers: Array<'Org' | 'Tier 1' | 'Tier 2' | 'Tier 3'> = [
  'Org',
  'Tier 1',
  'Tier 2',
  'Tier 3',
];

export default function MapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dependency view"
        title="A supply chain map that shows who depends on whom, and where risk is stacking."
        description="The seeded map uses tiered columns instead of a heavy graph library, which keeps the MVP fast and reliable while still making the dependency story legible."
      />

      <SectionCard
        eyebrow="Map"
        title="Org → tiered supplier dependency graph"
        description="Nodes are color-coded with the same risk score language used throughout the dashboard."
      >
        <div className="grid gap-5 xl:grid-cols-4">
          {tiers.map((tier) => (
            <div key={tier} className="space-y-4">
              <div className="border-border/70 bg-background/75 rounded-full border px-4 py-3 text-sm font-semibold">
                {tier}
              </div>
              {dependencyMap
                .filter((node) => node.tier === tier)
                .map((node) => (
                  <article
                    key={node.id}
                    className="border-border/70 bg-background/80 rounded-[24px] border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{node.label}</p>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {node.region}
                        </p>
                      </div>
                      <RiskScoreBadge score={node.riskScore} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {node.dependencyLabels.length === 0 ? (
                        <span className="text-muted-foreground text-sm">
                          No downstream nodes
                        </span>
                      ) : (
                        node.dependencyLabels.map((dependency) => (
                          <span
                            key={dependency}
                            className="border-border/70 text-muted-foreground rounded-full border px-3 py-2 text-sm"
                          >
                            {dependency}
                          </span>
                        ))
                      )}
                    </div>
                  </article>
                ))}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
