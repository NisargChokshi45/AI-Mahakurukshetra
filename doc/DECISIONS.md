## 2026-03-15

### Decision: Remove the redundant Dashboard link from the authenticated header navigation

Reason:
The brand link already routes logged-in users to `/dashboard`, so removing the extra Dashboard button keeps the header user menu focused on other workspace destinations and avoids duplicate navigation affordances.

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

### Decision: Guard public auth surfaces with both server-side and client-side auth redirects

Reason:
Server checks on `/`, `/login`, and `/signup` prevent authenticated users from seeing logged-out UI on fresh navigations, while a browser auth-state listener handles already-open tabs so sign-in in one tab redirects sibling tabs without manual refresh.

### Decision: Do not encode logout status in URL query parameters

Reason:
Logout success is deterministic and does not need a querystring message. Keeping sign-out redirects on a clean `/login` URL avoids leaking transient status into shareable links and keeps auth routes canonical.

### Decision: Authorize risk-event mutations from server-side organization context, not JWT app metadata

Reason:
`requireOrganizationContext()` resolves active membership and role from the database-backed auth context. Using it for `createRiskEventAction` ensures only `owner|admin|risk_manager` can execute service-role-backed risk writes and avoids trusting mutable client/session metadata as the authorization source.

### Decision: Enforce supplier/risk-event org integrity with database triggers on risk-linked tables

Reason:
Service-role paths bypass RLS policy checks. Trigger guardrails on `disruptions`, `risk_scores`, and `alerts` make cross-organization supplier/risk-event references impossible even if an application-layer validation is missed in future code paths.

### Decision: Centralize origin allowlist, CORS, and public API rate limiting in `proxy.ts`

Reason:
Applying Phase 5 security controls at the proxy boundary prevents per-route drift, ensures every `/api/*` response gets consistent allowlist-driven CORS behavior, and enforces public webhook throttling before handlers execute.

### Decision: Resolve Supabase auth callback URLs from request origin, then constrain with `ALLOWED_REDIRECT_URLS`

Reason:
Using a single hardcoded app URL breaks preview and multi-domain environments. Deriving callback URLs from request headers while validating against explicit redirect allowlists supports local/preview/production flows without opening redirect targets.

### Decision: Use a documented P0/P1/P2 review gate to drive codebase hardening before launch

Reason:
Passing lint/typecheck alone is not enough for release confidence in a multi-tenant, security-sensitive app. A written remediation plan (`doc/REVIEW_ACTION_PLAN.md`) with severity, ownership scope, and acceptance criteria keeps security and correctness fixes auditable and prioritized.

### Decision: Execute risk-event ingestion through one transactional RPC function

Reason:
Manual and webhook ingestion previously performed event/disruption/score/alert writes in separate application calls, which could leave partial state on failures. Moving these writes into `public.process_risk_event_ingestion(...)` guarantees atomicity and keeps ingestion behavior consistent across channels.

### Decision: Keep redirect-safety logic in a shared security utility, not inside route modules

Reason:
Next.js route modules cannot export arbitrary helpers without violating route type constraints. Moving safe-next-path normalization into `lib/security/redirects.ts` makes it reusable and directly unit-testable while keeping route handlers compliant.

### Decision: Keep login page as a server component and isolate password visibility in a client subcomponent

Reason:
The login form submits through a server action, but password show/hide requires browser state. A small client `PasswordInput` component provides the eye toggle without converting the full page to client rendering or changing the auth mutation flow.

### Decision: Billing page reads live subscription state from RLS-scoped tables and avoids service-role bypass

Reason:
`subscriptions` and `payment_history` are intentionally owner-restricted in RLS. The billing UI now queries those tables with the authenticated server client and renders owner-only details; non-owner users get explicit RBAC messaging instead of privileged data leakage.

### Decision: Use server-side Stripe session routes invoked by standard form POST from billing UI

Reason:
Billing operations require secret-key-backed Stripe SDK calls and should not expose client-side session creation logic. Wiring `/settings/billing` buttons to `POST /api/stripe/checkout` and `POST /api/stripe/portal` keeps key usage server-only, preserves RBAC checks, and supports direct redirect flows without client JS complexity.

### Decision: Persist Stripe subscription and invoice lifecycle via webhook sync into Supabase billing tables

Reason:
Relying on front-end actions alone leaves billing state stale when renewals, payment failures, or cancellations occur asynchronously. Handling signed Stripe webhooks server-side keeps `subscriptions` and `payment_history` in sync with the source of truth and enables accurate active/inactive billing status in the app.

