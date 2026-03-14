'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireOrganizationContext } from '@/lib/auth/session';
import { resolveAuthCallbackUrl } from '@/lib/security/redirects';
import { createAdminClient } from '@/lib/supabase/admin';
import { inviteMemberSchema } from '@/lib/validations/auth';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function inviteOrganizationMemberAction(formData: FormData) {
  const context = await requireOrganizationContext();

  if (!['owner', 'admin'].includes(context.organization.role)) {
    redirect(
      '/settings/members?error=' +
        encodeURIComponent('Only owners and admins can invite members.'),
    );
  }

  const parsed = inviteMemberSchema.safeParse({
    email: getString(formData, 'email'),
    role: getString(formData, 'role'),
  });

  if (!parsed.success) {
    redirect(
      '/settings/members?error=' +
        encodeURIComponent('Enter a valid email and role.'),
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
      redirect('/settings/members?error=' + encodeURIComponent(error.message));
    }

    userId = data.user?.id ?? null;
  }

  if (!userId) {
    redirect(
      '/settings/members?error=' +
        encodeURIComponent('Unable to resolve the invited user.'),
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
    redirect(
      '/settings/members?error=' + encodeURIComponent(membershipError.message),
    );
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
    '/settings/members?message=' +
      encodeURIComponent('Member invited successfully.'),
  );
}
