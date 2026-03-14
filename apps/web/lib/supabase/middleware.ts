import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import {
  NextResponse,
  type NextResponse as NextResponseType,
} from 'next/server';
import { getPublicEnv } from '@/lib/env';

export async function updateSession(
  request: NextRequest,
): Promise<NextResponseType> {
  const env = getPublicEnv();
  let response: NextResponseType = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({
            request,
          });

          for (const { name, options, value } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}
