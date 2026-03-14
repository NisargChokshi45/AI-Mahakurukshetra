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
- Closed the remaining Phase 0 tracking item after confirming the dev workflow was already running outside sandbox socket restrictions; Phase 0 and Phase 1 are now fully closed in `doc/TASKS.md`.
- Added the full Phase 2 schema baseline under `supabase/`: local config, timestamped migrations `001`–`009`, a custom access-token hook for `org_id`, default-deny RLS policies, and realistic demo seed data.
- Added auth and tenancy flows in `apps/web`: email/password + Google OAuth actions, callback exchange route, session-refresh middleware, protected dashboard layout, first-login organization setup, and member invitations.
- Added protected Phase 2 surfaces for `/login`, `/signup`, `/dashboard`, `/setup/organization`, and `/settings/members`, plus shared server-side auth/session helpers and validation schemas.
- Marked auth-dependent routes as dynamic for Next 16 build stability and replaced deprecated `middleware.ts` with `proxy.ts`; `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` now pass locally.
- Added a hosted Supabase Phase 2 verification runbook and reusable SQL verification script so migrations, RLS, seed data, and JWT hook setup can be validated without Docker.
- Ignored Supabase CLI local temp artifacts by adding `supabase/.temp/` to `.gitignore` so generated marker files (for example `supabase/.temp/cli-latest`) are not committed.
- Fixed monorepo dev/runtime env bootstrapping in `apps/web/package.json` by sourcing the workspace root `.env` before `next dev/build/start`, resolving missing `NEXT_PUBLIC_*` runtime variables when running `pnpm run dev` from repo root.
