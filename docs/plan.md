# Production-Ready Next.js + Supabase SaaS Boilerplate

## Context

Creating a comprehensive, production-grade SaaS boilerplate for a technical hackathon on **March 14, 2026**. The goal is to build a foundation that enables rapid feature development during the vibe-coding hackathon while showcasing professional development practices to judges through:

- **Public API documentation** (Swagger/OpenAPI with modular YAML specs)
- **Code quality metrics** (public coverage reports)
- **Reliability monitoring** (public status page)
- **Payment integration** (Stripe for SaaS subscriptions)
- **Performance & security** (Redis caching, rate limiting)
- **Observability** (structured logging with pino)
- **Type safety** (Zod validation for all inputs)
- **Feature gating** (plan-based feature flags)
- **Multi-tenancy** (optional, feature-flag controlled)

This boilerplate must be deployment-ready on Vercel and structured as a monorepo to demonstrate architectural maturity.

### Design Principles

**Avoiding Over-Engineering:**
- Keep backend code clean (no JSDoc comments for API specs - use separate YAML files)
- Features are modular and optional via feature flags
- Multi-tenancy is disabled by default, only enabled when needed
- Use proven, lightweight tools (pino for logging, Upstash for Redis)
- Zod schemas provide single source of truth for validation
- Rate limiting and caching are opt-in per endpoint

---

## Technical Architecture

