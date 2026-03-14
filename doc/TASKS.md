# Master Task List

## Phase 0 — Foundation

- [x] 2026-03-14 10:19 — Review repo baseline, extract problem statement, and create phased implementation plan
- [x] 2026-03-14 11:50 — Configure `.codex` multi-agent roster from `PRD.md` and `plan.md`
- [x] 2026-03-14 11:57 — Tighten `.codex/agents/*.toml` to minimal, production-ready role profiles
- [~] 2026-03-14 12:12 — Workspace foundation aligned; `pnpm build` passes, but `pnpm dev` could not be socket-verified inside the sandbox
- [x] 2026-03-14 12:12 — Install and configure: Supabase client + SSR auth helpers, Zod, React Hook Form, TanStack Query, shadcn/ui, pino, Vitest, Playwright, Upstash Redis
- [x] 2026-03-14 12:12 — Set up `.env.example` with all required vars (Supabase, Stripe, Redis, app URLs, allowed origins)
- [x] 2026-03-14 12:12 — Configure ESLint, Prettier, Husky pre-commit (lint-staged + type-check)
- [x] 2026-03-14 12:12 — Align framework versions with project conventions or document divergence

## Phase 1 — Product Definition & Architecture

- [ ] Lock route map and page inventory (see plan.md)
- [ ] Define and document role matrix: owner, admin, risk_manager, procurement_lead, viewer
- [ ] Confirm API endpoint groups and document in plan.md
- [ ] Document cross-domain strategy: app domain, Vercel preview URLs, auth redirect URLs, webhook origins
- [ ] Define org onboarding flow (org creation → invite members → seed demo data)
- [ ] Confirm feature flag list and which advanced features are gated for MVP

## Phase 2 — Database & Auth

- [ ] Write and apply migrations 001–009 (see SCHEMA.md for full table list)
- [ ] Enable RLS on every table; verify default-deny policy
- [ ] Implement custom JWT claim `org_id` via Supabase auth hook
- [ ] Implement Supabase auth: email/password + Google OAuth
- [ ] Session refresh middleware, protected dashboard layout, redirect on unauthenticated
- [ ] Org creation on first login; invitation flow for org members
- [ ] Write `seed.sql`: 2 demo orgs, 10 suppliers (tiers 1–3), 5 regions, 3 active risk events, 2 open incidents, multiple alerts, contracts, and inventory records
- [ ] Verify demo data is visible immediately after deploy with no manual setup

## Phase 3 — Data Ingestion & Risk Engine

- [ ] Build risk scoring model: weighted inputs (financial health, geopolitical, natural disaster, operational stability, compliance, delivery performance)
- [ ] Store configurable per-org scoring weights in `risk_score_configs`
- [ ] Create alert generation rules: score threshold crossed → create `alert` record
- [ ] Escalation rule: new `risk_event` affecting >3 suppliers → critical alert
- [ ] Build manual risk event ingestion form with Zod validation
- [ ] Build external feed ingestion endpoint (`POST /api/monitoring`) with HMAC signature verification
- [ ] Add audit history for risk score changes (stored in `risk_scores` as time-series)
- [ ] Trigger score recalculation as server action when risk event is created or updated

## Phase 4 — Core Product UI

- [ ] Dashboard (`/dashboard`): alert counts by severity, top 5 at-risk suppliers, disruption feed, trend sparklines
- [ ] Supplier directory (`/suppliers`): filterable table with risk score badges, region filter, tier filter
- [ ] Supplier detail (`/suppliers/[id]`): profile, risk score breakdown by category, active alerts, assessment history, linked incidents
- [ ] Risk event list (`/risk-events`): filterable by type / region / severity / status, manual ingestion CTA
- [ ] Supply chain map (`/map`): dependency graph (org → tier-1 → tier-2 suppliers), nodes color-coded by risk score
- [ ] Incident board (`/incidents`): kanban-style status columns (new → investigating → mitigating → resolved)
- [ ] Incident workspace (`/incidents/[id]`): timeline, owner assignment, linked risk event, action item checklist, mitigation plans
- [ ] Reports page (`/reports`): list, generate report by type (executive summary, supplier scorecard), export CSV
- [ ] Assessments page (`/assessments`): list and create supplier assessments
- [ ] Add empty, loading, and error states for all critical views

## Phase 5 — Integrations & Cross-Domain Readiness

- [ ] Implement origin allowlist in middleware using `ALLOWED_ORIGINS` env var (no hardcoded domains)
- [ ] Configure Supabase Auth redirect URL allowlist for local, preview, and production
- [ ] Apply CORS headers on all API routes (allowlist-based, never `*`)
- [ ] Rate limiting via Upstash Redis on all public API routes (see plan.md for limits)
- [ ] ERP integration placeholder: connector config UI under `/settings/integrations`
- [ ] Validate Vercel multi-domain deployment with env-based URL config

## Phase 6 — Quality, Security & Demo Readiness

- [ ] Unit tests: risk scoring engine, Zod validation schemas, auth utility functions
- [ ] E2E tests: login → dashboard → supplier detail → create incident → resolve incident
- [ ] Verify RLS: user from org A cannot read or write org B data
- [ ] Security checklist: no secrets in client bundle, all mutations require auth, webhooks verify signatures, input validated on every API route
- [ ] pino structured logging on all API route handlers (request ID, user ID, org ID, status, latency)
- [ ] `GET /api/health` returns DB + Redis connectivity, app version, uptime
- [ ] Error boundaries on all dashboard pages with structured error log
- [ ] Swagger docs at `/api/docs` cover all endpoint groups
- [ ] Finalize seed data so the demo org looks realistic and compelling
- [ ] Write judge walkthrough script: sign in → alerts → supplier risk breakdown → create incident → resolve → view report

## Phase 7 — Launch

- [ ] Deploy to Vercel with Supabase production project
- [ ] Set all env vars in Vercel dashboard; verify no missing vars at build time
- [ ] Run production seed script; smoke test all core flows on live URL
- [ ] Verify auth redirect URLs work on production domain
- [ ] Record 5-minute demo video following hackathon guide template
- [ ] Submit: GitHub repo link, Vercel URL, Google Drive video link, Product Hunt listing URL
- [ ] Schedule Product Hunt launch for assigned date
