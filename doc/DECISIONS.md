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

### Decision: Accept external dev-session confirmation as the Phase 0 runtime check when sandbox socket binding is restricted

Reason:
The remaining Phase 0 caveat was caused by sandbox limitations around local socket verification, not by a known application failure. If the Next.js dev workflow is already running in the user session, that is sufficient evidence to close the foundation phase without adding repo churn just to satisfy the sandbox.

### Decision: Use `user_profiles.current_organization_id` plus a custom access-token hook as the source of truth for active org context

Reason:
Phase 2 needs a stable tenant context for RLS, server actions, and route guards. Persisting the active org on the profile and copying it into the JWT keeps reads cheap while still allowing first-login bootstrap and org switching later.

### Decision: Keep organization bootstrap user-driven and RLS-compatible

Reason:
The first-login org creation flow can be completed with the authenticated user client by allowing authenticated inserts into `organizations` and self-creation of the initial `owner` membership. This avoids unnecessary service-role use in the normal onboarding path.

### Decision: Force auth-bound routes dynamic and use `proxy.ts` for request-bound session refresh in Next 16

Reason:
Protected routes depend on cookies, redirects, and per-request Supabase session resolution. Marking those surfaces dynamic prevents static generation failures, and `proxy.ts` matches the current Next 16 runtime convention better than the deprecated middleware file name.

### Decision: Ignore Supabase local `.temp` artifacts in git

Reason:
`supabase/.temp/` is generated local CLI state and should remain untracked to avoid committing machine-specific noise like `cli-latest`.

### Decision: Source workspace-root `.env` directly from `apps/web` runtime scripts in this monorepo

Reason:
`pnpm run dev` runs `next dev` from `apps/web`, and Next loads env files from that app boundary. Sourcing `../../.env` in scripts guarantees consistent env resolution from the root command path and prevents runtime Zod failures for required `NEXT_PUBLIC_*` values.

### Decision: Keep `/login` and `/signup` implemented only in the `(auth)` route group, and reserve `/auth/callback` exclusively for the route handler

Reason:
Next.js resolves route-group pages to the same public pathname as top-level pages. Duplicating both forms causes `pnpm run dev` to fail at compile time with path conflicts, and `/auth/callback` must remain a route handler so Supabase can exchange the auth code server-side.

### Decision: Use one shared server-side risk pipeline for manual and webhook ingestion

Reason:
Phase 3 requires consistent scoring, alerting, and audit behavior regardless of ingestion channel. Centralizing this logic avoids drift between server actions and route handlers, and keeps threshold/escalation logic testable and deterministic.

### Decision: Emit threshold alerts only on threshold crossing (not every high score write)

Reason:
Repeated alerts for already-high suppliers create noisy triage and weak signal quality. Comparing each new score to the latest prior score preserves meaningful alert volume and aligns with "threshold crossed" semantics in the plan.

### Decision: Add explicit provenance columns to `risk_scores` for auditability

Reason:
Time-series rows alone show "what changed" and "when", but not reliable attribution. Adding `risk_event_id`, `triggered_by_source`, and `triggered_by_user_id` captures source and actor context needed for incident review and compliance traceability.

### Decision: Do not depend on `insert().select()` when bootstrapping a new organization under strict RLS

Reason:
`organizations_select` requires active membership, which does not exist yet at org creation time. Generating the organization UUID in the server action allows insert + downstream membership creation without reading the row first, and sequential writes prevent race conditions for role-gated config upserts.

### Decision: Normalize Supabase embedded relation shapes at auth-context boundaries

Reason:
Supabase embeds can resolve as an object or array depending on relationship metadata and query shape. Normalizing this in `getAuthContext()` prevents incorrectly treating valid memberships as missing organizations, which can cause redirect loops on protected routes.
