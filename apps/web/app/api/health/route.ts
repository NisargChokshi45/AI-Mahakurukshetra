import packageJson from '../../../package.json';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRedisClient } from '@/lib/redis/client';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

type HealthState = 'down' | 'up' | 'unconfigured';

type DependencyCheck = {
  detail?: string;
  latency_ms: number | null;
  status: HealthState;
};

function resolveStatusCode(
  database: DependencyCheck,
  redis: DependencyCheck,
): number {
  if (database.status === 'down') {
    return 503;
  }

  if (redis.status === 'down') {
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const statusCode = resolveStatusCode(database, redis);

  const response = NextResponse.json(
    {
      checks: {
        database,
        redis,
      },
      request_id: requestLog.requestId,
      status: statusCode === 200 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      version: packageJson.version,
    },
    { status: statusCode },
  );
  response.headers.set('x-request-id', requestLog.requestId);

  logRequestResponse(requestLog, {
    status: statusCode,
    message: 'Health check completed.',
    level: statusCode === 200 ? 'info' : 'warn',
    metadata: {
      db_status: database.status,
      redis_status: redis.status,
    },
  });

  return response;
}
