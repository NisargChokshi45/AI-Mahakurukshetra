'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { RiskEvent } from '@/lib/demo-data';
import { getSupplierName } from '@/lib/demo-data';
import {
  EmptyState,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

type RiskEventListProps = Readonly<{
  events: RiskEvent[];
}>;

const severityOptions = ['All severities', 'critical', 'high', 'medium', 'low'];
const statusOptions = ['All statuses', 'active', 'monitoring', 'resolved'];
const typeOptions = [
  'All types',
  'Logistics',
  'Operational',
  'Financial',
  'Natural disaster',
  'Regulatory',
];
const regionOptions = [
  'All regions',
  'East Asia',
  'North America',
  'Europe',
  'South Asia',
  'Africa',
];

export function RiskEventList({ events }: RiskEventListProps) {
  const [severity, setSeverity] = useState('All severities');
  const [status, setStatus] = useState('All statuses');
  const [type, setType] = useState('All types');
  const [region, setRegion] = useState('All regions');

  const filteredEvents = events.filter((event) => {
    const matchesSeverity =
      severity === 'All severities' || event.severity === severity;
    const matchesStatus = status === 'All statuses' || event.status === status;
    const matchesType = type === 'All types' || event.type === type;
    const matchesRegion = region === 'All regions' || event.region === region;

    return matchesSeverity && matchesStatus && matchesType && matchesRegion;
  });

  return (
    <SectionCard
      eyebrow="Monitoring"
      title="Risk event feed"
      description="Operations and risk teams can slice disruption signals by severity, region, or event class before opening a formal incident."
      actions={
        <Link href="/risk-events/new" className={buttonStyles('primary')}>
          Add risk event
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {regionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No matching risk events"
            description="Try widening one of the filters. This empty state is already wired for future server-side filtering and pagination."
            actionHref="/risk-events/new"
            actionLabel="Create a manual event"
          />
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="border-border/70 bg-background/80 rounded-[24px] border p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={event.severity} />
                      <StatusBadge status={event.status} />
                      <span className="text-muted-foreground text-sm">
                        {event.type} • {event.region}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground max-w-3xl text-sm leading-6">
                      {event.summary}
                    </p>
                  </div>
                  <div className="text-muted-foreground grid gap-2 text-sm lg:min-w-64">
                    <p>Date: {event.date}</p>
                    <p>
                      Suppliers:{' '}
                      {event.affectedSupplierIds
                        .map((supplierId) => getSupplierName(supplierId))
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
