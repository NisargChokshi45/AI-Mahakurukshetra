import { z } from 'zod';

export const riskEventTypeSchema = z.enum([
  'geopolitical',
  'natural_disaster',
  'financial',
  'operational',
  'compliance',
  'delivery',
]);

export const severityLevelSchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const riskEventPayloadSchema = z.object({
  title: z.string().trim().min(5).max(200),
  event_type: riskEventTypeSchema,
  severity: severityLevelSchema,
  source: z.string().trim().min(2),
  source_url: z.string().url().optional().or(z.literal('')),
  summary: z.string().trim().min(10),
  supplier_ids: z.array(z.string().uuid()).optional(),
});

export const createRiskEventSchema = riskEventPayloadSchema;

export const updateRiskEventSchema = riskEventPayloadSchema.extend({
  risk_event_id: z.string().uuid(),
});

export const monitoringWebhookSchema = riskEventPayloadSchema.extend({
  hmac_signature: z.string().optional(),
});

export type RiskEventType = z.infer<typeof riskEventTypeSchema>;
export type SeverityLevel = z.infer<typeof severityLevelSchema>;
export type RiskEventPayloadInput = z.infer<typeof riskEventPayloadSchema>;
export type CreateRiskEventInput = z.infer<typeof createRiskEventSchema>;
export type UpdateRiskEventInput = z.infer<typeof updateRiskEventSchema>;
export type MonitoringWebhookInput = z.infer<typeof monitoringWebhookSchema>;
