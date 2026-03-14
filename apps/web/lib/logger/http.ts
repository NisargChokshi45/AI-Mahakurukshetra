import { randomUUID } from 'crypto';
import { createLogger } from '@/lib/logger';

type LogLevel = 'error' | 'info' | 'warn';

type RequestLogOptions = {
  method: string;
  pathname: string;
  requestId?: string | null;
};

type ResponseLogOptions = {
  level?: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  status: number;
};

export type RequestLogContext = {
  logger: ReturnType<typeof createLogger>;
  requestId: string;
  startedAt: number;
};

export function startRequestLog({
  method,
  pathname,
  requestId,
}: RequestLogOptions): RequestLogContext {
  const normalizedRequestId = requestId?.trim() || randomUUID();
  const logger = createLogger({
    method,
    pathname,
    request_id: normalizedRequestId,
  });

  return {
    logger,
    requestId: normalizedRequestId,
    startedAt: Date.now(),
  };
}

export function logRequestResponse(
  context: RequestLogContext,
  { status, message, metadata, level = 'info' }: ResponseLogOptions,
) {
  const payload = {
    latency_ms: Date.now() - context.startedAt,
    status,
    ...(metadata ?? {}),
  };

  if (level === 'error') {
    context.logger.error(payload, message);
    return;
  }

  if (level === 'warn') {
    context.logger.warn(payload, message);
    return;
  }

  context.logger.info(payload, message);
}
