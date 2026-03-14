import { z } from 'zod';

export const appRoleSchema = z.enum([
  'owner',
  'admin',
  'risk_manager',
  'procurement_lead',
  'viewer',
]);

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: appRoleSchema.exclude(['owner']),
});

export type AppRole = z.infer<typeof appRoleSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
