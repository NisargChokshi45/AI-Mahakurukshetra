import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import {
  calculateCompositeScore,
  deriveScoresFromRiskEvent,
  type WeightConfig,
} from '@/lib/risk-engine';
import type { RiskEventType, SeverityLevel } from '@/lib/validations/risk';

const DEFAULT_RISK_CONFIG = {
  financial_weight: 20,
  geopolitical_weight: 20,
  natural_disaster_weight: 20,
  operational_weight: 15,
  compliance_weight: 15,
  delivery_weight: 10,
  alert_threshold: 70,
} satisfies WeightConfig & { alert_threshold: number };

const severityRank: Record<SeverityLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

type IngestionSource = 'manual_ingestion' | 'monitoring_webhook' | 'system';

type RiskScoreConfig = WeightConfig & {
  alert_threshold: number;
};

type RiskScoreConfigRow = {
  financial_weight: number | string;
  geopolitical_weight: number | string;
  natural_disaster_weight: number | string;
  operational_weight: number | string;
  compliance_weight: number | string;
  delivery_weight: number | string;
  alert_threshold: number | string;
};

type SupplierNameRow = {
  id: string;
  name: string | null;
};

type PreviousScoreRow = {
  composite_score: number | string;
};

type CreateDisruptionsInput = {
  organizationId: string;
  riskEventId: string;
  supplierIds: string[];
  title: string;
  impactSummary: string;
};

type RunRiskPipelineInput = {
  organizationId: string;
  riskEventId: string;
  eventType: RiskEventType;
  severity: SeverityLevel;
  eventTitle: string;
  eventSummary: string;
  supplierIds: string[];
  isNewEvent: boolean;
  ingestionSource: IngestionSource;
  actorUserId?: string | null;
};

type PipelineResult = {
  scoresInserted: number;
  alertsCreated: number;
  escalationAlertCreated: boolean;
};

function toFiniteNumber(value: number | string, fallback: number): number {
  const normalized =
    typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(normalized) ? normalized : fallback;
}

function normalizeSupplierIds(supplierIds: string[]): string[] {
  const deduped = new Set<string>();
  for (const supplierId of supplierIds) {
    const trimmed = supplierId.trim();
    if (trimmed.length > 0) {
      deduped.add(trimmed);
    }
  }
  return [...deduped];
}

function normalizeRiskConfig(row: RiskScoreConfigRow | null): RiskScoreConfig {
  if (!row) {
    return { ...DEFAULT_RISK_CONFIG };
  }

  return {
    financial_weight: toFiniteNumber(
      row.financial_weight,
      DEFAULT_RISK_CONFIG.financial_weight,
    ),
    geopolitical_weight: toFiniteNumber(
      row.geopolitical_weight,
      DEFAULT_RISK_CONFIG.geopolitical_weight,
    ),
    natural_disaster_weight: toFiniteNumber(
      row.natural_disaster_weight,
      DEFAULT_RISK_CONFIG.natural_disaster_weight,
    ),
    operational_weight: toFiniteNumber(
      row.operational_weight,
      DEFAULT_RISK_CONFIG.operational_weight,
    ),
    compliance_weight: toFiniteNumber(
      row.compliance_weight,
      DEFAULT_RISK_CONFIG.compliance_weight,
    ),
    delivery_weight: toFiniteNumber(
      row.delivery_weight,
      DEFAULT_RISK_CONFIG.delivery_weight,
    ),
    alert_threshold: toFiniteNumber(
      row.alert_threshold,
      DEFAULT_RISK_CONFIG.alert_threshold,
    ),
  };
}

function deriveScoreSeverity(compositeScore: number): SeverityLevel {
  if (compositeScore >= 90) return 'critical';
  if (compositeScore >= 80) return 'high';
  if (compositeScore >= 70) return 'medium';
  return 'low';
}

function maxSeverity(a: SeverityLevel, b: SeverityLevel): SeverityLevel {
  return severityRank[a] >= severityRank[b] ? a : b;
}

async function loadRiskConfig(
  organizationId: string,
): Promise<RiskScoreConfig> {
  const admin = createAdminClient();

  const { data: existingConfigData } = await admin
    .from('risk_score_configs')
    .select(
      'financial_weight, geopolitical_weight, natural_disaster_weight, operational_weight, compliance_weight, delivery_weight, alert_threshold',
    )
    .eq('organization_id', organizationId)
    .maybeSingle();

  const existingConfig = (existingConfigData ??
    null) as RiskScoreConfigRow | null;

  if (existingConfig) {
    return normalizeRiskConfig(existingConfig);
  }

  const { data: insertedConfigData } = await admin
    .from('risk_score_configs')
    .upsert(
      {
        organization_id: organizationId,
        ...DEFAULT_RISK_CONFIG,
      },
      { onConflict: 'organization_id' },
    )
    .select(
      'financial_weight, geopolitical_weight, natural_disaster_weight, operational_weight, compliance_weight, delivery_weight, alert_threshold',
    )
    .single();

  const insertedConfig = (insertedConfigData ??
    null) as RiskScoreConfigRow | null;

  return normalizeRiskConfig(insertedConfig ?? null);
}

