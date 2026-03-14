'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireOrganizationContext } from '@/lib/auth/session';
import { resolveAuthCallbackUrl } from '@/lib/security/redirects';
import { setFlash } from '@/lib/flash';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AppRole } from '@/lib/validations/auth';
import {
  deleteMemberSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '@/lib/validations/auth';

type OrganizationMember = {
  role: AppRole;
  status: 'active' | 'inactive' | 'invited';
  user_id: string;
};

function canManageMembers(role: AppRole) {
  return role === 'owner' || role === 'admin';
}

async function findOrganizationMember(
  organizationId: string,
  userId: string,
): Promise<OrganizationMember | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('organization_members')
    .select('user_id, role, status')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as OrganizationMember;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function inviteOrganizationMemberAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!canManageMembers(context.organization.role)) {
    await setFlash({
      error: 'Only owners and admins can manage organization members.',
    });
    redirect('/settings/members');
  }

  const parsed = inviteMemberSchema.safeParse({
    email: getString(formData, 'email'),
    role: getString(formData, 'role'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Enter a valid email and role.' });
    redirect('/settings/members');
  }

  const admin = createAdminClient();
  const normalizedEmail = parsed.data.email.toLowerCase();
  let userId: string | null = null;

  const { data: existingProfile } = await admin
    .from('user_profiles')
    .select('id, current_organization_id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    const requestHeaders = await headers();
    const callbackUrl = resolveAuthCallbackUrl(requestHeaders);
    const { data, error } = await admin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: {
          invited_org_name: context.organization.organizationName,
        },
        redirectTo: callbackUrl,
      },
    );

    if (error) {
      await setFlash({ error: error.message });
      redirect('/settings/members');
    }

    userId = data.user?.id ?? null;
  }

  if (!userId) {
    await setFlash({ error: 'Unable to resolve the invited user.' });
    redirect('/settings/members');
  }

  const { error: membershipError } = await admin
    .from('organization_members')
    .upsert(
      {
        invited_by: context.user.id,
        joined_at: new Date().toISOString(),
        organization_id: context.organization.organizationId,
        role: parsed.data.role,
        status: 'active',
        user_id: userId,
      },
      {
        onConflict: 'organization_id,user_id',
      },
    );

  if (membershipError) {
    await setFlash({ error: membershipError.message });
    redirect('/settings/members');
  }

  await admin
    .from('user_profiles')
    .update({
      current_organization_id: context.organization.organizationId,
    })
    .eq('id', userId)
    .is('current_organization_id', null);

  revalidatePath('/settings/members');
  await setFlash({ message: 'Member invited successfully.' });
  redirect('/settings/members');
}

export async function updateOrganizationMemberRoleAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!canManageMembers(context.organization.role)) {
    await setFlash({
      error: 'Only owners and admins can manage organization members.',
    });
    redirect('/settings/members');
  }

  const parsed = updateMemberRoleSchema.safeParse({
    role: getString(formData, 'role'),
    userId: getString(formData, 'userId'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Enter a valid member and role.' });
    redirect('/settings/members');
  }

  if (parsed.data.userId === context.user.id) {
    await setFlash({
      error: 'You cannot change your own role from this page.',
    });
    redirect('/settings/members');
  }

  const member = await findOrganizationMember(
    context.organization.organizationId,
    parsed.data.userId,
  );

  if (!member) {
    await setFlash({
      error: 'The selected member could not be found in this organization.',
    });
    redirect('/settings/members');
  }

  if (member.role === 'owner') {
    await setFlash({
      error: 'Owner memberships cannot be edited from this page.',
    });
    redirect('/settings/members');
  }

  if (member.role === parsed.data.role) {
    await setFlash({ message: 'No role changes were needed.' });
    redirect('/settings/members');
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('organization_members')
    .update({
      role: parsed.data.role,
    })
    .eq('organization_id', context.organization.organizationId)
    .eq('user_id', parsed.data.userId);

  if (error) {
    await setFlash({ error: error.message });
    redirect('/settings/members');
  }

  revalidatePath('/settings/members');
  await setFlash({ message: 'Member role updated successfully.' });
  redirect('/settings/members');
}

export async function deleteOrganizationMemberAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!canManageMembers(context.organization.role)) {
    await setFlash({
      error: 'Only owners and admins can manage organization members.',
    });
    redirect('/settings/members');
  }

  const parsed = deleteMemberSchema.safeParse({
    userId: getString(formData, 'userId'),
  });

  if (!parsed.success) {
    await setFlash({ error: 'Select a valid member.' });
    redirect('/settings/members');
  }

  if (parsed.data.userId === context.user.id) {
    await setFlash({
      error: 'You cannot remove your own membership from this page.',
    });
    redirect('/settings/members');
  }

  const member = await findOrganizationMember(
    context.organization.organizationId,
    parsed.data.userId,
  );

  if (!member) {
    await setFlash({
      error: 'The selected member could not be found in this organization.',
    });
    redirect('/settings/members');
  }

  if (member.role === 'owner') {
    await setFlash({
      error: 'Owner memberships cannot be removed from this page.',
    });
    redirect('/settings/members');
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('organization_members')
    .delete()
    .eq('organization_id', context.organization.organizationId)
    .eq('user_id', parsed.data.userId);

  if (error) {
    await setFlash({ error: error.message });
    redirect('/settings/members');
  }

  await admin
    .from('user_profiles')
    .update({
      current_organization_id: null,
    })
    .eq('id', parsed.data.userId)
    .eq('current_organization_id', context.organization.organizationId);

  revalidatePath('/settings/members');
  await setFlash({ message: 'Member removed successfully.' });
  redirect('/settings/members');
}
