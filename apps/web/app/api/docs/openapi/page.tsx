import type { Metadata } from 'next';
import Link from 'next/link';
import { openApiSpec } from '@/lib/api/openapi';
import {
  MetricCard,
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';

export const metadata: Metadata = {
  title: 'OpenAPI Coverage | Supply Chain Risk Intelligence Platform',
  description:
    'Analytical OpenAPI reference with endpoint coverage, security posture, and integration-ready operation index.',
};

const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
  'trace',
] as const;

type HttpMethod = (typeof HTTP_METHODS)[number];

type OpenApiOperation = {
  summary?: string;
  tags?: readonly string[];
  security?: readonly unknown[];
  responses?: Record<string, unknown>;
};

type OperationSummary = {
  id: string;
  method: Uppercase<HttpMethod>;
  path: string;
  tag: string;
  summary: string;
  isProtected: boolean;
  responseCodes: string[];
};

function toUpperMethod(method: HttpMethod): Uppercase<HttpMethod> {
  if (method === 'get') {
    return 'GET';
  }
  if (method === 'post') {
    return 'POST';
  }
  if (method === 'put') {
    return 'PUT';
  }
  if (method === 'patch') {
    return 'PATCH';
  }
  if (method === 'delete') {
    return 'DELETE';
  }
  if (method === 'options') {
    return 'OPTIONS';
  }
  if (method === 'head') {
    return 'HEAD';
  }

  return 'TRACE';
}

function getOperations(): OperationSummary[] {
  return Object.entries(openApiSpec.paths).flatMap(([path, pathItem]) => {
    const operations: OperationSummary[] = [];
    const normalizedPathItem = pathItem as unknown as Partial<
      Record<HttpMethod, OpenApiOperation>
    >;

    for (const method of HTTP_METHODS) {
      const candidate = normalizedPathItem[method];
      if (!candidate) {
        continue;
      }

      const operation = candidate as OpenApiOperation;
      const tag = operation.tags?.[0] ?? 'Uncategorized';

      operations.push({
        id: `${method}:${path}`,
        method: toUpperMethod(method),
        path,
        tag,
        summary: operation.summary ?? 'No summary provided',
        isProtected: Boolean(
          operation.security && operation.security.length > 0,
        ),
        responseCodes: Object.keys(operation.responses ?? {}),
      });
    }

    return operations;
  });
}

function getMethodClass(method: Uppercase<HttpMethod>) {
  if (method === 'GET') {
    return 'bg-cyan-100 text-cyan-800';
  }

  if (method === 'POST') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (method === 'PATCH' || method === 'PUT') {
    return 'bg-amber-100 text-amber-800';
  }

  if (method === 'DELETE') {
    return 'bg-rose-100 text-rose-800';
  }

  return 'bg-slate-100 text-slate-800';
}

export default function OpenApiCoveragePage() {
  const operations = getOperations();
  const totalOperations = operations.length;
  const protectedOperations = operations.filter(
    (operation) => operation.isProtected,
  ).length;
  const publicOperations = totalOperations - protectedOperations;
  const tagCoverage = new Map<string, number>();
  const methodCoverage = new Map<Uppercase<HttpMethod>, number>();

  for (const operation of operations) {
    tagCoverage.set(operation.tag, (tagCoverage.get(operation.tag) ?? 0) + 1);
    methodCoverage.set(
      operation.method,
      (methodCoverage.get(operation.method) ?? 0) + 1,
    );
  }

  const sortedTags = Array.from(tagCoverage.entries()).sort(
    (left, right) => right[1] - left[1],
  );
  const sortedMethods = Array.from(methodCoverage.entries()).sort(
    (left, right) => right[1] - left[1],
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 md:py-8">
        <header className="border-border/70 bg-background/86 flex items-center justify-between rounded-full border px-4 py-3 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur md:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]"
            />
            SupplySense AI
          </Link>
          <nav
            aria-label="Document navigation"
            className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex"
          >
            <Link
              href="/#capabilities"
              className="transition hover:text-slate-900"
            >
              Capabilities
            </Link>
            <Link href="/#workflow" className="transition hover:text-slate-900">
              Workflow
            </Link>
            <Link href="/#outcomes" className="transition hover:text-slate-900">
              Outcomes
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <section className="flex w-full flex-col gap-6 py-10 md:py-12">
          <PageHeader
            eyebrow="OpenAPI Intelligence"
            title="API surface, analyzed for humans"
            description="This view translates the raw OpenAPI document into endpoint coverage, auth posture, and request-method distribution so teams can integrate faster."
            actions={
              <Link href="/api/docs" className={buttonStyles('ghost')}>
                Back to API docs
              </Link>
            }
          />

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Paths"
              value={String(Object.keys(openApiSpec.paths).length)}
              detail="Distinct route paths currently documented."
            />
            <MetricCard
              label="Operations"
              value={String(totalOperations)}
              detail="Total method-level operations ready for integration."
            />
            <MetricCard
              label="Protected"
              value={String(protectedOperations)}
              detail="Operations requiring Supabase JWT authentication."
            />
            <MetricCard
              label="Public"
              value={String(publicOperations)}
              detail="Operations available without bearer auth."
            />
          </section>

          <section className="space-y-8">
            <SectionCard
              eyebrow="Coverage"
              title="Tag and method distribution"
              description="Use this to spot dense API domains and quickly understand the dominant request patterns."
            >
              <div className="space-y-6">
                <article className="border-border/70 bg-background/80 rounded-[20px] border p-4">
                  <h3 className="text-sm font-semibold tracking-tight">
                    By tag
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {sortedTags.map(([tag, count]) => (
                      <li
                        key={tag}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-muted-foreground">{tag}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="border-border/70 bg-background/80 rounded-[20px] border p-4">
                  <h3 className="text-sm font-semibold tracking-tight">
                    By method
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {sortedMethods.map(([method, count]) => (
                      <li
                        key={method}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-muted-foreground">{method}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Endpoint Index"
              title="Operation-by-operation reference"
              description="Readable operation index grouped by tag, with auth requirement and response envelopes."
              className="space-y-3 overflow-hidden"
            >
              <div className="grid gap-3">
                <div className="text-muted-foreground grid grid-cols-[120px_1fr_120px_120px] text-[0.65rem] font-semibold tracking-[0.3em] uppercase">
                  <span className="flex items-center justify-start">
                    Method
                  </span>
                  <span className="flex items-center justify-start">Path</span>
                  <span className="flex items-center justify-start">Auth</span>
                  <span className="flex items-center justify-start">
                    Responses
                  </span>
                </div>
                {operations.map((operation) => (
                  <div
                    key={operation.id}
                    className="bg-background/80 grid grid-cols-[120px_1fr_120px_120px] items-start gap-3 rounded-[20px] border border-slate-100 px-4 py-3 text-sm shadow-sm"
                  >
                    <span
                      className={`inline-flex min-h-7 items-center justify-center rounded-full px-3 text-xs font-semibold ${getMethodClass(operation.method)}`}
                    >
                      {operation.method}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">
                        {operation.path}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {operation.summary}
                      </p>
                    </div>
                    <span className="inline-flex min-h-7 items-center justify-center rounded-full px-3 text-xs font-semibold">
                      {operation.isProtected ? 'JWT required' : 'Public'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {operation.responseCodes.length > 0
                        ? operation.responseCodes.join(', ')
                        : 'Not specified'}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </section>
        </section>
      </div>
    </main>
  );
}
