import type { Metadata } from 'next';
import Link from 'next/link';
import {
  PageHeader,
  SectionCard,
  SelectField,
  buttonStyles,
} from '@/components/dashboard/ui';
import { consumeFlash } from '@/lib/flash';
import { createRiskEventAction } from '@/lib/actions/risk';

export const metadata: Metadata = {
  title: 'New Risk Event | Supply Chain Risk Intelligence Platform',
  description:
    'Manual risk event ingestion form for the supply chain risk platform.',
};

type NewRiskEventPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewRiskEventPage({
  searchParams,
}: NewRiskEventPageProps) {
  const { error: errorMessage, message } = await consumeFlash();
  const params = (await searchParams) ?? {};
  const riskEventId = readParam(params.risk_event_id);
  const isUpdate = Boolean(riskEventId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manual ingestion"
        title={
          isUpdate
            ? 'Update a risk event and rerun the scoring pipeline.'
            : 'Create a risk event and trigger the scoring pipeline.'
        }
        description="Validated events are persisted to Supabase, disruptions are linked to affected suppliers, and composite risk scores are recalculated automatically for create and update flows."
        actions={
          <Link href="/risk-events" className={buttonStyles('secondary')}>
            Back to event feed
          </Link>
        }
      />

      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <SectionCard
        eyebrow="Form"
        title={isUpdate ? 'Risk event update' : 'Risk event draft'}
        description="All fields are validated server-side before the event is persisted and scored."
      >
        <form
          action={createRiskEventAction}
          className="grid gap-4 lg:grid-cols-2"
        >
          {riskEventId ? (
            <input type="hidden" name="risk_event_id" value={riskEventId} />
          ) : null}

          <label className="grid gap-2 text-sm font-medium">
            Event title
            <input
              name="title"
              required
              minLength={5}
              maxLength={200}
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              placeholder="Kaohsiung throughput disruption"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Event type
            <SelectField name="event_type">
              <option value="geopolitical">Geopolitical</option>
              <option value="natural_disaster">Natural disaster</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="compliance">Compliance</option>
              <option value="delivery">Delivery</option>
            </SelectField>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Severity
            <SelectField name="severity">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </SelectField>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Source
            <input
              name="source"
              required
              minLength={2}
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              placeholder="Reuters, internal ops team, etc."
            />
          </label>

          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Source URL
            <input
              name="source_url"
              type="url"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              placeholder="https://example.com/article (optional)"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Summary
            <textarea
              name="summary"
              required
              minLength={10}
              className="border-border/70 bg-background/85 min-h-32 rounded-[24px] border px-4 py-3 text-sm outline-none"
              placeholder="Capture the trigger, likely scope, and expected business impact."
            />
          </label>

          <label className="grid gap-2 text-sm font-medium lg:col-span-2">
            Affected supplier IDs
            <input
              name="supplier_ids"
              className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
              placeholder="Comma-separated UUIDs (optional) - e.g. uuid1,uuid2"
            />
            <span className="text-muted-foreground text-xs">
              Optional. Providing supplier UUIDs will create disruption records
              and recalculate their risk scores.
            </span>
          </label>

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button type="submit" className={buttonStyles('primary')}>
              {isUpdate ? 'Update and rescore' : 'Save and score'}
            </button>
            <Link href="/risk-events" className={buttonStyles('secondary')}>
              Cancel
            </Link>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
