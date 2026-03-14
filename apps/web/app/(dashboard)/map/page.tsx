import type { Metadata } from 'next';
import Link from 'next/link';
import { dependencyMap } from '@/lib/demo-data';
import {
  PageHeader,
  RiskScoreBadge,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { SupplyChainMap } from '@/components/map/supply-chain-map';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Supply Chain Map | Supply Chain Risk Intelligence Platform',
  description:
    'Interactive geographic map showing supplier facilities color-coded by risk score.',
};

export const dynamic = 'force-dynamic';

const tiers: Array<'Org' | 'Tier 1' | 'Tier 2' | 'Tier 3'> = [
  'Org',
  'Tier 1',
  'Tier 2',
  'Tier 3',
];

const TIER_LABEL: Record<string, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};

const riskTone = (score: number) => {
  if (score >= 80) return 'bg-rose-500/70';
  if (score >= 65) return 'bg-amber-500/70';
  return 'bg-emerald-500/70';
};

export default async function MapPage() {
  const supabase = await createClient();

  // Fetch supplier facilities with supplier info
  const { data: facilitiesData } = await supabase
    .from('supplier_facilities')
    .select(
      `
      id,
      name,
      facility_type,
      city,
      country,
      latitude,
      longitude,
      suppliers!inner(
        name,
        slug,
        tier,
        current_risk_score
      )
    `,
    )
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  // Transform data for map component
  type SupplierJoin = {
    name: string;
    slug: string;
    tier: string;
    current_risk_score: number;
  };

  const facilities =
    facilitiesData?.map((f) => {
      const s = f.suppliers as unknown as SupplierJoin;
      return {
        id: f.id,
        name: f.name,
        facilityType: f.facility_type,
        city: f.city ?? '',
        country: f.country,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        supplier: {
          name: s.name,
          slug: s.slug,
          riskScore: Math.round(Number(s.current_risk_score)),
          tier: TIER_LABEL[s.tier] ?? s.tier,
        },
      };
    }) ?? [];

  const hasMapData = facilities.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Geographic View"
        title="Global supplier facility map with real-time risk intelligence"
        description="Interactive map showing all supplier facilities color-coded by risk score. Click markers for detailed supplier information."
        actions={
          <Link href="/suppliers" className={buttonStyles('secondary')}>
            View supplier directory
          </Link>
        }
      />

      {hasMapData ? (
        <SectionCard
          eyebrow="Map"
          title="Supplier facilities by risk level"
          description="Facilities are color-coded from green (low risk) to red (critical risk). Click any marker for detailed supplier information."
        >
          <SupplyChainMap facilities={facilities} />
        </SectionCard>
      ) : (
        <SectionCard
          eyebrow="Map"
          title="No facility data available"
          description="Run database migrations and seed data to see the geographic map."
        >
          <div className="border-border/70 bg-background/50 rounded-[24px] border p-12 text-center">
            <p className="text-muted-foreground">
              No supplier facilities with coordinates found.
            </p>
          </div>
        </SectionCard>
      )}

      <SectionCard
        eyebrow="Dependency Graph"
        title="Organizational dependency map"
        description="Tiered view showing supplier relationships and dependencies across your supply chain."
      >
        <div className="border-border/70 bg-background/40 rounded-[26px] border p-4 md:p-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => {
              const tierNodes = dependencyMap.filter(
                (node) => node.tier === tier,
              );

              return (
                <div key={tier} className="space-y-4">
                  <div className="border-border/70 bg-background/80 flex items-center justify-between rounded-full border px-4 py-2 text-sm font-semibold">
                    <span>{tier}</span>
                    <span className="text-muted-foreground text-xs font-medium">
                      {tierNodes.length} nodes
                    </span>
                  </div>
                  <div className="space-y-3">
                    {tierNodes.map((node) => {
                      const inner = (
                        <>
                          <div className="absolute top-5 left-4 h-9 w-1 rounded-full">
                            <span
                              className={`block h-full w-full rounded-full ${riskTone(
                                node.riskScore,
                              )}`}
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="leading-6 font-semibold text-balance">
                                {node.label}
                              </p>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {node.region}
                              </p>
                            </div>
                            <RiskScoreBadge score={node.riskScore} />
                          </div>
                          <div className="mt-4">
                            <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
                              Downstream
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {node.dependencyLabels.length === 0 ? (
                                <span className="text-muted-foreground text-sm">
                                  No downstream nodes
                                </span>
                              ) : (
                                node.dependencyLabels.map((dependency) => (
                                  <span
                                    key={dependency}
                                    className="border-border/70 text-muted-foreground rounded-full border px-3 py-1 text-xs"
                                  >
                                    {dependency}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      );

                      return node.supplierId ? (
                        <Link
                          key={node.id}
                          href={`/suppliers/${node.supplierId}`}
                          className="border-border/70 bg-background/80 group relative block rounded-[22px] border p-4 pl-8 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <article
                          key={node.id}
                          className="border-border/70 bg-background/80 relative rounded-[22px] border p-4 pl-8"
                        >
                          {inner}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
