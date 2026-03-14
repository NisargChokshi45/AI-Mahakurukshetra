import type { Metadata } from 'next';
import {
  PageHeader,
  SectionCard,
  StatusBadge,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'API Docs | Supply Chain Risk Intelligence Platform',
  description:
    'Judge-facing API documentation surface for the Supply Chain Risk Intelligence Platform.',
};

const groups = [
  { name: 'Analytics', path: '/api/analytics', status: 'planned' },
  { name: 'Suppliers', path: '/api/suppliers', status: 'planned' },
  { name: 'Risks', path: '/api/risks', status: 'planned' },
  { name: 'Incidents', path: '/api/incidents', status: 'planned' },
  { name: 'Reports', path: '/api/reports', status: 'planned' },
  { name: 'Monitoring webhook', path: '/api/monitoring', status: 'planned' },
];

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-16">
        <PageHeader
          eyebrow="Public docs"
          title="API reference surface for judges and integration reviewers."
          description="This page stands in for the future Swagger UI at `/api/docs`. It exposes the API group structure and expected ownership until the OpenAPI spec is wired."
        />

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard
            eyebrow="Overview"
            title="Documentation status"
            description="HTML placeholder for the public docs route defined in the plan."
          >
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-7">
                The final version should render a live Swagger UI backed by the
                OpenAPI files. For now, judges can inspect the planned surface
                area and endpoint grouping directly from this route.
              </p>
              <button type="button" className={buttonStyles('primary')}>
                Open spec preview
              </button>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Endpoint groups"
            title="Planned API surface"
            description="Organized by business domain, consistent with `doc/plan.md`."
          >
            <div className="grid gap-4">
              {groups.map((group) => (
                <article
                  key={group.path}
                  className="border-border/70 bg-background/80 rounded-[24px] border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">
                        {group.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {group.path}
                      </p>
                    </div>
                    <StatusBadge status={group.status} />
                  </div>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}