### Decision: Treat local loopback hosts as equivalent for exact origin-allowlist rules

Reason:
Local QA tools and browsers frequently alternate between `localhost` and `127.0.0.1`. Requiring both to be listed for identical protocol/port caused server-action request rejections and unstable local auth behavior. Matching loopback aliases as equivalent preserves origin security while removing non-production QA friction.

### Decision: Force incident workspace route dynamic to avoid stale post-mutation renders

Reason:
Incident resolve mutations persisted correctly, but `/incidents/[id]` could render stale status immediately after redirect. Marking the page `force-dynamic` ensures post-action reads reflect current database state for operational workflows and E2E assertions.

### Decision: Await Supabase user refresh in proxy middleware before returning responses

Reason:
Access tokens expire periodically, and refresh writes updated auth cookies through the middleware cookie adapter. Returning the response before `supabase.auth.getUser()` resolves can drop refresh-cookie writes and lead to unexpected idle logouts.

### Decision: Standardize header brand clicks to route to `/dashboard`

Reason:
Users treat the top-left brand/logo as a home action inside the product. Routing brand clicks to `/dashboard` provides a consistent recovery path to the main operational view from both public and authenticated headers.

### Decision: Redirect sign-out actions to `/dashboard` as the post-logout destination

Reason:
The latest UX request requires logout to land on the dashboard route rather than `/login`. The server action now uses `/dashboard` as the canonical post-sign-out redirect target.

### Decision: Implement dashboard footer at the shared authenticated layout boundary

Reason:
Adding the footer in `app/(dashboard)/layout.tsx` guarantees consistent visibility across all protected dashboard routes, avoids duplicated per-page UI, and keeps footer placement stable by using a `flex` column shell with `main` set to `flex-1`.

### Decision: Model `/settings/members` as an operations screen (metrics + invite + searchable directory) instead of a plain list

Reason:
Member management is a high-frequency admin workflow. Presenting quick coverage metrics, explicit role semantics, and searchable member cards with scoped actions reduces access-management errors and makes permissions decisions faster and more intuitive.

### Decision: Provide a built-in dummy Stripe flow for local/demo environments when `STRIPE_SECRET_KEY` is absent

Reason:
Billing UX and role flows still need validation without live Stripe credentials. Auto-falling back to `/api/stripe/dummy/*` routes keeps end-to-end billing behavior testable (plan switch, portal, invoice actions) while preserving the real Stripe path whenever credentials are configured.

### Decision: Enforce active-organization scoping on incidents board/workspace reads

Reason:
The resolve action already updates incidents with `organization_id = context.organization.organizationId`; read paths now apply the same org boundary to avoid mismatches where users could open an incident outside the active org and then fail to mark it resolved.

### Decision: Design dashboard cards around operational decisions, not vanity counts

Reason:
Judges and operators need immediate action signals. The dashboard now emphasizes decision-grade KPIs (risk exposure mix, active disruption cost, alert backlog pressure, and response effectiveness trends) so users can prioritize triage and mitigation from the first screen.

### Decision: Include a persistent footer on the public landing page for navigation completeness

Reason:
A production marketing page should provide clear secondary navigation and persistent access actions even after long-scroll sections. Adding a footer with product anchors and auth/dashboard entry points improves discoverability and reduces navigation friction.

### Decision: Route users to the public home page after sign-out

Reason:
Post-logout navigation should land on a non-protected destination. Redirecting to `/` gives a clear signed-out state and prevents accidental loops or protected-route transitions.

### Decision: Support both action-based and URL-based logout with identical redirect behavior

Reason:
Users may sign out from UI actions or direct `/logout` links. Handling both through explicit sign-out logic and redirecting to `/` keeps logout behavior predictable and avoids dead-end routes.

### Decision: Make dashboard supplier watchlist rendering null-safe

Reason:
Some organizations can have incomplete supplier records (`slug`, `tier`, or `current_risk_score` unset). Defensive rendering fallbacks prevent route instability when navigating to `/dashboard` from other dashboard pages such as `/map`.

### Decision: Keep authenticated account utilities directly in the shared dashboard header

Reason:
Logged-in users need fast access to profile and workspace settings across all protected routes. Placing profile/account actions in the global dashboard header reduces navigation friction and avoids repeating account controls in per-page UIs.

### Decision: Render header profile actions as a popup overlay rather than an in-flow dropdown

