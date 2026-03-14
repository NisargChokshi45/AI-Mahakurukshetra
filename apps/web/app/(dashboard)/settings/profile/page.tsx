import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'Profile Settings | Supply Chain Risk Intelligence Platform',
  description: 'Manage user profile and personal workspace preferences.',
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile settings"
        description="Manage your identity, alert preferences, and personal dashboard defaults."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          eyebrow="Identity"
          title="User profile"
          description="Personal information and how you appear across incidents, reports, and assessments."
        >
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Full name
              <input
                defaultValue="Arjun Rao"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Role
              <input
                defaultValue="Risk Manager"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                defaultValue="arjun.rao@helix.example"
                className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              />
            </label>
            <button type="button" className={buttonStyles('primary')}>
              Save profile
            </button>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Preferences"
          title="Notification and workspace defaults"
          description="Choose how you want the product to behave after sign-in and during escalations."
        >
          <div className="grid gap-4">
            {[
              'Email me for critical alerts only',
              'Default landing route after sign-in: Dashboard',
              'Show unresolved incidents first in all worklists',
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
