import {
  monitoringWebhookSchema,
  riskEventPayloadSchema,
  updateRiskEventSchema,
} from '@/lib/validations/risk';

const validPayload = {
  title: 'Port closure due to severe weather',
  event_type: 'natural_disaster',
  severity: 'high',
  source: 'Regional weather bureau',
  source_url: 'https://example.com/event',
  summary: 'Port operations paused and outgoing shipments delayed.',
  supplier_ids: ['550e8400-e29b-41d4-a716-446655440000'],
} as const;

describe('risk validations', () => {
  it('accepts valid risk event payload', () => {
    const result = riskEventPayloadSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects non-uuid supplier ids', () => {
    const result = riskEventPayloadSchema.safeParse({
      ...validPayload,
      supplier_ids: ['not-a-uuid'],
    });

    expect(result.success).toBe(false);
  });

  it('requires risk_event_id for update schema', () => {
    const result = updateRiskEventSchema.safeParse(validPayload);
    expect(result.success).toBe(false);
  });

  it('allows webhook payload without hmac_signature field', () => {
    const result = monitoringWebhookSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });
});
