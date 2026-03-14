import type { Metadata } from 'next';
import { inviteOrganizationMemberAction } from '@/app/(dashboard)/settings/members/actions';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Invite and manage organization members.',
};

export const dynamic = 'force-dynamic';

type MembersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type MemberRow = {
  user_id: string;
  role: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
};

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const context = await requireOrganizationContext();
  const params = (await searchParams) ?? {};
  const error = readMessage(params.error);
  const message = readMessage(params.message);
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('user_id, role, status, created_at')
    .eq('organization_id', context.organization.organizationId)
    .order('created_at', { ascending: true });

  const memberRows = (memberships ?? []) as MemberRow[];
  const userIds = memberRows.map((member) => member.user_id);

  const { data: profiles } = userIds.length
    ? await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds)
    : { data: [] as ProfileRow[] };

  const profileMap = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.28em] text-emerald-700 uppercase">
          Invite Member
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Manage access for {context.organization.organizationName}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Invitations are backed by auth identities and organization
          memberships.
        </p>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        <form
          action={inviteOrganizationMemberAction}
          className="mt-6 space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              name="email"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none"
              placeholder="teammate@company.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              name="role"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none"
              defaultValue="viewer"
            >
              <option value="admin">Admin</option>
              <option value="risk_manager">Risk manager</option>
              <option value="procurement_lead">Procurement lead</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Send invite
          </button>
        </form>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold tracking-[0.28em] text-slate-500 uppercase">
          Current Access
        </p>
        <div className="mt-6 space-y-3">
          {memberRows.map((member) => {
            const profile = profileMap.get(member.user_id);

            return (
              <article
                key={member.user_id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-950">
                    {profile?.display_name ?? profile?.email ?? member.user_id}
                  </p>
                  <p className="text-sm text-slate-500">
                    {profile?.email ?? 'No email available'}
                  </p>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {member.role}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                    {member.status}
                  </span>
                </div>
              </article>
            );
          })}

          {memberRows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
              No members yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
