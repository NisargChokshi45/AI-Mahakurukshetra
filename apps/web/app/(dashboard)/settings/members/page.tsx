import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Member Settings | Supply Chain Risk Intelligence Platform',
  description: 'Invite members, assign roles, and manage organization access.',
};

const members = [
  {
    name: 'Arjun Rao',
    email: 'arjun.rao@helix.example',
    role: 'owner',
    status: 'active',
  },
  {
    name: 'Meera Khanna',
    email: 'meera.khanna@helix.example',
    role: 'risk_manager',
    status: 'active',
  },
  {
    name: 'Sofia Patel',
    email: 'sofia.patel@helix.example',
    role: 'procurement_lead',
    status: 'active',
  },
  {
    name: 'Noah James',
    email: 'noah.james@helix.example',
    role: 'viewer',
    status: 'invited',
  },
];

export default function MembersSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Members and access"
        description="Invite teammates, control role scope, and keep the organization workspace aligned with the role matrix from the plan."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard
          eyebrow="Invite"
          title="Invite a member"
          description="UI-first invite flow to be wired to Supabase and org membership records."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Work email
              <input
                placeholder="teammate@company.com"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Role
              <select className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none">
                <option>admin</option>
                <option>risk_manager</option>
                <option>procurement_lead</option>
                <option>viewer</option>
              </select>
            </label>
            <button type="button" className={buttonStyles('primary')}>
              Send invite
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Team"
          title="Current members"
          description="Role assignment, invitation state, and management controls."
        >
          <div className="grid gap-4">
            {members.map((member) => (
              <article
                key={member.email}
                className="border-border/70 bg-background/80 rounded-[24px] border p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {member.name}
                    </h3>
                    <div className="text-muted-foreground mt-2 flex flex-wrap gap-3 text-sm">
                      <span>{member.email}</span>
                      <span>{member.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={member.status} />
                    <button type="button" className={buttonStyles('secondary')}>
                      Edit role
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
