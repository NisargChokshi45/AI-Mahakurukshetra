# Master Task List

## Phase 0 - Foundation

- [x] 2026-03-14 10:19 - Review repo baseline, extract problem statement, and create phased implementation plan
- [x] 2026-03-14 11:50 - Configure `.codex` multi-agent roster from `PRD.md` and `plan.md`
- [x] 2026-03-14 11:57 - Tighten `.codex/agents/*.toml` to minimal, production-ready role profiles
- [x] 2026-03-14 13:03 - Workspace foundation aligned; `pnpm build` passes and dev workflow was confirmed from the already-running user session outside sandbox socket limits
- [x] 2026-03-14 12:12 - Install and configure: Supabase client + SSR auth helpers, Zod, React Hook Form, TanStack Query, shadcn/ui, pino, Vitest, Playwright, Upstash Redis
- [x] 2026-03-14 12:12 - Set up `.env.example` with all required vars (Supabase, Stripe, Redis, app URLs, allowed origins)
- [x] 2026-03-14 12:12 - Configure ESLint, Prettier, Husky pre-commit (lint-staged + type-check)
- [x] 2026-03-14 12:12 - Align framework versions with project conventions or document divergence
- [x] 2026-03-14 13:32 - Ignore Supabase local CLI temp artifacts in `.gitignore` (`supabase/.temp/`)
- [x] 2026-03-14 13:37 - Fix `pnpm run dev` env loading by sourcing workspace-root `.env` from `apps/web` scripts
- [x] 2026-03-14 15:20 - Fix `pnpm run dev` route conflicts by removing duplicate top-level auth pages and keeping the `(auth)` route-group + `/auth/callback` handler as the single source of truth

## Phase 1 - Product Definition & Architecture

- [x] 2026-03-14 12:25 - Lock route map and page inventory (see `doc/plan.md`)
- [x] 2026-03-14 12:25 - Define and document role matrix: owner, admin, risk_manager, procurement_lead, viewer
- [x] 2026-03-14 12:25 - Confirm API endpoint groups and document in `doc/plan.md`
- [x] 2026-03-14 12:25 - Document cross-domain strategy: app domain, Vercel preview URLs, auth redirect URLs, webhook origins
- [x] 2026-03-14 12:25 - Define org onboarding flow (org creation → invite members → seed demo data)
- [x] 2026-03-14 12:25 - Confirm feature flag list and which advanced features are gated for MVP

## Phase 2 - Database & Auth

- [x] 2026-03-14 14:58 - Build auth UI surfaces for `/login`, `/signup`, and `/auth/callback` so the planned onboarding flow has visible entry points before Supabase wiring
- [x] 2026-03-14 15:55 - Applied migrations 001–009 plus `supabase/config.toml` to the hosted development Supabase project via linked reset
- [x] 2026-03-14 15:55 - Verified RLS policies across all tables with default-deny posture after hosted-project migration apply
- [x] 2026-03-14 15:55 - Implemented and verified custom JWT claim `org_id` via Supabase auth hook on the hosted development project
- [x] 2026-03-14 13:15 - Implement Supabase auth: email/password + Google OAuth
- [x] 2026-03-14 13:15 - Session refresh middleware, protected dashboard layout, redirect on unauthenticated
- [x] 2026-03-14 13:15 - Org creation on first login; invitation flow for org members
- [x] 2026-03-14 16:21 - Fix first-login org bootstrap failure after email activation by avoiding RLS-blocked `insert().select()` and sequencing membership/config/profile writes
- [x] 2026-03-14 16:25 - Fix post-create redirect loop by resolving Supabase embedded `organizations` relation as object-or-array in auth context
- [x] 2026-03-14 16:35 - Fix cross-tab auth sync so open public tabs (`/`, `/login`, `/signup`) auto-redirect to `/dashboard` after sign-in in another tab
- [x] 2026-03-14 16:38 - Remove logout status querystring redirects so sign-out always routes to `/login` without `?message=...`
- [x] 2026-03-14 18:15 - Fix idle-session logout by awaiting Supabase auth refresh in proxy session middleware before returning response cookies
- [x] 2026-03-14 18:33 - Fix logout navigation: `signOutAction` and new `/logout` route now both sign out and redirect to `/`
- [x] 2026-03-14 13:15 - Write `seed.sql`: 2 demo orgs, 10 suppliers (tiers 1–3), 5 regions, 3 active risk events, 2 open incidents, multiple alerts, contracts, and inventory records
- [x] 2026-03-14 15:55 - Verified demo data is visible immediately after deploy with no manual setup

