import type { Metadata } from 'next';
import {
  deleteOrganizationMemberAction,
  inviteOrganizationMemberAction,
  updateOrganizationMemberRoleAction,
} from '@/app/(dashboard)/settings/members/actions';
import {
  PageHeader,
  SectionCard,
  SelectField,
  buttonStyles,
  selectStyles,
} from '@/components/dashboard/ui';
import { requireOrganizationContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { consumeFlash } from '@/lib/flash';
import type { AppRole } from '@/lib/validations/auth';
import { DismissibleToast } from '@/app/(dashboard)/settings/members/_components/dismissible-toast';

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
  const { error, message } = await consumeFlash();
  const roleToastMessages = new Set([
    'Member role updated successfully.',
    'No role changes were needed.',
  ]);
  const isRoleToast = Boolean(message && roleToastMessages.has(message));
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Member Management"
        title={`People and access controls for ${context.organization.organizationName}`}
        description="Invite teammates, adjust roles, and keep access aligned with operational responsibilities."
      />

      <SectionCard
        eyebrow="Invite"
        title="Add a teammate"
        description="New members are attached directly to this organization and can access the workspace based on role."
      >
        {managerAccess ? (
          <form action={inviteOrganizationMemberAction} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_auto] md:items-end">
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
                <SelectField name="role" defaultValue="viewer">
                  <option value="admin">Admin</option>
                  <option value="risk_manager">Risk manager</option>
                  <option value="procurement_lead">Procurement lead</option>
                  <option value="viewer">Viewer</option>
                </SelectField>
              </label>

              <button type="submit" className={buttonStyles('primary')}>
                Send invite
              </button>
            </div>
          </form>
        ) : (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Only owners and admins can invite or manage members.
          </p>
        )}
      </SectionCard>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        isRoleToast ? (
          <DismissibleToast message={message} />
        ) : (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )
      ) : null}

      <SectionCard
        eyebrow="Directory"
        title="Current members"
        description="Search, scan role coverage, and update access from one place."
        className="p-4 [&>div:first-child]:gap-3 [&>div:first-child]:pb-4 [&>div:last-child]:pt-4"
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
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Avatar + identity */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold tracking-wide text-white">
                    {initials(member.displayName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {member.displayName}
                      </p>
                      {member.isCurrentUser ? (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:w-48 sm:flex-nowrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadgeClasses(member.role)}`}
                  >
                    {roleLabel(member.role)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClasses(member.status)}`}
                  >
                    {member.status}
                  </span>
                </div>

                {/* Actions */}
                {managerAccess ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <form
                      action={updateOrganizationMemberRoleAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="userId" value={member.id} />
                      <label htmlFor={`role-${member.id}`} className="sr-only">
                        Role
                      </label>
                      <SelectField
                        id={`role-${member.id}`}
                        name="role"
                        defaultValue={member.role}
                        disabled={!member.canEditOrDelete}
                        className="h-8 w-40 rounded-lg px-2 py-1 text-xs"
                      >
                        {EDITABLE_ROLES.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleLabel(roleOption)}
                          </option>
                        ))}
                      </SelectField>
                      <button
                        type="submit"
                        disabled={!member.canEditOrDelete}
                        className="h-8 rounded-lg border border-slate-300 px-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Update
                      </button>
                    </form>

                    <form action={deleteOrganizationMemberAction}>
                      <input type="hidden" name="userId" value={member.id} />
                      <button
                        type="submit"
                        disabled={!member.canEditOrDelete}
                        className="h-8 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
