# AI Mahakurukshetra - Next.js SaaS Boilerplate

## Project Overview
Production-ready Next.js + Supabase SaaS boilerplate for March 14, 2026 hackathon.
**Goal**: Rapid feature development with professional code quality for judges.
**Constraint**: 10-hour time limit.

## Tech Stack
- Framework: Next.js 16+ (App Router)
- Backend: Supabase (PostgreSQL, Auth, Real-time)
- UI: Tailwind CSS + shadcn/ui
- Deployment: Vercel
- Payments: Stripe
- Validation: Zod (all inputs/outputs)
- Monorepo: Turborepo + PNPM

## Coding Standards
- TypeScript strict mode (no `any` types)
- Follow Next.js App Router conventions (see `.agents/skills/next-best-practices/`)
- Use Zod for all input validation
- Apply Supabase best practices (see `.agents/skills/supabase-postgres-best-practices/`)
- Conventional commits only (use `/git-commit` skill)
- Meet performance targets (see `.agents/rules/performance-targets.md`)
- Handle all errors gracefully (see `.agents/rules/error-handling.md`)
- Check security before committing (see `.agents/rules/security-checklist.md`)

## Hackathon Constraints (March 14, 2026)
- **Time Limit**: 10 hours total
- **Scope**: Phase 0 features only (see scratchpad.md)
- **Deliverables**: Working demo, video, GitHub repo
- **Judging Criteria**: Code quality, security, functionality, usability

## Architecture Principles
- Monorepo structure with Turborepo
- Feature flags for plan-based access
- Rate limiting on all public APIs
- Structured logging with pino
- Public API docs (Swagger)
- RLS policies on all tables

## Available Skills (in `.agents/skills/`)
All skills are tool-agnostic and work with any AI coding assistant:
- `.agents/skills/api-design` - Design API endpoints
- `.agents/skills/deploy-check` - Pre-deployment verification checklist
- `.agents/skills/git-commit` - Conventional commits with intelligent staging
- `.agents/skills/next-best-practices/` - Next.js patterns
- `.agents/skills/supabase-postgres-best-practices/` - Database optimization

## Project Rules (in `.agents/rules/`)
All code must follow these production-ready standards:
- `.agents/rules/architecture.md` - System design and patterns
- `.agents/rules/coding-standards.md` - TypeScript, React, and code quality
- `.agents/rules/security-checklist.md` - Security best practices
- `.agents/rules/performance-targets.md` - Speed and UX targets (Core Web Vitals, API latency)
- `.agents/rules/error-handling.md` - Error patterns (API failures, AI timeouts, validation)

## Quick References
- **Roadmap**: `/scratchpad.md` (Phases 0-4)
- **Tasks**: `/TODO.md`
- **Resources**: `/resources.md`
- **Architecture**: `/docs/plan.md`
- **Hackathon Guide**: `/docs/participant-guide.md`