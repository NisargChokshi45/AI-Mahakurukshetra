import 'server-only';

export type CategoryScores = {
  financial: number;
  geopolitical: number;
  natural_disaster: number;
  operational: number;
  compliance: number;
  delivery: number;
};

export type WeightConfig = {
  financial_weight: number;
  geopolitical_weight: number;
  natural_disaster_weight: number;
  operational_weight: number;
  compliance_weight: number;
  delivery_weight: number;
};

export function calculateCompositeScore(
  categoryScores: CategoryScores,
  weights: WeightConfig,
): number {
  const weightedSum =
    categoryScores.financial * weights.financial_weight +
    categoryScores.geopolitical * weights.geopolitical_weight +
    categoryScores.natural_disaster * weights.natural_disaster_weight +
    categoryScores.operational * weights.operational_weight +
    categoryScores.compliance * weights.compliance_weight +
    categoryScores.delivery * weights.delivery_weight;

  const totalWeight =
    weights.financial_weight +
    weights.geopolitical_weight +
    weights.natural_disaster_weight +
    weights.operational_weight +
    weights.compliance_weight +
    weights.delivery_weight;

  if (totalWeight === 0) return 0;

  const raw = weightedSum / totalWeight;
  const clamped = Math.min(100, Math.max(0, raw));
  return Math.round(clamped * 100) / 100;
}

export function deriveScoresFromRiskEvent(
  eventType: string,
  severity: string,
): CategoryScores {
  const baseScoreMap: Record<string, number> = {
    low: 25,
    medium: 45,
    high: 70,
    critical: 90,
  };

  const base = baseScoreMap[severity] ?? 25;
  const bump = 15;

  const scores: CategoryScores = {
    financial: base,
    geopolitical: base,
    natural_disaster: base,
    operational: base,
    compliance: base,
    delivery: base,
  };

  switch (eventType) {
    case 'geopolitical':
      scores.geopolitical = Math.min(100, scores.geopolitical + bump);
      break;
    case 'natural_disaster':
      scores.natural_disaster = Math.min(100, scores.natural_disaster + bump);
      break;
    case 'financial':
      scores.financial = Math.min(100, scores.financial + bump);
      break;
    case 'operational':
      scores.operational = Math.min(100, scores.operational + bump);
      break;
    case 'compliance':
      scores.compliance = Math.min(100, scores.compliance + bump);
      break;
    case 'delivery':
      scores.delivery = Math.min(100, scores.delivery + bump);
      break;
    default:
      break;
  }

  return scores;
}
