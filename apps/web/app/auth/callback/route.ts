import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error_description');
  const nextPath = requestUrl.searchParams.get('next') ?? '/dashboard';

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(exchangeError.message)}`,
          requestUrl.origin,
        ),
      );
    }
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
