# Performance Targets

## Overview

Performance targets ensure fast, responsive user experience critical for hackathon judging and production quality.

## Core Web Vitals (Must Pass)

### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- **Acceptable**: 2.5-4.0 seconds
- **Poor**: > 4.0 seconds

**What to optimize**:
- Server Component data fetching
- Image optimization with next/image
- Font loading with next/font
- Remove render-blocking resources

### First Input Delay (FID)
- **Target**: < 100ms
- **Acceptable**: 100-300ms
- **Poor**: > 300ms

**What to optimize**:
- Minimize JavaScript execution
- Code splitting by route
- Defer non-critical scripts
- Use Server Components by default

### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- **Acceptable**: 0.1-0.25
- **Poor**: > 0.25

**What to optimize**:
- Set explicit width/height on images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use skeleton loaders

## API Response Times

### REST API Endpoints

**Target Performance**:
```
p50 (median):  < 200ms
p95:           < 500ms
p99:           < 1000ms
Timeout:       5000ms (5s)
```

**By Operation Type**:
- **Read operations** (GET): < 100ms
- **Write operations** (POST/PUT): < 300ms
- **Complex queries**: < 500ms
- **Batch operations**: < 1000ms

**Checklist**:
- ✅ Use database indexes on queried columns
- ✅ Limit result sets with pagination
- ✅ Cache frequently accessed data (Redis)
- ✅ Avoid N+1 queries
- ✅ Use connection pooling

### AI Endpoints (Special Case)

**Target Performance**:
```
Time to First Token:  < 2s
Streaming enabled:    Required
Max timeout:          30s
User feedback:        Show progress within 500ms
```

**Requirements**:
- ✅ Enable streaming for AI responses
- ✅ Show loading state immediately
- ✅ Display "thinking" indicator within 500ms
- ✅ Stream tokens as they arrive (don't wait for completion)
- ✅ Handle timeouts gracefully with retry option

**Error States**:
- Timeout after 30s with helpful message
- Show retry button
- Log AI failures for monitoring

## Database Performance

### Query Execution Time

**Target**:
- **Simple queries**: < 10ms
- **Join queries**: < 50ms
- **Complex aggregations**: < 100ms
- **Full-text search**: < 200ms

**Requirements**:
- ✅ Add indexes on foreign keys
- ✅ Add indexes on WHERE clause columns
- ✅ Add indexes on ORDER BY columns
- ✅ Use composite indexes for multi-column queries
- ✅ Monitor with EXPLAIN ANALYZE

### Connection Pooling

**Settings** (Supabase):
```
Min connections: 2
Max connections: 10 (per serverless function)
Idle timeout: 10s
```

**Use pgBouncer** for connection pooling in production.

## Bundle Size Targets

### JavaScript Bundles

**Target**:
```
Initial bundle (FCP):    < 200KB (gzipped)
Total JS:                < 300KB (gzipped)
Per route chunk:         < 50KB (gzipped)
```

**Optimization Checklist**:
- ✅ Dynamic imports for heavy components
- ✅ Tree-shaking enabled (ES modules)
- ✅ Remove unused dependencies
- ✅ Use next/dynamic for client-only components
- ✅ Analyze bundle with `pnpm build --analyze`

**Monitor**:
```bash
# Check bundle size after each build
pnpm build
# Look for warnings about large bundles
```

### Image Optimization

**Target**:
```
Hero images:     < 100KB
Thumbnails:      < 20KB
Icons:           < 5KB (use SVG)
```

**Requirements**:
- ✅ Use next/image for all images
- ✅ Use WebP format
- ✅ Specify width/height
- ✅ Use appropriate quality (75-80)
- ✅ Lazy load below-the-fold images

## Memory Usage

### Server Memory

**Target**:
```
Per request:     < 50MB
Idle memory:     < 100MB
Peak memory:     < 200MB
```

**Avoid**:
- ❌ Loading large files into memory
- ❌ Unbounded arrays/collections
- ❌ Memory leaks from event listeners

### Client Memory

**Target**:
```
Initial load:    < 50MB
After navigation: < 100MB
```

**Monitor**:
- Use Chrome DevTools Memory profiler
- Check for memory leaks on navigation
- Clean up subscriptions in useEffect

## Time to Interactive (TTI)

### Target

**Desktop**: < 3.0 seconds
**Mobile**: < 5.0 seconds

**Optimization**:
- ✅ Server-side rendering with Server Components
- ✅ Minimize client-side JavaScript
- ✅ Code split by route
- ✅ Preload critical resources
- ✅ Use Suspense for data loading

## Build Performance

### Build Time

**Target**:
```
Development build:   < 10s
Production build:    < 60s
Rebuild (HMR):       < 3s
```

**If builds are slow**:
- Check for large dependencies
- Use Turbopack (Next.js 15+)
- Reduce number of pages
- Optimize image processing

## Caching Strategy

### CDN Cache (Vercel Edge)

**Static assets**: 1 year (immutable)
**API routes**: No cache (or short TTL)
**Server Components**: Per-route revalidation

### Application Cache (Redis)

**User sessions**: 5 minutes
**Subscription data**: 5 minutes
**Feature flags**: 1 hour
**Static config**: 24 hours

**Cache invalidation**:
- On data mutation
- Manual purge option
- Time-based expiry

## Monitoring Targets

### Uptime

**Target**: 99.9% (allows ~43 minutes downtime/month)

### Error Rate

**Target**: < 0.1% of requests
**Critical**: < 0.01% for auth/payment flows

### Apdex Score

**Target**: > 0.94 (Excellent)
```
T threshold: 500ms
Satisfied:   < 500ms
Tolerating:  500ms - 2000ms
Frustrated:  > 2000ms
```

## Real User Monitoring (RUM)

### Metrics to Track

**Page Load**:
- Time to First Byte (TTFB): < 600ms
- First Contentful Paint (FCP): < 1.8s
- Time to Interactive (TTI): < 3.8s

**User Interactions**:
- Click response: < 100ms
- Form submission: < 300ms
- Navigation: < 200ms

**AI Chat**:
- Message send: < 200ms
- First token: < 2s
- Scroll to latest: < 50ms

## Performance Testing

### Tools

**Development**:
- Lighthouse CI
- Chrome DevTools Performance tab
- React DevTools Profiler

**Production**:
- Vercel Analytics (Web Vitals)
- Upptime (uptime monitoring)
- Custom RUM (if needed)

### Testing Checklist

Before deployment:
- [ ] Lighthouse score > 90 (all categories)
- [ ] Core Web Vitals pass on mobile
- [ ] No console errors
- [ ] Bundle size within limits
- [ ] API response times < targets
- [ ] Database queries optimized
- [ ] Images optimized

## Performance Budget

Set budgets to prevent regressions:

```javascript
// next.config.js performance budgets
module.exports = {
  performance: {
    maxAssetSize: 200000,      // 200KB
    maxEntrypointSize: 300000, // 300KB
  }
}
```

## Quick Reference

**Before shipping**:
1. Run `pnpm build` - Check for warnings
2. Test on slow 3G network
3. Test on mobile device
4. Run Lighthouse audit
5. Check API response times
6. Verify Core Web Vitals pass

**During development**:
- Use Server Components by default
- Lazy load heavy client components
- Optimize images with next/image
- Add database indexes early
- Enable AI response streaming
- Show loading states immediately

**Post-deployment**:
- Monitor Core Web Vitals in production
- Track API response times
- Watch error rates
- Set up uptime monitoring
- Review slow queries weekly
