-- Migration 013: AI Settings
-- Stores AI provider configuration per organization

CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('claude', 'gemini', 'openai', 'grok')),
  api_key TEXT NOT NULL,
  model TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active provider per org (partial unique index)
CREATE UNIQUE INDEX idx_ai_settings_one_enabled_per_org
  ON ai_settings(organization_id)
  WHERE enabled = true;

-- Index for fast lookups
CREATE INDEX idx_ai_settings_org ON ai_settings(organization_id);

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only org owners and admins can read/write AI settings
CREATE POLICY "ai_settings_select" ON ai_settings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "ai_settings_insert" ON ai_settings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "ai_settings_update" ON ai_settings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "ai_settings_delete" ON ai_settings
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Updated_at trigger
CREATE TRIGGER set_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE ai_settings IS 'AI provider configuration per organization';
COMMENT ON COLUMN ai_settings.provider IS 'AI provider: claude, gemini, openai, or grok';
COMMENT ON COLUMN ai_settings.api_key IS 'Encrypted API key for the provider';
COMMENT ON COLUMN ai_settings.model IS 'Optional model override (uses provider default if null)';
COMMENT ON COLUMN ai_settings.enabled IS 'Only one provider can be enabled per org';