### Core Stack
- **Framework**: Next.js 16+ (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Cache & Rate Limiting**: Redis (Upstash for serverless)
- **UI**: Tailwind CSS + shadcn/ui
- **Package Manager**: PNPM (with workspaces)
- **Monorepo**: Turborepo (for build orchestration)
- **Deployment**: Vercel
- **Payments**: Stripe (Checkout + Webhooks)
- **Validation**: Zod (all inputs/outputs)

### Monorepo Structure

```
AI-Mahakurukshetra/
├── apps/
│   └── web/                    # Next.js 16 SaaS application
│       ├── app/
│       │   ├── (auth)/        # Public auth pages (login, signup, reset)
│       │   ├── (dashboard)/   # Protected dashboard routes
│       │   │   ├── dashboard/
│       │   │   ├── projects/  # Sample CRUD feature
│       │   │   └── settings/
│       │   │       ├── profile/
│       │   │       ├── billing/      # Stripe integration
│       │   │       └── subscription/
│       │   ├── api/
│       │   │   ├── auth/callback/    # OAuth callback handler
│       │   │   ├── docs/             # Swagger UI (PUBLIC)
│       │   │   ├── health/           # Health check for status page
│       │   │   ├── projects/         # RESTful API for projects
│       │   │   └── stripe/
│       │   │       ├── checkout/     # Create checkout session
│       │   │       ├── portal/       # Customer portal session
│       │   │       └── webhook/      # Stripe webhook handler
│       │   ├── middleware.ts          # Auth + session refresh
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                    # shadcn/ui components
│       │   ├── auth/                  # Auth forms + OAuth buttons
│       │   ├── dashboard/             # Sidebar, header, navigation
│       │   ├── billing/               # Pricing cards, subscription UI
│       │   └── providers/             # React context providers
│       ├── lib/
│       │   ├── supabase/
│       │   │   ├── client.ts          # Client-side Supabase
│       │   │   ├── server.ts          # Server-side Supabase (SSR)
│       │   │   └── middleware.ts      # Middleware Supabase
│       │   ├── stripe/
│       │   │   ├── client.ts          # Server-side Stripe client
│       │   │   ├── webhooks.ts        # Webhook event handlers
│       │   │   └── plans.ts           # Pricing plans config
│       │   ├── redis/
│       │   │   ├── client.ts          # Redis client (Upstash)
│       │   │   ├── cache.ts           # Caching utilities
│       │   │   └── rate-limit.ts      # Rate limiting middleware
│       │   ├── feature-flags/
│       │   │   ├── config.ts          # Feature flag definitions
│       │   │   ├── provider.tsx       # React context for flags
│       │   │   └── hooks.ts           # useFeatureFlag hook
│       │   ├── logger/
│       │   │   └── index.ts           # Structured logging (pino)
│       │   └── validations/
│       │       ├── auth.ts            # Zod schemas for auth
│       │       ├── projects.ts        # Zod schemas for projects
│       │       └── common.ts          # Shared validation schemas
│       ├── public/
│       ├── api-specs/                  # OpenAPI specifications
│       │   ├── openapi.yaml           # Main spec (PUBLIC)
│       │   ├── auth.yaml              # Auth endpoints spec
│       │   ├── projects.yaml          # Projects endpoints spec
│       │   └── stripe.yaml            # Stripe endpoints spec
│       ├── config/
│       │   └── features.json          # Feature flags configuration
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── database/               # Shared Supabase types & schemas
│   │   ├── types.ts           # Generated from Supabase
│   │   └── package.json
│   ├── ui/                    # Shared UI components (if needed later)
│   │   └── package.json
│   ├── stripe/                # Shared Stripe utilities
│   │   ├── types.ts           # Stripe-related types
│   │   ├── config.ts          # Pricing plans
│   │   └── package.json
│   └── tsconfig/              # Shared TypeScript configs
│       ├── base.json
│       ├── nextjs.json
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 20260306000000_initial_schema.sql      # Users, profiles
│   │   ├── 20260306000001_organizations_schema.sql # Multi-tenant support
│   │   ├── 20260306000002_projects_schema.sql     # Sample feature
│   │   └── 20260306000003_subscriptions_schema.sql # Stripe integration
│   ├── seed.sql
│   └── config.toml
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # Lint, test, build
│   │   ├── coverage.yml       # Generate & upload to Codecov
│   │   └── upptime.yml        # Status page updates
│   └── upptime.yml            # Upptime config for status page
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .husky/
│   ├── pre-commit             # lint-staged
│   └── pre-push               # type-check + tests
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json               # Root package.json
├── .env.example
├── .prettierrc
├── .eslintrc.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## Key Integrations

### 1. Stripe Payment System

**Purpose**: Enable subscription-based SaaS monetization with multiple pricing tiers.

**Components**:
- **Checkout Flow**: Create Stripe Checkout sessions from settings/billing
- **Webhook Handler**: Process events (subscription created, updated, cancelled, payment succeeded/failed)
- **Customer Portal**: Allow users to manage subscriptions via Stripe's hosted portal
- **Database Schema**: Store subscriptions, customers, pricing plans, payment history

**Database Tables**:
```sql
-- customers: Links Supabase users to Stripe customers
-- subscriptions: Active/cancelled subscriptions with status
-- prices: Available pricing plans (synced from Stripe)
-- payment_history: Log of successful/failed payments
```

**API Routes**:
- `POST /api/stripe/checkout` - Create checkout session (protected)
- `POST /api/stripe/portal` - Create portal session (protected)
- `POST /api/stripe/webhook` - Handle Stripe events (public, signature-verified)

**Environment Variables**:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

### 2. Swagger/OpenAPI Documentation

**Purpose**: Provide public, interactive API documentation for judges to explore.

**Implementation**:
- Maintain separate YAML files in `api-specs/` directory (keeps backend code clean)
- Main `openapi.yaml` references individual spec files for each domain
- Serve Swagger UI at `/api/docs` (public, no auth required)
- Use `$ref` to compose specs from modular YAML files
- Document all API routes: auth, projects CRUD, health checks, Stripe endpoints

**File Structure**:
```
api-specs/
├── openapi.yaml        # Main spec with references
├── auth.yaml           # Auth endpoints
├── projects.yaml       # Projects CRUD
└── stripe.yaml         # Payment endpoints
```

**Example Spec** (`api-specs/projects.yaml`):
```yaml
paths:
  /api/projects:
    get:
      summary: Get all projects for authenticated user
      tags: [Projects]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'
```

**Public URL for Judges**: `https://your-app.vercel.app/api/docs`

### 3. Code Coverage Reports (Codecov)

**Purpose**: Showcase code quality and testing rigor to judges via public metrics.

**Setup**:
- Configure Vitest to generate coverage reports (Istanbul/c8)
- GitHub Action uploads coverage to Codecov after test runs
- Add Codecov badge to README
- Make repository public or use Codecov's public report feature

**CI Workflow** (`.github/workflows/coverage.yml`):
```yaml
- name: Run tests with coverage
  run: pnpm test:coverage
- name: Upload to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/coverage-final.json
```

**Target Coverage**: Aim for >70% for hackathon demo purposes.

**Public URL**: `https://codecov.io/gh/your-username/AI-Mahakurukshetra`

### 4. Status Page (Upptime)

**Purpose**: Demonstrate system reliability and uptime monitoring to judges.

**Implementation**:
- Use **Upptime** (open-source, GitHub Actions-based, free)
- Configure health check endpoints in `.upptimerc.yml`
- Monitors `/api/health` endpoint every 5 minutes
- Generates public status page via GitHub Pages
- Shows 90-day uptime history and response times

**Health Check Endpoint** (`/api/health/route.ts`):
```typescript
// Returns 200 OK with system status
{
  "status": "healthy",
  "timestamp": "2026-03-06T...",
  "database": "connected",
  "version": "1.0.0"
}
```

**Status Page URL**: `https://your-username.github.io/AI-Mahakurukshetra/`

### 5. Feature Flags

**Purpose**: Enable/disable features based on subscription tier and tenant configuration.

**Implementation**:
- Configuration file: `config/features.json` defines available features
- Server-side feature checks using subscription data
- React Context Provider for client-side feature access
- `useFeatureFlag('feature-name')` hook for components
- Features gated by plan: basic, pro, enterprise
- Multi-tenancy flag to enable workspace/organization features

**Feature Flag Structure**:
```typescript
{
  "multi_tenancy": {
    "enabled": false,
    "plans": ["enterprise"]
  },
  "advanced_analytics": {
    "enabled": true,
    "plans": ["pro", "enterprise"]
  },
  "api_access": {
    "enabled": true,
    "plans": ["basic", "pro", "enterprise"],
    "rate_limits": {
      "basic": 100,
      "pro": 1000,
      "enterprise": 10000
    }
  }
}
```

**Usage Example**:
```typescript
// Server-side
const hasFeature = await checkFeatureAccess(userId, 'advanced_analytics')

// Client-side
const { hasFeature } = useFeatureFlag('advanced_analytics')
if (hasFeature) {
  return <AdvancedAnalyticsDashboard />
}
```

### 6. Redis Cache & Rate Limiting

**Purpose**: Improve performance and protect API endpoints from abuse.

**Implementation**:
- Use **Upstash Redis** (serverless, Vercel-compatible, free tier)
- Caching: User profiles, subscription status, feature flags
- Rate limiting: Per-user, per-IP, per-endpoint limits based on plan
- TTL-based cache invalidation
- Cache keys namespaced by tenant (if multi-tenancy enabled)

**Cache Strategy**:
```typescript
// Cache user subscription with 5min TTL
await redis.set(`subscription:${userId}`, subscription, { ex: 300 })

// Cache feature flags with 1hr TTL
await redis.set(`features:${tenantId}`, features, { ex: 3600 })
```

**Rate Limiting**:
```typescript
// Rate limit middleware
export async function rateLimit(req: Request, limit: number) {
  const key = `rate_limit:${userId}:${endpoint}`
  const requests = await redis.incr(key)
  if (requests === 1) await redis.expire(key, 60) // 1min window
  return requests <= limit
}
```

**Environment Variables**:
```
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### 7. Structured Logging

**Purpose**: Enable observability and debugging in production.

**Implementation**:
- Use **pino** (fast, structured JSON logging)
- Log levels: debug, info, warn, error
- Automatic request ID tracking
- Sensitive data redaction (passwords, tokens)
- Vercel integrations for log aggregation

**Logger Setup**:
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'token', 'apiKey'],
  formatters: {
    level: (label) => ({ level: label }),
  },
})
```

**Usage**:
```typescript
logger.info({ userId, action: 'subscription_created' }, 'User subscribed')
logger.error({ error, userId }, 'Payment failed')
```

### 8. Multi-Tenancy Support

**Purpose**: Allow organizations/workspaces when enabled via feature flag.

**Implementation**:
- **Conditional Feature**: Disabled by default, enabled via `multi_tenancy` flag
- If enabled: Users can create/join organizations
- Each organization has its own subscription
- RLS policies filter data by `organization_id`
- Users can switch between personal and organization contexts

**Database Schema** (when enabled):
```sql
-- organizations table
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, unique)
- owner_id (UUID, FK to profiles)
- subscription_id (UUID, FK to subscriptions)
- created_at, updated_at

-- organization_members table
- id (UUID, PK)
- organization_id (UUID, FK to organizations)
- user_id (UUID, FK to profiles)
- role (TEXT: 'owner' | 'admin' | 'member')
- created_at

-- Update existing tables to add organization_id (nullable)
ALTER TABLE projects ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

**UI Considerations**:
- Organization switcher in header (when multi_tenancy enabled)
- Invite members flow (gated by enterprise plan)
- Organization settings page
- Personal vs Organization context filtering

---

## Database Schema

### Core Tables

**1. profiles** (extends auth.users)
```sql
- id (UUID, FK to auth.users)
- email (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- stripe_customer_id (TEXT, nullable)
- created_at, updated_at
```

**2. organizations** (multi-tenancy, conditional)
```sql
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, unique)
- owner_id (UUID, FK to profiles)
- created_at, updated_at
```

**3. organization_members** (multi-tenancy, conditional)
```sql
- id (UUID, PK)
- organization_id (UUID, FK to organizations)
- user_id (UUID, FK to profiles)
- role (TEXT: 'owner' | 'admin' | 'member')
- created_at
```

**4. projects** (sample feature)
```sql
- id (UUID, PK)
- user_id (UUID, FK to profiles)
- organization_id (UUID, FK to organizations, nullable)
- title (TEXT)
- description (TEXT)
- status (TEXT: 'active' | 'archived' | 'completed')
- created_at, updated_at
```

**5. customers** (Stripe integration)
```sql
- id (UUID, PK)
- user_id (UUID, FK to profiles, unique, nullable)
- organization_id (UUID, FK to organizations, nullable)
- stripe_customer_id (TEXT, unique)
- created_at, updated_at
-- Note: Either user_id OR organization_id is set, not both
```

**6. subscriptions**
```sql
- id (UUID, PK)
- user_id (UUID, FK to profiles, nullable)
- organization_id (UUID, FK to organizations, nullable)
- stripe_subscription_id (TEXT, unique)
- stripe_price_id (TEXT)
- status (TEXT: 'active' | 'canceled' | 'past_due' | 'incomplete')
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- cancel_at_period_end (BOOLEAN)
- created_at, updated_at
-- Note: Either user_id OR organization_id is set based on multi_tenancy flag
```

**7. prices** (pricing plans)
```sql
- id (UUID, PK)
- stripe_price_id (TEXT, unique)
- stripe_product_id (TEXT)
- name (TEXT)
- description (TEXT)
- unit_amount (INTEGER, cents)
- currency (TEXT)
- interval (TEXT: 'month' | 'year')
- active (BOOLEAN)
- created_at, updated_at
```

**Row Level Security (RLS)**: Enabled on all tables with policies ensuring users can only access their own data.

---

## Authentication

### Providers
- Email/Password (Supabase Auth)
- Google OAuth
- GitHub OAuth

### Flow
1. User signs up → profile created automatically (via DB trigger)
2. OAuth callback handled at `/api/auth/callback`
3. Middleware refreshes session on every request
4. Protected routes redirect to `/login` if unauthenticated
5. Auth state available via `useUser()` hook

---

## Development Tooling

### Code Quality
- **ESLint**: Next.js config + strict rules
- **Prettier**: Consistent formatting with Tailwind plugin
- **TypeScript**: Strict mode enabled
- **Husky**: Pre-commit (lint-staged) + pre-push (type-check, tests)

### Testing
- **Vitest**: Unit & integration tests with coverage
- **Playwright**: E2E tests for critical flows (auth, payment, CRUD)
- **Coverage Target**: >70% (visible via Codecov)

### CI/CD
- **GitHub Actions**:
  - `ci.yml` - Lint, type-check, test, build on every push
  - `coverage.yml` - Generate and upload coverage reports
  - `upptime.yml` - Health monitoring (every 5min)

---

## Critical Files

### Monorepo Configuration

**`pnpm-workspace.yaml`**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**`turbo.json`**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Root `package.json`**
```json
{
  "name": "AI-Mahakurukshetra",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:coverage": "turbo run test -- --coverage",
    "lint": "turbo run lint",
    "format": "prettier --write .",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### Authentication & Authorization

**`apps/web/middleware.ts`**
- Refreshes Supabase session on every request
- Protects `/dashboard/*` routes (redirects to `/login`)
- Redirects authenticated users away from `/login`, `/signup`
- Uses `@supabase/ssr` for cookie management

**`apps/web/lib/supabase/server.ts`**
- Server-side Supabase client factory
- Handles cookie reading/writing for SSR
- Used in Server Components and Server Actions

**`apps/web/lib/hooks/use-user.ts`**
- Primary hook for accessing current user
- Returns `{ user, loading, error }`
- Used throughout dashboard components

### Stripe Integration

**`apps/web/lib/stripe/client.ts`**
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})
```

**`apps/web/app/api/stripe/webhook/route.ts`**
- Verifies Stripe signature
- Handles events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
- Updates `subscriptions` table based on events
- Returns 200 to acknowledge receipt

**`apps/web/app/(dashboard)/settings/billing/page.tsx`**
- Displays current subscription status
- Shows pricing cards for available plans
- "Upgrade" button creates Stripe Checkout session
- "Manage Subscription" button opens Customer Portal

### API Documentation

**`apps/web/api-specs/openapi.yaml`**
```yaml
openapi: 3.0.0
info:
  title: SaaS Starter API
  version: 1.0.0
  description: Production-ready SaaS API with auth, CRUD, and payments
