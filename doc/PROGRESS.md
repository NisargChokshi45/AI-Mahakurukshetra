[2026-03-14 11:50] codex — Configured `.codex` multi-agent roster and per-agent profiles from PRD/plan requirements
[2026-03-14 11:57] codex — Simplified `.codex/agents` runtime profiles for production defaults (least-complex reasoning and role-appropriate sandboxing)
[2026-03-14 12:12] codex — Completed Phase 0 foundation setup: deps, env template, Supabase/Redis/logger scaffolding, query provider, test configs, and Husky tooling
[2026-03-14 12:25] codex — Completed Phase 1 architecture definition in `doc/plan.md`: route/page inventory, role matrix, API groups, cross-domain strategy, onboarding flow, and MVP feature-flag boundaries
[2026-03-14 13:03] codex — Closed Phase 0 and confirmed Phase 1 complete by resolving the final dev-runtime verification note in task tracking
[2026-03-14 13:15] codex — Delivered Phase 2 code slice: Supabase migrations/seed, auth callback + middleware, protected dashboard shell, org bootstrap, and member invite flow
[2026-03-14 13:29] codex — Hardened Phase 2 for Next 16 production builds by forcing auth-bound routes dynamic, replacing middleware with proxy, and re-verifying build/lint/typecheck/test
[2026-03-14 13:41] codex — Added hosted-Supabase verification runbook and SQL checks to close the remaining Phase 2 schema/RLS/seed tasks
[2026-03-14 13:32] codex — Updated `.gitignore` to ignore Supabase local temp artifacts at `supabase/.temp/`
[2026-03-14 13:37] codex — Fixed root `pnpm run dev` env resolution by sourcing `../../.env` in `apps/web` start/build scripts; verified dev server boots and serves `/`
[2026-03-14 14:23] codex — Built the Phase 4 core UI in `apps/web`: seeded dashboard shell, supplier/risk/incident/map/report/assessment routes, and shared loading/error states; verified with lint, typecheck, format, and production build
[2026-03-14 14:58] codex — Added the remaining planned UI shells: public auth pages, settings pages, mitigation, billing/integrations placeholders, and a public `/api/docs` page; verified with lint, typecheck, format, and build
[2026-03-14 15:20] codex — Fixed `pnpm run dev` route collisions by removing duplicate `app/login`, `app/signup`, and `app/auth/callback/page.tsx` so the `(auth)` route group and callback route handler compile cleanly
[2026-03-14 15:55] codex — Marked Phase 2 hosted-Supabase verification complete after user-confirmed linked reset, migration apply, seed visibility, auth hook setup, and RLS validation
[2026-03-14 16:11] codex — Closed Phase 3 by shipping a shared risk ingestion pipeline (create/update/webhook), threshold-cross and >3-supplier escalation alerts, and risk-score audit provenance migration/seed updates; verified with `pnpm --filter @repo/web lint`, `typecheck`, and `test`
[2026-03-14 16:21] codex — Fixed onboarding org creation failures for email-activation users by replacing RLS-blocked org insert-return reads with app-generated UUID inserts and sequential setup writes
[2026-03-14 16:25] codex — Fixed organization-setup redirect loop by handling Supabase `organization_members -> organizations` embed shapes as either object or array in auth context resolution
[2026-03-14 16:35] codex — Fixed cross-tab auth synchronization so open `/`, `/login`, and `/signup` tabs redirect to `/dashboard` after sign-in in another tab; verified with lint/typecheck/test
[2026-03-14 16:38] codex — Removed logout `?message=Signed%20out.` URL behavior by redirecting sign-out to clean `/login`; verified with lint/typecheck
[2026-03-14 16:44] codex — Completed reviewer audit, ran lint/typecheck/test gates, and published prioritized remediation plan in `doc/REVIEW_ACTION_PLAN.md`
[2026-03-14 16:45] codex — Completed Phase 5 cross-domain hardening: proxy-level origin allowlist + CORS, Upstash rate limiting for public monitoring webhook, auth callback redirect allowlists, and domain validation script/run.
[2026-03-14 16:50] codex — Completed Phase 6 P0 security fixes: risk-event RBAC enforcement, callback `next` redirect sanitization, org-bound supplier validation, and DB trigger guardrails for supplier-linked risk rows; verified with lint/typecheck/test
[2026-03-14 16:51] codex — Completed transactional risk-ingestion hardening by adding `process_risk_event_ingestion` DB function (migration `20260314171000_012`) and routing manual/webhook ingestion through a single atomic RPC write path
[2026-03-14 16:57] codex — Consolidated app ingestion onto `ingestRiskEventTransactional()` wrapper (RPC `process_risk_event_ingestion`) for both manual and webhook paths, removed duplicate migration drift, and re-verified lint/typecheck/test
[2026-03-14 17:05] codex — Added baseline unit coverage for risk engine, auth/risk Zod schemas, and redirect-sanitization utility; fixed Vitest config path/glob issues so `pnpm --filter @repo/web test` executes real suites (17 passing)
[2026-03-14 17:01] codex — Added login password show/hide UI with eye icon via client `PasswordInput` component while keeping existing server-action sign-in flow
[2026-03-14 17:02] codex — Finalized review-plan implementation state: confirmed P0 + P1 transactional ingestion hardening in code/docs and re-ran `pnpm lint`, `pnpm typecheck`, and `pnpm test`
