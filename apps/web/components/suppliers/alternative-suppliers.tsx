'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  RiskScoreBadge,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';
import { cn } from '@/lib/utils';
import { getSupplierById, suppliers as demoSuppliers } from '@/lib/demo-data';

type AlternativeSupplier = {
  supplier_id: string;
  supplier_slug: string | null;
  name: string;
  tier: string;
  status: string;
  country: string;
  current_risk_score: number | null;
  matched_component_count: number;
  matched_components: string[] | null;
  regions: string[] | null;
};

type AlternativeSuppliersPanelProps = {
  supplierId: string;
  title?: string;
  description?: string;
  limit?: number;
  className?: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TIER_LABEL: Record<string, string> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};

function formatTier(tier: string) {
  return TIER_LABEL[tier] ?? tier.replace(/_/g, ' ');
}

function normalizeList(values: string[] | null, fallback: string) {
  if (!values || values.length === 0) {
    return fallback;
  }

  return values.join(', ');
}

function buildDemoAlternatives(
  supplierId: string,
  limit: number,
): AlternativeSupplier[] {
  const target = getSupplierById(supplierId);
  if (!target) {
    return [];
  }

  const targetCategories = new Set(
    target.categories.map((category) => category.label.toLowerCase()),
  );

  const candidates = demoSuppliers
    .filter((supplier) => supplier.id !== target.id)
    .filter((supplier) => supplier.region !== target.region)
    .map((supplier) => {
      const matched = supplier.categories.filter((category) =>
        targetCategories.has(category.label.toLowerCase()),
      );

      return {
        supplier_id: supplier.id,
        supplier_slug: supplier.id,
        name: supplier.name,
        tier: supplier.tier,
        status: supplier.status,
        country: supplier.country,
        current_risk_score: supplier.riskScore,
        matched_component_count: matched.length,
        matched_components: matched.map((category) => category.label),
        regions: [supplier.region],
      } satisfies AlternativeSupplier;
    });

  const hasMatches = candidates.some(
    (candidate) => candidate.matched_component_count > 0,
  );

  return candidates
    .filter((candidate) =>
      hasMatches ? candidate.matched_component_count > 0 : true,
    )
    .sort((left, right) => {
      if (right.matched_component_count !== left.matched_component_count) {
        return right.matched_component_count - left.matched_component_count;
      }
      return (left.current_risk_score ?? 0) - (right.current_risk_score ?? 0);
    })
    .slice(0, Math.max(1, limit));
}

export function AlternativeSuppliersPanel({
  supplierId,
  title = 'Alternative suppliers',
  description = 'Capability-matched suppliers outside the impacted region, ranked by overlap and risk score.',
  limit = 4,
  className,
}: AlternativeSuppliersPanelProps) {
  const [alternatives, setAlternatives] = useState<AlternativeSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUuid = useMemo(() => uuidPattern.test(supplierId), [supplierId]);

  useEffect(() => {
    let isMounted = true;

    async function loadAlternatives() {
      if (!isUuid) {
        const demoAlternatives = buildDemoAlternatives(supplierId, limit);
        if (isMounted) {
          setAlternatives(demoAlternatives);
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/suppliers/alternatives?supplier_id=${supplierId}&limit=${limit}`,
        );

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const payload = (await response.json()) as {
          alternatives: AlternativeSupplier[];
        };

        if (isMounted) {
          setAlternatives(payload.alternatives ?? []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.log('Error loading alternative suppliers:', err);
          setError('Unable to load alternative suppliers right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAlternatives();

    return () => {
      isMounted = false;
    };
  }, [supplierId, limit, isUuid]);

  return (
    <SectionCard
      eyebrow="Continuity"
      title={title}
      description={description}
      className={cn(className)}
    >
      {loading ? (
        <p className="text-muted-foreground text-sm">
          Loading alternative suppliers...
        </p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !isUuid ? (
        alternatives.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Alternative matching is available once this supplier is synced to
            the live database.
          </p>
        ) : (
          <div className="grid gap-4">
            {alternatives.map((alternative) => {
              const supplierLink = alternative.supplier_slug
                ? `/suppliers/${alternative.supplier_slug}`
                : `/suppliers/${alternative.supplier_id}`;
              const matchedComponents = (alternative.matched_components ?? [])
                .filter(Boolean)
                .slice(0, 4);
              const hasMoreComponents =
                (alternative.matched_components?.length ?? 0) >
                matchedComponents.length;

              return (
                <article
                  key={alternative.supplier_id}
                  className="border-border/70 bg-background/80 rounded-[22px] border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {alternative.name}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatTier(alternative.tier)} · {alternative.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alternative.status} />
                      <RiskScoreBadge
                        score={Math.round(
                          Number(alternative.current_risk_score ?? 0),
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-3 grid gap-2 text-xs">
                    <p>
                      Regions:{' '}
                      {normalizeList(
                        alternative.regions,
                        'Regional data pending',
                      )}
                    </p>
                    <p>
                      Capability match: {alternative.matched_component_count}{' '}
                      capability
                      {alternative.matched_component_count === 1 ? '' : 'ies'}
                    </p>
                    {matchedComponents.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchedComponents.map((component) => (
                          <span
                            key={component}
                            className="border-border/70 rounded-full border px-3 py-1"
                          >
                            {component}
                          </span>
                        ))}
                        {hasMoreComponents ? (
                          <span className="border-border/70 rounded-full border px-3 py-1">
                            +
                            {(alternative.matched_components?.length ?? 0) -
                              matchedComponents.length}{' '}
                            more
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={supplierLink}
                      className={buttonStyles('secondary')}
                    >
                      View supplier
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : alternatives.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No alternative suppliers matched the current capability and region
          filters.
        </p>
      ) : (
        <div className="grid gap-4">
          {alternatives.map((alternative) => {
            const supplierLink = alternative.supplier_slug
              ? `/suppliers/${alternative.supplier_slug}`
              : `/suppliers/${alternative.supplier_id}`;
            const matchedComponents = (alternative.matched_components ?? [])
              .filter(Boolean)
              .slice(0, 4);
            const hasMoreComponents =
              (alternative.matched_components?.length ?? 0) >
              matchedComponents.length;

            return (
              <article
                key={alternative.supplier_id}
                className="border-border/70 bg-background/80 rounded-[22px] border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{alternative.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatTier(alternative.tier)} · {alternative.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alternative.status} />
                    <RiskScoreBadge
                      score={Math.round(
                        Number(alternative.current_risk_score ?? 0),
                      )}
                    />
                  </div>
                </div>
                <div className="text-muted-foreground mt-3 grid gap-2 text-xs">
                  <p>
                    Regions:{' '}
                    {normalizeList(
                      alternative.regions,
                      'Regional data pending',
                    )}
                  </p>
                  <p>
                    Capability match: {alternative.matched_component_count}{' '}
                    capability
                    {alternative.matched_component_count === 1 ? '' : 'ies'}
                  </p>
                  {matchedComponents.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {matchedComponents.map((component) => (
                        <span
                          key={component}
                          className="border-border/70 rounded-full border px-3 py-1"
                        >
                          {component}
                        </span>
                      ))}
                      {hasMoreComponents ? (
                        <span className="border-border/70 rounded-full border px-3 py-1">
                          +
                          {(alternative.matched_components?.length ?? 0) -
                            matchedComponents.length}{' '}
                          more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3">
                  <Link
                    href={supplierLink}
                    className={buttonStyles('secondary')}
                  >
                    View supplier
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
