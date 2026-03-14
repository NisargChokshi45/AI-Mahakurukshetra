function parseCsv(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeOrigin(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function parseAllowedOrigins(value) {
  const wildcardRegex = /^(https?):\/\/\*\.(.+)$/i;

  return parseCsv(value)
    .map((entry) => {
      const wildcardMatch = entry.match(wildcardRegex);
      if (wildcardMatch?.[1] && wildcardMatch[2]) {
        return {
          protocol: wildcardMatch[1].toLowerCase(),
          suffix: wildcardMatch[2].toLowerCase(),
          type: 'wildcard',
        };
      }

      const normalized = normalizeOrigin(entry);
      if (!normalized) {
        return null;
      }

      return {
        origin: normalized,
        type: 'exact',
      };
    })
    .filter(Boolean);
}

function isOriginAllowed(origin, rules) {
  if (!origin) {
    return false;
  }

  try {
    const parsed = new URL(origin);
    return rules.some((rule) => {
      if (rule.type === 'exact') {
        return parsed.origin.toLowerCase() === rule.origin;
      }

      if (parsed.protocol.replace(':', '').toLowerCase() !== rule.protocol) {
        return false;
      }

      return parsed.hostname.toLowerCase().endsWith(`.${rule.suffix}`);
    });
  } catch {
    return false;
  }
}

function parseAllowedRedirects(value) {
  return parseCsv(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  const allowedOriginRules = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  assert(allowedOriginRules.length > 0, 'ALLOWED_ORIGINS must not be empty.');

  const appOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  assert(appOrigin, 'NEXT_PUBLIC_APP_URL must be a valid URL.');
  assert(
    isOriginAllowed(appOrigin, allowedOriginRules),
    'ALLOWED_ORIGINS must include NEXT_PUBLIC_APP_URL.',
  );

  const productionDomain =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (productionDomain) {
    const productionOrigin = normalizeOrigin(
      productionDomain.startsWith('http')
        ? productionDomain
        : `https://${productionDomain}`,
    );

    assert(
      productionOrigin && isOriginAllowed(productionOrigin, allowedOriginRules),
      'ALLOWED_ORIGINS must include NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL.',
    );
  }

  const previewOrigin = 'https://phase5-preview.vercel.app';
  assert(
    isOriginAllowed(previewOrigin, allowedOriginRules),
    'ALLOWED_ORIGINS must allow Vercel preview domains (for example https://*.vercel.app).',
  );

  const allowedRedirects = parseAllowedRedirects(
    process.env.ALLOWED_REDIRECT_URLS,
  );
  assert(
    allowedRedirects.length > 0,
    'ALLOWED_REDIRECT_URLS must include local, preview, and production callback URLs.',
  );

  const hasLocalCallback = allowedRedirects.includes(
    `${appOrigin}/auth/callback`,
  );
  assert(
    hasLocalCallback,
    'ALLOWED_REDIRECT_URLS must include NEXT_PUBLIC_APP_URL/auth/callback.',
  );

  const hasPreviewPattern = allowedRedirects.some((value) =>
    value.includes('*.vercel.app/auth/callback'),
  );
  assert(
    hasPreviewPattern,
    'ALLOWED_REDIRECT_URLS must include a preview callback pattern like https://*.vercel.app/auth/callback.',
  );

  console.log(
    'Domain configuration is valid for local, Vercel preview, and production environments.',
  );
}

run();
