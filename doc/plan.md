# Supply Chain Risk Intelligence Platform — Architecture Plan

## Context

Building a production-grade Supply Chain Risk Intelligence Platform for the AI Mahakurukshetra hackathon (March 14, 2026, 10-hour window). The product targets enterprise risk managers, procurement leads, and operations teams who need real-time visibility into supplier disruptions, risk scoring, and incident response — an alternative to Resilinc.

**Goal**: Ship a polished, seeded, fully demo-able MVP on Vercel that covers the core supply chain risk loop: monitor → score → alert → respond → report.

### Design Principles

- Keep backend clean — no JSDoc API comments, use separate YAML spec files
- Org-scoped data model from day one; multi-tenancy enforced via RLS
- Risk scoring is configurable, not hardcoded
- Seed data must make the app look real immediately on first deploy
- Narrow scope wins over broad half-finished features
- Rate limiting and caching are opt-in per endpoint

---

## Phase Summary

| Phase | Name                                  | Time Budget |
| ----- | ------------------------------------- | ----------- |
| 0     | Foundation                            | 1 hr        |
| 1     | Product Definition & Architecture     | 0.5 hr      |
| 2     | Database & Auth                       | 1.5 hr      |
| 3     | Data Ingestion & Risk Engine          | 1.5 hr      |
| 4     | Core Product UI                       | 2 hr        |
| 5     | Integrations & Cross-Domain Readiness | 1 hr        |
| 6     | Quality, Security & Demo Readiness    | 1.5 hr      |
| 7     | Launch                                | 1 hr        |

---

## Technical Architecture

### Core Stack

