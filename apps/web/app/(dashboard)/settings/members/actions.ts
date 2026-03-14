'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireOrganizationContext } from '@/lib/auth/session';
import { resolveAuthCallbackUrl } from '@/lib/security/redirects';
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

function buildSettingsMembersRedirect(
  key: 'error' | 'message',
  message: string,
) {
  return '/settings/members?' + key + '=' + encodeURIComponent(message);
}

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
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Only owners and admins can manage organization members.',
      ),
    );
  }

  const parsed = inviteMemberSchema.safeParse({
    email: getString(formData, 'email'),
    role: getString(formData, 'role'),
  });

  if (!parsed.success) {
    redirect(
      buildSettingsMembersRedirect('error', 'Enter a valid email and role.'),
    );
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
      redirect(buildSettingsMembersRedirect('error', error.message));
    }

    userId = data.user?.id ?? null;
  }

  if (!userId) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Unable to resolve the invited user.',
      ),
    );
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
    redirect(buildSettingsMembersRedirect('error', membershipError.message));
  }

  await admin
    .from('user_profiles')
    .update({
      current_organization_id: context.organization.organizationId,
    })
    .eq('id', userId)
    .is('current_organization_id', null);

  revalidatePath('/settings/members');
  redirect(
    buildSettingsMembersRedirect('message', 'Member invited successfully.'),
  );
}

export async function updateOrganizationMemberRoleAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!canManageMembers(context.organization.role)) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Only owners and admins can manage organization members.',
      ),
    );
  }

  const parsed = updateMemberRoleSchema.safeParse({
    role: getString(formData, 'role'),
    userId: getString(formData, 'userId'),
  });

  if (!parsed.success) {
    redirect(
      buildSettingsMembersRedirect('error', 'Enter a valid member and role.'),
    );
  }

  if (parsed.data.userId === context.user.id) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'You cannot change your own role from this page.',
      ),
    );
  }

  const member = await findOrganizationMember(
    context.organization.organizationId,
    parsed.data.userId,
  );

  if (!member) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'The selected member could not be found in this organization.',
      ),
    );
  }

  if (member.role === 'owner') {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Owner memberships cannot be edited from this page.',
      ),
    );
  }

  if (member.role === parsed.data.role) {
    redirect(
      buildSettingsMembersRedirect('message', 'No role changes were needed.'),
    );
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
    redirect(buildSettingsMembersRedirect('error', error.message));
  }

  revalidatePath('/settings/members');
  redirect(
    buildSettingsMembersRedirect(
      'message',
      'Member role updated successfully.',
    ),
  );
}

export async function deleteOrganizationMemberAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!canManageMembers(context.organization.role)) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Only owners and admins can manage organization members.',
      ),
    );
  }

  const parsed = deleteMemberSchema.safeParse({
    userId: getString(formData, 'userId'),
  });

  if (!parsed.success) {
    redirect(buildSettingsMembersRedirect('error', 'Select a valid member.'));
  }

  if (parsed.data.userId === context.user.id) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'You cannot remove your own membership from this page.',
      ),
    );
  }

  const member = await findOrganizationMember(
    context.organization.organizationId,
    parsed.data.userId,
  );

  if (!member) {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'The selected member could not be found in this organization.',
      ),
    );
  }

  if (member.role === 'owner') {
    redirect(
      buildSettingsMembersRedirect(
        'error',
        'Owner memberships cannot be removed from this page.',
      ),
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('organization_members')
    .delete()
    .eq('organization_id', context.organization.organizationId)
    .eq('user_id', parsed.data.userId);

  if (error) {
    redirect(buildSettingsMembersRedirect('error', error.message));
  }

  await admin
    .from('user_profiles')
    .update({
      current_organization_id: null,
    })
    .eq('id', parsed.data.userId)
    .eq('current_organization_id', context.organization.organizationId);

  revalidatePath('/settings/members');
  redirect(
    buildSettingsMembersRedirect('message', 'Member removed successfully.'),
  );
}
