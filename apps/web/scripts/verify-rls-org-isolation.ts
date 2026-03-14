import { createClient } from '@supabase/supabase-js';

type ScriptConfig = {
  anonKey: string;
  serviceRoleKey: string;
  supabaseUrl: string;
  testUserEmail: string;
  testUserPassword: string;
};

type MembershipRow = {
  organization_id: string;
};

type SupplierRow = {
  id: string;
  name: string;
  organization_id: string;
};

function loadConfig(): ScriptConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testUserEmail =
    process.env.RLS_TEST_USER_EMAIL ?? 'risk@apex-resilience.demo';
  const testUserPassword = process.env.RLS_TEST_USER_PASSWORD ?? 'DemoPass123!';

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return {
    anonKey,
    serviceRoleKey,
    supabaseUrl,
    testUserEmail,
    testUserPassword,
  };
}

async function main() {
  const config = loadConfig();
  const admin = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authClient = createClient(config.supabaseUrl, config.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } =
    await authClient.auth.signInWithPassword({
      email: config.testUserEmail,
      password: config.testUserPassword,
    });

  if (authError || !authData.user) {
    throw new Error(
      `Failed to sign in test user ${config.testUserEmail}: ${authError?.message ?? 'No user returned.'}`,
    );
  }

  const { data: memberships, error: membershipError } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', authData.user.id)
    .eq('status', 'active');

  if (membershipError || !memberships || memberships.length === 0) {
    throw new Error(
      `Unable to resolve test-user memberships: ${membershipError?.message ?? 'No memberships found.'}`,
    );
  }

  const userOrgId = (memberships[0] as MembershipRow).organization_id;

  const { data: crossOrgSupplier, error: crossOrgSupplierError } = await admin
    .from('suppliers')
    .select('id, name, organization_id')
    .neq('organization_id', userOrgId)
    .limit(1)
    .maybeSingle();

  if (crossOrgSupplierError || !crossOrgSupplier) {
    throw new Error(
      `Unable to find cross-org supplier for verification: ${crossOrgSupplierError?.message ?? 'No supplier returned.'}`,
    );
  }

  const targetSupplier = crossOrgSupplier as SupplierRow;
  const updatedName = `${targetSupplier.name} [RLS_TEST_SHOULD_NOT_PERSIST]`;

  const { data: crossOrgReadData, error: crossOrgReadError } = await authClient
    .from('suppliers')
    .select('id')
    .eq('organization_id', targetSupplier.organization_id);

  if (crossOrgReadError) {
    throw new Error(
      `Cross-org read check failed: ${crossOrgReadError.message}`,
    );
  }

  if ((crossOrgReadData ?? []).length > 0) {
    throw new Error(
      `RLS read isolation failed: user can see ${(crossOrgReadData ?? []).length} supplier(s) from another org.`,
    );
  }

  const { data: crossOrgWriteData, error: crossOrgWriteError } =
    await authClient
      .from('suppliers')
      .update({ name: updatedName })
      .eq('id', targetSupplier.id)
      .select('id, name');

  if (crossOrgWriteError) {
    throw new Error(
      `Cross-org write check failed: ${crossOrgWriteError.message}`,
    );
  }

  if ((crossOrgWriteData ?? []).length > 0) {
    throw new Error(
      'RLS write isolation failed: update returned rows for cross-org supplier.',
    );
  }

  const { data: postCheck, error: postCheckError } = await admin
    .from('suppliers')
    .select('name')
    .eq('id', targetSupplier.id)
    .maybeSingle();

  if (postCheckError || !postCheck) {
    throw new Error(
      `Unable to verify supplier post-write state: ${postCheckError?.message ?? 'Supplier not found after check.'}`,
    );
  }

  if (postCheck.name !== targetSupplier.name) {
    throw new Error(
      'RLS write isolation failed: cross-org supplier was modified.',
    );
  }

  const { error: signOutError } = await authClient.auth.signOut();
  if (signOutError) {
    throw new Error(`Failed to sign out test session: ${signOutError.message}`);
  }

  console.log(
    JSON.stringify(
      {
        checks: {
          cross_org_read: 'pass',
          cross_org_write: 'pass',
        },
        organization_id: userOrgId,
        target_supplier_id: targetSupplier.id,
        test_user: config.testUserEmail,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown RLS verification error.';
  console.error(`RLS verification failed: ${message}`);
  process.exitCode = 1;
});
