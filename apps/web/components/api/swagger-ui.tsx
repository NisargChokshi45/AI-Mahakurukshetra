'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

type SwaggerUiBundle = ((config: Record<string, unknown>) => void) & {
  presets?: {
    apis?: unknown;
  };
};

declare global {
  interface Window {
    SwaggerUIBundle?: SwaggerUiBundle;
  }
}

export function SwaggerUi() {
  const [loadError, setLoadError] = useState<string | null>(null);

  const initializeSwagger = useCallback(() => {
    const bundle = window.SwaggerUIBundle;

    if (!bundle) {
      return;
    }

    bundle({
      deepLinking: true,
      dom_id: '#swagger-ui',
      layout: 'BaseLayout',
      presets: bundle.presets?.apis ? [bundle.presets.apis] : undefined,
      url: '/api/openapi',
    });
  }, []);

  useEffect(() => {
    initializeSwagger();
  }, [initializeSwagger]);

  return (
    <section className="space-y-4">
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onReady={initializeSwagger}
        onError={() =>
          setLoadError('Unable to load Swagger UI assets from CDN.')
        }
      />

      {loadError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <div
        id="swagger-ui"
        className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm"
      />
    </section>
  );
}
