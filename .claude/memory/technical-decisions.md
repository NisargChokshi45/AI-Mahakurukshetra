---
name: technical-decisions
description: Key technical decisions and their rationale for the project
type: project
---

# Technical Decisions

## Architecture Decisions

### Monorepo with Turborepo
**Decision**: Use Turborepo for monorepo management

**Why:**
- Demonstrates architectural maturity for judges
- Enables shared packages (database types, Stripe utils)
- Better build orchestration and caching
- Scales well if project grows post-hackathon

**How to apply:**
- Keep apps independent
- Share code via packages
- Use turbo for build/test/lint commands

---

### Multi-Tenancy as Feature Flag
**Decision**: Support multi-tenancy but disable by default

**Why:**
- Flexibility without complexity
- Can enable per customer needs
- Demonstrates advanced architecture
- Database schema supports both models

**How to apply:**
- Check `NEXT_PUBLIC_MULTI_TENANCY_ENABLED` flag
- Use `organization_id` column (nullable)
- RLS policies handle both personal and org contexts

---

### Redis for Caching & Rate Limiting
**Decision**: Use Upstash Redis instead of alternatives

**Why:**
- Serverless-compatible (works on Vercel)
- Free tier sufficient for demo
- Simple REST API
- Better than in-memory (works across serverless instances)

**How to apply:**
- Cache user subscriptions, feature flags
- Apply rate limiting per endpoint
- Use TTL for automatic expiration
- Fail open if Redis is down (graceful degradation)

---

### OpenAPI in Separate YAML Files
**Decision**: Keep API specs in modular YAML files, not JSDoc

**Why:**
- Keeps backend code clean
- Easier to maintain and review
- Enables better composition with $ref
- Judges can easily access public docs

**How to apply:**
- Create separate YAML per domain (auth, projects, stripe)
- Main openapi.yaml references all specs
- Serve via /api/docs endpoint
- Update specs when adding/changing endpoints

---

### Zod for All Validation
**Decision**: Use Zod for both client and server validation

**Why:**
- Single source of truth
- Type safety with TypeScript
- Runtime validation
- Great error messages
- Works in both browser and Node

**How to apply:**
- Define schema for all inputs
- Use in react-hook-form (client)
- Validate in API routes (server)
- Export inferred types

---

### Server Components by Default
**Decision**: Use Server Components unless client interactivity needed

**Why:**
- Better performance (less JS to client)
- SEO benefits
- Simpler data fetching
- Recommended by Next.js team

**How to apply:**
- Default to Server Components
- Only use 'use client' for:
  - User interactions (onClick, onChange)
  - Browser APIs (localStorage)
  - React hooks (useState, useEffect)
  - Third-party components requiring browser

---

## Trade-offs Made

### Coverage Target: 70% (not 90%)
**Why:**
- Balance between quality and speed
- Focus on critical paths
- Sufficient for hackathon demo
- Can increase post-hackathon

### Logging: pino (not advanced APM)
**Why:**
- Lightweight and fast
- Structured JSON logging
- Built-in redaction
- Sufficient for current scale
- Can upgrade to Datadog/Sentry later

### Status Page: Upptime (not paid service)
**Why:**
- Free and open source
- GitHub Actions-based
- Simple GitHub Pages hosting
- Good enough for demo
- Professional appearance

---

## Patterns to Follow

### Error Handling
Always return consistent error format:
```typescript
{
  error: string,
  details?: unknown,
  code?: string
}
```

### API Responses
Always include data wrapper:
```typescript
{
  data: T,
  meta?: { total, page, pageSize }
}
```

### Feature Flags
Always check before using features:
```typescript
const hasFeature = await checkFeatureAccess(userId, 'feature-name')
```

### Rate Limiting
Always apply to API routes based on plan:
```typescript
const result = await rateLimitByPlan(req, userPlan)
```

---

## Future Considerations

Things we might add post-hackathon:
- Real-time features (Supabase Realtime)
- Advanced analytics dashboard
- Email notification system
- Webhook system for customers
- More sophisticated multi-tenancy (RBAC)
- Audit logs
- Data export features
- Internationalization (i18n)
