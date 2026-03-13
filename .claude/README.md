# Claude Configuration for AI-Mahakurukshetra

This directory contains the Claude Code configuration for the AI-Mahakurukshetra SaaS boilerplate project.

## Structure

```
.claude/
├── agents/                # Specialized agents for different tasks
│   ├── AGENTS.md
│   ├── api-builder.md
│   ├── code-reviewer.md
│   ├── database-architect.md
│   ├── deployment-specialist.md
│   ├── stripe-integration.md
│   ├── test-engineer.md
│   └── ui-builder.md
├── memory/                # Persistent project memory
│   ├── external-resources.md
│   ├── MEMORY.md
│   ├── project-context.md
│   ├── technical-decisions.md
│   └── user-profile.md
└── README.md             # This file
```

## Available Agents

**database-architect**
- Use for: Database design, migrations, RLS
- Expertise: Schema design, SQL migrations, performance optimization

**stripe-integration**
- Use for: Payment flows, webhooks
- Expertise: Checkout, subscription management, webhook handlers

**api-builder**
- Use for: Building Next.js API routes with validation
- Expertise: RESTful APIs, Zod validation, rate limiting

**ui-builder**
- Use for: React components, UI, shadcn/ui integration
- Expertise: Server Components, shadcn/ui, responsive design

**test-engineer**
- Use for: Testing, coverage
- Expertise: Unit/integration/E2E tests, Vitest, Playwright

**deployment-specialist**
- Use for: Vercel deployment, CI/CD
- Expertise: Production deployment, monitoring, optimization

## Available Skills (in `.agents/skills/`)
All skills are tool-agnostic and work with any AI coding assistant

## Project Rules (in `.agents/rules/`)
All code must follow these production-ready standards

## Memory System

The memory system stores and persist project context, decisions, and references for continuity across conversations:

- **project-context.md**: Hackathon goals, and success criteria
- **user-profile.md**: User preferences and working style
- **technical-decisions.md**: Key architectural decisions and rationale
- **external-resources.md**: Important documentation links

## Usage Examples

### Using an Agent

```bash
# Database Migration
I need to create a migration for the subscriptions table with Stripe integration.
Use the database-architect agent to help design the schema with proper RLS policies.

# API Development
Help me build a RESTful API for the projects CRUD operations.
Use the api-builder agent to create routes with Zod validation and rate limiting.
```

### Using a Skill

```bash
# To check deployment readiness:
/deploy-check
```

### Accessing Memory

Claude automatically loads `MEMORY.md`. To reference specific context:
```bash
Check the technical decisions for our Redis caching strategy.
What's our current project phase?
```

## Best Practices

1. **Use agents for complex, domain-specific tasks**
   - Database design, then database-architect
   - API development, then api-builder
   - Testing, then test-engineer

2. **Use skills for common, repetitive tasks**

3. **Update memory when decisions are made**
   - Add new technical decisions to `technical-decisions.md`
   - Document external resources in `external-resources.md`
   - Update project context as goals evolve

4. **Follow the rules**
   - Review architecture.md for system design patterns
   - Follow coding-standards.md for consistent code style
   - Reference CLAUDE.md for project-specific guidelines

## Getting Started

1. Read `CLAUDE.md` for project overview
2. Check `memory/project-context.md` for current phase
3. Review `doc/plan.md` for implementation roadmap
4. Use appropriate agent for your task domain
5. Follow coding standards and architecture guidelines
