import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  appendCorsHeaders,
  createCorsPreflightResponse,
  isMutationMethod,
  resolveCorsAllowedOrigin,
} from '@/lib/security/cors';
import {
  appendRateLimitHeaders,
  enforcePublicApiRateLimit,
  isPublicApiRoute,
} from '@/lib/security/public-api';
import { isOriginAllowed } from '@/lib/security/origins';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const originHeader = request.headers.get('origin');
  const isApiRoute = pathname.startsWith('/api/');

  if (isApiRoute) {
    const allowedCorsOrigin = resolveCorsAllowedOrigin(originHeader);

    if (request.method === 'OPTIONS') {
      return createCorsPreflightResponse(originHeader);
    }

    if (originHeader && !allowedCorsOrigin) {
      const forbidden = NextResponse.json(
        { error: 'Origin is not allowed for this API route.' },
        { status: 403 },
      );
      appendCorsHeaders(forbidden, null);
      return forbidden;
    }

    if (isPublicApiRoute(pathname)) {
      const rateLimit = await enforcePublicApiRateLimit(request);

      if (!rateLimit.ok) {
        const blocked = NextResponse.json(
          { error: rateLimit.error },
          { status: rateLimit.status },
        );
        appendCorsHeaders(blocked, allowedCorsOrigin);
        appendRateLimitHeaders(blocked.headers, rateLimit);
        return blocked;
      }

      const response = updateSession(request);
      appendCorsHeaders(response, allowedCorsOrigin);
      appendRateLimitHeaders(response.headers, rateLimit);
      return response;
    }

    const response = updateSession(request);
    appendCorsHeaders(response, allowedCorsOrigin);
    return response;
  }

  if (isMutationMethod(request.method) && originHeader) {
    const originAllowed = isOriginAllowed(originHeader);
    if (!originAllowed) {
      return NextResponse.json(
        { error: 'Origin is not allowed.' },
        { status: 403 },
      );
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
