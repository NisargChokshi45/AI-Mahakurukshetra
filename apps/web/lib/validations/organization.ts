import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  industry: z.string().trim().max(80).optional().default(''),
  headquartersCountry: z.string().trim().max(80).optional().default(''),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
