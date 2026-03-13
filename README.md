# AI Mahakurukshetra

Hackathon-oriented Next.js + Supabase monorepo scaffold with a repo-local Codex working model.

## Current State

- Product and architecture planning live in `doc/plan.md`
- Participant and event guidance live in `doc/participant-guide.md`
- The application scaffold is prepared, but feature code has not been generated yet
- Codex role prompts and launch helpers live in `.codex/` and `scripts/codex/`

## Recommended Top-Level Structure

```text
apps/         Next.js application(s)
packages/     Shared UI, config, and types
supabase/     Migrations and seed assets
tests/        Unit, integration, and e2e suites
doc/          Product, task, and decision tracking
.codex/       Repo-local Codex role prompts
scripts/      Reusable local automation
```

## Quick Start

```bash
./scripts/codex/run-role.sh coordinator "Read doc/TASKS.md and plan the next build step"
```

## Notes

- The installed Codex CLI on this machine reports `gpt-5.4` as the top-capacity available model.
- Native `multi_agent` support exists as an experimental feature in the local CLI, so this repository keeps a stable role-based setup that works without depending on that flag.