servers:
  - url: http://localhost:3000
    description: Development
  - url: https://your-app.vercel.app
    description: Production

paths:
  # Reference modular spec files
  $ref:
    - './auth.yaml#/paths'
    - './projects.yaml#/paths'
    - './stripe.yaml#/paths'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**`apps/web/app/api/docs/route.ts`**
- Serves Swagger UI HTML
- Loads and merges OpenAPI specs from `api-specs/` directory
- Public endpoint (no auth required)

### Redis Cache & Rate Limiting

**`apps/web/lib/redis/client.ts`**
```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

**`apps/web/lib/redis/cache.ts`**
```typescript
import { redis } from './client'

export async function getCached<T>(key: string): Promise<T | null> {
  return await redis.get(key)
}

export async function setCache<T>(key: string, value: T, ttl: number) {
  await redis.set(key, value, { ex: ttl })
}

export async function invalidateCache(pattern: string) {
  // Cache invalidation logic
}
```

**`apps/web/lib/redis/rate-limit.ts`**
```typescript
import { redis } from './client'
import { NextRequest } from 'next/server'

export async function rateLimit(req: NextRequest, limit: number, window: number = 60) {
  const userId = req.headers.get('x-user-id') || req.ip
  const key = `rate_limit:${userId}:${req.nextUrl.pathname}`

  const requests = await redis.incr(key)
  if (requests === 1) await redis.expire(key, window)

  return {
    success: requests <= limit,
    remaining: Math.max(0, limit - requests),
  }
}
```

### Feature Flags

**`apps/web/config/features.json`**
```json
{
  "multi_tenancy": {
    "enabled": false,
    "plans": ["enterprise"]
  },
  "advanced_analytics": {
    "enabled": true,
    "plans": ["pro", "enterprise"]
  },
  "api_access": {
    "enabled": true,
    "plans": ["basic", "pro", "enterprise"]
  }
}
```

**`apps/web/lib/feature-flags/hooks.ts`**
```typescript
import { useContext } from 'react'
import { FeatureFlagContext } from './provider'

