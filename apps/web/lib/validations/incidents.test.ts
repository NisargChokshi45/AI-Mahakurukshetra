import {
  createIncidentSchema,
  resolveIncidentSchema,
} from '@/lib/validations/incidents';

describe('incident validation schemas', () => {
  it('accepts a valid create payload', () => {
    const result = createIncidentSchema.safeParse({
      priority: 'high',
      summary:
        'Escalate alternate source qualification before week-end cutoff.',
      title: 'Backup supplier escalation',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid create payloads', () => {
    const result = createIncidentSchema.safeParse({
      priority: 'urgent',
      summary: 'short',
      title: 'bad',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid resolve payload', () => {
    const result = resolveIncidentSchema.safeParse({
      incidentId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(result.success).toBe(true);
  });
});
