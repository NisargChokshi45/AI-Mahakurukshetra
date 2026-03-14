import { LoadingGrid, PageHeader } from '@/components/dashboard/ui';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loading"
        title="Preparing the risk workspace"
        description="Rendering the seeded analytics surfaces and operational views."
      />
      <LoadingGrid />
    </div>
  );
}