Reason:
The single-row header uses horizontal overflow behavior for responsiveness; in-flow dropdown expansion can create unwanted page scroll shifts. A fixed-position popup overlay preserves layout stability while keeping account actions accessible.

### Decision: Include a first-class dummy report preview surface directly on `/reports`

Reason:
The report flow was hard to evaluate with only form and queue placeholders. Embedding a realistic preview card (summary metrics, top risk drivers, timeline) makes the output tangible for judges and stakeholders before real PDF generation is wired.

### Decision: Keep report preview selection URL-driven (`?preview=<reportId>`) on the server-rendered reports page

Reason:
This keeps preview CTAs functional without introducing client-side state complexity and allows direct linking to a specific preview card while preserving RSC-first page architecture.

### Decision: Make `/risk-events` a triage-focused operations screen instead of a plain event list

Reason:
Risk-event handling is an operational workflow, not just a table view. The route now emphasizes immediate triage decisions through top-level signal KPIs, context-rich feed cards, and explicit escalation guidance so teams can move faster from detection to incident action.

### Decision: Implement report CSV export as an authenticated API attachment response

Reason:
Export CTAs should trigger a real browser download without client-side file-generation complexity. Serving dummy CSV from `/api/reports/export` with `Content-Disposition: attachment` keeps behavior predictable, secure, and easy to replace with live report data later.

### Decision: Reframe `/settings/billing` as a control-center layout with KPI-first hierarchy

Reason:
The billing page needed clearer scanability and action clarity. Leading with KPI cards, then grouping operational actions in a dedicated control-center panel, and separating plan selection into a catalog view improves decision speed while keeping existing Stripe/dummy flows unchanged.

### Decision: Standardize all native select/dropdown controls through a shared UI helper

Reason:
Dropdown quality was inconsistent between suppliers and other dashboard forms due to repeated ad-hoc class strings. Centralizing select presentation in `selectStyles()` keeps spacing, focus affordances, chevron treatment, and disabled states visually consistent across the platform while reducing future drift.

### Decision: Make landing-page brand navigation conditional on auth state

Reason:
The public landing page must avoid deep-linking logged-out users into protected routes. Keeping the logo on `/` for unauthenticated users, while preserving `/dashboard` for authenticated contexts, aligns navigation with access expectations and removes avoidable redirect churn.

### Decision: Prioritize a single-flow API docs page over split overview/explorer columns

Reason:
Public API docs users primarily want to discover and test endpoints quickly. A linear layout (context first, then full interactive explorer) is easier to scan on desktop and mobile, while removing internal implementation text keeps the page focused on user outcomes rather than engineering internals.

### Decision: Use hash-path section links plus explicit scroll offsets for landing-page in-page navigation

Reason:
The landing page has a sticky header, so default hash jumps can place section headings too close to the viewport top. Converting section links to explicit `/#...` targets and applying section `scroll-mt` offsets keeps navigation intuitive, and also preserves clearer section context when users visit `/api/docs` and return via browser back.

### Decision: Keep `/api/docs` on the same public-header pattern as landing

Reason:
Developer docs is a public-entry route and should not feel visually disconnected from the rest of the marketing/navigation flow. Adding the same style of top header (brand, key section links, auth actions) improves orientation and reduces navigation friction.

### Decision: Initialize Swagger UI for both first script load and route-transition remounts

Reason:
In App Router navigation, relying only on `Script.onLoad` can leave third-party widgets uninitialized on client transitions. Using `onReady` plus a mount-time `window.SwaggerUIBundle` check ensures `/api/docs` renders reliably without requiring a hard refresh.

### Decision: Keep `/api/docs` top navigation behavior visually and interactively equivalent to the landing header

Reason:
The public docs route should feel like the same marketing surface as landing. Removing route-specific header items and sticky behavior avoids navigation drift and preserves expected page scroll behavior.

### Decision: Keep `/api/openapi` and `/api/health` as machine endpoints, and add separate analytical pages for humans

Reason:
Integrations and uptime probes need stable JSON endpoints, while users need readable diagnostics and API understanding. Adding `/api/docs/openapi` and `/api/docs/service-status` preserves endpoint compatibility and delivers a production-ready UX that summarizes data instead of dumping raw payloads.

### Decision: Reuse the shared password visibility toggle on signup

Reason:
The login screen already exposes the `PasswordInput` component with the eye/eye-off affordance, and reusing it on signup keeps the interaction consistent while preventing the signup form from losing the show/hide control when the component is updated elsewhere.
