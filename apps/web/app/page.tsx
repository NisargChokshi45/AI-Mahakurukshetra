const pillars = [
  "Next.js App Router baseline",
  "Supabase-ready architecture",
  "Public health endpoint + API docs starter",
  "Feature flag config for plan gating"
];

const tracks = [
  {
    title: "Foundation",
    copy: "Workspace configuration, app shell, route groups, and repo structure now match the planning docs."
  },
  {
    title: "Delivery",
    copy: "The next step is wiring Supabase auth, database migrations, and a first protected CRUD flow."
  },
  {
    title: "Judging Surface",
    copy: "OpenAPI specs, health monitoring, coverage, and status-page support are scaffolded at the repo level."
  }
];

export default function HomePage() {
  return (
    <main className="page-shell stack">
      <nav className="nav">
        <div className="brand">AI Mahakurukshetra</div>
        <div className="nav-links">
          <a href="/login">Login</a>
          <a href="/signup">Signup</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/api/health">Health</a>
        </div>
      </nav>

      <section className="hero-card stack">
        <p className="eyebrow">Hackathon Scaffold</p>
        <h1 className="title">Ship the SaaS foundation before feature rush starts.</h1>
        <p className="subtitle">
          This initialization step sets up the monorepo, the main app shell, and
          the project-level configuration needed to move into Supabase auth,
          protected routes, API design, and deployment.
        </p>
        <div className="pill-row">
          {pillars.map((pillar) => (
            <span key={pillar} className="pill">
              {pillar}
            </span>
          ))}
        </div>
        <div className="pill-row">
          <a className="cta" href="/dashboard">
            Open dashboard stub
          </a>
          <a className="cta secondary" href="/api/health">
            View health response
          </a>
        </div>
      </section>

      <section className="grid grid-3">
        {tracks.map((track) => (
          <article key={track.title} className="content-card">
            <h2 className="section-title">{track.title}</h2>
            <p className="section-copy">{track.copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

