'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveAuthCallbackUrl } from '@/lib/security/redirects';
import { createClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function getErrorRedirect(pathname: string, message: string) {
  return `${pathname}?error=${encodeURIComponent(message)}`;
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: getString(formData, 'email'),
    password: getString(formData, 'password'),
  });

  if (!parsed.success) {
    redirect(getErrorRedirect('/login', 'Enter a valid email and password.'));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirect(getErrorRedirect('/login', error.message));
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
    redirect(
      getErrorRedirect(
        '/signup',
        'Name, email, and password must all be valid.',
      ),
    );
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
    redirect(getErrorRedirect('/signup', error.message));
  }

  if (!data.session) {
    redirect(
      '/login?message=' +
        encodeURIComponent(
          'Check your inbox to confirm the account, then continue to organization setup.',
        ),
    );
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
    redirect(
      getErrorRedirect(
        '/login',
        error?.message ?? 'Unable to start Google OAuth.',
      ),
    );
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
