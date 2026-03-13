# AI Mahakurukshetra

Monorepo scaffold for a Next.js + Supabase SaaS boilerplate intended for the March 14, 2026 hackathon.

## Workspace

- `apps/web`: Next.js App Router frontend and API routes
- `packages/ui`: shared UI entrypoint
- `packages/config-eslint`: shared ESLint config placeholder
- `packages/config-typescript`: shared TypeScript config placeholder
- `api-specs`: modular OpenAPI files
- `config`: product-level configuration such as feature flags
- `supabase/migrations`: database migration files

## Quick Start

1. Use Node.js `20+`
2. Install PNPM `10+`
3. Run `pnpm install`
4. Run `pnpm dev`

## Current Status

This repository currently contains the initial monorepo structure, a minimal app shell, a health endpoint, feature flag config, and starter OpenAPI files. Supabase, Stripe, Redis, auth, and tests still need implementation.

