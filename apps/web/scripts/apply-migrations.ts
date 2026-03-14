#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, readdirSync } from 'fs';

config({ path: resolve(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function applyMigrations() {
  console.log('🚀 Applying migrations to production database...\n');

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const migrationsDir = resolve(__dirname, '../../../supabase/migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files:\n`);

  for (const file of migrationFiles) {
    console.log(`📄 Applying: ${file}`);
    const sql = readFileSync(resolve(migrationsDir, file), 'utf-8');

    try {
      const { error } = await adminClient.rpc('exec_sql', { sql });
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Applied successfully`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.log(`   ⚠️  Error: ${message}`);
    }
  }

  console.log('\n✨ Migration process complete!');
  console.log('\nRun the connection test again to verify:');
  console.log('  npx tsx scripts/test-supabase-connection.ts');
}

applyMigrations().catch(console.error);
