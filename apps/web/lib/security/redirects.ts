import {
  normalizeOriginValue,
  resolveAllowedAppOrigin,
} from '@/lib/security/origins';

type AllowedRedirectRule =
  | {
      type: 'exact';
      url: string;
    }
  | {
      path: string;
      protocol: 'http' | 'https';
      suffix: string;
      type: 'wildcard';
    };

const AUTH_CALLBACK_PATH = '/auth/callback';
const WILDCARD_REDIRECT_REGEX = /^(https?):\/\/\*\.(.+?)(\/.*)$/i;

export function resolveSafeNextPath(rawNextPath: string | null): string {
  if (!rawNextPath) {
    return '/dashboard';
  }

  if (!rawNextPath.startsWith('/') || rawNextPath.startsWith('//')) {
    return '/dashboard';
  }

  if (rawNextPath.includes('\n') || rawNextPath.includes('\r')) {
    return '/dashboard';
  }

  try {
    const parsed = new URL(rawNextPath, 'http://localhost');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/dashboard';
  }
}

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeRedirectUrlValue(value: string): string | null {
  try {
    const parsed = new URL(value);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseAllowedRedirectRule(value: string): AllowedRedirectRule | null {
  const wildcardMatch = value.match(WILDCARD_REDIRECT_REGEX);
  if (wildcardMatch?.[1] && wildcardMatch[2] && wildcardMatch[3]) {
    const protocol = wildcardMatch[1].toLowerCase();
    const suffix = wildcardMatch[2].toLowerCase();
    const path = wildcardMatch[3];
    if (
      (protocol === 'http' || protocol === 'https') &&
      suffix.length > 0 &&
      path.length > 0
    ) {
      return {
        path,
        protocol,
        suffix,
        type: 'wildcard',
      };
    }
    return null;
  }

  const normalized = normalizeRedirectUrlValue(value);
  if (!normalized) {
    return null;
  }

  return {
    type: 'exact',
    url: normalized,
  };
}

function getAllowedRedirectRules(): AllowedRedirectRule[] {
  return parseCsvEnv(process.env.ALLOWED_REDIRECT_URLS).flatMap((value) => {
    const rule = parseAllowedRedirectRule(value);
    return rule ? [rule] : [];
  });
}

function isRedirectAllowedByRule(url: URL, rule: AllowedRedirectRule): boolean {
  if (rule.type === 'exact') {
    return normalizeRedirectUrlValue(url.toString()) === rule.url;
  }

  if (url.protocol.replace(':', '').toLowerCase() !== rule.protocol) {
    return false;
  }

  if (!url.hostname.toLowerCase().endsWith(`.${rule.suffix}`)) {
    return false;
  }

  return url.pathname === rule.path;
}

function isRedirectAllowed(
  redirectUrl: string,
  rules: AllowedRedirectRule[],
): boolean {
  if (rules.length === 0) {
    return true;
  }

  try {
    const parsed = new URL(redirectUrl);
    return rules.some((rule) => isRedirectAllowedByRule(parsed, rule));
  } catch {
    return false;
  }
}

export function resolveAuthCallbackUrl(requestHeaders: Headers): string {
  const appOrigin = resolveAllowedAppOrigin(requestHeaders);
  const candidate = `${appOrigin}${AUTH_CALLBACK_PATH}`;
  const redirectRules = getAllowedRedirectRules();

  if (isRedirectAllowed(candidate, redirectRules)) {
    return candidate;
  }

  const fallbackOrigin = normalizeOriginValue(
    process.env.NEXT_PUBLIC_APP_URL ?? null,
  );
  if (fallbackOrigin) {
    const fallback = `${fallbackOrigin}${AUTH_CALLBACK_PATH}`;
    if (isRedirectAllowed(fallback, redirectRules)) {
      return fallback;
    }
  }

  const firstExactRule = redirectRules.find((rule) => rule.type === 'exact');
  if (firstExactRule?.type === 'exact') {
    return firstExactRule.url;
  }

  throw new Error(
    'No valid auth callback URL resolved. Check ALLOWED_REDIRECT_URLS and NEXT_PUBLIC_APP_URL.',
  );
}
