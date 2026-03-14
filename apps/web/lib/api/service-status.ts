import packageJson from '../../package.json';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRedisClient } from '@/lib/redis/client';

export type HealthState = 'down' | 'up' | 'unconfigured';

export type DependencyCheck = {
  detail?: string;
  latency_ms: number | null;
  status: HealthState;
};

export type ServiceStatusReport = {
  checks: {
    database: DependencyCheck;
    redis: DependencyCheck;
  };
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime_seconds: number;
  version: string;
};

export function resolveStatusCode(
  database: DependencyCheck,
  redis: DependencyCheck,
): number {
  if (database.status === 'down' || redis.status === 'down') {
    return 503;
  }

  return 200;
}

async function checkDatabase(): Promise<DependencyCheck> {
  const startedAt = Date.now();
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('organizations').select('id').limit(1);

    if (error) {
      throw new Error(error.message);
    }

    return {
      latency_ms: Date.now() - startedAt,
      status: 'up',
    };
  } catch (error) {
    return {
      detail:
        error instanceof Error ? error.message : 'Unknown database failure.',
      latency_ms: Date.now() - startedAt,
      status: 'down',
    };
  }
}

async function checkRedis(): Promise<DependencyCheck> {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return {
      detail: 'Upstash Redis credentials not configured.',
      latency_ms: null,
      status: 'unconfigured',
    };
  }

  const startedAt = Date.now();
  try {
    const redis = getRedisClient();
    await redis.ping();
    return {
      latency_ms: Date.now() - startedAt,
      status: 'up',
    };
  } catch (error) {
    return {
      detail: error instanceof Error ? error.message : 'Unknown Redis failure.',
      latency_ms: Date.now() - startedAt,
      status: 'down',
    };
  }
}

export async function getServiceStatusReport(): Promise<ServiceStatusReport> {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const statusCode = resolveStatusCode(database, redis);

  return {
    checks: {
      database,
      redis,
    },
    status: statusCode === 200 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    version: packageJson.version,
  };
}