## Phase 3 - Data Ingestion & Risk Engine

- [x] 2026-03-14 16:11 - Built weighted risk scoring model (financial, geopolitical, natural disaster, operational, compliance, delivery) and centralized execution in a shared server-side pipeline
- [x] 2026-03-14 16:11 - Persisted and auto-hydrated per-org scoring weights from `risk_score_configs` (default row upsert on first pipeline execution)
- [x] 2026-03-14 16:11 - Implemented threshold-crossing alert generation rules (alert only when latest composite score crosses configured org threshold)
- [x] 2026-03-14 16:11 - Added escalation rule: new `risk_event` impacting more than 3 suppliers now creates a critical triage alert
- [x] 2026-03-14 16:11 - Completed manual risk event ingestion form + server action validation with Zod (`createRiskEventSchema` / `updateRiskEventSchema`)
- [x] 2026-03-14 16:11 - Completed external monitoring webhook ingestion (`POST /api/monitoring`) with HMAC SHA-256 signature verification and UUID org-header validation
- [x] 2026-03-14 16:11 - Added time-series risk score audit provenance in `risk_scores` (`risk_event_id`, `triggered_by_source`, `triggered_by_user_id`)
- [x] 2026-03-14 16:11 - Triggered risk score recalculation through server actions for both risk event create and update flows

## Phase 4 - Core Product UI

- [x] 2026-03-14 14:23 - Dashboard (`/dashboard`): alert counts by severity, top 5 at-risk suppliers, disruption feed, trend sparklines
- [x] 2026-03-14 14:23 - Supplier directory (`/suppliers`): filterable table with risk score badges, region filter, tier filter
- [x] 2026-03-14 14:23 - Supplier detail (`/suppliers/[id]`): profile, risk score breakdown by category, active alerts, assessment history, linked incidents
- [x] 2026-03-14 14:23 - Risk event list (`/risk-events`): filterable by type / region / severity / status, manual ingestion CTA
- [x] 2026-03-14 14:23 - Supply chain map (`/map`): dependency graph (org → tier-1 → tier-2 suppliers), nodes color-coded by risk score
- [x] 2026-03-14 14:23 - Incident board (`/incidents`): kanban-style status columns (new → investigating → mitigating → resolved)
- [x] 2026-03-14 14:23 - Incident workspace (`/incidents/[id]`): timeline, owner assignment, linked risk event, action item checklist, mitigation plans
- [x] 2026-03-14 14:23 - Reports page (`/reports`): list, generate report by type (executive summary, supplier scorecard), export CSV
- [x] 2026-03-14 14:23 - Assessments page (`/assessments`): list and create supplier assessments
- [x] 2026-03-14 14:23 - Add empty, loading, and error states for all critical views

## Phase 5 - Integrations & Cross-Domain Readiness

- [x] 2026-03-14 16:45 - Implement origin allowlist in middleware using `ALLOWED_ORIGINS` env var (no hardcoded domains)
- [x] 2026-03-14 16:45 - Configure Supabase Auth redirect URL allowlist for local, preview, and production
- [x] 2026-03-14 16:45 - Apply CORS headers on all API routes (allowlist-based, never `*`)
- [x] 2026-03-14 16:45 - Rate limiting via Upstash Redis on all public API routes (see `doc/plan.md` for limits)
- [x] 2026-03-14 14:58 - ERP integration placeholder: connector config UI under `/settings/integrations`
- [x] 2026-03-14 16:45 - Validate Vercel multi-domain deployment with env-based URL config

## Phase 6 - Quality, Security & Demo Readiness

