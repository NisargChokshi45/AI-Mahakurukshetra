# Contributing to AI Mahakurukshetra

Thank you for contributing! Please follow these guidelines to keep the codebase consistent and production-ready.

## Table of Contents

- [Contributing to AI Mahakurukshetra](#contributing-to-ai-mahakurukshetra)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
  - [Branch Naming](#branch-naming)
  - [Commit Conventions](#commit-conventions)
  - [Pull Request Process](#pull-request-process)
  - [Code Standards](#code-standards)
  - [Testing Requirements](#testing-requirements)
  - [Security Guidelines](#security-guidelines)
  - [Database Changes (Supabase)](#database-changes-supabase)
  - [Questions?](#questions)

---

## Getting Started

1. Fork the repository and clone your fork
2. Install dependencies: `pnpm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Set up Supabase locally or point to a dev project
5. Run the dev server: `pnpm dev`

---

## Development Setup

**Prerequisites:**

- Node.js 20+
- PNPM 9+
- Supabase CLI

**Install and run:**

```bash
pnpm install
pnpm dev
```

**Run tests:**

```bash
pnpm test
pnpm test:e2e
```

---

## Branch Naming

Use the following pattern:

```
<type>/<short-description>
```

| Type        | Purpose                                  |
| ----------- | ---------------------------------------- |
| `feat/`     | New feature                              |
| `fix/`      | Bug fix                                  |
| `chore/`    | Tooling, deps, config                    |
| `docs/`     | Documentation only                       |
| `refactor/` | Code restructure without behavior change |
| `test/`     | Tests only                               |

Examples:

- `feat/user-onboarding`
- `fix/stripe-webhook-signature`
- `chore/upgrade-nextjs`

---

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>(scope): <short description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`

**Examples:**

```
feat(auth): add magic link sign-in via Supabase
fix(api): handle expired Stripe subscription gracefully
chore(deps): upgrade to Next.js 16.1
```

Use the `/git-commit` skill for guided commit creation.

---

## Pull Request Process

1. Branch off `main` using the naming convention above
2. Make focused, atomic changes - one concern per PR
3. Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely
4. Ensure all checklist items pass before requesting review
5. Assign at least one reviewer
6. Squash merge after approval

**PR size guidance:**

- Prefer small PRs (< 400 lines changed)
- Large PRs must include a detailed description and be split where possible

---

## Code Standards

All code must comply with the rules in `.agents/rules/`:

- **TypeScript**: Strict mode, no `any` types
- **React**: Server Components by default; use `"use client"` only when required
- **Validation**: Zod schemas for all inputs and API responses
- **Imports**: Absolute paths via `@/` alias
- **Formatting**: Prettier (auto-applied on commit via lint-staged)
- **Linting**: ESLint must pass with zero errors

See `.agents/rules/coding-standards.md` for the full reference.

---

## Testing Requirements

| Layer       | Tool                    | Requirement                     |
| ----------- | ----------------------- | ------------------------------- |
| Unit        | Vitest                  | All utility functions and hooks |
| Integration | Vitest + Supabase local | API routes and server actions   |
| E2E         | Playwright              | Critical user flows             |

- Do not mock the database in integration tests - use a real local Supabase instance
- New features require corresponding tests before merge
- Existing tests must remain green

---

## Security Guidelines

Before opening a PR, verify:

- [ ] No secrets, tokens, or API keys committed
- [ ] All environment variables use `.env.local` (never committed)
- [ ] RLS policies added/updated for any new Supabase tables
- [ ] API routes validate all inputs with Zod
- [ ] Sensitive operations run server-side only
- [ ] Rate limiting applied to public endpoints

See `.agents/rules/security-checklist.md` for the full checklist.

---

## Database Changes (Supabase)

- All schema changes must be in a versioned migration file under `supabase/migrations/`
- RLS policies are required on every new table
- Never use the Supabase dashboard to make schema changes directly - always use migrations
- Include a rollback SQL comment in each migration

---

## Questions?

Open a [GitHub Discussion](../../discussions) or ping the team on the project channel.
