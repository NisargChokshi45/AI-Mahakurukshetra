import type { Metadata } from 'next';
import { SwaggerUi } from '@/components/api/swagger-ui';
import { PageHeader, SectionCard } from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'API Docs | Supply Chain Risk Intelligence Platform',
  description:
    'Swagger API reference surface for judges and integration reviewers.',
};

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-16">
        <PageHeader
          eyebrow="Public docs"
          title="Swagger API reference for judges and integration reviewers."
          description="This route serves a live Swagger UI backed by `/api/openapi`, including all planned endpoint groups and currently-implemented public routes."
        />

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <SectionCard
            eyebrow="Overview"
            title="Documentation status"
            description="OpenAPI tags and paths mirror the architecture plan and are intended for live judge review."
          >
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-7">
                Implemented endpoints currently include `/api/health`,
                `/api/monitoring`, `/api/openapi`, and `/auth/callback`. Planned
                protected endpoint groups are documented in the same spec to
                keep backend and docs in sync.
              </p>
              <p className="text-muted-foreground text-sm leading-7">
                Use the interactive panel to inspect schemas, headers, response
                statuses, and auth requirements.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Swagger UI"
            title="Live OpenAPI explorer"
            description="Rendered from `/api/openapi` with grouped tags per domain."
          >
            <SwaggerUi />
          </SectionCard>
        </div>
      </section>
    </main>
  );
}
