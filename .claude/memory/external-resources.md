---
name: external-resources
description: Links to important external resources and documentation
type: reference
---

# External Resources

## Project Documentation

- **Project Plan**: `doc/plan.md` - Complete implementation roadmap
- **Participant Guide**: `doc/participant-guide.md` - Hackathon information

## Official Documentation

### Next.js
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

### Supabase
- Docs: https://supabase.com/docs
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- CLI: https://supabase.com/docs/reference/cli

### Stripe
- Docs: https://stripe.com/docs
- Checkout: https://stripe.com/docs/payments/checkout
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

### Upstash (Redis)
- Docs: https://upstash.com/docs
- Redis SDK: https://upstash.com/docs/redis/sdks/ts/overview

### shadcn/ui
- Docs: https://ui.shadcn.com
- Components: https://ui.shadcn.com/docs/components
- Theming: https://ui.shadcn.com/docs/theming

### Zod
- Docs: https://zod.dev
- Guide: https://zod.dev/?id=basic-usage

## Tools & Services

### Deployment
- Vercel: https://vercel.com/docs
- Vercel CLI: https://vercel.com/docs/cli

### Testing
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev
- Testing Library: https://testing-library.com

### Monitoring
- Upptime: https://upptime.js.org
- Codecov: https://docs.codecov.com

### CI/CD
- GitHub Actions: https://docs.github.com/en/actions

## Best Practices

### Database (Supabase/PostgreSQL)
Reference: `.claude/agents/database-architect.md` for patterns

### API Development
Reference: `.claude/agents/api-builder.md` for patterns

### Testing
Reference: `.claude/agents/test-engineer.md` for patterns

## Troubleshooting

### Common Issues

**Supabase Local Development**
- Issue: Connection refused
- Solution: Run `npx supabase start`
- Docs: https://supabase.com/docs/guides/cli/local-development

**Stripe Webhooks**
- Issue: Signature verification fails
- Solution: Use raw body, check webhook secret
- Docs: https://stripe.com/docs/webhooks/signatures

**Next.js Build Errors**
- Issue: "Module not found"
- Solution: Check tsconfig paths
- Docs: https://nextjs.org/docs/app/building-your-application/configuring/absolute-imports-and-module-aliases

**Vercel Deployment**
- Issue: Environment variables not set
- Solution: Add via Vercel dashboard or CLI
- Docs: https://vercel.com/docs/concepts/projects/environment-variables

## Community Resources

### Discussions
- Next.js Discord: https://nextjs.org/discord
- Supabase Discord: https://discord.supabase.com
- Stripe Discord: https://stripe.com/discord

### GitHub Repositories
- Next.js: https://github.com/vercel/next.js
- Supabase: https://github.com/supabase/supabase
- shadcn/ui: https://github.com/shadcn/ui
