---
name: migrate
description: Create a new Supabase database migration
---

# Database Migration Skill

Creates a new Supabase migration file with proper naming and structure.

## Usage

```
/migrate [migration_name]
```

## Example

```
/migrate add_projects_table
```

This will:
1. Generate a timestamped migration file
2. Provide a template with common patterns
3. Guide you through writing the migration
4. Remind you to test locally before pushing

## Migration Template

The skill creates a migration with this structure:

```sql
-- Migration: [description]
-- Created: [timestamp]

-- UP Migration
BEGIN;

-- Your changes here

COMMIT;

-- Rollback instructions (as comments):
-- [rollback SQL]
```

## Best Practices

1. **One logical change per migration**
2. **Always include rollback instructions**
3. **Test locally first**: `npx supabase db reset`
4. **Enable RLS on new tables**
5. **Add indexes for foreign keys**
6. **Use descriptive migration names**

## Common Patterns

### Creating a Table
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY table_name_select_own ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX table_name_user_id_idx ON table_name(user_id);

-- Triggers
CREATE TRIGGER table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Adding a Column
```sql
ALTER TABLE table_name ADD COLUMN column_name TYPE;

-- Rollback:
-- ALTER TABLE table_name DROP COLUMN column_name;
```

### Creating an Index
```sql
CREATE INDEX idx_name ON table_name(column_name);

-- Rollback:
-- DROP INDEX idx_name;
```