export function useFeatureFlag(flagName: string) {
  const { flags, subscription } = useContext(FeatureFlagContext)
  const flag = flags[flagName]

  if (!flag || !flag.enabled) return { hasFeature: false }

  const hasFeature = flag.plans.includes(subscription?.plan || 'basic')
  return { hasFeature }
}
```

### Structured Logging

**`apps/web/lib/logger/index.ts`**
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: ['password', 'token', 'apiKey', 'stripe_key'],
    remove: true,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  }),
})
```

### Input Validation

**`apps/web/lib/validations/projects.ts`**
```typescript
import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived', 'completed']).default('active'),
  organization_id: z.string().uuid().optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
```

### Status Monitoring

**`.upptimerc.yml`**
```yaml
owner: your-username
repo: AI-Mahakurukshetra
sites:
  - name: Production App
    url: https://your-app.vercel.app/api/health
    maxResponseTime: 5000
  - name: API Documentation
    url: https://your-app.vercel.app/api/docs
status-website:
  cname: status.your-domain.com # Optional custom domain
  name: SaaS Starter Status
  theme: light
```

**`apps/web/app/api/health/route.ts`**
```typescript
import { logger } from '@/lib/logger'
import { redis } from '@/lib/redis/client'

export async function GET() {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
  }

  // Check DB connection
  try {
    const { error } = await supabase.from('profiles').select('count').single()
    checks.database = error ? 'disconnected' : 'connected'
  } catch (e) {
    checks.database = 'error'
    logger.error({ error: e }, 'Database health check failed')
  }

  // Check Redis connection
  try {
    await redis.ping()
    checks.redis = 'connected'
  } catch (e) {
    checks.redis = 'disconnected'
    logger.error({ error: e }, 'Redis health check failed')
  }

  const isHealthy = checks.database === 'connected' && checks.redis === 'connected'

  return Response.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    ...checks,
    version: '1.0.0',
  }, {
    status: isHealthy ? 200 : 503
  })
}
```

