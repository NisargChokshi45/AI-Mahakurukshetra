# Shared Agent Resources

This directory contains **shared resources** used across all AI coding tools (Claude Code, Codex, Antigravity, etc.).

## Structure

```
.agents/
├── rules/      # Universal project rules (architecture, coding standards, security)
└── skills/     # Reusable skills and best practices (framework patterns, workflows)
```

## Purpose

Resources in `.agents/` are **tool-agnostic** and should work with any AI coding assistant:

### Rules (`rules/`)
- **architecture.md** - System design principles and patterns
- **coding-standards.md** - TypeScript, React, and code quality standards
- **security-checklist.md** - Security best practices and checks
- **performance-targets.md** - Speed and UX targets (Core Web Vitals, API latency, AI timeouts)
- **error-handling.md** - Error patterns (API failures, AI errors, validation, empty states)

### Skills (`skills/`)
- **api-spec/** - Generate OpenAPI specifications for API endpoints
- **deploy-check/** - Pre-deployment verification checklist
- **git-commit/** - Conventional commit patterns and workflows
- **migrate/** - Database migration creation and management
- **next-best-practices/** - Next.js App Router patterns and best practices
- **supabase-postgres-best-practices/** - PostgreSQL/Supabase optimization patterns

## Tool-Specific Resources

Each AI tool has its own directory for tool-specific agents only:

- `.claude/agents/` - Claude Code CLI specialized agents
- `.codex/agents/` - Codex CLI specialized agents (future)
- `.antigravity/agents/` - Antigravity specialized agents (future)

**Note**: All skills are now consolidated in `.agents/skills/` as the single source of truth.

## Adding New Resources

**Add to `.agents/` if:**
- ✅ Works across all AI tools
- ✅ Contains universal rules or patterns
- ✅ Framework/language best practices
- ✅ Project-wide standards

**Add to tool-specific folder if:**
- ⚠️ Uses tool-specific syntax or features
- ⚠️ Tool-specific agent definitions
- ⚠️ Custom integrations for that tool

## Maintenance

Keep this directory clean and production-ready:
- Remove redundant files
- Ensure all rules are comprehensive
- Update skills when patterns evolve
- Document any breaking changes