- **Framework**: Next.js 16+ (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Cache & Rate Limiting**: Redis (Upstash for serverless)
- **UI**: Tailwind CSS + shadcn/ui
- **Package Manager**: PNPM (with workspaces)
- **Monorepo**: Turborepo (build orchestration)
- **Deployment**: Vercel
- **Payments**: Stripe (Checkout + Webhooks, tiered by suppliers monitored)
- **Validation**: Zod (all inputs/outputs)
- **Logging**: pino (structured)
- **Testing**: Vitest (unit), Playwright (E2E)

### Monorepo Structure

```
AI-Mahakurukshetra/
├── apps/
│   └── web/                          # Next.js 16 application
│       ├── app/
│       │   ├── (auth)/               # login, signup, reset, callback
│       │   ├── (dashboard)/          # protected org-scoped routes
│       │   │   ├── dashboard/        # KPI summary, alert feed, trend cards
│       │   │   ├── suppliers/        # supplier directory + detail + risk profile
│       │   │   ├── risk-events/      # risk event list, ingestion form
│       │   │   ├── incidents/        # incident response workspace
│       │   │   ├── map/              # supply chain dependency map
│       │   │   ├── reports/          # report generation + export
│       │   │   ├── assessments/      # supplier assessments
│       │   │   ├── mitigation/       # mitigation plan management
│       │   │   └── settings/
│       │   │       ├── profile/
│       │   │       ├── organization/
│       │   │       ├── members/      # invite / manage org members
│       │   │       ├── billing/      # Stripe subscription management
│       │   │       └── integrations/ # ERP / webhook connectors
│       │   ├── api/
│       │   │   ├── auth/callback/    # Supabase OAuth callback
│       │   │   ├── docs/             # Swagger UI (PUBLIC)
│       │   │   ├── health/           # health check endpoint
│       │   │   ├── suppliers/        # supplier CRUD + risk profile
│       │   │   ├── risks/            # risk event ingestion + scoring
│       │   │   ├── assessments/      # supplier assessment endpoints
│       │   │   ├── alerts/           # alert management
│       │   │   ├── disruptions/      # disruption tracking
│       │   │   ├── incidents/        # incident response workflows
│       │   │   ├── mitigation/       # mitigation plan CRUD
│       │   │   ├── reports/          # report generation
│       │   │   ├── analytics/        # dashboard analytics queries
│       │   │   ├── monitoring/       # external feed ingestion webhook
│       │   │   ├── notifications/    # notification delivery
│       │   │   ├── integrations/     # ERP connector endpoints
│       │   │   └── stripe/
│       │   │       ├── checkout/
│       │   │       ├── portal/
│       │   │       └── webhook/
│       │   ├── middleware.ts         # auth + session refresh + CORS
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                   # shadcn/ui primitives
│       │   ├── auth/                 # login/signup forms
│       │   ├── dashboard/            # sidebar, header, nav, KPI cards
│       │   ├── suppliers/            # supplier cards, risk badges, tier map
│       │   ├── risk/                 # risk event list, severity indicators
│       │   ├── alerts/               # alert feed, dismiss/acknowledge
│       │   ├── incidents/            # incident timeline, action items
│       │   ├── map/                  # supply chain dependency graph
│       │   ├── charts/               # trend charts, score gauges
│       │   ├── billing/              # pricing cards, plan badges
│       │   └── providers/            # React context providers
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts         # client-side Supabase
│       │   │   ├── server.ts         # server-side Supabase (SSR)
│       │   │   └── middleware.ts     # middleware Supabase
│       │   ├── risk/
│       │   │   ├── scoring.ts        # risk score calculation engine
│       │   │   ├── weights.ts        # configurable scoring weights
│       │   │   └── alert-rules.ts    # alert trigger rules
│       │   ├── stripe/
│       │   │   ├── client.ts
│       │   │   ├── webhooks.ts
│       │   │   └── plans.ts          # tier config (by suppliers count)
│       │   ├── redis/
│       │   │   ├── client.ts
│       │   │   ├── cache.ts
│       │   │   └── rate-limit.ts
│       │   ├── feature-flags/
│       │   │   ├── config.ts
│       │   │   ├── provider.tsx
│       │   │   └── hooks.ts
│       │   ├── logger/
│       │   │   └── index.ts          # pino structured logging
│       │   └── validations/
│       │       ├── auth.ts
│       │       ├── suppliers.ts
│       │       ├── risk-events.ts
│       │       ├── incidents.ts
│       │       ├── assessments.ts
│       │       └── common.ts
│       ├── api-specs/
│       │   ├── openapi.yaml          # main spec (PUBLIC at /api/docs)
│       │   ├── auth.yaml
│       │   ├── suppliers.yaml
│       │   ├── risks.yaml
│       │   ├── alerts.yaml
│       │   ├── incidents.yaml
│       │   ├── assessments.yaml
│       │   ├── mitigation.yaml
│       │   ├── reports.yaml
│       │   ├── analytics.yaml
│       │   └── stripe.yaml
│       ├── config/
│       │   └── features.json         # feature flags
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── database/                     # Supabase generated types
│   ├── ui/                           # shared UI components (future)
│   └── tsconfig/                     # shared TS configs
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_auth_orgs.sql         # users, organizations, members
│   │   ├── 002_suppliers.sql         # suppliers, facilities, regions
│   │   ├── 003_products.sql          # products, components, contracts
│   │   ├── 004_risk_engine.sql       # risk_events, disruptions, risk_scores
│   │   ├── 005_alerts_incidents.sql  # alerts, incidents, mitigation_plans
│   │   ├── 006_assessments.sql       # assessments, reports
│   │   ├── 007_logistics.sql         # inventories, shipments
│   │   ├── 008_integrations.sql      # integrations, scenarios, metrics
│   │   └── 009_subscriptions.sql     # Stripe billing tables
│   ├── seed.sql                      # realistic demo data
│   └── config.toml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── coverage.yml
│       └── upptime.yml
│
├── tests/
│   ├── unit/                         # risk scoring, validation, auth utils
│   ├── integration/                  # API route handlers
│   └── e2e/                          # login → dashboard → supplier → incident
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .env.example
├── vitest.config.ts
└── playwright.config.ts
```

---

## Domain Architecture

### User Roles & Permissions

| Capability                                             | owner | admin | risk_manager | procurement_lead | viewer |
| ------------------------------------------------------ | ----- | ----- | ------------ | ---------------- | ------ |
| Access dashboard, suppliers, map, reports, assessments | Yes   | Yes   | Yes          | Yes              | Yes    |
| Create and update supplier records                     | Yes   | Yes   | No           | Yes              | No     |
| Create and update assessments                          | Yes   | Yes   | Yes          | Yes              | No     |
| Create and update risk events                          | Yes   | Yes   | Yes          | No               | No     |
| Acknowledge alerts                                     | Yes   | Yes   | Yes          | Yes              | No     |
| Create and manage incidents                            | Yes   | Yes   | Yes          | No               | No     |
| Create and manage mitigation plans                     | Yes   | Yes   | Yes          | No               | No     |
| Invite and manage members                              | Yes   | Yes   | No           | No               | No     |
| Edit organization settings                             | Yes   | Yes   | No           | No               | No     |
| Manage billing and subscriptions                       | Yes   | No    | No           | No               | No     |

### Page Inventory

| Route                    | Page / Surface            | Purpose                                                       | Auth      | MVP     |
| ------------------------ | ------------------------- | ------------------------------------------------------------- | --------- | ------- |
| `/`                      | Marketing landing page    | Product positioning and sign-in CTA                           | Public    | Yes     |
| `/login`                 | Login page                | Email/password and Google OAuth entry                         | Public    | Yes     |
| `/signup`                | Signup page               | User registration and first-org bootstrap                     | Public    | Yes     |
| `/auth/callback`         | Auth callback handler     | Complete Supabase OAuth / magic link flows                    | Public    | Yes     |
| `/dashboard`             | Dashboard home            | KPI summary, alert counts, at-risk suppliers, disruption feed | Protected | Yes     |
| `/suppliers`             | Supplier directory        | Filter suppliers by region, tier, status, score               | Protected | Yes     |
| `/suppliers/[id]`        | Supplier detail           | Profile, facilities, assessments, alerts, incidents           | Protected | Yes     |
| `/risk-events`           | Risk event list           | Severity/type/region filtered risk feed                       | Protected | Yes     |
| `/risk-events/new`       | Risk event ingestion form | Manual event creation with validation                         | Protected | Yes     |
| `/incidents`             | Incident board            | Active incidents grouped by workflow status                   | Protected | Yes     |
| `/incidents/[id]`        | Incident workspace        | Timeline, owner, linked event, action checklist, mitigations  | Protected | Yes     |
| `/map`                   | Supply chain map          | Tier visibility and risk-colored dependency map               | Protected | Yes     |
| `/assessments`           | Assessments list          | Supplier assessments and create flow                          | Protected | Yes     |
| `/reports`               | Reports page              | Generate executive summary and supplier scorecard exports     | Protected | Yes     |
| `/mitigation`            | Mitigation plans          | Manage formal mitigation strategies                           | Protected | Stretch |
| `/settings/profile`      | User profile settings     | Display name, avatar, preferences                             | Protected | Yes     |
| `/settings/organization` | Organization settings     | Org metadata and workspace defaults                           | Protected | Yes     |
| `/settings/members`      | Member management         | Invite, role assignment, revoke access                        | Protected | Yes     |
| `/settings/billing`      | Billing settings          | Stripe plan and usage state                                   | Protected | Stretch |
| `/settings/integrations` | Integrations settings     | ERP connectors and feed configuration                         | Protected | Stretch |
| `/api/docs`              | API docs UI               | Public Swagger surface for judges and integration reviewers   | Public    | Yes     |
| `/api/health`            | Health check              | DB/Redis/app readiness probe                                  | Public    | Yes     |

### Route Map

| Route               | Description                                     | Auth      |
| ------------------- | ----------------------------------------------- | --------- |
| `/`                 | Marketing landing page                          | Public    |
| `/login`, `/signup` | Auth flows                                      | Public    |
| `/dashboard`        | KPI summary, active alerts, trend view          | Protected |
| `/suppliers`        | Supplier directory + risk scores                | Protected |
| `/suppliers/[id]`   | Supplier detail, facility list, risk profile    | Protected |
| `/risk-events`      | Risk event feed, filter by type/region/severity | Protected |
| `/risk-events/new`  | Manual risk event ingestion                     | Protected |
| `/incidents`        | Active incidents, status board                  | Protected |
| `/incidents/[id]`   | Incident workspace, timeline, action items      | Protected |
| `/map`              | Supply chain dependency graph                   | Protected |
| `/assessments`      | Supplier assessment list + forms                | Protected |
| `/mitigation`       | Mitigation plan management                      | Protected |
| `/reports`          | Report list, generate, export                   | Protected |
| `/settings/*`       | Profile, org, members, billing, integrations    | Protected |
| `/api/docs`         | Swagger UI                                      | Public    |
| `/api/health`       | Health check                                    | Public    |

### API Endpoint Groups

All API routes return `application/json`, validate with Zod, and apply rate limiting.

| Group         | Prefix               | Main Operations                                    | Auth      | Notes                                                            |
| ------------- | -------------------- | -------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| Auth          | `/api/auth`          | OAuth callback, session completion                 | Public    | Supabase-owned login UX with app-owned callback                  |
| Users         | `/api/users`         | Profile read/update                                | Protected | Current user only unless admin surface is added later            |
| Organizations | `/api/organizations` | Org bootstrap, member invites, membership queries  | Protected | Owner/admin mutations only                                       |
| Suppliers     | `/api/suppliers`     | Supplier CRUD, facility links, tier relationships  | Protected | Procurement/admin write paths                                    |
| Risks         | `/api/risks`         | Risk event ingestion, score recalculation triggers | Protected | Risk manager/admin write paths                                   |
| Assessments   | `/api/assessments`   | Assessment CRUD                                    | Protected | Procurement, risk, admin mutation paths                          |
| Alerts        | `/api/alerts`        | List alerts, acknowledge, dismiss, resolve         | Protected | Read for all members except dismissed-history controls if needed |
| Disruptions   | `/api/disruptions`   | Confirm and update disruption records              | Protected | Linked to risk events and incidents                              |
| Incidents     | `/api/incidents`     | Incident CRUD, status moves, action items          | Protected | Risk manager/admin write paths                                   |
| Mitigation    | `/api/mitigation`    | Mitigation plan CRUD                               | Protected | Risk manager/admin write paths                                   |
| Reports       | `/api/reports`       | Report generation and export                       | Protected | CSV/PDF generation stays server-side                             |
| Analytics     | `/api/analytics`     | Dashboard aggregates, trends, counts               | Protected | Read-only, org-scoped                                            |
| Monitoring    | `/api/monitoring`    | External feed ingestion webhook                    | Public    | HMAC-signed, rate-limited, no browser auth                       |
| Notifications | `/api/notifications` | Delivery log and preference-aware sends            | Protected | Internal app use first, external delivery later                  |
| Integrations  | `/api/integrations`  | ERP connector config and sync status               | Protected | Feature-flagged for MVP                                          |
| Scenarios     | `/api/scenarios`     | Scenario simulation CRUD                           | Protected | Feature-flagged for MVP                                          |
| Stripe        | `/api/stripe/*`      | Checkout, portal, webhook                          | Mixed     | Webhook is public + signature-verified                           |
| Health        | `/api/health`        | Readiness and dependency health                    | Public    | No auth, heavily rate-limited                                    |
| Docs          | `/api/docs`          | Swagger UI and spec serving                        | Public    | Read-only documentation surface                                  |

### Cross-Domain Strategy

The product must support local development, Vercel preview deployments, the production app domain, and non-browser callers such as Stripe and monitoring feeds without hardcoded hostnames.

| Concern                 | Strategy                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Primary app URL         | `NEXT_PUBLIC_APP_URL` points to the canonical production domain used in metadata, redirects, and generated links.                  |
| Local development       | `http://localhost:3000` is always allowed for app and Supabase auth redirects in local environments.                               |
| Vercel previews         | `VERCEL_URL` and preview deployment hostnames are treated as temporary app origins for auth redirects and deep links.              |
| Auth redirect allowlist | Supabase Auth is configured with local, preview, and production callback URLs for `/auth/callback` and any email link returns.     |
| API browser callers     | Middleware/API CORS uses `ALLOWED_ORIGINS` from env, never `*`, and reflects only approved origins.                                |
| Webhook callers         | Stripe and monitoring webhooks bypass browser CORS and rely on signature verification plus endpoint-specific rate limits.          |
| Embedded / judge access | Read-only docs and health endpoints remain public; protected app routes always require session validation regardless of hostname.  |
| URL generation          | Server code derives absolute URLs from env-aware helpers so emails, reports, and redirects use the correct domain per environment. |

Required env surface for this strategy:

```
NEXT_PUBLIC_APP_URL=
ALLOWED_ORIGINS=
SUPABASE_AUTH_REDIRECT_URLS=
VERCEL_PROJECT_PRODUCTION_URL=
```

`SUPABASE_AUTH_REDIRECT_URLS` is documented here as the canonical comma-separated source-of-truth list even if Supabase dashboard entry remains manual during hackathon setup.

### Org Onboarding Flow

1. User signs up with email/password or Google OAuth.
2. App completes auth callback and checks for an existing `organization_members` row.
3. If no organization exists for the user, create a new organization and assign the user as `owner`.
4. Bootstrap org defaults:
   - create default risk score config
   - enable core feature flags
   - queue demo data seed for the org
5. Redirect the owner to `/dashboard` with seeded sample data visible immediately.
6. Owner can invite additional members from `/settings/members`.
7. Invited users accept invite, join the existing org, and land on `/dashboard`.

Constraints:

- Demo data seeding must be idempotent so retries do not duplicate suppliers or incidents.
- Invite acceptance must validate org membership before granting access.
- Seeded demo data is required for hackathon judging and is part of the default first-login experience.

### Feature Flags

| Flag                    | Default | MVP Exposure | Notes                                                    |
| ----------------------- | ------- | ------------ | -------------------------------------------------------- |
| `predictive_analytics`  | `false` | Hidden       | Future ML recommendations and forecast scoring           |
| `multi_tier_visibility` | `false` | Hidden       | Keep current map focused on seeded dependency graph only |
| `erp_integrations`      | `false` | Hidden       | Settings placeholder allowed, live sync out of MVP scope |
| `map_overlays`          | `false` | Hidden       | Live geospatial/weather overlays deferred                |
| `communication_hub`     | `false` | Hidden       | No in-app chat/email center in MVP                       |
| `ai_supplier_discovery` | `false` | Hidden       | Alternative supplier suggestions deferred                |
| `scenario_simulation`   | `false` | Hidden       | Scenario planning remains schema-only in MVP             |

All advanced/differentiating features are gated — core monitoring, scoring, alerting, and incident response are always on.

---

## Phase Details

### Phase 0 — Foundation (1 hr)

**Goal**: Working monorepo with all dependencies, typed env, and CI configured.

- Init Turborepo + PNPM workspace
- Install and configure: Supabase client, SSR auth helpers, Zod, React Hook Form, TanStack Query, shadcn/ui, pino, Vitest, Playwright, Upstash Redis
- Set up `.env.example` with all required vars (Supabase, Stripe, Redis, app URLs)
- Configure ESLint, Prettier, Husky pre-commit hooks
- Verify `pnpm dev` starts cleanly

**Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STARTER=
STRIPE_PRICE_ID_PROFESSIONAL=
STRIPE_PRICE_ID_ENTERPRISE=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=
```

---

### Phase 1 — Product Definition & Architecture (0.5 hr)

**Goal**: Lock routes, roles, API surface, and cross-domain strategy. No code — documents only.

- Finalize route map and page inventory
- Define role matrix (owner, admin, risk_manager, procurement_lead, viewer)
- Confirm API endpoint groups (see above)
- Document cross-domain strategy: app domain, preview URLs, auth redirect URLs, webhook origins
- Define org onboarding flow (org creation → invite members → seed demo data)
- Confirm advanced feature flags remain off for MVP unless explicitly enabled later

---

### Phase 2 — Database & Auth (1.5 hr)

**Goal**: All tables migrated, RLS on every table, auth working end-to-end, seed data visible.

- Write and apply all migrations (001–009)
- Enable RLS; all business tables scoped by `organization_id`
- Implement Supabase auth: email/password + Google OAuth
- Session refresh middleware, protected layout, redirect on unauthenticated
- Org creation on first login, invitation flow for members
- Write `seed.sql` with realistic demo data: 2 orgs, 10 suppliers, 5 regions, 3 active risk events, 2 incidents, multiple alerts
- Verify demo org is accessible immediately after deploy

---

### Phase 3 — Data Ingestion & Risk Engine (1.5 hr)

**Goal**: Risk scores calculated, alerts generated, audit trail recorded.

- Risk scoring model: weighted inputs (financial health, operational stability, geopolitical exposure, natural disaster risk, compliance status, performance history)
- Configurable weights per org stored in DB
- Alert generation rules: score threshold crossed → create alert record + notification
- Manual risk event ingestion form with Zod validation
- External feed ingestion endpoint (`POST /api/monitoring`) with signature verification
- Audit history table for all risk score changes (who changed what and when)
- Background job / server action for recalculating affected supplier scores when a risk event is created

---

### Phase 4 — Core Product UI (2 hr)

**Goal**: Full dashboard, supplier registry, risk events, incidents, and map screens working with real data.

**Dashboard** (`/dashboard`):

- Active alert count by severity (critical / high / medium / low)
- Top 5 at-risk suppliers with score badges
- Recent disruption feed
- Trend sparklines for org-level risk score over time

**Supplier Directory** (`/suppliers`):

- Filterable table: search, region filter, risk tier filter
- Risk score badge (color-coded), status, tier level
- Quick actions: view, create assessment, create incident

**Supplier Detail** (`/suppliers/[id]`):

- Profile card: company info, tier, regions, facilities
- Risk score breakdown by category
- Active alerts for this supplier
- Assessment history
- Related incidents

**Risk Events** (`/risk-events`):

- Feed with filters: type (geopolitical, natural, financial, operational), region, severity, status
- Manual ingestion form
- Event detail with affected suppliers list

**Incident Response** (`/incidents`, `/incidents/[id]`):

- Kanban-style status board (new → investigating → mitigating → resolved)
- Incident detail: timeline, owner assignment, linked risk event, mitigation plans
- Action item checklist

**Supply Chain Map** (`/map`):

- Dependency graph showing org → tier-1 suppliers → tier-2 suppliers
- Node color-coded by risk score
- Click node to see supplier summary

**Empty, loading, and error states on all critical views.**

---

### Phase 5 — Integrations & Cross-Domain Readiness (1 hr)

**Goal**: External callers can POST risk events, CORS is locked, preview deployments work.

- Implement origin allowlist in middleware (env-driven, no hardcoded domains)
- Configure Supabase Auth redirect URLs for: local dev, Vercel preview, production
- CORS response headers on all API routes (allowlist-based)
- `POST /api/monitoring` webhook endpoint with HMAC signature verification
- ERP integration placeholder: stubbed connector config UI in settings
- Validate Vercel multi-domain deployment with environment-based URL config
- Rate limiting on all public API routes using Upstash Redis

---

### Phase 6 — Quality, Security & Demo Readiness (1.5 hr)

**Goal**: Tests passing, no secrets exposed, app is demo-ready for judges.

**Tests**:

- Unit: risk scoring engine, Zod schema validation, auth utility functions
- E2E: login → dashboard (alerts visible) → supplier detail → create incident → resolve incident

**Security Checklist**:

- No secrets in client bundle
- All mutations require auth
- RLS verified: user from org A cannot read org B data
- Webhook endpoints verify signatures before processing
- Input validation on every API route (Zod)
- CORS origin allowlist (not `*`)

**Observability**:

- pino structured logging on all API routes (request ID, user ID, org ID, latency)
- `GET /api/health` returns DB connectivity, Redis connectivity, uptime
- Error boundaries on all dashboard pages

**Demo Readiness**:

- Seed data is realistic and visually compelling
- Judge walkthrough script: login as demo user → see active alerts → click into supplier → view risk score breakdown → create incident → assign action → mark resolved → view report
- Record 5-minute demo video following hackathon guide template

---

### Phase 7 — Launch (1 hr)

**Goal**: Production deploy working, submission complete.

- Deploy to Vercel with Supabase production project
- Verify all env vars set in Vercel dashboard
- Run production seed: `pnpm db:seed --env production`
- Smoke test: login, dashboard loads, alerts visible, incident creates/resolves
- Verify auth redirects work on production domain
- Record final demo video
- Submit: GitHub repo, Vercel URL, video link, Product Hunt listing
- Schedule Product Hunt launch for assigned date

---

## Key Integrations

### Supabase Auth + RLS

- Email/password and Google OAuth
- Session managed via SSR cookies (`@supabase/ssr`)
- Middleware refreshes session on every request
- RLS policy template: `organization_id = auth.jwt()->>'org_id'` (set via custom JWT claims)
- Organization membership checked before all data access

### Risk Scoring Engine

Scoring function runs on the server (never client-exposed). Inputs:

| Factor                 | Default Weight |
| ---------------------- | -------------- |
| Financial health score | 25%            |
| Operational stability  | 20%            |
| Geopolitical exposure  | 20%            |
| Natural disaster risk  | 15%            |
| Compliance status      | 10%            |
| Delivery performance   | 10%            |

Output: 0–100 score. Thresholds: `critical < 30`, `high < 50`, `medium < 70`, `low ≥ 70`.
Weights are stored per organization in DB, allowing customization.

### Alert System

Alert triggers (server-side, runs after score recalculation):

- Score drops below threshold → create `alert` record with `severity`
- New `risk_event` affects >3 suppliers → escalate to `critical`
- Incident status stale >24h with no update → reminder notification

Notifications stored in DB, optionally delivered via email (Resend/Postmark, feature-flagged).

### Stripe Subscriptions

Tiered by number of suppliers monitored:

| Plan         | Suppliers | Price   |
| ------------ | --------- | ------- |
| Starter      | up to 25  | $99/mo  |
| Professional | up to 100 | $299/mo |
| Enterprise   | Unlimited | Custom  |

- `POST /api/stripe/checkout` — create Checkout session (protected)
- `POST /api/stripe/portal` — create portal session (protected)
- `POST /api/stripe/webhook` — process events: `subscription.created`, `subscription.updated`, `subscription.deleted`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### Swagger / OpenAPI Docs

- Separate YAML files in `api-specs/` (clean backend code)
- Main `openapi.yaml` uses `$ref` to include domain specs
- Served at `/api/docs` (public, no auth)
- Covers all endpoint groups: suppliers, risks, alerts, incidents, assessments, mitigation, reports, analytics

### Redis (Upstash) Rate Limiting

Applied per-route, per-IP or per-user:

| Route category            | Limit                |
| ------------------------- | -------------------- |
| Public ingestion webhooks | 100 req/min          |
| Authenticated API routes  | 300 req/min per user |
| Report generation         | 10 req/min per org   |
| Auth endpoints            | 20 req/min per IP    |

### Observability

- pino logger wraps all API handlers: logs request method, path, user ID, org ID, status, latency (ms)
- Request ID header propagated through all calls
- `GET /api/health` checks: Supabase connectivity, Redis connectivity, app version, uptime
- Error boundaries on all RSC pages with structured error logging

---

## Cross-Domain Strategy

The app may run across multiple domains in production (app.domain.com) and preview (\*.vercel.app). Strategy:

| Concern         | Solution                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------- |
| Auth redirects  | Store all valid redirect URLs in Supabase project settings + `ALLOWED_REDIRECT_URLS` env var |
| CORS            | Middleware reads `ALLOWED_ORIGINS` env var; never use `*` in production                      |
| Cookie domain   | Use `__Host-` prefix for session cookies in production                                       |
| Webhook callers | Verify HMAC signature; no origin restriction needed                                          |
| Embed iframes   | Set `X-Frame-Options: SAMEORIGIN` by default; opt-in override per route                      |

---

## Success Criteria

- App loads and is usable end-to-end on Vercel production URL
- Demo user can: sign in → see populated dashboard → drill into supplier risk → create and resolve an incident
- Multi-org RLS: user from org A cannot see org B data (verified by test)
- Risk scoring recalculates when new risk event is created
- Alerts are visible within the dashboard immediately
- Mobile view is usable for all core screens
- `/api/docs` shows the full Swagger UI
- `/api/health` returns 200 with all systems green
- No exposed secrets in client bundle or public repo
