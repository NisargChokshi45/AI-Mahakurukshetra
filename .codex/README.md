# Codex Workspace

This folder keeps the repository-local Codex operating model.

## Files

- `roles.toml`: role-to-model mapping and default execution policy
- `agents/*.md`: role prompts

## Recommended Usage

Interactive coordinator session:

```bash
./scripts/codex/run-role.sh coordinator "Plan the next implementation slice for this repo"
```

Focused specialist session:

```bash
./scripts/codex/run-role.sh backend "Set up Supabase auth and initial schema"
```

Diff review:

```bash
./scripts/codex/run-role.sh reviewer "Review the current diff for regressions and missing tests"
```

## Native Experimental Flags

The local Codex CLI currently lists:
- `multi_agent`
- `child_agents_md`

They are disabled by default in the installed CLI. Treat this repository setup as the stable baseline, then layer those flags on top if you want native sub-agent routing.
