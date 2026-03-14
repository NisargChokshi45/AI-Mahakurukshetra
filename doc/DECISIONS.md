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

### Decision: Keep the current Next.js 16 / Tailwind 4 baseline and document the divergence from AGENTS canonical versions

Reason:
The repository was already scaffolded on Next.js 16.1.6 and Tailwind 4. Reworking the stack during the hackathon would spend time on churn rather than product capability. The safer Phase 0 move is to keep the baseline, normalize the tooling around it, and record the divergence explicitly.

### Decision: Use local CSS font stacks instead of `next/font/google` in the baseline shell

Reason:
Phase 0 verification must succeed in restricted environments. Google font fetching caused build failures without outbound network access, so the app shell now uses local font stacks until branded self-hosted fonts are added later.

### Decision: Use webpack for production verification builds in this repo until Turbopack is stable in the sandbox

Reason:
`next build` with Turbopack panicked in the sandbox while processing CSS/PostCSS and attempted operations that were not permitted. `next build --webpack` compiles successfully and gives a reliable verification path for the current environment.

### Decision: Treat `/dashboard` as the authenticated application home and keep all operational workflows under protected routes

Reason:
The core user loop starts after login. Making `/dashboard` the protected landing page keeps auth, tenancy checks, and navigation framing consistent while leaving `/` free to serve as a public pitch/demo surface.

### Decision: Keep billing, integrations, and mitigation management in the route map but classify them as stretch surfaces for the MVP

Reason:
These pages are part of the realistic enterprise product shape and help avoid future route churn, but they are not required to prove the main judging flow. Marking them as stretch prevents Phase 2–4 work from being diluted.

### Decision: First-login organization bootstrap must seed demo data automatically and idempotently

Reason:
The PRD requires a realistic environment immediately after deploy. Automatic idempotent seeding ensures every new demo org lands in a usable state without manual operator steps or duplicated records on retries.

### Decision: Implement Phase 4 as a seeded static UI layer before wiring auth, Supabase, and the risk engine

Reason:
Phase 2 and Phase 3 are not complete yet, but the hackathon demo needs a full product walkthrough now. Building the core routes on shared mock data creates a stable visual contract for later API integration, keeps the judging flow testable, and avoids reworking layouts once backend data arrives.

### Decision: Build the remaining auth, settings, mitigation, and docs surfaces as UI-first placeholders before backend integration

Reason:
The route map in `doc/plan.md` is broader than the original Phase 4 task list. Shipping these surfaces now closes visible gaps in the judge flow and page inventory, while still keeping scope under control by deferring real auth, billing, integration, and OpenAPI behavior to later phases.
