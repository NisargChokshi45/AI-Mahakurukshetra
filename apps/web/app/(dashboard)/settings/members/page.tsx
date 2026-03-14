import type { Metadata } from 'next';
import {
  deleteOrganizationMemberAction,
  inviteOrganizationMemberAction,
  updateOrganizationMemberRoleAction,
} from '@/app/(dashboard)/settings/members/actions';
import {
  PageHeader,
  SectionCard,
  buttonStyles,
} from '@/components/dashboard/ui';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/validations/auth';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Invite and manage organization members.',
};

export const dynamic = 'force-dynamic';

type MembersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type MemberRow = {
  user_id: string;
  role: AppRole;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
};

type MemberView = {
  canEditOrDelete: boolean;
  createdAt: string;
  displayName: string;
  email: string;
  id: string;
  isCurrentUser: boolean;
  role: AppRole;
  status: string;
};

const EDITABLE_ROLES: Exclude<AppRole, 'owner'>[] = [
  'admin',
  'risk_manager',
  'procurement_lead',
  'viewer',
];

const ROLE_SORT_PRIORITY: Record<AppRole, number> = {
  owner: 0,
  admin: 1,
  risk_manager: 2,
  procurement_lead: 3,
  viewer: 4,
};

const ROLE_SUMMARIES: Record<AppRole, string> = {
  owner: 'Full organization control and billing authority.',
  admin: 'Manages members and operational configuration.',
  procurement_lead: 'Owns supplier relationships and sourcing workflows.',
  risk_manager: 'Leads risk monitoring, triage, and incident response.',
  viewer: 'Read-only access to dashboards and reports.',
};

function readMessage(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function canManageMembers(role: AppRole) {
  return role === 'owner' || role === 'admin';
}

function roleLabel(role: AppRole) {
  return role.replaceAll('_', ' ');
}

function initials(value: string) {
  return value
    .split(' ')
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formattedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function roleBadgeClasses(role: AppRole) {
  switch (role) {
    case 'owner':
      return 'bg-violet-100 text-violet-700';
    case 'admin':
      return 'bg-sky-100 text-sky-700';
    case 'risk_manager':
      return 'bg-amber-100 text-amber-700';
    case 'procurement_lead':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function statusBadgeClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'active') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (normalized === 'invited') {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-slate-200 text-slate-700';
}

function matchesQuery(member: MemberView, query: string) {
  if (!query) {
    return true;
  }

  const normalized = query.toLowerCase();
  return (
    member.displayName.toLowerCase().includes(normalized) ||
    member.email.toLowerCase().includes(normalized) ||
    roleLabel(member.role).toLowerCase().includes(normalized) ||
    member.status.toLowerCase().includes(normalized)
  );
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const context = await requireOrganizationContext();
  const params = (await searchParams) ?? {};
  const error = readMessage(params.error);
  const message = readMessage(params.message);
  const search = readMessage(params.search)?.trim() ?? '';
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
  const managerAccess = canManageMembers(context.organization.role);

  const members: MemberView[] = memberRows
    .map((member) => {
      const profile = profileMap.get(member.user_id);
      const displayName =
        profile?.display_name ?? profile?.email ?? member.user_id;
      const email = profile?.email ?? 'No email available';
      const isCurrentUser = member.user_id === context.user.id;
      const isOwnerMember = member.role === 'owner';

      return {
        canEditOrDelete: managerAccess && !isCurrentUser && !isOwnerMember,
        createdAt: member.created_at,
        displayName,
        email,
        id: member.user_id,
        isCurrentUser,
        role: member.role,
        status: member.status,
      };
    })
    .sort((a, b) => {
      const byRole = ROLE_SORT_PRIORITY[a.role] - ROLE_SORT_PRIORITY[b.role];
      if (byRole !== 0) {
        return byRole;
      }

      return a.displayName.localeCompare(b.displayName);
    });

  const filteredMembers = members.filter((member) =>
    matchesQuery(member, search),
  );
  const activeMembers = members.filter(
    (member) => member.status === 'active',
  ).length;
  const pendingInvites = members.filter(
    (member) => member.status === 'invited',
  ).length;
  const adminsAndOwners = members.filter(
    (member) => member.role === 'owner' || member.role === 'admin',
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Member Management"
        title={`People and access controls for ${context.organization.organizationName}`}
        description="Invite teammates, adjust roles, and keep access aligned with operational responsibilities."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Active members
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {activeMembers}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Admin coverage
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {adminsAndOwners}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Pending invites
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {pendingInvites}
          </p>
        </article>
      </section>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <SectionCard
          eyebrow="Invite"
          title="Add a teammate"
          description="New members are attached directly to this organization and can access the workspace based on role."
        >
          {managerAccess ? (
            <form action={inviteOrganizationMemberAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  required
                  type="email"
                  name="email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-400"
                  placeholder="teammate@company.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Role</span>
                <select
                  name="role"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none focus:border-emerald-400"
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
                className={`${buttonStyles('primary')} w-full`}
              >
                Send invite
              </button>
            </form>
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Only owners and admins can invite or manage members.
            </p>
          )}

          <div className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Role guide</p>
            {Object.entries(ROLE_SUMMARIES).map(([role, summary]) => (
              <p key={role} className="text-xs leading-5 text-slate-600">
                <span className="font-semibold text-slate-800">
                  {roleLabel(role as AppRole)}:
                </span>{' '}
                {summary}
              </p>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Directory"
          title="Current members"
          description="Search, scan role coverage, and update access from one place."
          actions={
            <form method="get" className="w-full md:w-72">
              <label htmlFor="members-search" className="sr-only">
                Search members
              </label>
              <input
                id="members-search"
                name="search"
                defaultValue={search}
                placeholder="Search name, email, role, status"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-400"
              />
            </form>
          }
        >
          {filteredMembers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">
              No members match your search.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <article
                  key={member.id}
                  className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold tracking-wide text-white">
                          {initials(member.displayName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {member.displayName}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {member.email}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Joined {formattedDate(member.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClasses(member.role)}`}
                      >
                        {roleLabel(member.role)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusBadgeClasses(member.status)}`}
                      >
                        {member.status}
                      </span>
                      {member.isCurrentUser ? (
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                          You
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {managerAccess ? (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <form
                          action={updateOrganizationMemberRoleAction}
                          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
                        >
                          <input
                            type="hidden"
                            name="userId"
                            value={member.id}
                          />
                          <label
                            htmlFor={`role-${member.id}`}
                            className="sr-only"
                          >
                            Role
                          </label>
                          <select
                            id={`role-${member.id}`}
                            name="role"
                            defaultValue={member.role}
                            disabled={!member.canEditOrDelete}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 sm:w-52"
                          >
                            {EDITABLE_ROLES.map((roleOption) => (
                              <option key={roleOption} value={roleOption}>
                                {roleLabel(roleOption)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            disabled={!member.canEditOrDelete}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Update role
                          </button>
                        </form>

                        <form action={deleteOrganizationMemberAction}>
                          <input
                            type="hidden"
                            name="userId"
                            value={member.id}
                          />
                          <button
                            type="submit"
                            disabled={!member.canEditOrDelete}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </form>
                      </div>

                      {!member.canEditOrDelete ? (
                        <p className="mt-2 text-xs text-slate-500">
                          {member.isCurrentUser
                            ? 'Use another owner or admin account to change your own access.'
                            : 'Owner memberships cannot be changed from this screen.'}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
