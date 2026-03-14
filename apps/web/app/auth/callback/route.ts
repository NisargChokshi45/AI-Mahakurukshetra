import { NextResponse } from 'next/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { resolveSafeNextPath } from '@/lib/security/redirects';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestLog = startRequestLog({
    method: request.method,
    pathname: requestUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });
  const redirectWithLog = (url: URL, status: number, message: string) => {
    const response = NextResponse.redirect(url);
    response.headers.set('x-request-id', requestLog.requestId);
    logRequestResponse(requestLog, { status, message });
    return response;
  };

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error_description');
  const nextPath = resolveSafeNextPath(requestUrl.searchParams.get('next'));

  if (error) {
    return redirectWithLog(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin),
      302,
      'Auth callback returned provider error.',
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return redirectWithLog(
        new URL(
          `/login?error=${encodeURIComponent(exchangeError.message)}`,
          requestUrl.origin,
        ),
        302,
        'Auth callback exchange failed.',
      );
    }
  }

  return redirectWithLog(
    new URL(nextPath, requestUrl.origin),
    302,
    'Auth callback exchange succeeded.',
  );
}
