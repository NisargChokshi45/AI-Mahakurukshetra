## 2026-03-14

- Configured `.codex/config.toml` with `frontend`, `backend`, `database`, `tester`, and `reviewer` agents aligned to the supply-chain MVP architecture.
- Added per-agent `.toml` profiles for reasoning effort and sandbox mode under `.codex/agents/`.
- Reduced `.codex/agents/backend.toml` and `.codex/agents/database.toml` `reasoning_effort` from `high` to `medium` to keep defaults minimal and stable.
- Reduced `.codex/agents/tester.toml` `reasoning_effort` from `medium` to `low` for lightweight execution-oriented test runs.
- Added Phase 0 workspace scaffolding across the monorepo: env template, Husky + lint-staged, root Vitest/Playwright configs, and workspace script normalization (`typecheck`, `test`, `test:e2e`).
- Expanded `apps/web` with Supabase SSR helpers, Upstash Redis/rate-limit helpers, pino logger bootstrap, Zod-backed env parsing, a TanStack Query provider, and shadcn-compatible design tokens/config.
- Replaced the default starter page with a project-branded Phase 0 landing page and switched production builds to `next build --webpack` to avoid Turbopack sandbox failures during verification.
- Locked Phase 1 product architecture in `doc/plan.md`: finalized page inventory, role capability matrix, API endpoint groups, cross-domain URL/origin strategy, organization onboarding flow, and feature-flag scope for the MVP.
- Corrected plan references in task tracking from `plan.md` to `doc/plan.md` where applicable so the docs point at the real source of truth.
- Added a seeded Phase 4 application shell under `apps/web/app/(dashboard)` with routes for dashboard, suppliers, supplier detail, risk events, risk-event ingestion, map, incidents, incident workspace, reports, and assessments.
- Added reusable dashboard UI primitives and client-side filter components under `apps/web/components/` plus a shared seeded dataset in `apps/web/lib/demo-data.ts` to support the MVP demo flow before backend integration.
- Updated the marketing landing page to point at the new dashboard surfaces and verified the UI changes with `pnpm --filter @repo/web lint`, `typecheck`, `format:check`, and `build`.
- Added public auth screens under `apps/web/app/login`, `apps/web/app/signup`, and `apps/web/app/auth/callback` using a shared auth shell so Phase 2 Supabase auth can plug into stable UI.
- Added dashboard-scoped settings pages under `apps/web/app/(dashboard)/settings/*`, a mitigation workspace at `apps/web/app/(dashboard)/mitigation/page.tsx`, and a public placeholder docs page at `apps/web/app/api/docs/page.tsx`.
- Added `apps/web/.prettierignore` so `pnpm --filter @repo/web format:check` ignores generated `.next` artifacts after a production build.
