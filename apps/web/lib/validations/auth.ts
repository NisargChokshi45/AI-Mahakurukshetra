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

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: appRoleSchema.exclude(['owner']),
});

// z.string().uuid() in Zod v4 enforces strict RFC 4122 version/variant bits,
// which rejects valid Supabase-style UUIDs that use version 0 (e.g. seed data).
// Use a lenient hex-UUID regex instead so any 8-4-4-4-12 formatted ID passes.
const uuidLikeSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Invalid UUID',
  );

export const updateMemberRoleSchema = z.object({
  role: appRoleSchema.exclude(['owner']),
  userId: uuidLikeSchema,
});

export const deleteMemberSchema = z.object({
  userId: uuidLikeSchema,
});

export type AppRole = z.infer<typeof appRoleSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type DeleteMemberInput = z.infer<typeof deleteMemberSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
