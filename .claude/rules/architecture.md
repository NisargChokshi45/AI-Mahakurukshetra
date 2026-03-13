# Architecture Guidelines

## System Design Principles

### Monorepo Structure

```
AI-Mahakurukshetra/
├── apps/web/              # Main Next.js application
├── packages/              # Shared packages
│   ├── database/         # Supabase types & schemas
│   ├── stripe/           # Stripe utilities
│   └── tsconfig/         # Shared TypeScript configs
├── supabase/             # Database migrations
└── tests/                # Test suites
```

**Rules:**
- Apps are independent deployable units
- Packages are shared, reusable libraries
- No circular dependencies between packages
- Apps can depend on packages, not vice versa

### Component Architecture

**Server Components (Default)**
```typescript
// Use for:
// - Data fetching
// - Static content
// - SEO-critical pages
// - Non-interactive UI

export default async function Page() {
  const data = await fetchData()
  return <View data={data} />
}
```

**Client Components (When Needed)**
```typescript
'use client'

// Use only for:
// - User interactions (onClick, onChange)
// - Browser APIs (localStorage, window)
// - React hooks (useState, useEffect)
// - Third-party libraries requiring browser

export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={...}>
}
```

### Data Flow Patterns

**Read Operations**
```
Server Component
  → Supabase Client (with cookies)
    → RLS-filtered query
      → Return data
```

**Write Operations**
```
Client Component
  → Server Action
    → Validate with Zod
      → Check auth & permissions
        → Supabase mutation
          → revalidatePath()
            → Return result
```

**API Routes (External Access)**
```
API Route Handler
  → Rate Limit Check (Redis)
    → Auth Verification
      → Zod Validation
        → Business Logic
          → Database Operation
            → Structured Response
```

## Database Architecture

### Row Level Security (RLS)

**Every user-scoped table MUST have:**
1. RLS enabled
2. Policies for SELECT, INSERT, UPDATE, DELETE
3. Proper `auth.uid()` checks

**Multi-tenant pattern:**
```sql
-- User can see their own data OR org data they're a member of
CREATE POLICY resource_select ON resources
  FOR SELECT USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

### Indexing Strategy

**Always index:**
- Foreign keys
- Columns in WHERE clauses
- Columns in ORDER BY
- Columns used in JOINs

**Consider composite indexes for:**
- Multi-column WHERE clauses
- Covering indexes (include SELECT columns)

### Migration Strategy

1. **Development**: Use Supabase local instance
2. **Testing**: Reset and apply all migrations
3. **Staging**: Apply migrations to staging DB
4. **Production**: Apply after thorough testing

**Never:**
- Modify existing migrations
- Skip migrations
- Deploy migrations with code simultaneously (migrate first)

## API Design

### RESTful Conventions

```
GET    /api/resources          List all
GET    /api/resources/[id]     Get one
POST   /api/resources          Create
PUT    /api/resources/[id]     Update (full)
PATCH  /api/resources/[id]     Update (partial)
DELETE /api/resources/[id]     Delete
```

### Response Format

**Success:**
```typescript
{
  data: T,
  meta?: {
    total: number
    page: number
    pageSize: number
  }
}
```

**Error:**
```typescript
{
  error: string,
  details?: unknown,
  code?: string
}
```

### Rate Limiting Tiers

```typescript
const RATE_LIMITS = {
  basic: 100,        // req/hour
  pro: 1000,         // req/hour
  enterprise: 10000, // req/hour
}
```

## Security Architecture

### Defense in Depth

1. **Client**: Input validation (UX)
2. **Server**: Zod validation (security)
3. **Database**: RLS policies (last line of defense)
4. **Network**: Rate limiting (abuse prevention)

### Authentication Flow

```
User Login
  → Supabase Auth
    → JWT issued
      → Cookie set (httpOnly, secure, sameSite)
        → Middleware refreshes on each request
          → Session available to Server Components
```

### Authorization Layers

1. **Route Level**: Middleware protects routes
2. **API Level**: Check auth in route handlers
3. **Database Level**: RLS enforces access control
4. **Feature Level**: Feature flags check plan access

## Caching Strategy

### Cache Levels

**1. Redis Cache (Application Level)**
```typescript
// User subscriptions (5min TTL)
const subscription = await getCached(`subscription:${userId}`)

// Feature flags (1hr TTL)
const features = await getCached(`features:${tenantId}`)
```

**2. Next.js Cache (React Cache)**
```typescript
// Automatic caching for fetch() in Server Components
// Revalidate with revalidatePath() or revalidateTag()
```

**3. CDN Cache (Vercel)**
```typescript
// Static assets automatically cached
// API routes cached with Cache-Control headers
export const revalidate = 3600 // 1 hour
```

### Cache Invalidation

**On data mutation:**
```typescript
await supabase.from('projects').insert(...)

