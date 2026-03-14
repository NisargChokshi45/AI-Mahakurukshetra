import pino from 'pino';

export function createLogger(
  bindings?: Record<string, string | number | boolean | undefined>,
) {
  return pino({
    base: bindings,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
            },
          },
  });
}

const logger = createLogger();
export default logger;
