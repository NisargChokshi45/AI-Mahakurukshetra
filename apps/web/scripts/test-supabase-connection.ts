#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from root
config({ path: resolve(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Test 1: Environment variables
  console.log('1️⃣ Environment Variables:');
  console.log(`   SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(
    `   SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}\n`,
  );

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Test 2: Basic connectivity with anon client
  console.log('2️⃣ Testing Anon Client Connection:');
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { error } = await anonClient
      .from('organizations')
      .select('count')
      .limit(0);
    if (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    } else {
      console.log('   ✅ Anon client connected successfully\n');
    }
  } catch (err) {
    console.log(`   ❌ Connection error: ${err}\n`);
  }

  // Test 3: Admin client with service role
  console.log('3️⃣ Testing Admin Client (Service Role):');
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { error } = await adminClient
      .from('organizations')
      .select('count')
      .limit(0);
    if (error) {
      console.log(`   ❌ Admin connection failed: ${error.message}\n`);
    } else {
      console.log('   ✅ Admin client connected successfully\n');
    }
  } catch (err) {
    console.log(`   ❌ Admin connection error: ${err}\n`);
  }

  // Test 4: Check critical tables exist
  console.log('4️⃣ Verifying Database Schema:');
  const tables = [
    'user_profiles',
    'organizations',
    'organization_members',
    'suppliers',
    'products',
    'risk_scores',
    'alerts',
    'incidents',
  ];

  for (const table of tables) {
    try {
      const { error } = await adminClient.from(table).select('count').limit(0);
      if (error) {
        console.log(`   ❌ Table "${table}": ${error.message}`);
      } else {
        console.log(`   ✅ Table "${table}" exists`);
      }
    } catch (err) {
      console.log(`   ❌ Table "${table}": ${err}`);
    }
  }

  console.log('\n5️⃣ Auth Configuration:');
  try {
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      console.log(`   ❌ Auth check failed: ${error.message}`);
    } else {
      console.log(`   ✅ Auth working (${data.users.length} users found)`);
    }
  } catch (err) {
    console.log(`   ❌ Auth error: ${err}`);
  }

  console.log('\n✨ Connection test complete!');
}

testConnection().catch(console.error);
