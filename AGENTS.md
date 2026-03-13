# AGENTS.md

This repository uses Codex as a coordinator with specialist role prompts.

Read these files before starting work:
- `doc/TASKS.md`
- `doc/PROGRESS.md`
- `doc/BLOCKERS.md`
- `doc/DECISIONS.md`
- `doc/SCHEMA.md`

Current repository state:
- Planning docs exist in `doc/plan.md` and `doc/participant-guide.md`
- Application code has not been scaffolded yet
- The Codex setup in this repository is repo-local and safe to commit

## Working Model

Use a coordinator plus specialists:
- `coordinator`: breaks work into steps, delegates, verifies outcomes
- `frontend`: UI, layout, Tailwind, App Router page work
- `backend`: API routes, server actions, Supabase integration, schema work
- `reviewer`: diff review, correctness, regressions, security, missing tests
- `docs`: PRD, tasks, architecture, handoff notes

## Best-Capacity Setup

Preferred defaults on this machine:
- Coordinator: `gpt-5.4`, reasoning `high` for architecture or major refactors
- Frontend: `gpt-5.4`, reasoning `medium`
- Backend: `gpt-5.4`, reasoning `high`
- Reviewer: `gpt-5.1-codex-max`, reasoning `medium`, read-only mindset
- Docs: `gpt-5.1-codex-mini`, reasoning `low`

Repo-local role prompts and launcher live under:
- `.codex/`
- `scripts/codex/run-role.sh`

## Invocation

Stable path:
- `./scripts/codex/run-role.sh coordinator "Read doc/TASKS.md and continue the next task"`
- `./scripts/codex/run-role.sh frontend "Build the landing page shell in apps/web"`
- `./scripts/codex/run-role.sh reviewer "Review the current diff"`

Experimental path:
- The installed CLI exposes `multi_agent` and `child_agents_md` feature flags, but they are experimental.
- If you want native sub-agent routing, enable them in `~/.codex/config.toml` or pass `--enable multi_agent --enable child_agents_md` per run.

## Required Doc Updates

After each meaningful task:
1. Mark status in `doc/TASKS.md`
2. Append a line to `doc/PROGRESS.md`
3. Update `doc/CHANGELOG.md` for code or structure changes
4. Record architectural choices in `doc/DECISIONS.md`
5. Update `doc/SCHEMA.md` when database shape changes

## Session Start Prompt

Use this at the beginning of a new Codex session:

```text
Read doc/TASKS.md, doc/PROGRESS.md, and doc/BLOCKERS.md.
Summarize what is complete, in progress, and blocked.
Then continue the next highest-priority unfinished task.
```
