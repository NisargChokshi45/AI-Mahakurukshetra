## 2026-03-14

### Decision: Build MVP around organization-scoped risk operations

Reason:
The blueprint emphasizes enterprise supply chain monitoring, so the data model and UI should be centered on organizations, suppliers, regions, risk events, and incident workflows instead of a generic SaaS starter.

### Decision: Treat cross-domain support as a first-class requirement

Reason:
The app should not assume a single hostname. Plan for multiple frontend domains, preview deployments, webhook callers, and external integrations by using origin allowlists, redirect URL management, and stateless API access where needed.

### Decision: Keep the first release narrow and demoable

Reason:
The hackathon is time-boxed. The strongest deliverable is a polished seeded MVP with supplier risk monitoring, alerts, incident management, and a simple dependency view rather than a half-built predictive platform.

### Decision: Include contracts, inventories, shipments, and scenarios in schema but not in Phase 4 UI

Reason:
The blueprint lists these as part of the full data model. Having them in the DB schema enables realistic seed data and future expansion without UI complexity now. The Phase 4 UI focuses only on the core user loop: dashboard → supplier → risk event → incident → mitigation.

### Decision: Gate all advanced/differentiating features behind feature flags

Reason:
Features like predictive analytics, AI supplier discovery, IoT integration, and digital twin simulation are listed as "innovative" in the blueprint. They are too complex to build in the hackathon time window. Feature-flagging them keeps the codebase clean and shows architectural foresight to judges without risking a broken demo.

### Decision: Stripe pricing tier is based on number of suppliers monitored

Reason:
The blueprint explicitly lists "Tiered SaaS subscription based on number of suppliers monitored" as the primary monetization strategy. Aligns product pricing with the core value metric of the platform.

### Decision: Risk scoring runs server-side only, never client-exposed

Reason:
The scoring logic and weights are org-specific and commercially sensitive. Running scoring as a server action or API handler prevents weight manipulation and keeps the algorithm logic out of the client bundle.

### Decision: Mirror the product architecture in the `.codex` agent roster

Reason:
The plan separates concerns across UI, application/backend logic, database/RLS work, testing, and final review. Matching that structure in `.codex` makes agent handoffs map directly to the MVP delivery flow: database -> backend -> frontend -> tester -> reviewer.

### Decision: Keep per-agent TOML profiles minimal and role-focused

Reason:
Production defaults should minimize unnecessary instruction surface area while preserving correctness. `backend` and `database` use `medium` reasoning for balanced reliability/cost, `tester` uses `low` reasoning for execution-heavy tasks, and `reviewer` stays read-only for safety.
