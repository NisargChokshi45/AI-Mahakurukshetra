import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  SelectField,
  buttonStyles,
  selectStyles,
} from '@/components/dashboard/ui';
import { requireOrganizationContext } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Organization Settings | Supply Chain Risk Intelligence Platform',
  description: 'Manage organization profile, defaults, and workspace metadata.',
};

export const dynamic = 'force-dynamic';

export default async function OrganizationSettingsPage() {
  const context = await requireOrganizationContext();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Organization settings"
        description="Core workspace identity, operating region defaults, and seeded demo context."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Workspace"
          title="Organization profile"
          description="These settings shape reports, invites, and environment defaults."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Organization name
              <input
                defaultValue={context.organization.organizationName}
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Default operating region
              <SelectField>
                <option>APAC Electronics</option>
                <option>Global</option>
                <option>North America</option>
              </SelectField>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Response target
              <input
                defaultValue="3h 20m"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <button type="button" className={buttonStyles('primary')}>
              Update workspace
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Governance"
          title="Organization defaults"
          description="Surface-level controls for policies that will later bind to org-scoped backend config."
        >
          <div className="grid gap-4">
            {[
              'Seed demo data for every newly created sandbox workspace',
              'Require owner approval for critical alert dismissals',
              'Expose supplier risk score breakdowns to procurement leads',
            ].map((item) => (
              <label
                key={item}
                className="border-border/70 bg-background/80 flex items-start gap-3 rounded-[24px] border p-4 text-sm"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="border-border mt-1 h-4 w-4 rounded"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
