import { NextResponse } from 'next/server';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';
import { resolveSafeNextPath } from '@/lib/security/redirects';
import { attachFlash, type FlashPayload } from '@/lib/flash';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestLog = startRequestLog({
    method: request.method,
    pathname: requestUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });
  const redirectWithLog = (
    url: URL,
    status: number,
    message: string,
    flashPayload?: FlashPayload,
  ) => {
    const response = NextResponse.redirect(url, { status });
    response.headers.set('x-request-id', requestLog.requestId);
    if (flashPayload) {
      attachFlash(response, flashPayload);
    }
    logRequestResponse(requestLog, { status, message });
    return response;
  };

  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error_description');
  const type = requestUrl.searchParams.get('type');
  const nextPath =
    type === 'recovery'
      ? '/reset-password'
      : resolveSafeNextPath(requestUrl.searchParams.get('next'));

  if (error) {
    return redirectWithLog(
      new URL('/login', requestUrl.origin),
      302,
      'Auth callback returned provider error.',
      { error },
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return redirectWithLog(
        new URL('/login', requestUrl.origin),
        302,
        'Auth callback exchange failed.',
        { error: exchangeError.message },
      );
    }
  }

  return redirectWithLog(
    new URL(nextPath, requestUrl.origin),
    302,
    'Auth callback exchange succeeded.',
  );
}
