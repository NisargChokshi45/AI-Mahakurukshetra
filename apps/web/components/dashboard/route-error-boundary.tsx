'use client';

import { useEffect } from 'react';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

type RouteErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
  routeLabel: string;
};

export function RouteErrorBoundary({
  error,
  reset,
  routeLabel,
}: RouteErrorBoundaryProps) {
  useEffect(() => {
    // Send structured error to server for logging
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'dashboard_route_error',
        route: routeLabel,
        message: error.message,
        digest: error.digest ?? null,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Fallback to console if logging endpoint fails
      console.error('dashboard_route_error', {
        digest: error.digest ?? null,
        message: error.message,
        route: routeLabel,
      });
    });
  }, [error.digest, error.message, error.stack, routeLabel]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Error state"
        title={`Unable to render ${routeLabel}`}
        description="The page hit an unexpected error. Review server logs and retry the view."
      />
      <SectionCard
        eyebrow="Recovery"
        title="Retry this route"
        description="Use retry to re-render the route boundary after transient failures."
      >
        <button
          type="button"
          className={buttonStyles('primary')}
          onClick={reset}
        >
          Retry route
        </button>
      </SectionCard>
    </div>
  );
}
