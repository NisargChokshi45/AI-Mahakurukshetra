import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getRiskEventById,
  getSupplierName,
  type RiskEvent,
} from '@/lib/demo-data';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import {
  PageHeader,
  SectionCard,
  SeverityBadge,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';
import { AlternativeSuppliersPanel } from '@/components/suppliers/alternative-suppliers';

export const dynamic = 'force-dynamic';

type RiskEventDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

type DbRiskEventRow = {
  id: string;
  title: string;
  event_type: string;
  severity: string;
  source: string | null;
  source_url: string | null;
  summary: string | null;
  detected_at: string | null;
  resolved_at: string | null;
  region_id: string | null;
  regions: { name: string } | { name: string }[] | null;
};

type SupplierRow = {
  id: string;
  name: string;
  slug: string;
};

function resolveRegionName(
  regions: DbRiskEventRow['regions'],
  regionId: string | null,
): string {
  if (!regions) {
    return regionId ? `Region ${regionId.slice(0, 8)}` : 'Unassigned region';
  }

  const region = Array.isArray(regions) ? regions[0] : regions;
  return region?.name ?? 'Unassigned region';
}

function normalizeSeverity(severity: string): RiskEvent['severity'] {
  if (
    severity === 'critical' ||
    severity === 'high' ||
    severity === 'medium' ||
    severity === 'low'
  ) {
    return severity;
  }

  return 'low';
}

function formatDateLabel(value: string | null) {
  if (!value) {
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

export async function generateMetadata({
  params,
}: RiskEventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const demo = getRiskEventById(id);

  if (demo) {
    return {
      title: `${demo.title} | Supply Chain Risk Intelligence Platform`,
      description: demo.summary,
    };
  }

  return {
    title: `Risk Event ${id.slice(0, 8)} | Supply Chain Risk Intelligence Platform`,
  };
}

export default async function RiskEventDetailPage({
  params,
}: RiskEventDetailPageProps) {
  const { id } = await params;

  const demoEvent = getRiskEventById(id);
  if (demoEvent) {
    return (
      <RiskEventDetailView
        event={demoEvent}
        impactedSuppliers={demoEvent.affectedSupplierIds.map((supplierId) => ({
          id: supplierId,
          name: getSupplierName(supplierId),
          slug: supplierId,
        }))}
      />
    );
  }

  const context = await requireOrganizationContext();
  const supabase = await createClient();

  const { data: eventData } = await supabase
    .from('risk_events')
    .select(
      'id, title, event_type, severity, source, source_url, summary, detected_at, resolved_at, region_id, regions(name)',
    )
    .eq('organization_id', context.organization.organizationId)
    .eq('id', id)
    .maybeSingle();

  const event = eventData as DbRiskEventRow | null;
  if (!event) {
    notFound();
  }

  const { data: disruptionRows } = await supabase
    .from('disruptions')
    .select('supplier_id')
    .eq('organization_id', context.organization.organizationId)
    .eq('risk_event_id', event.id);

  const supplierIds = Array.from(
    new Set(
      (disruptionRows ?? [])
        .map((row) => row.supplier_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const impactedSuppliers: SupplierRow[] = supplierIds.length
    ? ((
        await supabase
          .from('suppliers')
          .select('id, name, slug')
          .eq('organization_id', context.organization.organizationId)
          .in('id', supplierIds)
      ).data ?? [])
    : [];

  const mappedEvent: RiskEvent = {
    id: event.id,
    title: event.title,
    type: event.event_type,
    region: resolveRegionName(event.regions, event.region_id),
    severity: normalizeSeverity(event.severity),
    status: event.resolved_at ? 'resolved' : 'active',
    date: event.detected_at ? event.detected_at.slice(0, 10) : 'Unknown',
    affectedSupplierIds: supplierIds,
    summary: event.summary ?? '',
  };

  return (
    <RiskEventDetailView
      event={mappedEvent}
      impactedSuppliers={impactedSuppliers}
      source={event.source}
      sourceUrl={event.source_url}
      detectedAt={event.detected_at}
      resolvedAt={event.resolved_at}
    />
  );
}

type RiskEventDetailViewProps = {
  event: RiskEvent;
  impactedSuppliers: SupplierRow[];
  source?: string | null;
  sourceUrl?: string | null;
  detectedAt?: string | null;
  resolvedAt?: string | null;
};

function RiskEventDetailView({
  event,
  impactedSuppliers,
  source,
  sourceUrl,
  detectedAt,
  resolvedAt,
}: RiskEventDetailViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Disruption detail"
        title={event.title}
        description={event.summary}
        actions={
          <>
            <Link href="/risk-events" className={buttonStyles('secondary')}>
              Back to risk events
            </Link>
            <Link
              href={`/mitigation?risk_event_id=${event.id}`}
              className={buttonStyles('secondary')}
            >
              Start sourcing plan
            </Link>
            <Link
              href={`/risk-events/new?risk_event_id=${event.id}`}
              className={buttonStyles('primary')}
            >
              Update event
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Signal overview"
          title="Impact context"
          description="Status, detection window, and source context for the disruption."
        >
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={event.severity} />
              <StatusBadge status={event.status} />
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {event.type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {event.region}
              </span>
            </div>
            <div className="text-muted-foreground grid gap-2 text-sm">
              <p>Detected: {formatDateLabel(detectedAt ?? event.date)}</p>
              <p>
                Resolved: {resolvedAt ? formatDateLabel(resolvedAt) : 'Open'}
              </p>
              <p>Source: {source ?? 'Demo feed'}</p>
              {sourceUrl ? (
                <Link
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline underline-offset-2"
                >
                  View source
                </Link>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Supplier impact"
          title="Affected suppliers"
          description="Suppliers directly linked to disruption records."
        >
          {impactedSuppliers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No suppliers linked to this disruption yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {impactedSuppliers.map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/${supplier.slug ?? supplier.id}`}
                  className="border-border/70 bg-background/80 block rounded-[22px] border p-4"
                >
                  <p className="font-semibold">{supplier.name}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    View supplier profile and resilience context
                  </p>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {impactedSuppliers.length > 0 ? (
        <div className="grid gap-6">
          {impactedSuppliers.map((supplier) => (
            <AlternativeSuppliersPanel
              key={supplier.id}
              supplierId={supplier.id}
              title={`Alternative suppliers for ${supplier.name}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
