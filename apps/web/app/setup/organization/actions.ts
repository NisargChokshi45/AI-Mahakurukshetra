'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { slugify } from '@/lib/slug';
import { createClient } from '@/lib/supabase/server';
import { createOrganizationSchema } from '@/lib/validations/organization';

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function createOrganizationAction(formData: FormData) {
  const context = await requireUser();
  const parsed = createOrganizationSchema.safeParse({
    name: getString(formData, 'name'),
    industry: getString(formData, 'industry'),
    headquartersCountry: getString(formData, 'headquartersCountry'),
  });

  if (!parsed.success) {
    redirect(
      '/setup/organization?error=' +
        encodeURIComponent('Enter a valid organization name.'),
    );
  }

  const supabase = await createClient();
  const baseSlug =
    slugify(parsed.data.name) || `org-${context.user.id.slice(0, 8)}`;
  let organizationId: string | null = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug =
      attempt === 0
        ? baseSlug
        : `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        created_by: context.user.id,
        headquarters_country: parsed.data.headquartersCountry || null,
        industry: parsed.data.industry || null,
        name: parsed.data.name,
        seed_source: 'onboarding',
        slug,
      })
      .select('id')
      .single();

    if (!error && data) {
      organizationId = data.id;
      break;
    }
  }

  if (!organizationId) {
    redirect(
      '/setup/organization?error=' +
        encodeURIComponent('Unable to create the organization right now.'),
    );
  }

  const [
    { error: membershipError },
    { error: configError },
    { error: profileError },
  ] = await Promise.all([
    supabase.from('organization_members').insert({
      joined_at: new Date().toISOString(),
      organization_id: organizationId,
      role: 'owner',
      status: 'active',
      user_id: context.user.id,
    }),
    supabase.from('risk_score_configs').upsert({
      organization_id: organizationId,
    }),
    supabase
      .from('user_profiles')
      .update({
        current_organization_id: organizationId,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', context.user.id),
  ]);

  if (membershipError || configError || profileError) {
    redirect(
      '/setup/organization?error=' +
        encodeURIComponent(
          membershipError?.message ??
            configError?.message ??
            profileError?.message ??
            'Unable to finish organization setup.',
        ),
    );
  }

  revalidatePath('/dashboard');
  redirect('/dashboard?message=' + encodeURIComponent('Organization created.'));
}
