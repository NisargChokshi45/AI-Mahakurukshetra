'use client';

import { RouteErrorBoundary } from '@/components/dashboard/route-error-boundary';

export default function SegmentError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <RouteErrorBoundary error={error} reset={reset} routeLabel="/dashboard" />
  );
}
