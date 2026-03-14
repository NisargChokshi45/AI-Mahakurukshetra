import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logRequestResponse, startRequestLog } from '@/lib/logger/http';

const errorLogSchema = z.object({
  type: z.string(),
  route: z.string(),
  message: z.string(),
  digest: z.string().nullable(),
  stack: z.string().optional(),
  timestamp: z.string(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestLog = startRequestLog({
    method: request.method,
    pathname: request.nextUrl.pathname,
    requestId: request.headers.get('x-request-id'),
  });

  try {
    const body = await request.json();
    const parsed = errorLogSchema.safeParse(body);

    if (!parsed.success) {
      logRequestResponse(requestLog, {
        status: 400,
        level: 'warn',
        message: 'Invalid error log payload.',
        metadata: { validation_error: parsed.error.issues[0]?.message },
      });

      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Log the client-side error with full context
    logRequestResponse(requestLog, {
      status: 200,
      level: 'error',
      message: parsed.data.message,
      metadata: {
        error_type: parsed.data.type,
        route: parsed.data.route,
        digest: parsed.data.digest,
        stack: parsed.data.stack?.slice(0, 500), // Truncate stack traces
        client_timestamp: parsed.data.timestamp,
      },
    });

    return NextResponse.json({ logged: true });
  } catch (error) {
    logRequestResponse(requestLog, {
      status: 500,
      level: 'error',
      message: 'Failed to process error log.',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json({ error: 'Logging failed' }, { status: 500 });
  }
}
