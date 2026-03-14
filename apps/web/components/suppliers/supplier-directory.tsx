'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Supplier } from '@/lib/demo-data';
import { cn } from '@/lib/utils';
import {
  EmptyState,
  RiskScoreBadge,
  SectionCard,
  StatusBadge,
} from '@/components/dashboard/ui';

type SupplierDirectoryProps = Readonly<{
  suppliers: Supplier[];
}>;

const allRegions = [
  'All regions',
  'East Asia',
  'North America',
  'Europe',
  'South Asia',
  'Africa',
];
const allTiers = ['All tiers', 'Tier 1', 'Tier 2', 'Tier 3'];

export function SupplierDirectory({ suppliers }: SupplierDirectoryProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('All regions');
  const [tier, setTier] = useState('All tiers');

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesQuery =
      query.length === 0 ||
      supplier.name.toLowerCase().includes(query.toLowerCase()) ||
      supplier.country.toLowerCase().includes(query.toLowerCase());
    const matchesRegion =
      region === 'All regions' || supplier.region === region;
    const matchesTier = tier === 'All tiers' || supplier.tier === tier;

    return matchesQuery && matchesRegion && matchesTier;
  });

  return (
    <SectionCard
      eyebrow="Directory"
      title="Supplier directory"
      description="Filter the seeded supplier base by geography and tier. The layout is wired so later phases can swap these controls to URL state or server-side filters."
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="border-border/70 bg-background/85 flex min-h-11 items-center rounded-2xl border px-4">
            <span className="sr-only">Search suppliers</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search supplier or country"
              className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {allRegions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(event) => setTier(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {allTiers.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {filteredSuppliers.length === 0 ? (
          <EmptyState
            title="No suppliers match these filters"
            description="Reset the region or tier filters to restore the seeded dataset, or replace this client-side filter layer with real query params when backend search lands."
          />
        ) : (
          <div className="border-border/70 overflow-hidden rounded-[24px] border">
            <div className="border-border/70 bg-muted/40 text-muted-foreground hidden grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.8fr_0.7fr_0.8fr] gap-4 border-b px-4 py-3 text-xs font-semibold tracking-[0.2em] uppercase lg:grid">
              <span>Supplier</span>
              <span>Region</span>
              <span>Tier</span>
              <span>Risk</span>
              <span>Status</span>
              <span>Next action</span>
            </div>
            <div className="divide-border/70 divide-y">
              {filteredSuppliers.map((supplier) => (
                <article
                  key={supplier.id}
                  className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.4fr)_0.7fr_0.7fr_0.8fr_0.7fr_0.8fr] lg:items-center"
                >
                  <div>
                    <Link
                      href={`/suppliers/${supplier.id}`}
                      className="hover:text-primary text-base font-semibold tracking-tight"
                    >
                      {supplier.name}
                    </Link>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {supplier.summary}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{supplier.region}</p>
                    <p className="text-muted-foreground">{supplier.country}</p>
                  </div>
                  <p className="text-sm font-medium">{supplier.tier}</p>
                  <RiskScoreBadge score={supplier.riskScore} />
                  <div>
                    <StatusBadge status={supplier.status} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <p
                      className={cn(
                        'font-medium',
                        supplier.activeAlerts > 0 && 'text-[rgb(146,64,14)]',
                      )}
                    >
                      {supplier.activeAlerts} alerts
                    </p>
                    <p className="text-muted-foreground">
                      Assess by {supplier.lastAssessment}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
