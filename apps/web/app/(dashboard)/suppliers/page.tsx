import type { Metadata } from 'next';
import Link from 'next/link';
import { SupplierDirectory } from '@/components/suppliers/supplier-directory';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import {
  suppliers as demoSuppliers,
  topRiskSuppliers as demoTopRiskSuppliers,
  type Supplier,
} from '@/lib/demo-data';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Suppliers | Supply Chain Risk Intelligence Platform',
  description:
    'Supplier directory with region and tier filters, risk score badges, and direct drill-down into supplier exposure.',
};

export const dynamic = 'force-dynamic';

const TIER_LABEL: Record<string, Supplier['tier']> = {
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};

const STATUS_LABEL: Record<string, Supplier['status']> = {
  watchlist: 'watchlist',
  active: 'stable',
  inactive: 'stable',
};

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: dbRows } = await supabase
    .from('suppliers')
    .select(
      'id, slug, name, tier, status, country, current_risk_score, primary_contact_email',
    )
    .order('current_risk_score', { ascending: false });

  // Map Supabase rows → Supplier type; fall back to demo data when DB is empty
  const suppliers: Supplier[] =
    dbRows && dbRows.length > 0
      ? dbRows.map((row) => {
          // Prefer demo-data entry if slug matches (carries rich fields like categories)
          const demo = demoSuppliers.find((s) => s.id === row.slug);
          if (demo)
            return {
              ...demo,
              riskScore: Math.round(Number(row.current_risk_score)),
            };

          return {
            id: row.slug ?? row.id,
            name: row.name,
            tier: TIER_LABEL[row.tier] ?? 'Tier 1',
            region: '—',
            country: row.country,
            riskScore: Math.round(Number(row.current_risk_score)),
            status: STATUS_LABEL[row.status] ?? 'stable',
            primaryContact: row.primary_contact_email ?? '—',
            activeAlerts: 0,
            openIncidents: 0,
            lastAssessment: '—',
            leadTimeDays: 0,
            resilienceScore: 0,
            summary: '',
            categories: [],
          };
        })
      : demoSuppliers;

  const topRiskSuppliers = [...suppliers]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const highRiskCount = suppliers.filter((s) => s.riskScore >= 70).length;
  const tier1Count = suppliers.filter((s) => s.tier === 'Tier 1').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Suppliers"
        title="A filterable supplier registry built for triage, not just record keeping."
        description="Procurement and risk teams can scan score, geography, and workflow state in one pass, then drill straight into the supplier workspace."
        actions={
          <>
            <Link href="/map" className={buttonStyles('secondary')}>
              View dependency map
            </Link>
            <Link
              href={`/suppliers/${topRiskSuppliers[0]?.id ?? demoTopRiskSuppliers[0].id}`}
              className={buttonStyles('primary')}
            >
              Open highest-risk supplier
            </Link>
          </>
        }
      />

      <SupplierDirectory suppliers={suppliers} />

      <SectionCard
        eyebrow="Insights"
        title="Coverage snapshot"
        description="Quick operational context across your monitored supplier base."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
              Tier 1 suppliers
            </p>
            <p className="mt-3 text-3xl font-semibold">{tier1Count}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Primary production partners in your monitored workspace.
            </p>
          </article>
          <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
              High-risk suppliers
            </p>
            <p className="mt-3 text-3xl font-semibold">{highRiskCount}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Ready for watchlist or mitigation workflow escalation.
            </p>
          </article>
          <article className="border-border/70 bg-background/80 rounded-[24px] border p-4 md:col-span-2">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
              Why this matters
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-7">
              The directory is tuned for operations visibility: score,
              geography, tier, and next action are surfaced before supplier
              master data. That keeps the table aligned with the risk narrative
              and later backend APIs.
            </p>
          </article>
        </div>
      </SectionCard>
    </div>
  );
}
