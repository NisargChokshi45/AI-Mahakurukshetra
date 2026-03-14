import type { NextRequest } from 'next/server';
import type { Ratelimit } from '@upstash/ratelimit';
import { createRateLimiter } from '@/lib/redis/rate-limit';

type RateLimitWindow =
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

type PublicRateLimitConfig = {
  identifierPrefix: string;
  limit: number;
  route: string;
  window: RateLimitWindow;
};

type RateLimitInfo = {
  limit: number;
  remaining: number;
  reset: number;
};

type PublicApiRateLimitResult =
  | ({
      error: string;
      ok: false;
      status: number;
    } & Partial<RateLimitInfo>)
  | ({
      ok: true;
      status: 200;
    } & RateLimitInfo);

const PUBLIC_API_LIMITS: PublicRateLimitConfig[] = [
  {
    identifierPrefix: 'rate-limit:public:monitoring',
    limit: 100,
    route: '/api/monitoring',
    window: '1 m',
  },
];

const limiterCache = new Map<string, Ratelimit | null>();

function getPublicApiConfig(pathname: string): PublicRateLimitConfig | null {
  return PUBLIC_API_LIMITS.find((config) => config.route === pathname) ?? null;
}

function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function getLimiter(pathname: string): Ratelimit | null {
  if (limiterCache.has(pathname)) {
    return limiterCache.get(pathname) ?? null;
  }

  const config = getPublicApiConfig(pathname);
  if (!config || !isRateLimitConfigured()) {
    limiterCache.set(pathname, null);
    return null;
  }

  const limiter = createRateLimiter({
    identifierPrefix: config.identifierPrefix,
    limit: config.limit,
    window: config.window,
  });

  limiterCache.set(pathname, limiter);
  return limiter;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_LIMITS.some((config) => config.route === pathname);
}

export async function enforcePublicApiRateLimit(
  request: NextRequest,
): Promise<PublicApiRateLimitResult> {
  const pathname = request.nextUrl.pathname;
  const config = getPublicApiConfig(pathname);

  if (!config) {
    return {
      limit: Number.MAX_SAFE_INTEGER,
      ok: true,
      remaining: Number.MAX_SAFE_INTEGER,
      reset: Date.now() + 60_000,
      status: 200,
    };
  }

  const limiter = getLimiter(pathname);

  if (!limiter) {
    return {
      error:
        'Public API rate limiting is unavailable. Configure Upstash Redis credentials.',
      ok: false,
      status: 503,
    };
  }

  const identifier = `${config.route}:${getClientIp(request)}`;
  const result = await limiter.limit(identifier);

  if (!result.success) {
    return {
      limit: result.limit,
      ok: false,
      remaining: result.remaining,
      reset: result.reset,
      status: 429,
      error: 'Rate limit exceeded.',
    };
  }

  return {
    limit: result.limit,
    ok: true,
    remaining: result.remaining,
    reset: result.reset,
    status: 200,
  };
}

export function appendRateLimitHeaders(
  headers: Headers,
  result: Partial<RateLimitInfo>,
) {
  if (
    typeof result.limit !== 'number' ||
    typeof result.remaining !== 'number' ||
    typeof result.reset !== 'number'
  ) {
    return;
  }

  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.reset));

  if (result.remaining === 0) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    headers.set('Retry-After', String(retryAfterSeconds));
  }
}