---

## Environment Variables

### Required for Development

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SaaS Starter

# Logging
LOG_LEVEL=info  # debug | info | warn | error

# Feature Flags
NEXT_PUBLIC_MULTI_TENANCY_ENABLED=false  # Set to true for multi-tenant mode

# Codecov (CI only)
CODECOV_TOKEN=your_codecov_token
```

### Required for Production (Vercel)

- All of the above, but with production Supabase and Stripe keys
- Stripe webhook secret from production webhook endpoint
- NEXT_PUBLIC_SITE_URL set to Vercel domain

---

## Implementation Order

### Phase 1: Monorepo Foundation (Day 1)

1. **Initialize Turborepo with PNPM**
   ```bash
   npx create-turbo@latest --package-manager pnpm
   # Configure for Next.js 16 in apps/web
   ```

2. **Setup Next.js in `apps/web`**
   ```bash
   cd apps/web
   pnpm create next-app . --typescript --tailwind --app
   ```

3. **Configure shared packages**
   - `packages/tsconfig` with base configs
   - `packages/database` placeholder
   - `packages/stripe` placeholder

4. **Setup development tools**
   ```bash
   pnpm add -D -w prettier eslint-config-prettier prettier-plugin-tailwindcss
   pnpm add -D -w husky lint-staged
   pnpm add -D -w vitest @vitest/ui @vitejs/plugin-react jsdom
   pnpm add -D -w @playwright/test
   ```

5. **Initialize Supabase**
   ```bash
   pnpm add -D supabase
   npx supabase init
   npx supabase start
   ```

### Phase 2: Core Infrastructure (Day 2)

6. **Database schema & migrations**
   - Create initial migration with profiles table
   - Create organizations migration (with multi_tenancy flag check)
   - Create projects table (with organization_id support)
   - Add RLS policies (tenant-aware if multi_tenancy enabled)
   - Add DB triggers (auto-create profile on signup)

7. **Supabase client setup**
   ```bash
   cd apps/web
   pnpm add @supabase/supabase-js @supabase/ssr
   ```
   - Create `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
   - Generate types: `npx supabase gen types typescript --local > lib/supabase/database.types.ts`

