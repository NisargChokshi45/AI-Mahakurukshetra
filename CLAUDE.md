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
- `/api-spec` - Generate OpenAPI specifications for API endpoints
- `/deploy-check` - Pre-deployment verification checklist
- `/git-commit` - Conventional commits with intelligent staging
- `/migrate` - Database migration creation and management
- Next.js patterns - `.agents/skills/next-best-practices/`
- Database optimization - `.agents/skills/supabase-postgres-best-practices/`

## Project Rules (in `.agents/rules/`)
Before any commit:
- Follow `.agents/rules/architecture.md` - System design principles
- Follow `.agents/rules/coding-standards.md` - TypeScript and React standards
- Review `.agents/rules/security-checklist.md` - Security best practices

## Quick References
- **Roadmap**: `/scratchpad.md` (Phases 0-4)
- **Tasks**: `/TODO.md`
- **Resources**: `/resources.md`
- **Architecture**: `/docs/plan.md`
- **Hackathon Guide**: `/docs/participant-guide.md`