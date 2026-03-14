type AllowedOriginRule =
  | {
      origin: string;
      type: 'exact';
    }
  | {
      protocol: 'http' | 'https';
      suffix: string;
      type: 'wildcard';
    };

const WILDCARD_ORIGIN_REGEX = /^(https?):\/\/\*\.(.+)$/i;
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function normalizeOriginValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function parseAllowedOriginRule(value: string): AllowedOriginRule | null {
  const wildcardMatch = value.match(WILDCARD_ORIGIN_REGEX);

  if (wildcardMatch?.[1] && wildcardMatch[2]) {
    const protocol = wildcardMatch[1].toLowerCase();
    const suffix = wildcardMatch[2].toLowerCase();
    if ((protocol === 'http' || protocol === 'https') && suffix.length > 0) {
      return {
        protocol,
        suffix,
        type: 'wildcard',
      };
    }
    return null;
  }

  const origin = normalizeOriginValue(value);
  if (!origin) {
    return null;
  }

  return {
    origin,
    type: 'exact',
  };
}

export function getAllowedOriginRules(): AllowedOriginRule[] {
  return parseCsvEnv(process.env.ALLOWED_ORIGINS).flatMap((value) => {
    const rule = parseAllowedOriginRule(value);
    return rule ? [rule] : [];
  });
}

function matchesAllowedOriginRule(
  origin: URL,
  rule: AllowedOriginRule,
): boolean {
  if (rule.type === 'exact') {
    const normalizedOrigin = origin.origin.toLowerCase();
    if (normalizedOrigin === rule.origin) {
      return true;
    }

    try {
      const allowed = new URL(rule.origin);
      const isLoopbackPair =
        LOOPBACK_HOSTNAMES.has(origin.hostname.toLowerCase()) &&
        LOOPBACK_HOSTNAMES.has(allowed.hostname.toLowerCase());

      if (!isLoopbackPair) {
        return false;
      }

      const originProtocol = origin.protocol.toLowerCase();
      const allowedProtocol = allowed.protocol.toLowerCase();
      if (originProtocol !== allowedProtocol) {
        return false;
      }

      return origin.port === allowed.port;
    } catch {
      return false;
    }
  }

  if (origin.protocol.replace(':', '').toLowerCase() !== rule.protocol) {
    return false;
  }

  const hostname = origin.hostname.toLowerCase();
  return hostname.endsWith(`.${rule.suffix}`);
}

export function isOriginAllowed(
  originValue: string | null,
  rules: AllowedOriginRule[] = getAllowedOriginRules(),
): boolean {
  if (!originValue) {
    return false;
  }

  try {
    const origin = new URL(originValue);
    return rules.some((rule) => matchesAllowedOriginRule(origin, rule));
  } catch {
    return false;
  }
}

function getForwardedHostOrigin(requestHeaders: Headers): string | null {
  const hostHeader = requestHeaders.get('x-forwarded-host');
  const protocolHeader = requestHeaders.get('x-forwarded-proto');
  if (!hostHeader || !protocolHeader) {
    return null;
  }

  const host = hostHeader.split(',')[0]?.trim();
  const protocol = protocolHeader.split(',')[0]?.trim();
  if (!host || !protocol) {
    return null;
  }

  return normalizeOriginValue(`${protocol}://${host}`);
}

function getHostFallbackOrigin(requestHeaders: Headers): string | null {
  const hostHeader = requestHeaders.get('host');
  if (!hostHeader) {
    return null;
  }

  const host = hostHeader.split(',')[0]?.trim();
  if (!host) {
    return null;
  }

  const lowerHost = host.toLowerCase();
  const protocol =
    lowerHost.includes('localhost') || lowerHost.startsWith('127.0.0.1')
      ? 'http'
      : 'https';

  return normalizeOriginValue(`${protocol}://${host}`);
}

export function resolveAllowedAppOrigin(requestHeaders: Headers): string {
  const rules = getAllowedOriginRules();
  const candidateOrigins = [
    normalizeOriginValue(requestHeaders.get('origin')),
    getForwardedHostOrigin(requestHeaders),
    getHostFallbackOrigin(requestHeaders),
  ];

  for (const candidate of candidateOrigins) {
    if (candidate && isOriginAllowed(candidate, rules)) {
      return candidate;
    }
  }

  const fallback = normalizeOriginValue(
    process.env.NEXT_PUBLIC_APP_URL ?? null,
  );
  if (fallback) {
    return fallback;
  }

  throw new Error('NEXT_PUBLIC_APP_URL must be set to a valid URL.');
}