// Invalidate cache
await invalidateCache(`user:${userId}:projects`)

// Revalidate Next.js cache
revalidatePath('/projects')
```

## Error Handling

### Error Boundaries

```
Application
  ├── Global Error Boundary (app/error.tsx)
  ├── Route Error Boundaries (app/[route]/error.tsx)
  └── Component Error Boundaries (components/error-boundary.tsx)
```

### Logging Strategy

**Log Levels:**
- `debug`: Development details
- `info`: Important events (user actions)
- `warn`: Unexpected but handled
- `error`: Failures requiring attention

**Always log:**
- Authentication events
- Payment events
- Failed API calls
- Database errors
- Rate limit hits
- Feature flag checks (for analytics)

**Never log:**
- Passwords
- API keys
- Tokens
- Credit card data
- Personal identifying information (mask/redact)

## Performance Optimization

### Bundle Optimization

- ✅ Dynamic imports for large components
- ✅ Next.js Image component for all images
- ✅ Font optimization with next/font
- ✅ Tree-shaking via ES modules
- ✅ Code splitting by route

### Database Optimization

- ✅ Use indexes for frequent queries
- ✅ Limit result sets (pagination)
- ✅ Select only needed columns
- ✅ Use connection pooling (pgBouncer)
- ✅ Avoid N+1 queries (use joins or batch)

### Runtime Performance

- ✅ Server Components for static content
- ✅ Suspense boundaries for loading states
- ✅ Streaming for large responses
- ✅ Parallel data fetching when possible
- ✅ Memoization for expensive calculations

## Testing Architecture

### Test Pyramid

```
        /\
       /  \  E2E (10%)
      /____\
     /      \  Integration (30%)
    /________\
   /          \  Unit (60%)
  /__________\
```

**Unit Tests:** Pure functions, utilities, validations
**Integration Tests:** API routes, Server Actions, database
**E2E Tests:** Critical user journeys only

### Test Organization

```
tests/
├── unit/
│   ├── lib/
│   │   ├── validations/
│   │   └── utils/
│   └── components/
├── integration/
│   ├── api/
│   ├── actions/
│   └── database/
└── e2e/
    ├── auth.spec.ts
    ├── checkout.spec.ts
    └── projects.spec.ts
```

## Deployment Architecture

### Environment Progression

```
Local Development
  → Feature Branch
    → Pull Request (CI runs)
      → Vercel Preview
        → Code Review
          → Merge to main
            → Vercel Production
```

### Zero-Downtime Deployments

1. New version deployed alongside old
2. Health check passes
3. Traffic gradually shifted
4. Old version drained and removed

### Rollback Strategy

- Vercel: Instant rollback to previous deployment
- Database: Manual rollback using migration comments
- Feature Flags: Toggle features off without deployment

## Monitoring Architecture

### Observability Stack

1. **Logs**: Structured JSON via pino → Vercel logs
2. **Metrics**: Upptime for uptime → GitHub Pages
3. **Tracing**: Web vitals → Console
4. **Errors**: Try/catch → pino.error → Vercel

### Health Checks

```typescript
/api/health
  ├── Database connectivity
  ├── Redis connectivity
  ├── External API status (optional)
  └── System version
```

### Alerts

- ❌ Health check fails (Upptime)
- ❌ Test failures (GitHub Actions)
- ❌ Coverage drops (Codecov)
- ❌ Build failures (Vercel)
- ⚠️  High error rate (manual monitoring)

## Scalability Considerations

### Horizontal Scaling

- ✅ Stateless API routes (no local state)
- ✅ Redis for shared state
- ✅ Database connection pooling
- ✅ Serverless-friendly architecture

### Database Scaling

- ✅ Read replicas for read-heavy workloads
- ✅ Connection pooling (pgBouncer)
- ✅ Query optimization with indexes
- ✅ Materialized views for complex queries
- ✅ Partitioning for large tables

### Cost Optimization

- ✅ Cache frequently accessed data
- ✅ Rate limiting prevents abuse
- ✅ Efficient database queries
- ✅ Image optimization (next/image)
- ✅ Static generation where possible

## Anti-Patterns to Avoid

### ❌ Don't

- Mix server/client code in same file (except 'use server')
- Fetch data in Client Components (use Server Components)
- Store sensitive data in client state
- Skip input validation
- Bypass RLS with service role key in API routes
- Create circular dependencies
- Commit secrets to Git
- Skip tests for critical flows
- Ignore ESLint/TypeScript errors
- Over-engineer simple solutions

### ✅ Do

- Use Server Components by default
- Validate all inputs with Zod
- Enable RLS on all user tables
- Apply rate limiting to API routes
- Log important events
- Test critical paths
- Follow principle of least privilege
- Keep it simple (KISS)
- Favor composition over inheritance
- Write self-documenting code
