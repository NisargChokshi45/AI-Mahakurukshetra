# Database Migrations Guide

Quick reference for managing Supabase database migrations in this project.

## 🚀 Quick Start (TL;DR)

```bash
# Apply all pending migrations to production
pnpm db:push

# Create a new migration
pnpm db:new add_notifications_table

# Test database connection
pnpm db:test
```

---

## 📋 Available Commands

### Using pnpm (Recommended)

```bash
# Push migrations to production (most common)
pnpm db:push

# Create a new migration file
pnpm db:new <migration_name>

# Check migration status (what's pending)
pnpm db:status

# Test database connection and verify schema
pnpm db:test

# Pull current schema from production
pnpm db:pull
```

### Using the Script Directly

```bash
# All commands work the same way
./scripts/migrate.sh push
./scripts/migrate.sh new <name>
./scripts/migrate.sh status
./scripts/migrate.sh test
./scripts/migrate.sh pull
```

---

## 🔄 Common Workflows

### 1. Adding a New Table/Feature

```bash
# Step 1: Create migration file
pnpm db:new add_notifications_table

# Step 2: Edit the generated file
# File location: supabase/migrations/YYYYMMDDHHMMSS_add_notifications_table.sql
# Add your SQL:
#   CREATE TABLE notifications (...);
#   CREATE POLICY notifications_select ON notifications ...;

# Step 3: Push to production
pnpm db:push

# Step 4: Verify (automatically runs after push)
# ✅ Connection test runs automatically
```

### 2. Modifying Existing Schema

```bash
# Step 1: Create migration for the change
pnpm db:new update_user_profiles_add_timezone

# Step 2: Write ALTER statements in the migration file
# ALTER TABLE user_profiles ADD COLUMN timezone TEXT DEFAULT 'UTC';

# Step 3: Apply to production
pnpm db:push
```

### 3. Daily Workflow

```bash
# Morning: Check if team pushed any migrations
pnpm db:status

# If there are new migrations: apply them
pnpm db:push

# Create your changes
pnpm db:new my_feature

# Edit the SQL file, then push
pnpm db:push
```

---

## 📝 Migration Best Practices

### ✅ DO

- **Create one migration per logical change**

  ```bash
  pnpm db:new add_notification_preferences  # Good
  pnpm db:new add_feature_x                 # Too vague
  ```

- **Use descriptive names**
  - ✅ `add_user_timezone_column`
  - ✅ `create_audit_log_table`
  - ❌ `update_db`
  - ❌ `fixes`

- **Include RLS policies with tables**

  ```sql
  CREATE TABLE notifications (...);

  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

  CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (user_id = auth.uid());
  ```

- **Order SQL statements correctly**

  ```sql
  -- 1. Create types/enums first
  CREATE TYPE status AS ENUM ('active', 'inactive');

  -- 2. Create tables
  CREATE TABLE users (...);

  -- 3. Create functions that reference tables
  CREATE FUNCTION get_user(...) ...;

  -- 4. Create policies that use functions
  CREATE POLICY users_select ...;
  ```

### ❌ DON'T

- **Never edit applied migrations** - Create new ones instead
- **Don't commit with syntax errors** - Test locally first
- **Don't skip RLS policies** - All tables need security
- **Don't use DROP TABLE** without team approval
- **Don't include test data in migrations** - Use `supabase/seed.sql`

---

## 🔍 Checking Migration Status

### Before You Push

```bash
# See what migrations are pending
pnpm db:status

# Output shows:
# • Migrations to apply: 2
# • Last applied: 20260314131800_009_subscriptions.sql
```

### After You Push

```bash
# Verify everything is working
pnpm db:test

# Expected output:
# ✅ Environment variables
# ✅ Connection working
# ✅ All tables exist
# ✅ Auth working
```

---

## 🛠️ Troubleshooting

### Migration Failed

```bash
# Error: relation "xyz" does not exist
# Fix: Reorder your SQL (create tables before functions)

# Error: duplicate key value
# Fix: Use CREATE IF NOT EXISTS or check for existing data
```

### Need to Undo a Migration

```bash
# Option 1: Create a new rollback migration
pnpm db:new rollback_bad_migration
# Add: DROP TABLE xyz; or ALTER TABLE xyz DROP COLUMN ...;

# Option 2: Use Supabase Dashboard
# Go to: https://supabase.com/dashboard/project/<project-id>/database/backups
# Restore from backup (if available)
```

### Test Connection Fails

```bash
# Run detailed test
pnpm db:test

# Check specific issues:
# ❌ Table "xyz" not found → Run: pnpm db:push
# ❌ Connection failed → Check .env file
# ❌ Auth not working → Check Supabase Dashboard → Authentication
```

---

## 📁 File Structure

```
├── supabase/
│   ├── migrations/          # All migration files (auto-applied in order)
│   │   ├── 20260314131000_001_auth_orgs.sql
│   │   ├── 20260314131100_002_suppliers.sql
│   │   └── ...
│   ├── seed.sql            # Test data (not auto-applied)
│   └── config.toml         # Supabase configuration
│
├── scripts/
│   └── migrate.sh          # Migration helper script
│
└── apps/web/scripts/
    └── test-supabase-connection.ts  # Connection test
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] All migrations tested locally
- [ ] Migration files follow naming convention
- [ ] All tables have RLS policies enabled
- [ ] No syntax errors in SQL
- [ ] Indexes added for performance
- [ ] Connection test passes: `pnpm db:test`
- [ ] Team notified about schema changes

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ljrvozxjmkryyzpqypkd
- **Table Editor**: Dashboard → Database → Tables
- **SQL Editor**: Dashboard → SQL Editor
- **Auth Users**: Dashboard → Authentication → Users
- **API Docs**: Dashboard → API → Tables

---

## 📞 Need Help?

```bash
# Show all available commands
./scripts/migrate.sh help

# Test your connection
pnpm db:test

# Check project documentation
cat CLAUDE.md
```

---

## 🎓 Example Migration

**File**: `supabase/migrations/20260314140000_add_notifications.sql`

```sql
-- Create notification preferences table
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  push_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id)
);

-- Create index for faster lookups
create index idx_notification_preferences_user_id
  on public.notification_preferences(user_id);

-- Enable RLS
alter table public.notification_preferences enable row level security;
alter table public.notification_preferences force row level security;

-- Create policies
create policy notification_preferences_select
  on public.notification_preferences
  for select
  using (user_id = auth.uid());

create policy notification_preferences_insert
  on public.notification_preferences
  for insert
  with check (user_id = auth.uid());

create policy notification_preferences_update
  on public.notification_preferences
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Add trigger for updated_at
create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row
  execute function public.set_updated_at();
```

**Apply it**:

```bash
pnpm db:push
```

---

**Remember**: When in doubt, run `pnpm db:test` to verify everything is working! ✅