8. **Next.js middleware**
   - Implement auth middleware with session refresh
   - Configure protected/public route matchers

### Phase 3: Authentication (Day 3)

9. **Setup shadcn/ui**
   ```bash
   cd apps/web
   npx shadcn@latest init
   npx shadcn@latest add button input label form card toast
   ```

10. **Build auth components**
    - `components/auth/login-form.tsx`
    - `components/auth/signup-form.tsx`
    - `components/auth/oauth-buttons.tsx`

11. **Create auth pages**
    - `app/(auth)/login/page.tsx`
    - `app/(auth)/signup/page.tsx`
    - `app/(auth)/auth/callback/route.ts`

12. **Auth utilities & validation**
    - `lib/hooks/use-user.ts`
    - `lib/hooks/use-auth.ts`
    - `lib/validations/auth.ts` (Zod schemas for login/signup)
    - `lib/validations/common.ts` (Shared Zod schemas)

13. **Configure OAuth in Supabase**
    - Enable Google & GitHub providers
    - Set redirect URLs

### Phase 3.5: Redis, Logging & Feature Flags (Day 3.5)

14. **Setup Redis (Upstash)**
    ```bash
    cd apps/web
    pnpm add @upstash/redis
    ```
    - Create Upstash account and Redis database
    - `lib/redis/client.ts` - Redis client setup
    - `lib/redis/cache.ts` - Cache utilities with TTL
    - `lib/redis/rate-limit.ts` - Rate limiting middleware

15. **Structured Logging**
    ```bash
    pnpm add pino pino-pretty
    ```
    - `lib/logger/index.ts` - Logger configuration
    - Add request ID middleware
    - Configure log redaction for sensitive data

16. **Feature Flags System**
    - `config/features.json` - Feature definitions with plan requirements
    - `lib/feature-flags/config.ts` - Feature flag loader
    - `lib/feature-flags/provider.tsx` - React context
    - `lib/feature-flags/hooks.ts` - `useFeatureFlag` hook
    - Server-side feature check utilities

### Phase 4: Stripe Integration (Day 4)

17. **Database schema for subscriptions** (moved from 15)
    - Create migration: `npx supabase migration new subscriptions`
    - Add customers, subscriptions, prices tables
    - Support both user_id and organization_id (for multi-tenancy)

