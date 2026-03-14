import { NextRequest, NextResponse } from 'next/server';
import {
  getServiceStatusReport,
  resolveStatusCode,
} from '@/lib/api/service-status';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const report = await getServiceStatusReport();
  const statusCode = resolveStatusCode(
    report.checks.database,
    report.checks.redis,
  );

  const response = NextResponse.json(
    { ...report, request_id: requestLog.requestId },
    { status: statusCode },
  );
  response.headers.set('x-request-id', requestLog.requestId);

  logRequestResponse(requestLog, {
    status: statusCode,
    message: 'Health check completed.',
    level: statusCode === 200 ? 'info' : 'warn',
    metadata: {
      db_status: report.checks.database.status,
      redis_status: report.checks.redis.status,
    },
  });

  return response;
}
