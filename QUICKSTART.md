# Quick Start Guide

## 🚀 One-Command Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev
```

Server runs at: http://localhost:3000

---

## 🗄️ Database Migrations (Most Common)

```bash
# Apply pending migrations to production
pnpm db:push

# Create a new migration
pnpm db:new <migration_name>

# Test database connection
pnpm db:test
```

**📖 Full migration guide**: See [MIGRATIONS.md](./MIGRATIONS.md)

---

## 🛠️ Development Commands

```bash
# Start dev server
pnpm dev                    # All apps (Turbo)
pnpm dev:web               # Just web app

# Code quality
pnpm lint                  # Check for issues
pnpm lint:fix              # Auto-fix issues
pnpm typecheck             # TypeScript check
pnpm format                # Format code
pnpm format:check          # Check formatting

# Testing
pnpm test                  # Unit tests
pnpm test:e2e              # E2E tests with Playwright

# Database
pnpm db:push               # Apply migrations
pnpm db:new <name>         # Create migration
pnpm db:test               # Test connection
pnpm db:status             # Check pending migrations

# Build
pnpm build                 # Production build
```

---

## 📁 Project Structure

```
├── apps/
│   └── web/               # Next.js app
│       ├── app/           # App Router pages
│       ├── lib/           # Utilities
│       └── scripts/       # Helper scripts
│
├── supabase/
│   ├── migrations/        # Database migrations
│   ├── seed.sql          # Test data
│   └── config.toml       # Supabase config
│
├── scripts/
│   └── migrate.sh        # Migration helper
│
└── docs/                 # Documentation
```

---

## 🔗 Important Links

- **App**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ljrvozxjmkryyzpqypkd
- **Migrations Guide**: [MIGRATIONS.md](./MIGRATIONS.md)
- **Project Docs**: [CLAUDE.md](./CLAUDE.md)

---

## ⚡ Common Tasks

### Add a new database table

```bash
# 1. Create migration
pnpm db:new add_my_table

# 2. Edit: supabase/migrations/<timestamp>_add_my_table.sql
# Add your CREATE TABLE, RLS policies, etc.

# 3. Apply to production
pnpm db:push
```

### Fix a migration error

```bash
# Check what went wrong
pnpm db:status

# Test connection to see specific errors
pnpm db:test

# Fix the SQL file in supabase/migrations/
# Then push again
pnpm db:push
```

### Start fresh

```bash
# Kill dev server
pkill -f "next dev"

# Clean
rm -rf apps/web/.next

# Restart
pnpm dev
```

---

## 🆘 Need Help?

```bash
# Show migration commands
./scripts/migrate.sh help

# Test database
pnpm db:test

# Check docs
cat MIGRATIONS.md
```

**For detailed guides**: See [MIGRATIONS.md](./MIGRATIONS.md) and [CLAUDE.md](./CLAUDE.md)
