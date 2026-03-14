# AI Mahakurukshetra — Supply Chain Risk Intelligence Platform

A production-ready SaaS platform for real-time supply chain risk monitoring, incident response, and AI-powered executive insights. Built as a Next.js + Supabase monorepo with multi-tenant architecture, Stripe billing, and support for multiple AI providers.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [AI Integration](#ai-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Overview

**AI Mahakurukshetra** is an alternative to enterprise supply chain risk tools like Resilinc. It targets enterprise risk managers, procurement leads, and operations teams who need real-time visibility into supplier disruptions, risk scoring, and incident resolution.

**Key capabilities:**

- Ingest and score risk events across suppliers, regions, and tiers
- Manage incidents with timelines and action tracking
- Visualize supply chain dependencies on an interactive map
- Generate AI-powered executive summaries and trend analysis
- Support multiple organizations with full data isolation

---

## Features

### Core Platform

- **Dashboard** — Executive KPI summary with live alerts, at-risk supplier count, and AI insight card
- **Supplier Management** — Filterable directory with risk scoring, facility details, and historical assessments
- **Risk Events** — Feed with severity/type/region filters; manual ingestion form; per-event affected supplier view
- **Incidents** — Kanban-style status board; incident workspace with timeline, action items, and AI summaries
- **Supply Chain Map** — Interactive dependency graph (Org → Tier-1/2 suppliers), color-coded by risk score
- **Assessments** — Create and track supplier assessments; exportable reports
- **Reports** — Generate executive summaries with export

### Settings & Administration

- Organization management and onboarding flow
- Team member invitations with role-based access (owner, admin, risk_manager, procurement_lead, viewer)
- Stripe subscription billing (Starter / Professional / Enterprise tiers)
- AI provider configuration (per-org API keys stored encrypted)
- Integration connectors panel

### API & Developer Tools

- Public Swagger UI at `/api/docs`
- Health check at `/api/health`
- Rate limiting on all public and authenticated endpoints
- Structured logging with request IDs (pino)
- OpenAPI spec auto-generated from route schemas

### AI-Powered Insights

- **Supplier Health Summary** — AI assessment of risk posture, key concerns, and recommended actions
- **Dashboard Executive Insights** — Trend analysis, top action items, emerging risk detection
- **Risk Event Analysis** — Impact assessment, affected sectors, and mitigation strategies
- Supports Anthropic Claude, Google Gemini, OpenAI GPT-4o, and xAI Grok

---

## Tech Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Framework     | Next.js 16+ (App Router), React 19    |
| Language      | TypeScript (strict mode)              |
| UI            | Tailwind CSS 4, shadcn/ui, Radix UI   |
| Backend       | Supabase (PostgreSQL, Auth, Realtime) |
| Validation    | Zod                                   |
| Forms         | React Hook Form                       |
| Maps          | Leaflet / React Leaflet               |
| Payments      | Stripe                                |
| Rate Limiting | Upstash Redis                         |
| Logging       | pino                                  |
| Testing       | Vitest (unit), Playwright (E2E)       |
| Monorepo      | Turborepo + PNPM                      |
| Deployment    | Vercel                                |

---

## Architecture

```
AI-Mahakurukshetra/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/
│       │   ├── (auth)/         # Login, signup, forgot/reset password
│       │   ├── (dashboard)/    # All authenticated app routes
│       │   ├── api/            # API routes (health, AI, Stripe, reports)
│       │   ├── auth/           # OAuth callback handler
│       │   └── setup/          # Organization onboarding
│       ├── components/         # Shared UI components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Core utilities (AI client, actions, validations)
├── packages/
│   ├── database/               # Shared Supabase types
│   └── tsconfig/               # Shared TypeScript configuration
├── supabase/
│   ├── migrations/             # Database migration files (001–013)
│   └── seed.sql                # Demo data seed
├── tests/                      # Unit and E2E test suites
└── docs/                       # Architecture docs and implementation guides
```

**Multi-tenancy:** Every table includes `organization_id`. Row-Level Security (RLS) policies enforce data isolation at the database level. A custom JWT claim (`org_id`) is used for efficient permission checking without extra round-trips.

**Risk Scoring:** Weighted across six factors — financial, operational, geopolitical, natural disaster, compliance, and delivery. Thresholds: critical <30, high <50, medium <70, low ≥70. Scores recalculate via stored procedures on new risk event ingestion.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 9+
- Supabase CLI
- A Supabase project
- A Stripe account
- An Upstash Redis instance
- At least one AI provider API key (Anthropic, OpenAI, Google AI, or xAI)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ai-mahakurukshetra.git
cd ai-mahakurukshetra

# Install all dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env.local
```

### Database Setup

```bash
# Apply all migrations and seed demo data
supabase db reset

# Or push migrations to a hosted Supabase project
pnpm db:push

# Seed demo data separately
pnpm db:seed
```

### Development

```bash
# Start the dev server (all packages via Turborepo)
pnpm dev

# Or run only the web app
pnpm dev:web
```

The app will be available at `http://localhost:3000`.

**Demo credentials (after seeding):**

| Role         | Email                      | Password      |
| ------------ | -------------------------- | ------------- |
| Owner        | owner@apex-resilience.com  | demo-password |
| Admin        | admin@apex-resilience.com  | demo-password |
| Risk Manager | risk@apex-resilience.com   | demo-password |
| Viewer       | viewer@apex-resilience.com | demo-password |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value.

```bash
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── Stripe ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_STARTER=
STRIPE_PRICE_ID_PROFESSIONAL=
STRIPE_PRICE_ID_ENTERPRISE=

# ── Upstash Redis (rate limiting) ─────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── App Configuration ─────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_REDIRECT_URLS=http://localhost:3000/auth/callback

# ── Monitoring ────────────────────────────────────────────────────────────────
MONITORING_WEBHOOK_SECRET=

# ── AI Providers (at least one required) ─────────────────────────────────────
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
OPENAI_API_KEY=
GROK_API_KEY=

# ── E2E Testing ───────────────────────────────────────────────────────────────
E2E_TEST_EMAIL=
E2E_TEST_PASSWORD=
RLS_TEST_USER_EMAIL=
RLS_TEST_USER_PASSWORD=
```

---

## Database

The schema spans 27 tables organized into eight domains:

| Domain      | Key Tables                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Auth        | `organizations`, `user_profiles`, `organization_members`                    |
| Suppliers   | `suppliers`, `supplier_facilities`, `regions`, `supplier_region_links`      |
| Products    | `products`, `components`, `supplier_components`, `contracts`                |
| Risk Engine | `risk_events`, `disruptions`, `risk_scores`, `risk_score_configs`, `alerts` |
| Incidents   | `incidents`, `incident_actions`, `mitigation_plans`                         |
| Assessments | `assessments`, `reports`                                                    |
| Logistics   | `inventories`, `shipments`                                                  |
| AI          | `ai_settings`                                                               |

Migrations live in `supabase/migrations/` and are numbered `001` through `013`. All tables have RLS enabled. See `doc/SCHEMA.md` for the full schema reference.

### Useful Database Commands

```bash
pnpm db:new        # Create a new migration file
pnpm db:push       # Push migrations to hosted Supabase
pnpm db:status     # Check migration status
pnpm db:seed       # Run demo data seed
```

---

## AI Integration

AI insights are powered by a unified multi-provider client (`apps/web/lib/ai/`). The platform supports:

| Provider         | Model                       |
| ---------------- | --------------------------- |
| Anthropic Claude | claude-3-5-sonnet (default) |
| Google Gemini    | gemini-2.0-flash-exp        |
| OpenAI           | gpt-4o                      |
| xAI Grok         | grok-2-latest               |

### Configuration

**Option 1 — Environment variable (global fallback):**
Set `ANTHROPIC_API_KEY` (or equivalent) in `.env.local`.

**Option 2 — Settings UI (recommended for multi-tenant use):**
Navigate to **Settings → Integrations → AI Provider Configuration** in the app. Keys are stored encrypted in the `ai_settings` table, scoped per organization, and never exposed in API responses.

### AI-Powered Endpoints

| Endpoint                          | Feature                    | Location in UI      |
| --------------------------------- | -------------------------- | ------------------- |
| `POST /api/ai/supplier-summary`   | Supplier health assessment | `/suppliers/[id]`   |
| `POST /api/ai/dashboard-insights` | Executive trend analysis   | `/dashboard`        |
| `POST /api/ai/risk-event-summary` | Risk event impact analysis | `/risk-events/[id]` |

All AI endpoints include Zod-validated inputs, rate limiting, structured error codes, and user-friendly error messages.

---

## Testing

```bash
# Unit tests (Vitest)
pnpm test
pnpm test:watch

# E2E tests (Playwright)
pnpm test:e2e

# RLS isolation verification
pnpm --filter @repo/web run verify:rls

# Type checking
pnpm check-types

# Lint
pnpm lint:fix
```

---

## Deployment

The app deploys to Vercel. Push to `main` triggers an automatic production deployment.

### Pre-Deployment Checklist

1. All environment variables set in the Vercel dashboard
2. Supabase Auth redirect URLs include the production domain
3. `ALLOWED_ORIGINS` and `ALLOWED_REDIRECT_URLS` updated for production
4. Stripe webhook endpoint configured (`/api/stripe/webhook`)
5. Database migrations applied to production (`pnpm db:push`)
6. Health check passes at `https://your-domain.com/api/health`

### Post-Deployment Smoke Test

```
1. Sign up / log in
2. Visit /dashboard → verify KPIs and AI insights load
3. Create a risk event → verify supplier scores update
4. Open an incident → verify timeline and actions
5. Check /api/health → should return 200
```

---

## Development Commands Reference

```bash
pnpm dev           # Start all apps in development mode
pnpm build         # Production build (all packages)
pnpm start         # Start Next.js in production mode
pnpm lint:fix      # Fix linting issues
pnpm format        # Prettier format
pnpm check-types   # TypeScript type check
pnpm test          # Run unit tests
pnpm test:e2e      # Run Playwright E2E tests
pnpm db:new        # Create a new Supabase migration
pnpm db:push       # Push migrations to remote Supabase
pnpm db:seed       # Seed demo data
```

---

## License

MIT
