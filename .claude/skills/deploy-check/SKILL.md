---
name: deploy-check
description: Run pre-deployment verification checklist
---

# Deployment Check Skill

Runs comprehensive pre-deployment verification to ensure production readiness.

## Usage

```
/deploy-check
```

## Verification Steps

### 1. Code Quality

- [ ] **Linting**: ESLint passes with no errors
- [ ] **Formatting**: Prettier check passes
- [ ] **Type Checking**: TypeScript compiles with no errors
- [ ] **Tests**: All unit, integration, and E2E tests pass
- [ ] **Coverage**: Code coverage meets threshold (>70%)

### 2. Build Verification

- [ ] **Build Success**: `pnpm build` completes without errors
- [ ] **Bundle Size**: No unexpected increases in bundle size
- [ ] **Environment Variables**: All required vars are set
- [ ] **Type Safety**: No type errors in production build

### 3. Database

- [ ] **Migrations**: All migrations applied successfully
- [ ] **RLS Policies**: Enabled on all user tables
- [ ] **Indexes**: Foreign keys have indexes
- [ ] **Seed Data**: Test data available if needed

### 4. Integration Tests

- [ ] **API Routes**: All endpoints responding correctly
- [ ] **Authentication**: Login/signup flows work
- [ ] **Stripe**: Checkout creates sessions successfully
- [ ] **Webhooks**: Webhook handlers process events
- [ ] **Redis**: Cache and rate limiting functional

### 5. Configuration

- [ ] **Environment Variables**: All production vars set in Vercel
- [ ] **Stripe Webhooks**: Production webhook endpoint configured
- [ ] **Supabase**: Production project configured
- [ ] **Redis**: Upstash production database ready
- [ ] **Feature Flags**: Production flags configured

### 6. Monitoring

- [ ] **Health Endpoint**: `/api/health` returns 200
- [ ] **Upptime**: Status page monitoring configured
- [ ] **Codecov**: Coverage upload working
- [ ] **Error Tracking**: Logs properly structured
- [ ] **Alerts**: Critical alerts configured

### 7. Security

- [ ] **Secrets**: No secrets in code or commits
- [ ] **RLS**: Row Level Security enabled
- [ ] **Rate Limiting**: Applied to API endpoints
- [ ] **Input Validation**: Zod schemas on all inputs
- [ ] **CORS**: Proper CORS headers configured
- [ ] **CSP**: Content Security Policy set

### 8. Documentation

- [ ] **OpenAPI**: API docs up to date at `/api/docs`
- [ ] **README**: Updated with deployment info
- [ ] **Environment**: `.env.example` includes all vars

## Commands Run

```bash
# Linting
pnpm lint

# Type check
pnpm type-check

# Tests
pnpm test:coverage

# Build
pnpm build

# E2E (optional, takes longer)
pnpm test:e2e
```

## Output

The skill provides:
1. ✅ Green checkmarks for passing checks
2. ❌ Red X for failing checks
3. ⚠️  Warnings for optional items
4. 📊 Summary report
5. 🚀 Go/No-Go deployment recommendation

## Example Output

```
🔍 Running Deployment Verification...

Code Quality
  ✅ ESLint passed
  ✅ Prettier check passed
  ✅ TypeScript compiled
  ✅ Tests passed (143/143)
  ✅ Coverage: 78% (threshold: 70%)

Build
  ✅ Production build successful
  ✅ Bundle size: 245KB (within limits)
  ✅ Environment variables validated

Database
  ✅ Migrations applied (5 migrations)
  ✅ RLS enabled on all tables
  ✅ Indexes verified

Integration
  ✅ API routes responding
  ✅ Auth flow working
  ✅ Stripe integration functional
  ⚠️  Redis connection slow (300ms)

Security
  ✅ No secrets in code
  ✅ RLS policies active
  ✅ Rate limiting configured
  ✅ Input validation present

📊 Summary: 27/28 checks passed, 1 warning

🚀 DEPLOYMENT APPROVED - Ready for production!

⚠️  Warning: Redis connection latency is higher than expected.
   Consider switching to a closer region or upgrading plan.
```

## Failure Handling

If any critical check fails:
1. ❌ Deployment NOT recommended
2. 🔍 Detailed error information provided
3. 💡 Suggested fixes
4. 🔗 Links to relevant documentation

## Best Practices

Run this skill:
- ✅ Before every production deployment
- ✅ After major feature additions
- ✅ When environment changes
- ✅ As part of CI/CD pipeline
