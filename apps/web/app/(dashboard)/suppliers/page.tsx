import type { Metadata } from 'next';
import Link from 'next/link';
import { SupplierDirectory } from '@/components/suppliers/supplier-directory';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { suppliers, topRiskSuppliers } from '@/lib/demo-data';

export const metadata: Metadata = {
  title: 'Suppliers | Supply Chain Risk Intelligence Platform',
  description:
    'Supplier directory with region and tier filters, risk score badges, and direct drill-down into supplier exposure.',
};

export default function SuppliersPage() {
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
              href={`/suppliers/${topRiskSuppliers[0]?.id ?? suppliers[0].id}`}
              className={buttonStyles('primary')}
            >
              Open highest-risk supplier
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SupplierDirectory suppliers={suppliers} />
        <SectionCard
          eyebrow="Insights"
          title="Coverage snapshot"
          description="Quick operational context while the full API and analytics surfaces are still being wired."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                Tier 1 suppliers
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {
                  suppliers.filter((supplier) => supplier.tier === 'Tier 1')
                    .length
                }
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Primary production partners in the current demo workspace.
              </p>
            </article>
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                High-risk suppliers
              </p>
              <p className="mt-3 text-3xl font-semibold">
                {
                  suppliers.filter((supplier) => supplier.riskScore >= 70)
                    .length
                }
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Ready for watchlist or mitigation workflow escalation.
              </p>
            </article>
            <article className="border-border/70 bg-background/80 rounded-[24px] border p-4 md:col-span-2">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
                Why this matters
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-7">
                The directory is intentionally tuned for operations visibility:
                score, geography, tier, and next action are surfaced before
                supplier master data. That keeps the table aligned with the
                judging narrative and later backend APIs.
              </p>
            </article>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
