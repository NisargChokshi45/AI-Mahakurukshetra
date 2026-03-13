# AI-Mahakurukshetra SaaS Boilerplate Project

## Project Overview

This is a **production-ready Next.js 16 + Supabase SaaS boilerplate** being built for a technical hackathon on **March 14, 2026** (TOMORROW!). The goal is maximum development velocity while showcasing professional practices.

## Critical Context

- **Timeline**: Prioritize speed and functionality
- **Target**: Judges will evaluate via public API docs, status page, and coverage reports
- **Architecture**: Turborepo monorepo with Next.js 16 App Router
- **Philosophy**: Avoid over-engineering, keep it clean and modular

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Cache/Rate Limit**: Redis (Upstash - serverless)
- **UI**: Tailwind CSS + shadcn/ui
- **Payments**: Stripe (Checkout + Webhooks)
- **Validation**: Zod (all inputs/outputs)
- **Logging**: pino (structured JSON)
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel
- **Monorepo**: Turborepo + PNPM

## Key Features

1. **Multi-tenancy**: Optional, feature-flag controlled (disabled by default)
2. **Feature Flags**: Plan-based feature gating (basic/pro/enterprise)
3. **Public API Docs**: Swagger/OpenAPI at `/api/docs`
4. **Status Page**: Upptime monitoring via GitHub Actions
5. **Coverage Reports**: Public Codecov integration
6. **Rate Limiting**: Redis-based, per-plan limits
7. **Structured Logging**: pino with request IDs and redaction

## Project Structure

```
AI-Mahakurukshetra/
├── apps/web/              # Main Next.js application
├── packages/              # Shared packages (database, stripe, tsconfig)
├── supabase/             # Database migrations & config
├── tests/                # Unit, integration, E2E tests
└── .github/              # CI/CD workflows
```

## Development Principles

### DO:
- ✅ Use dedicated tools (Read, Edit, Write, Grep, Glob) over Bash
- ✅ Validate all inputs with Zod schemas
- ✅ Apply rate limiting to API routes
- ✅ Log important events with structured logging
- ✅ Follow Next.js 15+ best practices (Server Components, Server Actions)
- ✅ Keep backend code clean (no JSDoc - use YAML specs)
- ✅ Make features modular and feature-flag controlled
- ✅ Test critical paths (auth, payments, CRUD)
- ✅ Update OpenAPI specs when adding endpoints

### DON'T:
- ❌ Over-engineer solutions
- ❌ Add features not in the plan
- ❌ Skip validation or rate limiting
- ❌ Commit sensitive data (.env files)
- ❌ Use `git add -A` (stage specific files)
- ❌ Skip RLS policies on database tables
- ❌ Add comments/docstrings unless truly necessary

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Prefer interfaces for object shapes
- Use Zod for runtime validation

### React/Next.js
- Server Components by default
- Client Components only when needed (`"use client"`)
- Server Actions for mutations
- Proper loading/error boundaries

### Database
- RLS policies on ALL tables
- Migrations over manual SQL
- Lowercase identifiers (snake_case)
- Foreign key indexes
- Proper constraints

### API Routes
- Zod validation on inputs
- Rate limiting per plan tier
- Structured error responses
- Logging for important events
- OpenAPI documentation

## File Naming Conventions

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- API routes: `route.ts`
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Types: `types.ts`
- Schemas: `schema.ts` or `validations.ts`

## Environment Variables

Always check `.env.example` for required variables. Never commit `.env` files.

## Testing Strategy

- **Unit**: Utility functions, validations, helpers
- **Integration**: API routes, database operations, auth flows
- **E2E**: Critical user journeys (signup → subscribe → use feature)
- **Target**: >70% coverage for demo

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase production project configured
- [ ] Stripe production webhooks configured
- [ ] Upstash Redis database created
- [ ] GitHub Actions secrets configured
- [ ] OpenAPI docs accessible publicly
- [ ] Status page deployed to GitHub Pages
- [ ] Codecov integration working

## Agent Usage Guidelines

**Use specialized agents for:**
- Database migrations → `database-architect` agent
- Stripe integration → `stripe-integration` agent
- API development → `api-builder` agent
- UI components → `ui-builder` agent
- Testing → `test-engineer` agent
- Documentation → `docs-writer` agent

**Don't use agents for:**
- Simple file reads/edits
- Single grep/glob searches
- Quick configuration changes

## Current Phase

Refer to `doc/plan.md` for implementation phases. We're preparing for the hackathon tomorrow, so prioritize:
1. Core infrastructure setup
2. Critical feature completeness
3. Public endpoints (docs, status, coverage)
4. Deployment readiness

## Success Metrics

The boilerplate is ready when:
- ✅ User can signup, login, subscribe (full auth + Stripe flow)
- ✅ Sample CRUD feature works (Projects)
- ✅ `/api/docs` shows complete API documentation
- ✅ Status page monitors health endpoint
- ✅ Coverage reports are public
- ✅ Feature flags control access by plan
- ✅ Rate limiting protects endpoints
- ✅ Deployed to Vercel with all integrations working

## Memory System

Use `.claude/memory/` to store:
- User preferences and feedback
- Project decisions and their rationale
- Reference to external resources
- Lessons learned during development

## Quick Commands

See `.claude/skills/` for available skills:
- `/migrate` - Create database migration
- `/seed` - Generate seed data
- `/api-spec` - Update OpenAPI spec
- `/test-stripe` - Test Stripe integration
- `/deploy-check` - Pre-deployment verification

## Resources

- Project Plan: `doc/plan.md`
- Participant Guide: `doc/participant-guide.md`
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
