# Master Task List

## Phase 0 — Foundation

- [x] 2026-03-14 10:19 — Review repo baseline, extract problem statement, and create phased implementation plan
- [ ] Align framework versions with project conventions or explicitly document the decision to stay on current versions
- [ ] Install and configure Supabase client, SSR auth helpers, Zod, React Hook Form, TanStack Query, shadcn/ui, Vitest, and Playwright
- [ ] Set up `.env.example`, typed env access, and local development instructions

## Phase 1 — Product Definition And Architecture

- [ ] Finalize MVP scope from the blueprint and lock the demo narrative
- [ ] Define user roles, permissions, and organization model
- [ ] Design information architecture and route map
- [ ] Define cross-domain strategy for app, API, auth redirects, and webhooks

## Phase 2 — Database And Auth

- [ ] Design Supabase schema for organizations, suppliers, regions, facilities, risks, alerts, incidents, and mitigation plans
- [ ] Create initial migrations with RLS on every table
- [ ] Implement Supabase auth, session refresh, protected dashboard layout, and onboarding flow
- [ ] Add seed/demo data scripts

## Phase 3 — Data Ingestion And Risk Engine

- [ ] Build ingestion model for manual entries plus external feeds
- [ ] Implement risk scoring model with configurable weights
- [ ] Create alert generation rules and notification records
- [ ] Add audit history for risk status changes

## Phase 4 — Core Product UI

- [ ] Build dashboard with KPIs, alert feed, and trend cards
- [ ] Build supplier directory and supplier detail screens
- [ ] Build risk event list and incident response workspace
- [ ] Build supply chain map / dependency visualization MVP
- [ ] Add empty, loading, and error states for all critical views

## Phase 5 — Integrations And Cross-Domain Readiness

- [ ] Add route handlers / server actions for external ingestion and integrations
- [ ] Implement CORS allowlist and origin-aware API responses
- [ ] Configure Supabase redirect URLs for preview, production, and custom domains
- [ ] Validate Vercel multi-domain deployment assumptions

## Phase 6 — Quality, Security, And Demo Readiness

- [ ] Add unit tests for validation, scoring, and auth-critical flows
- [ ] Add E2E tests for login, dashboard, supplier review, and incident flow
- [ ] Add observability, health checks, and error logging
- [ ] Create demo dataset and judge walkthrough script

## Phase 7 — Launch

- [ ] Deploy to Vercel with Supabase production project
- [ ] Verify auth, redirects, environment variables, and seed data in production
- [ ] Record demo video and prepare Product Hunt assets