18. **Install Stripe**
    ```bash
    cd apps/web
    pnpm add stripe @stripe/stripe-js
    ```

19. **Stripe setup**
    - `lib/stripe/client.ts` (server-side Stripe client)
    - `lib/stripe/plans.ts` (pricing configuration)
    - `lib/stripe/webhooks.ts` (event handlers)
    - `lib/validations/stripe.ts` (Zod schemas for webhook events)

20. **Stripe API routes**
    - `app/api/stripe/checkout/route.ts` - Create checkout session (with rate limiting)
    - `app/api/stripe/portal/route.ts` - Customer portal session
    - `app/api/stripe/webhook/route.ts` - Webhook handler (validated with Zod)

21. **Billing UI**
    - `app/(dashboard)/settings/billing/page.tsx`
    - `components/billing/pricing-cards.tsx` (feature-flag aware)
    - `components/billing/subscription-status.tsx`

22. **Test Stripe locally**
    ```bash
    stripe listen --forward-to localhost:3000/api/stripe/webhook
    # Get webhook secret and add to .env.local
    ```

### Phase 5: Dashboard & Sample Feature (Day 5)

23. **Install dashboard UI components**
    ```bash
    npx shadcn@latest add dropdown-menu avatar separator skeleton badge table
    ```

24. **Dashboard layout**
    - `app/(dashboard)/layout.tsx`
    - `components/dashboard/sidebar.tsx` (feature-flag aware menu items)
    - `components/dashboard/header.tsx`
    - `components/dashboard/user-nav.tsx`
    - `components/dashboard/org-switcher.tsx` (if multi_tenancy enabled)

25. **Dashboard page**
    - `app/(dashboard)/dashboard/page.tsx` (with cached data)

26. **Projects feature (sample CRUD)**
    - `app/(dashboard)/projects/page.tsx` (list, tenant-filtered)
    - `app/(dashboard)/projects/[id]/page.tsx` (detail)
    - `app/api/projects/route.ts` (GET, POST with Zod validation & rate limiting)
    - `app/api/projects/[id]/route.ts` (GET, PUT, DELETE with validation)
    - `lib/actions/projects.ts` (Server Actions with logging)
    - `lib/hooks/use-projects.ts`
    - `lib/validations/projects.ts` (Zod schemas)

### Phase 6: API Documentation (Day 6)

27. **Install Swagger UI**
    ```bash
    cd apps/web
    pnpm add swagger-ui-react
    pnpm add -D @types/swagger-ui-react
    ```

28. **Create OpenAPI specifications**
    - `api-specs/openapi.yaml` - Main spec with $ref to other files
    - `api-specs/auth.yaml` - Auth endpoints specification
    - `api-specs/projects.yaml` - Projects CRUD specification
    - `api-specs/stripe.yaml` - Payment endpoints specification
    - Define schemas for all request/response types

29. **Swagger UI endpoint**
    - `app/api/docs/route.ts` - Serve Swagger UI with OpenAPI spec
    - Load and merge YAML files server-side

30. **Test API documentation**
    - Visit `http://localhost:3000/api/docs`
    - Verify all endpoints are documented
    - Test API calls from Swagger UI

### Phase 7: Testing & Coverage (Day 7)

31. **Configure Vitest**
    - Create `vitest.config.ts` in `apps/web`
    - Enable coverage with `c8` or `istanbul`

32. **Write tests**
    - `tests/unit/lib/validations/*.test.ts` (Zod schema tests)
    - `tests/unit/lib/feature-flags.test.ts`
    - `tests/integration/auth.test.ts`
    - `tests/integration/rate-limit.test.ts`
    - `tests/e2e/auth.spec.ts`
    - `tests/e2e/checkout.spec.ts`

33. **Setup Codecov**
    - Create account at codecov.io
    - Add repo and get upload token
    - Create `.github/workflows/coverage.yml`
    - Add Codecov badge to README

### Phase 8: Status Page & Monitoring (Day 8)

34. **Setup Upptime**
    ```bash
    npx @upptime/uptime-monitor
    ```
    - Configure `.upptimerc.yml`
    - Add health check endpoint
    - Push to GitHub to trigger first check

35. **Health check API**
    - `app/api/health/route.ts` - Check DB, Redis, return status with logging

36. **Verify status page**
    - Check GitHub Pages is enabled
    - Visit status page URL
    - Confirm monitoring is working

