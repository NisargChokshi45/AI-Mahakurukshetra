'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveAuthCallbackUrl } from '@/lib/security/redirects';
import { createClient } from '@/lib/supabase/server';
import { setFlash } from '@/lib/flash';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/validations/auth';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: getString(formData, 'email'),
    password: getString(formData, 'password'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Enter a valid email and password.' });
    redirect('/login');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    await setFlash({ error: error.message });
    redirect('/login');
  }

  redirect('/dashboard');
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    displayName: getString(formData, 'displayName'),
    email: getString(formData, 'email'),
    password: getString(formData, 'password'),
  });

  if (!parsed.success) {
    await setFlash({
      error: 'Name, email, and password must all be valid.',
    });
    redirect('/signup');
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const callbackUrl = resolveAuthCallbackUrl(requestHeaders);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    await setFlash({ error: error.message });
    redirect('/signup');
  }

  if (!data.session) {
    await setFlash({
      message:
        'Check your inbox to confirm the account, then continue to organization setup.',
    });
    redirect('/login');
  }

  redirect('/setup/organization');
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const callbackUrl = resolveAuthCallbackUrl(requestHeaders);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error || !data.url) {
    await setFlash({
      error: error?.message ?? 'Unable to start Google OAuth.',
    });
    redirect('/login');
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: getString(formData, 'email'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Enter a valid email address.' });
    redirect('/forgot-password');
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin =
    requestHeaders.get('origin') ?? requestHeaders.get('host') ?? '';
  const resetUrl = `${origin.startsWith('http') ? origin : `https://${origin}`}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: resetUrl,
    },
  );

  if (error) {
    await setFlash({ error: error.message });
    redirect('/forgot-password');
  }

  await setFlash({
    message:
      'Check your inbox for a password reset link. It expires in 1 hour.',
  });
  redirect('/login');
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    password: getString(formData, 'password'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Password must be at least 8 characters.' });
    redirect('/reset-password');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    await setFlash({ error: error.message });
    redirect('/reset-password');
  }

  await supabase.auth.signOut();
  await setFlash({
    message: 'Password updated. Please sign in with your new password.',
  });
  redirect('/login');
}
