import { z } from 'zod';

export const incidentStatusSchema = z.enum([
  'new',
  'investigating',
  'mitigating',
  'resolved',
]);

export const incidentPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const createIncidentSchema = z.object({
  priority: incidentPrioritySchema,
  summary: z.string().trim().min(10).max(2000),
  title: z.string().trim().min(5).max(180),
});

export const resolveIncidentSchema = z.object({
  incidentId: z.string().uuid(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type IncidentPriority = z.infer<typeof incidentPrioritySchema>;
export type IncidentStatus = z.infer<typeof incidentStatusSchema>;