async function loadSupplierNameMap(
  organizationId: string,
  supplierIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (supplierIds.length === 0) {
    return map;
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from('suppliers')
    .select('id, name')
    .eq('organization_id', organizationId)
    .in('id', supplierIds);

  const rows = (data ?? []) as SupplierNameRow[];
  for (const row of rows) {
    map.set(row.id, row.name?.trim() || row.id);
  }

  return map;
}

async function getPreviousCompositeScore(
  organizationId: string,
  supplierId: string,
): Promise<number | null> {
  const admin = createAdminClient();
  const { data: previousScoreData } = await admin
    .from('risk_scores')
    .select('composite_score')
    .eq('organization_id', organizationId)
    .eq('target_type', 'supplier')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const data = (previousScoreData ?? null) as PreviousScoreRow | null;

  if (!data) {
    return null;
  }

  return toFiniteNumber(data.composite_score, 0);
}

export async function createDisruptionsForSuppliers({
  organizationId,
  riskEventId,
  supplierIds,
  title,
  impactSummary,
}: CreateDisruptionsInput): Promise<void> {
  const normalizedSupplierIds = normalizeSupplierIds(supplierIds);
  if (normalizedSupplierIds.length === 0) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.from('disruptions').insert(
    normalizedSupplierIds.map((supplierId) => ({
      organization_id: organizationId,
      risk_event_id: riskEventId,
      supplier_id: supplierId,
      title: `Disruption: ${title}`,
      impact_summary: impactSummary,
    })),
  );

  if (error) {
    throw new Error(`Failed to persist disruptions: ${error.message}`);
  }
}

export async function runRiskPipelineForEvent(
  input: RunRiskPipelineInput,
): Promise<PipelineResult> {
  const normalizedSupplierIds = normalizeSupplierIds(input.supplierIds);
  if (normalizedSupplierIds.length === 0) {
    return {
      scoresInserted: 0,
      alertsCreated: 0,
      escalationAlertCreated: false,
    };
  }

  const admin = createAdminClient();
  const config = await loadRiskConfig(input.organizationId);
  const supplierNameMap = await loadSupplierNameMap(
    input.organizationId,
    normalizedSupplierIds,
  );

  let alertsCreated = 0;

  for (const supplierId of normalizedSupplierIds) {
    const previousCompositeScore = await getPreviousCompositeScore(
      input.organizationId,
      supplierId,
    );

    const categoryScores = deriveScoresFromRiskEvent(
      input.eventType,
      input.severity,
    );
    const compositeScore = calculateCompositeScore(categoryScores, config);

    const { error: insertScoreError } = await admin.from('risk_scores').insert({
      organization_id: input.organizationId,
      target_type: 'supplier',
      supplier_id: supplierId,
      risk_event_id: input.riskEventId,
      financial_score: categoryScores.financial,
      geopolitical_score: categoryScores.geopolitical,
      natural_disaster_score: categoryScores.natural_disaster,
      operational_score: categoryScores.operational,
      compliance_score: categoryScores.compliance,
      delivery_score: categoryScores.delivery,
      composite_score: compositeScore,
      score_reason: `Recalculated from ${input.eventType} event (${input.severity} severity)`,
      triggered_by_source: input.ingestionSource,
      triggered_by_user_id: input.actorUserId ?? null,
    });

    if (insertScoreError) {
      throw new Error(
        `Failed to insert risk score: ${insertScoreError.message}`,
      );
    }

    const crossedThreshold =
      compositeScore >= config.alert_threshold &&
      (previousCompositeScore === null ||
        previousCompositeScore < config.alert_threshold);

    if (!crossedThreshold) {
      continue;
    }

    const severityFromScore = deriveScoreSeverity(compositeScore);
    const thresholdSeverity = maxSeverity(severityFromScore, input.severity);
    const supplierName = supplierNameMap.get(supplierId) ?? supplierId;

    const { error: createAlertError } = await admin.from('alerts').insert({
      organization_id: input.organizationId,
      supplier_id: supplierId,
      risk_event_id: input.riskEventId,
      severity: thresholdSeverity,
      title: `Risk threshold crossed: ${supplierName}`,
      summary: `Composite score ${compositeScore.toFixed(2)} crossed threshold ${config.alert_threshold.toFixed(2)} after "${input.eventTitle}".`,
      status: 'new',
    });

    if (createAlertError) {
      throw new Error(
        `Failed to create threshold alert: ${createAlertError.message}`,
      );
    }

    alertsCreated += 1;
  }

  let escalationAlertCreated = false;
  if (input.isNewEvent && normalizedSupplierIds.length > 3) {
    const { error: escalationAlertError } = await admin.from('alerts').insert({
      organization_id: input.organizationId,
      risk_event_id: input.riskEventId,
      severity: 'critical',
      title: 'Escalation: broad supplier impact detected',
      summary: `"${input.eventTitle}" currently impacts ${normalizedSupplierIds.length} suppliers. Escalated to critical triage.`,
      status: 'new',
    });

    if (escalationAlertError) {
      throw new Error(
        `Failed to create escalation alert: ${escalationAlertError.message}`,
      );
    }

    escalationAlertCreated = true;
    alertsCreated += 1;
  }

  return {
    scoresInserted: normalizedSupplierIds.length,
    alertsCreated,
    escalationAlertCreated,
  };
}
