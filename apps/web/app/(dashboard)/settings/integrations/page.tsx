import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  SelectField,
  buttonStyles,
} from '@/components/dashboard/ui';
import { AISettingsForm } from '@/components/settings/ai-settings-form';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Integrations Settings | Supply Chain Risk Intelligence Platform',
  description:
    'Configure AI providers, ERP connectors, and webhook integrations.',
};

const connectors = [
  {
    name: 'SAP S/4HANA',
    status: 'planned',
    note: 'ERP connector for supplier master sync and PO exposure.',
  },
  {
    name: 'Oracle NetSuite',
    status: 'planned',
    note: 'Finance and procurement sync for risk-adjusted sourcing views.',
  },
  {
    name: 'Monitoring webhook',
    status: 'ready',
    note: 'External disruption feed endpoint to be wired in Phase 3.',
  },
];

async function getAISettings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return null;
  }

  const { data: settings } = await supabase
    .from('ai_settings')
    .select('provider, model')
    .eq('organization_id', membership.organization_id)
    .eq('enabled', true)
    .single();

  if (!settings) {
    return null;
  }

  return {
    provider: settings.provider,
    model: settings.model || undefined,
    hasApiKey: true,
  };
}

export default async function IntegrationsSettingsPage() {
  const aiSettings = await getAISettings();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Integrations"
        description="Configure AI providers, ERP connectors, and monitoring endpoints for your supply chain intelligence platform."
      />

      <div className="grid gap-6">
        {/* AI Provider Settings */}
        <SectionCard
          eyebrow="AI Intelligence"
          title="AI Provider Configuration"
          description="Enable AI-powered insights by configuring your preferred AI provider. Supports Claude, Gemini, OpenAI, and Grok."
        >
          <AISettingsForm initialSettings={aiSettings} />
        </SectionCard>

        {/* Existing Integrations */}
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            eyebrow="Webhook"
            title="Monitoring endpoint"
            description="Placeholder configuration for the signed external monitoring feed."
          >
            <form className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Endpoint alias
                <input
                  defaultValue="global-disruption-feed"
                  className="border-border/70 bg-background/85 min-h-11 rounded-2xl border px-4 text-sm outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Signature mode
                <SelectField>
                  <option>HMAC SHA-256</option>
                  <option>Bearer token</option>
                </SelectField>
              </label>
              <button type="button" className={buttonStyles('primary')}>
                Save connector draft
              </button>
            </form>
          </SectionCard>

          <SectionCard
            eyebrow="Connectors"
            title="ERP and feed connectors"
            description="Readiness and scope for future integrations."
          >
            <div className="grid gap-4">
              {connectors.map((connector) => (
                <article
                  key={connector.name}
                  className="border-border/70 bg-background/80 rounded-[24px] border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {connector.name}
                    </h3>
                    <StatusBadge status={connector.status} />
                  </div>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {connector.note}
                  </p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
