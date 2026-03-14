import type { Metadata } from 'next';
import Link from 'next/link';
import { assessments, getSupplierName } from '@/lib/demo-data';
import {
  PageHeader,
  RiskScoreBadge,
  SectionCard,
  StatusBadge,
  SelectField,
  buttonStyles,
  selectStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Assessments | Supply Chain Risk Intelligence Platform',
  description:
    'Assessment list and supplier review creation surface for the MVP.',
};

export const dynamic = 'force-static';

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessments"
        title="Plan, track, and complete supplier assessments from one operational queue."
        description="Assessments close the loop between monitoring and remediation. This page keeps upcoming work and completed reviews visible for procurement and risk owners."
        actions={
          <>
            <Link href="/suppliers" className={buttonStyles('secondary')}>
              View suppliers
            </Link>
            <Link href="/incidents" className={buttonStyles('primary')}>
              View incidents
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          eyebrow="Create"
          title="Start a supplier assessment"
          description="Simple UI scaffold for the future React Hook Form + Zod workflow."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Supplier
              <select className={selectStyles()}>
                {assessments.map((assessment) => {
                  const supplierName = getSupplierName(assessment.supplierId);

                  return (
                    <option key={`${assessment.id}-${supplierName}`}>
                      {supplierName}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Framework
              <input
                placeholder="Operational resilience review"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Due date
              <input
                type="date"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <button type="button" className={buttonStyles('primary')}>
              Create assessment
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Queue"
          title="Assessment list"
          description="Current and upcoming supplier reviews."
        >
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={`/suppliers/${assessment.supplierId}`}
                className="border-border/70 bg-background/80 block rounded-[24px] border p-4 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={assessment.status} />
                      <span className="text-muted-foreground text-sm">
                        {assessment.framework}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold tracking-tight">
                      {getSupplierName(assessment.supplierId)}
                    </h3>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-sm">
                      <span>Assessor: {assessment.assessor}</span>
                      <span>Due: {assessment.dueDate}</span>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      {assessment.focus}
                    </p>
                  </div>
                  <RiskScoreBadge score={assessment.score} />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
