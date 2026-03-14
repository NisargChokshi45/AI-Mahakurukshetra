'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  FilterX,
  Globe2,
  RadioTower,
  ShieldAlert,
  UsersRound,
} from 'lucide-react';
import type { Severity } from '@/lib/demo-data';
import {
  EmptyState,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  SelectField,
  buttonStyles,
} from '@/components/dashboard/ui';

const ALL_FILTER_VALUE = 'all';

export type RiskEventFeedItem = {
  id: string;
  title: string;
  type: string;
  region: string;
  severity: Severity;
  status: 'active' | 'monitoring' | 'resolved';
  date: string;
  affectedSupplierIds: string[];
  summary: string;
  source: string;
  sourceUrl: string | null;
};

type RiskEventListProps = Readonly<{
  events: RiskEventFeedItem[];
}>;

const severityOptions: Array<Severity | typeof ALL_FILTER_VALUE> = [
  ALL_FILTER_VALUE,
  'critical',
  'high',
  'medium',
  'low',
];
const statusOptions: Array<
  RiskEventFeedItem['status'] | typeof ALL_FILTER_VALUE
> = [ALL_FILTER_VALUE, 'active', 'monitoring', 'resolved'];

function formatFilterLabel(value: string, allLabel: string) {
  if (value === ALL_FILTER_VALUE) {
    return allLabel;
  }

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateLabel(value: string) {
  if (!value || value.toLowerCase() === 'unknown') {
    return 'Unknown';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RiskEventList({ events }: RiskEventListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [severity, setSeverity] = useState<Severity | typeof ALL_FILTER_VALUE>(
    ALL_FILTER_VALUE,
  );
  const [status, setStatus] = useState<
    RiskEventFeedItem['status'] | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [type, setType] = useState(ALL_FILTER_VALUE);
  const [region, setRegion] = useState(ALL_FILTER_VALUE);

  const typeOptions = useMemo(
    () => [
      ALL_FILTER_VALUE,
      ...Array.from(new Set(events.map((event) => event.type))).sort(),
    ],
    [events],
  );

  const regionOptions = useMemo(
    () => [
      ALL_FILTER_VALUE,
      ...Array.from(new Set(events.map((event) => event.region))).sort(),
    ],
    [events],
  );

  const filteredEvents = events.filter((event) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      event.title.toLowerCase().includes(normalizedQuery) ||
      event.summary.toLowerCase().includes(normalizedQuery) ||
      event.source.toLowerCase().includes(normalizedQuery);
    const matchesSeverity =
      severity === ALL_FILTER_VALUE || event.severity === severity;
    const matchesStatus =
      status === ALL_FILTER_VALUE || event.status === status;
    const matchesType = type === ALL_FILTER_VALUE || event.type === type;
    const matchesRegion =
      region === ALL_FILTER_VALUE || event.region === region;

    return (
      matchesQuery &&
      matchesSeverity &&
      matchesStatus &&
      matchesType &&
      matchesRegion
    );
  });

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    severity !== ALL_FILTER_VALUE ||
    status !== ALL_FILTER_VALUE ||
    type !== ALL_FILTER_VALUE ||
    region !== ALL_FILTER_VALUE;

  function clearFilters() {
    setSearchQuery('');
    setSeverity(ALL_FILTER_VALUE);
    setStatus(ALL_FILTER_VALUE);
    setType(ALL_FILTER_VALUE);
    setRegion(ALL_FILTER_VALUE);
  }

  return (
    <SectionCard
      eyebrow="Monitoring"
      title="Risk signal stream"
      description="Filter, triage, and escalate risk signals with source context and supplier impact before they become full incidents."
      actions={
        <Link href="/risk-events/new" className={buttonStyles('primary')}>
          Add risk event
        </Link>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="sr-only" htmlFor="risk-event-search">
            Search risk events
          </label>
          <input
            id="risk-event-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none md:col-span-2"
            placeholder="Search by title, summary, or source"
          />
          <SelectField
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {formatFilterLabel(option, 'All event types')}
              </option>
            ))}
          </SelectField>
          <SelectField
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            {regionOptions.map((option) => (
              <option key={option} value={option}>
                {formatFilterLabel(option, 'All regions')}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <SelectField
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value as Severity | typeof ALL_FILTER_VALUE,
              )
            }
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {formatFilterLabel(option, 'All severities')}
              </option>
            ))}
          </SelectField>
          <SelectField
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as
                  | RiskEventFeedItem['status']
                  | typeof ALL_FILTER_VALUE,
              )
            }
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {formatFilterLabel(option, 'All statuses')}
              </option>
            ))}
          </SelectField>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={buttonStyles('secondary')}
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear filters
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <p className="text-slate-700">
            Showing{' '}
            <span className="font-semibold">{filteredEvents.length}</span> of{' '}
            <span className="font-semibold">{events.length}</span> events
          </p>
          <p className="text-slate-500">
            Sorted by detection time (latest first)
          </p>
        </div>

        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No matching risk events"
            description="Try widening one of the filters. This empty state is already wired for future server-side filtering and pagination."
            actionHref="/risk-events/new"
            actionLabel="Create a manual event"
          />
        ) : (
          <div className="grid gap-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="border-border/70 bg-background/80 rounded-2xl border p-4 shadow-sm"
              >
                {/* Top row: badges + date */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SeverityBadge severity={event.severity} />
                    <StatusBadge status={event.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      <ShieldAlert className="h-3 w-3" />
                      {formatFilterLabel(event.type, event.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      <Globe2 className="h-3 w-3" />
                      {event.region}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDateLabel(event.date)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-2.5 text-base font-semibold tracking-tight text-slate-900">
                  {event.title}
                </h3>

                {/* Summary — capped at 2 lines */}
                {event.summary ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                    {event.summary}
                  </p>
                ) : null}

                {/* Footer: source + supplier count + actions */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <RadioTower className="h-3.5 w-3.5" />
                      {event.source}
                    </span>
                    {event.affectedSupplierIds.length > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="h-3.5 w-3.5" />
                        {event.affectedSupplierIds.length}{' '}
                        {event.affectedSupplierIds.length === 1
                          ? 'supplier'
                          : 'suppliers'}{' '}
                        affected
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/risk-events/${event.id}`}
                      className={buttonStyles('secondary')}
                    >
                      View details
                    </Link>
                    <Link href="/incidents" className={buttonStyles('primary')}>
                      Open incident
                    </Link>
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
