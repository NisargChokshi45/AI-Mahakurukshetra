# DECISIONS

## 2026-03-13 16:53 IST

Decision:
- Use a repo-local role-based Codex setup as the stable default.

Rationale:
- The installed Codex CLI exposes `multi_agent` and `child_agents_md` as experimental feature flags, not stable defaults.
- A committed role-and-prompt layout works immediately for every contributor and does not depend on mutable home-directory state.

Decision:
- Use `gpt-5.4` as the lead implementation model on this machine.

Rationale:
- The local Codex model cache lists `gpt-5.4` as the highest-priority available model.
- This matches the user's request to use the best available Codex capacity.

Decision:
- Start with a monorepo-oriented folder structure before generating app code.

Rationale:
- The repository currently contains planning docs but no application scaffold.
- Establishing the directory layout first reduces churn when the Next.js and Supabase code is added.
