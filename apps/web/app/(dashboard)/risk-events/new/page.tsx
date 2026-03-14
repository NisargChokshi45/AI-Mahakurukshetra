import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'New Risk Event | Supply Chain Risk Intelligence Platform',
  description:
    'Manual risk event ingestion form UI for the seeded demo experience.',
};

export default function NewRiskEventPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manual ingestion"
        title="Create a risk event before the webhook and validation pipeline is ready."
        description="This Phase 4 form is a UI surface only. Phase 3 can wire Zod validation and persistence into the same structure without redesigning the page."
        actions={
          <Link href="/risk-events" className={buttonStyles('secondary')}>
            Back to event feed
          </Link>
        }
      />

      <SectionCard
        eyebrow="Form"
        title="Risk event draft"
        description="Visible labels, helper text, and grouped fields are already in place for later backend connection."
      >
        <form className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Event title
            <input
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              placeholder="Kaohsiung throughput disruption"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Event type
            <select className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none">
              <option>Logistics</option>
              <option>Operational</option>
              <option>Financial</option>
              <option>Natural disaster</option>
              <option>Regulatory</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Region
            <select className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none">
              <option>East Asia</option>
              <option>North America</option>
              <option>Europe</option>
              <option>South Asia</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Severity
            <select className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none">
              <option>critical</option>
              <option>high</option>
              <option>medium</option>
              <option>low</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Summary
            <textarea
              className="border-border/70 bg-background/85 min-h-32 rounded-[24px] border px-4 py-3 text-sm outline-none"
              placeholder="Capture the trigger, likely scope, and expected business impact."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Response guidance
            <textarea
              className="border-border/70 bg-background/85 min-h-24 rounded-[24px] border px-4 py-3 text-sm outline-none"
              placeholder="Suggested next actions for risk, procurement, and operations teams."
            />
          </label>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button type="button" className={buttonStyles('primary')}>
              Save draft
            </button>
            <button type="button" className={buttonStyles('secondary')}>
              Validate and escalate
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
