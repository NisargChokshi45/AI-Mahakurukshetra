import Link from 'next/link';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export default function DashboardNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Not found"
        title="This operational workspace does not exist"
        description="The requested supplier, incident, or route segment could not be found in the seeded Phase 4 dataset."
      />
      <SectionCard
        eyebrow="Next step"
        title="Return to the core command views"
        description="Open the dashboard overview to resume the main judging flow."
      >
        <Link href="/dashboard" className={buttonStyles('primary')}>
          Back to dashboard
        </Link>
      </SectionCard>
    </div>
  );
}
