import {
  calculateCompositeScore,
  deriveScoresFromRiskEvent,
} from '@/lib/risk-engine';

describe('risk-engine', () => {
  it('calculates weighted composite score with rounding', () => {
    const score = calculateCompositeScore(
      {
        financial: 70,
        geopolitical: 55,
        natural_disaster: 80,
        operational: 40,
        compliance: 65,
        delivery: 50,
      },
      {
        financial_weight: 20,
        geopolitical_weight: 20,
        natural_disaster_weight: 20,
        operational_weight: 15,
        compliance_weight: 15,
        delivery_weight: 10,
      },
    );

    expect(score).toBe(61.75);
  });

  it('returns 0 when total weights are zero', () => {
    const score = calculateCompositeScore(
      {
        financial: 90,
        geopolitical: 90,
        natural_disaster: 90,
        operational: 90,
        compliance: 90,
        delivery: 90,
      },
      {
        financial_weight: 0,
        geopolitical_weight: 0,
        natural_disaster_weight: 0,
        operational_weight: 0,
        compliance_weight: 0,
        delivery_weight: 0,
      },
    );

    expect(score).toBe(0);
  });

  it('bumps only the target category for a risk event type', () => {
    const scores = deriveScoresFromRiskEvent('natural_disaster', 'medium');

    expect(scores.natural_disaster).toBe(60);
    expect(scores.financial).toBe(45);
    expect(scores.geopolitical).toBe(45);
    expect(scores.operational).toBe(45);
    expect(scores.compliance).toBe(45);
    expect(scores.delivery).toBe(45);
  });

  it('defaults to low-base behavior for unknown severity', () => {
    const scores = deriveScoresFromRiskEvent('delivery', 'unknown');

    expect(scores.delivery).toBe(40);
    expect(scores.financial).toBe(25);
  });
});