- [x] 2026-03-14 16:44 - Complete reviewer audit of the codebase and publish prioritized remediation checklist in `doc/REVIEW_ACTION_PLAN.md`
- [x] 2026-03-14 16:50 - P0: Enforce role-based authorization in `createRiskEventAction` / update flow before any service-role writes
- [x] 2026-03-14 16:50 - P0: Sanitize `/auth/callback` `next` query parameter to prevent open redirects
- [x] 2026-03-14 16:50 - P0: Add org-bound supplier validation + DB-level guardrails for supplier-linked risk rows (`disruptions`, `risk_scores`, `alerts`)
- [x] 2026-03-14 16:51 - P1: Make risk ingestion writes transactional (event + disruptions + scores + alerts) to avoid partial persistence
- [x] 2026-03-14 17:05 - Unit tests: risk scoring engine, Zod validation schemas, auth utility functions
- [x] 2026-03-14 18:07 - E2E tests: login → dashboard → supplier detail → create incident → resolve incident
- [x] 2026-03-14 18:07 - Verify RLS: user from org A cannot read or write org B data
- [x] 2026-03-15 16:30 - Remove the Dashboard button from the authenticated header user menu so only other workspace links remain for logged-in users
- [ ] Security checklist: no secrets in client bundle, all mutations require auth, webhooks verify signatures, input validated on every API route
- [ ] pino structured logging on all API route handlers (request ID, user ID, org ID, status, latency)
- [ ] `GET /api/health` returns DB + Redis connectivity, app version, uptime
- [ ] Error boundaries on all dashboard pages with structured error log
- [ ] Swagger docs at `/api/docs` cover all endpoint groups
- [ ] Finalize seed data so the demo org looks realistic and compelling
- [ ] Write judge walkthrough script: sign in → alerts → supplier risk breakdown → create incident → resolve → view report

## Supplemental UI

