'use client';

import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export default function DashboardError({
  reset,
}: Readonly<{
  reset: () => void;
}>) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Error state"
        title="The workspace snapshot could not be rendered"
        description="This shared error boundary covers the critical Phase 4 views. Hook real error telemetry into this surface in Phase 6."
      />
      <SectionCard
        eyebrow="Recovery"
        title="Try reloading the workspace"
        description="If the problem persists, inspect the route-level data dependency or the Supabase query replacing the current mock data."
      >
        <button
          type="button"
          className={buttonStyles('primary')}
          onClick={reset}
        >
          Reload view
        </button>
      </SectionCard>
    </div>
  );
}
