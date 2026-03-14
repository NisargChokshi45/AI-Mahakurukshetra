import 'server-only';

import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/validations/auth';

export type OrganizationContext = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: AppRole;
};

export type AuthContext = {
  user: User;
  profile: {
    displayName: string | null;
    email: string | null;
    currentOrganizationId: string | null;
  } | null;
  organization: OrganizationContext | null;
};

type MembershipRow = {
  organization_id: string;
  role: AppRole;
  status: string;
  organizations:
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, email, current_organization_id')
    .eq('id', user.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id, role, status, organizations(name, slug)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  const membershipRows = (memberships ?? []) as MembershipRow[];
  const currentMembership =
    membershipRows.find(
      (membership) =>
        membership.organization_id === profile?.current_organization_id,
    ) ??
    membershipRows[0] ??
    null;

  return {
    user,
    profile: profile
      ? {
          currentOrganizationId: profile.current_organization_id,
          displayName: profile.display_name,
          email: profile.email,
        }
      : null,
    organization: currentMembership?.organizations?.[0]
      ? {
          organizationId: currentMembership.organization_id,
          organizationName: currentMembership.organizations[0].name,
          organizationSlug: currentMembership.organizations[0].slug,
          role: currentMembership.role,
        }
      : null,
  };
}

export async function requireUser() {
  const context = await getAuthContext();

  if (!context) {
    redirect('/login');
  }

  return context;
}

export async function requireOrganizationContext() {
  const context = await requireUser();

  if (!context.organization) {
    redirect('/setup/organization');
  }

  return context as AuthContext & { organization: OrganizationContext };
}