### Phase 9: CI/CD & Deployment (Day 9 - Before Hackathon)

37. **GitHub Actions**
    - `.github/workflows/ci.yml` - Full CI pipeline (lint, test, build)
    - `.github/workflows/coverage.yml` - Coverage upload

38. **Vercel deployment**
    - Connect repo to Vercel
    - Configure environment variables (Supabase, Stripe, Redis, flags)
    - Test automatic deployments
    - Configure production Supabase project
    - Configure production Stripe webhook
    - Setup Upstash Redis database

39. **Final verification**
    - Test complete user flow: signup → subscribe → use app
    - Verify rate limiting works
    - Check feature flags toggle correctly
    - Test multi-tenancy if enabled
    - Verify all public endpoints (docs, status, coverage)
    - Check all integrations work in production
    - Verify logs are structured and readable

---

## Verification Steps

### Local Development

1. **Database**: `npx supabase db reset` → tables created with RLS
2. **Redis**: Test connection → caching and rate limiting work
3. **Auth**: Sign up, log in, OAuth, password reset all work
4. **Stripe**: Create checkout → complete payment → subscription active
5. **Feature Flags**: Toggle features → UI updates based on plan
6. **Swagger**: Visit `/api/docs` → all endpoints documented
7. **Rate Limiting**: Exceed limit → receive 429 responses
8. **Logging**: Check logs → structured JSON with request IDs
9. **Validation**: Send invalid data → Zod validation errors returned
10. **Tests**: `pnpm test:coverage` → >70% coverage
11. **Build**: `pnpm build` → no errors
12. **Type-check**: `pnpm type-check` → no errors

### Production

13. **Deployment**: Push to main → auto-deploys to Vercel
14. **Redis**: Upstash connection works → cache hit/miss tracked
15. **Auth**: OAuth redirects work with production URLs
16. **Stripe**: Webhooks received at production endpoint
17. **Feature Flags**: Production flags load from config
18. **Swagger**: Public docs accessible at `your-app.vercel.app/api/docs`
19. **Rate Limiting**: Production limits enforced correctly
20. **Logging**: Vercel logs show structured JSON
21. **Multi-tenancy**: If enabled, organization features work
22. **Codecov**: Coverage badge shows in README
23. **Upptime**: Status page shows uptime history for DB and Redis

### For Judges

**Share these public URLs:**
- **App**: `https://your-app.vercel.app`
- **API Docs**: `https://your-app.vercel.app/api/docs`
- **Status Page**: `https://your-username.github.io/AI-Mahakurukshetra/`
- **Coverage Report**: `https://codecov.io/gh/your-username/AI-Mahakurukshetra`

---

## Success Criteria

✅ Monorepo architecture with Turborepo + PNPM
✅ Complete auth system (Email + Google + GitHub OAuth)
✅ Full Stripe integration (checkout, webhooks, billing UI)
✅ Public Swagger/OpenAPI documentation (modular YAML specs)
✅ Public code coverage reports (Codecov)
✅ Public status page (Upptime)
✅ Sample CRUD feature (Projects) with tenant support
✅ Feature flags system based on subscription plans
✅ Redis caching and rate limiting (Upstash)
✅ Structured logging with pino
✅ Zod validation for all inputs/outputs
✅ Multi-tenancy support (optional, feature-flag controlled)
✅ Production-grade tooling (ESLint, Prettier, Husky, tests)
✅ Fully deployed on Vercel
✅ Ready for rapid feature development on March 14th

---

## Post-Scaffold: Hackathon Day Strategy

Once this boilerplate is ready, on **March 14th** you can rapidly build features by:

1. **Duplicate patterns**: Copy `projects/` folder structure to create new features
2. **Reuse components**: All shadcn/ui components ready to use
3. **Fast prototyping**: Server Actions + hooks pattern enables quick iteration
4. **Skip infrastructure**: Auth, payments, caching, logging all configured
5. **Feature gating**: Use `useFeatureFlag` to restrict features by plan
6. **Validated APIs**: Copy Zod schemas pattern for type-safe validation
7. **Rate limiting**: Apply `rateLimit` middleware to protect endpoints
8. **API documentation**: Add new endpoints to YAML specs in `api-specs/`
9. **Tenant awareness**: Projects automatically filter by user/organization
10. **Tests optional for MVP**: Coverage infrastructure exists, add tests later if time

The goal of this boilerplate is to eliminate all infrastructure work so you can spend 100% of hackathon time on your unique SaaS idea. Good luck! 🚀
