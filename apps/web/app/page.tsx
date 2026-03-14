export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(244,247,245,1))]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-12 px-6 py-20 md:px-10">
        <div className="flex flex-col gap-6">
          <span className="border-border bg-background/80 text-muted-foreground inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium backdrop-blur">
            Phase 0 foundation in progress
          </span>
          <div className="flex max-w-3xl flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Supply Chain Risk Intelligence for real-world disruption response.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 md:text-lg">
              Phase 0 sets the workspace, env validation, SSR-ready Supabase
              helpers, query provider, test runners, and shadcn-ready design
              tokens for the product build-out.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            'Org-scoped architecture with Supabase SSR helpers',
            'TanStack Query, Zod, React Hook Form, and pino wired into the app shell',
            'Vitest, Playwright, Husky, and workspace-wide typecheck/lint scripts configured',
          ].map((item) => (
            <article
              key={item}
              className="border-border bg-background/85 rounded-3xl border p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur"
            >
              <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">
                Foundation
              </p>
              <p className="text-foreground mt-4 text-lg leading-7">{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
