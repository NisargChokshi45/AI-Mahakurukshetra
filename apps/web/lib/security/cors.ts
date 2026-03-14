import { NextResponse } from 'next/server';
import { isOriginAllowed, normalizeOriginValue } from '@/lib/security/origins';

const CORS_ALLOWED_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
const CORS_ALLOWED_HEADERS =
  'Authorization, Content-Type, X-Org-Id, X-Hub-Signature-256, X-Request-Id';
const CORS_MAX_AGE_SECONDS = '600';

export function isMutationMethod(method: string): boolean {
  const normalizedMethod = method.toUpperCase();
  return !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod);
}

export function resolveCorsAllowedOrigin(
  originHeader: string | null,
): string | null {
  const normalized = normalizeOriginValue(originHeader);
  if (!normalized) {
    return null;
  }

  return isOriginAllowed(normalized) ? normalized : null;
}

function appendVaryHeader(response: NextResponse, headerName: string) {
  const current = response.headers.get('Vary');
  if (!current) {
    response.headers.set('Vary', headerName);
    return;
  }

  const entries = current
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);

  if (!entries.includes(headerName.toLowerCase())) {
    response.headers.set('Vary', `${current}, ${headerName}`);
  }
}

export function appendCorsHeaders(
  response: NextResponse,
  allowedOrigin: string | null,
) {
  appendVaryHeader(response, 'Origin');
  response.headers.set('Access-Control-Allow-Headers', CORS_ALLOWED_HEADERS);
  response.headers.set('Access-Control-Allow-Methods', CORS_ALLOWED_METHODS);
  response.headers.set('Access-Control-Max-Age', CORS_MAX_AGE_SECONDS);

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    response.headers.delete('Access-Control-Allow-Credentials');
    response.headers.delete('Access-Control-Allow-Origin');
  }
}

export function createCorsPreflightResponse(originHeader: string | null) {
  const allowedOrigin = resolveCorsAllowedOrigin(originHeader);

  if (!originHeader) {
    return NextResponse.json(
      { error: 'Missing Origin header for preflight request.' },
      { status: 400 },
    );
  }

  if (!allowedOrigin) {
    const forbidden = NextResponse.json(
      { error: 'Origin is not allowed.' },
      { status: 403 },
    );
    appendCorsHeaders(forbidden, null);
    return forbidden;
  }

  const response = new NextResponse(null, { status: 204 });
  appendCorsHeaders(response, allowedOrigin);
  return response;
}
