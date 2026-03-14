import {
  inviteMemberSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/validations/auth';

describe('auth validations', () => {
  it('accepts valid sign-in input', () => {
    const result = signInSchema.safeParse({
      email: 'risk.manager@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
  });

  it('rejects short sign-in password', () => {
    const result = signInSchema.safeParse({
      email: 'risk.manager@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('trims display name for sign-up', () => {
    const result = signUpSchema.parse({
      displayName: '  Maya Chen  ',
      email: 'maya@example.com',
      password: 'a-secure-password',
    });

    expect(result.displayName).toBe('Maya Chen');
  });

  it('disallows owner role in member invite payload', () => {
    const result = inviteMemberSchema.safeParse({
      email: 'new.user@example.com',
      role: 'owner',
    });

    expect(result.success).toBe(false);
  });
});
