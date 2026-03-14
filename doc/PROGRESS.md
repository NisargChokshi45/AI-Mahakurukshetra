[2026-03-14 11:50] codex - Configured `.codex` multi-agent roster and per-agent profiles from PRD/plan requirements
[2026-03-14 11:57] codex - Simplified `.codex/agents` runtime profiles for production defaults (least-complex reasoning and role-appropriate sandboxing)
[2026-03-14 12:12] codex - Completed Phase 0 foundation setup: deps, env template, Supabase/Redis/logger scaffolding, query provider, test configs, and Husky tooling
[2026-03-14 12:25] codex - Completed Phase 1 architecture definition in `doc/plan.md`: route/page inventory, role matrix, API groups, cross-domain strategy, onboarding flow, and MVP feature-flag boundaries
[2026-03-14 13:03] codex - Closed Phase 0 and confirmed Phase 1 complete by resolving the final dev-runtime verification note in task tracking
[2026-03-14 13:15] codex - Delivered Phase 2 code slice: Supabase migrations/seed, auth callback + middleware, protected dashboard shell, org bootstrap, and member invite flow
[2026-03-14 13:29] codex - Hardened Phase 2 for Next 16 production builds by forcing auth-bound routes dynamic, replacing middleware with proxy, and re-verifying build/lint/typecheck/test
[2026-03-14 13:41] codex - Added hosted-Supabase verification runbook and SQL checks to close the remaining Phase 2 schema/RLS/seed tasks
[2026-03-14 13:32] codex - Updated `.gitignore` to ignore Supabase local temp artifacts at `supabase/.temp/`
[2026-03-14 13:37] codex - Fixed root `pnpm run dev` env resolution by sourcing `../../.env` in `apps/web` start/build scripts; verified dev server boots and serves `/`
[2026-03-14 14:23] codex - Built the Phase 4 core UI in `apps/web`: seeded dashboard shell, supplier/risk/incident/map/report/assessment routes, and shared loading/error states; verified with lint, typecheck, format, and production build
[2026-03-14 14:58] codex - Added the remaining planned UI shells: public auth pages, settings pages, mitigation, billing/integrations placeholders, and a public `/api/docs` page; verified with lint, typecheck, format, and build
[2026-03-14 15:20] codex - Fixed `pnpm run dev` route collisions by removing duplicate `app/login`, `app/signup`, and `app/auth/callback/page.tsx` so the `(auth)` route group and callback route handler compile cleanly
[2026-03-14 15:55] codex - Marked Phase 2 hosted-Supabase verification complete after user-confirmed linked reset, migration apply, seed visibility, auth hook setup, and RLS validation
[2026-03-14 16:11] codex - Closed Phase 3 by shipping a shared risk ingestion pipeline (create/update/webhook), threshold-cross and >3-supplier escalation alerts, and risk-score audit provenance migration/seed updates; verified with `pnpm --filter @repo/web lint`, `typecheck`, and `test`
[2026-03-14 16:21] codex - Fixed onboarding org creation failures for email-activation users by replacing RLS-blocked org insert-return reads with app-generated UUID inserts and sequential setup writes
[2026-03-14 16:25] codex - Fixed organization-setup redirect loop by handling Supabase `organization_members -> organizations` embed shapes as either object or array in auth context resolution
[2026-03-14 16:35] codex - Fixed cross-tab auth synchronization so open `/`, `/login`, and `/signup` tabs redirect to `/dashboard` after sign-in in another tab; verified with lint/typecheck/test
[2026-03-14 16:38] codex - Removed logout `?message=Signed%20out.` URL behavior by redirecting sign-out to clean `/login`; verified with lint/typecheck
[2026-03-14 16:44] codex - Completed reviewer audit, ran lint/typecheck/test gates, and published prioritized remediation plan in `doc/REVIEW_ACTION_PLAN.md`
[2026-03-14 16:45] codex - Completed Phase 5 cross-domain hardening: proxy-level origin allowlist + CORS, Upstash rate limiting for public monitoring webhook, auth callback redirect allowlists, and domain validation script/run.
[2026-03-14 16:50] codex - Completed Phase 6 P0 security fixes: risk-event RBAC enforcement, callback `next` redirect sanitization, org-bound supplier validation, and DB trigger guardrails for supplier-linked risk rows; verified with lint/typecheck/test
[2026-03-14 16:51] codex - Completed transactional risk-ingestion hardening by adding `process_risk_event_ingestion` DB function (migration `20260314171000_012`) and routing manual/webhook ingestion through a single atomic RPC write path
[2026-03-14 16:57] codex - Consolidated app ingestion onto `ingestRiskEventTransactional()` wrapper (RPC `process_risk_event_ingestion`) for both manual and webhook paths, removed duplicate migration drift, and re-verified lint/typecheck/test
[2026-03-14 17:05] codex - Added baseline unit coverage for risk engine, auth/risk Zod schemas, and redirect-sanitization utility; fixed Vitest config path/glob issues so `pnpm --filter @repo/web test` executes real suites (17 passing)
[2026-03-14 17:01] codex - Added login password show/hide UI with eye icon via client `PasswordInput` component while keeping existing server-action sign-in flow
[2026-03-14 17:02] codex - Finalized review-plan implementation state: confirmed P0 + P1 transactional ingestion hardening in code/docs and re-ran `pnpm lint`, `pnpm typecheck`, and `pnpm test`
[2026-03-14 18:00] codex - Wired `/settings/billing` to live `prices`, `subscriptions`, and `payment_history` queries with owner-only billing visibility and dynamic active/inactive plan status rendering
[2026-03-14 18:08] codex - Added Stripe integration routes for checkout + billing portal and connected billing page forms to initiate real Stripe session redirects
[2026-03-14 18:16] codex - Added `/api/stripe/invoice/latest` + `/api/stripe/webhook` and hooked latest-invoice download + webhook-based subscription/payment sync into Supabase billing records
[2026-03-14 18:07] codex - Completed QA remediation pass: fixed loopback-origin login failure, forced dynamic incident workspace to remove stale status reads, passed authenticated E2E critical flow, and verified cross-org RLS isolation.
[2026-03-14 18:15] codex - Fixed session-refresh race causing idle logout by awaiting `supabase.auth.getUser()` in proxy middleware; verified with lint/typecheck/test.
[2026-03-14 18:17] codex - Updated header brand links so logo clicks route to `/dashboard` on landing and protected dashboard header surfaces.
[2026-03-14 18:18] codex - Updated `signOutAction` to redirect to `/dashboard` after logout and re-verified `pnpm --filter @repo/web lint` and `typecheck`.
[2026-03-14 18:19] codex - Added a shared footer to the authenticated dashboard layout so all protected dashboard routes render consistent bottom branding/context.
[2026-03-14 18:27] codex - Rebuilt `/settings/members` UX for production: added overview metrics, invite panel, searchable directory, richer role/status badges, and clearer row-level management actions.
[2026-03-14 18:27] codex - Implemented dummy Stripe payment flow routes and wired billing UI to auto-fallback dummy checkout/portal/invoice actions when Stripe is not configured.
[2026-03-14 18:28] codex - Fixed incident resolve flow consistency by filtering incidents board/workspace reads to `context.organization.organizationId`, eliminating cross-org mismatch between read and resolve-update paths.
[2026-03-14 18:45] codex - Redesigned `/dashboard` KPI cards to use org-scoped, production-style metrics and trends: supplier risk exposure mix, live disruption cost, alert queue pressure, and response-performance indicators (MTTR + false-positive trend).
[2026-03-14 18:29] codex - Added a production-ready footer to the landing page with brand block, product anchors, and access links while preserving existing visual style.
[2026-03-14 18:31] codex - Fixed logout redirect target: `signOutAction` now routes signed-out users to `/` (public landing page) instead of `/dashboard`.
[2026-03-14 18:33] codex - Added `/logout` route handler (GET/POST) and aligned sign-out server action so both logout paths now redirect to `/`.
[2026-03-14 18:37] codex - Hardened `/dashboard` supplier watchlist rendering with nullable slug/tier/risk fallbacks to prevent unstable behavior when navigating from `/map` to `/dashboard`; re-verified lint/typecheck.
[2026-03-14 18:39] codex - Upgraded authenticated dashboard header with expanded primary links, direct settings shortcuts, and a profile menu with account actions; verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-14 18:44] codex - Redesigned `/reports` with a richer generation form, realistic dummy report preview card, and cleaner queue cards; verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-14 18:47] codex - Replaced header profile dropdown with a fixed popup overlay (`HeaderUserMenu`) to prevent dashboard scroll/layout shift on open; verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-14 18:47] codex - Fixed `/reports` preview CTA behavior by wiring `Generate preview` + `Open preview` to URL query selection (`?preview=<id>`) and anchor jump to the live preview panel; re-verified lint/typecheck.
[2026-03-14 18:50] codex - Added authenticated dummy CSV export route (`GET /api/reports/export`) and wired reports queue `Export CSV` CTAs to download generated files by `reportId`; verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-14 18:51] codex - Redesigned `/risk-events` route UI: added signal KPI summary cards, upgraded triage sidebar, and rebuilt the event feed component with search, real filter semantics, source context, and supplier-impact surfacing.
[2026-03-14 18:54] codex - Redesigned `/settings/billing` into a clearer billing control center with KPI strip, action-focused subscription panel, upgraded plan catalog cards, and governance checkpoints; verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-14 19:08] codex - Standardized dropdown design platform-wide via shared `selectStyles()` and applied it to all native `<select>` controls (including suppliers filters); verified with `pnpm --filter @repo/web lint` and `pnpm --filter @repo/web typecheck`.
[2026-03-15 15:30] codex - Updated landing-page header brand link to respect auth state (`/` for logged-out, `/dashboard` only for logged-in) and wired `LandingPage` with explicit `isLoggedIn` prop usage.
[2026-03-15 15:35] codex - Redesigned `/api/docs` with a production-ready single-column flow, removed internal-facing copy, and verified with `pnpm --filter @repo/web lint`.
[2026-03-15 15:40] codex - Fixed landing footer/header section-link UX by adding section scroll offsets and explicit `/#...` links so sticky header no longer clips anchors and browser-back from `/api/docs` restores in-page section context.
[2026-03-15 15:46] codex - Restored missing `/api/docs` top header with SupplySense AI brand, public nav links, and auth actions; verified with `pnpm --filter @repo/web lint`.
[2026-03-15 15:50] codex - Fixed `SwaggerUi` route-transition initialization so `/api/docs` renders Swagger on first client navigation (no refresh required) by adding mount-safe initialization + `Script.onReady`; verified with `pnpm --filter @repo/web lint`.
[2026-03-15 15:53] codex - Aligned `/api/docs` header with landing by removing the extra `API docs` nav item and sticky positioning; verified with `pnpm --filter @repo/web lint`.
[2026-03-15 15:59] codex - Added analytical OpenAPI and Service Status doc pages (`/api/docs/openapi`, `/api/docs/service-status`), refactored health checks into shared `lib/api/service-status.ts`, rewired `/api/docs` CTAs, and verified with `pnpm --filter @repo/web lint` + `pnpm --filter @repo/web typecheck`.
[2026-03-15 16:03] codex - Added landing-nav header to `/api/docs/service-status`, dropped the redundant `Raw health JSON` CTA, and re-verified with `pnpm --filter @repo/web lint` + `pnpm --filter @repo/web typecheck`.
[2026-03-15 16:07] codex - Added SupplySense AI header to `/api/docs/openapi`, removed the “Download JSON” CTA, and reflowed coverage/endpoint sections into readable row-based layouts; lint/typecheck clean.
[2026-03-15 16:08] codex - Turned the API docs step cards into button CTAs (no raw JSON link) so the guidance flows now point to the new analysis/explorer views; lint/typecheck still clean.
[2026-03-15 16:12] codex - Added a production-ready `/404` surface with auth-aware header, repeated dashboard navigation buttons, and contextual copy so unimplemented routes gracefully redirect users back to their workspace; lint/typecheck clean.
[2026-03-15 16:34] codex - Updated `/login` so the Sign in CTA uses the same slate-950 background and slate-800 hover as the `/signup` Create account button for consistent auth CTA coloring.
[2026-03-15 16:40] codex - Styled the landing header Log in button with a rounded outline and a border that matches the Start free background so logged-out users see a cohesive CTA pair.
[2026-03-15 16:50] codex - Refined the `/login` and `/signup` copy so every reference uses full “organization” terminology and the login cards spell out the MVP focus while keeping the auth flows production-ready.
[2026-03-15 17:25] codex - Re-skinned `/login` with the signup light-theme aesthetic, refreshed copy, and softer form/alert treatments so the public auth surfaces feel consistent and production-ready.
[2026-03-15 17:48] codex - Harmonized the password inputs/forms: every public auth field now shares the same slate border, hover/focus transition, and subtle outline, and the eye icon hover stays visible when toggling visibility.

[2026-03-15 18:30] codex - Replaced the remaining error/query-string flows with flash cookies across auth, onboarding, incidents, members, risk ingestion, and billing so URLs stay clean while the UI still surfaces contextual alerts.

[2026-03-15 16:15] codex - Restored the signup password visibility toggle by wiring the shared `PasswordInput` so the eye icon appears again.
[2026-03-15 16:30] codex - Removed the Dashboard navigation button from the authenticated header user menu so logged-in users only see the remaining workspace links.
[2026-03-15 17:12] codex - Fixed flash-cookie handling to await Next.js async cookie stores and updated flash reads/writes across server actions and pages.
[2026-03-15 19:05] codex - Replaced the Google sign-in CTA on `/login` with column-stacked demo role buttons for Apex Resilience access.

[2026-03-15 19:25] codex - Aligned `/login` demo access buttons into a single-row layout for fast role selection.

[2026-03-15 19:28] codex - Expanded `/login` demo access section to full width across the auth layout grid.
