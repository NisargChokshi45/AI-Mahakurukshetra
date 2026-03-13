const quickActions = [
  "Connect Supabase auth",
  "Add projects CRUD",
  "Wire Stripe billing",
  "Expose public API docs"
];

export default function DashboardPage() {
  return (
    <main className="page-shell stack">
      <section className="hero-card stack">
        <p className="eyebrow">Protected Area Stub</p>
        <h1 className="section-title">Dashboard</h1>
        <p className="section-copy">
          This route group is reserved for authenticated product surfaces.
        </p>
      </section>
      <section className="content-card">
        <h2 className="section-title">Quick actions</h2>
        <ul className="list">
          {quickActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