- [x] 2026-03-14 14:58 - Add planned settings UI surfaces for `/settings/profile`, `/settings/organization`, `/settings/members`, and stretch pages `/settings/billing`, `/mitigation`
- [x] 2026-03-14 14:58 - Add judge-facing placeholder UI at `/api/docs` until the real Swagger/OpenAPI surface is wired
- [x] 2026-03-14 17:01 - Add login password visibility toggle with eye icon to show/hide password input text
- [x] 2026-03-14 18:27 - Redesign `/settings/members` into a production-ready member management experience (metrics, invite panel, searchable member directory, clear role/status/action affordances)
- [x] 2026-03-14 18:29 - Add production footer section on landing page with brand context, product navigation, and access links
- [x] 2026-03-14 18:00 - Bind `/settings/billing` to live Supabase pricing/subscription/payment data and render RBAC-aware active/inactive status from real records
- [x] 2026-03-14 18:08 - Wire `/settings/billing` actions to real Stripe handlers (`POST /api/stripe/checkout`, `POST /api/stripe/portal`) and connect plan/portal buttons to server-side session redirects
- [x] 2026-03-14 18:16 - Implement Stripe invoice download action and webhook sync route (`/api/stripe/webhook`) to persist subscription/payment lifecycle events into Supabase billing tables
- [x] 2026-03-14 18:27 - Generate a dummy Stripe payment flow with local demo routes (`/api/stripe/dummy/*`) and automatic billing-action fallback when Stripe keys are not configured
- [x] 2026-03-14 18:17 - Update header logo navigation so brand clicks route to `/dashboard`
- [x] 2026-03-15 15:30 - Fix landing header logo routing so logged-out users stay on `/` and only logged-in users route to `/dashboard`
- [x] 2026-03-14 18:19 - Add a global footer to the authenticated dashboard layout shell
- [x] 2026-03-14 18:28 - Fix incident “Mark as resolved” reliability by scoping incidents board/workspace queries to the active organization
- [x] 2026-03-14 18:45 - Upgrade dashboard KPI cards with real-world operational metrics (risk exposure, disruption cost, alert pressure, and response-performance trend context)
- [x] 2026-03-14 18:37 - Harden `/dashboard` supplier watchlist rendering (nullable slug/tier/risk) to stabilize `/map` → `/dashboard` navigation behavior
- [x] 2026-03-14 18:39 - Expand authenticated header with primary app links, settings shortcuts, and a logged-in user profile menu/actions
- [x] 2026-03-14 18:44 - Redesign `/reports` with a realistic dummy preview panel and improved generation/queue visual hierarchy
- [x] 2026-03-14 18:47 - Replace header user menu dropdown with popup overlay behavior to prevent dashboard scroll shift when opening profile actions
- [x] 2026-03-14 18:47 - Fix `/reports` preview CTAs by wiring query-driven preview selection and anchor navigation to the preview panel
- [x] 2026-03-14 18:50 - Implement dummy `/reports` CSV download flow and wire `Export CSV` CTAs to authenticated export endpoint
- [x] 2026-03-14 18:51 - Redesign `/risk-events` route with an operations-focused layout, richer event cards, and practical triage filtering/search experience
- [x] 2026-03-14 18:54 - Redesign `/settings/billing` for clearer hierarchy (control center, plan catalog, KPI strip, and governance checkpoints) while preserving live billing actions
- [x] 2026-03-14 19:08 - Standardize dropdown/select design across dashboard surfaces, including `/suppliers`, using a shared `selectStyles` utility and consistent focus/chevron treatment
- [x] 2026-03-15 15:35 - Redesign `/api/docs` to remove internal implementation copy and ship a cleaner, single-flow interactive API reference layout
- [x] 2026-03-15 15:40 - Fix landing footer product anchor UX: prevent sticky-header overlap on `Capabilities/Workflow/Outcomes` jumps and preserve section context when navigating `/api/docs` and browser-back to `/`
- [x] 2026-03-15 15:46 - Restore missing `/api/docs` header section with production-ready brand/navigation/actions so docs page matches public-site navigation expectations
- [x] 2026-03-15 15:50 - Fix Swagger UI first-load regression on client navigation (`/` → `/api/docs`) by making bundle initialization route-transition-safe instead of refresh-dependent
- [x] 2026-03-15 15:53 - Align `/api/docs` header with landing header by removing the extra `API docs` nav item and disabling sticky header behavior on docs page
- [x] 2026-03-15 15:59 - Ship production-ready analytical docs subpages for OpenAPI and Service Status (`/api/docs/openapi`, `/api/docs/service-status`) so users see summarized insights instead of raw API payloads
- [x] 2026-03-15 16:15 - Restore the signup password visibility toggle by reusing the shared `PasswordInput` so the eye icon appears again
- [x] 2026-03-15 16:40 - Make the landing-page Log in button rounded with a border color that matches the Start free background for logged-out users
- [x] 2026-03-15 16:34 - Match the `/login` Sign in CTA background to the `/signup` Create account button so both auth CTAs share the same slate palette
- [x] 2026-03-15 16:50 - Refine `/login` and `/signup` copy (no “org” shorthand) and update the login cards so the MVP focus and production-ready messaging are explicit.
- [x] 2026-03-15 18:30 - Remove error query params from auth/signup, onboarding, incident, member, risk, and billing flows by switching to flash cookies so production URLs stay clean while the UI still surfaces inline alerts.
- [x] 2026-03-15 17:12 - Fix flash cookie helper to handle async Next.js cookie stores and update call sites to await flash reads/writes.
- [x] 2026-03-15 19:05 - Replace Google login CTA with column-stacked demo role buttons on `/login` for Apex Resilience demo access
- [x] 2026-03-15 19:25 - Align `/login` demo role buttons into a single-row layout for quicker role selection
- [x] 2026-03-15 19:28 - Expand `/login` demo access section to full width across the auth layout grid

## Phase 7 - Launch

- [ ] Deploy to Vercel with Supabase production project
- [ ] Set all env vars in Vercel dashboard; verify no missing vars at build time
- [ ] Run production seed script; smoke test all core flows on live URL
- [ ] Verify auth redirect URLs work on production domain
- [ ] Record 5-minute demo video following hackathon guide template
- [ ] Submit: GitHub repo link, Vercel URL, Google Drive video link, Product Hunt listing URL
- [ ] Schedule Product Hunt launch for assigned date
