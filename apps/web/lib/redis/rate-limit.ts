import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/redis/client';

type RateLimitWindow =
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

type RateLimiterOptions = {
  identifierPrefix: string;
  limit: number;
  window: RateLimitWindow;
};

export function createRateLimiter({
  identifierPrefix,
  limit,
  window,
}: RateLimiterOptions) {
  return new Ratelimit({
    analytics: true,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: identifierPrefix,
    redis: getRedisClient(),
  });
}
