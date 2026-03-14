import { NextRequest, NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/api/openapi';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  const response = NextResponse.json(openApiSpec, { status: 200 });
  response.headers.set('x-request-id', requestLog.requestId);
  response.headers.set('cache-control', 'public, max-age=300');

  logRequestResponse(requestLog, {
    status: 200,
    message: 'OpenAPI document served.',
  });

  return response;
}
