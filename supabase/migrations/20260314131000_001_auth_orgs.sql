create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum (
  'owner',
  'admin',
  'risk_manager',
  'procurement_lead',
  'viewer'
);

create type public.membership_status as enum ('invited', 'active', 'inactive');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select coalesce(
    case
      when auth.jwt() ? 'org_id' and auth.jwt() ->> 'org_id' <> '' then (auth.jwt() ->> 'org_id')::uuid
      else null
    end,
    case
      when coalesce(auth.jwt() -> 'app_metadata', '{}'::jsonb) ? 'org_id'
        and auth.jwt() -> 'app_metadata' ->> 'org_id' <> ''
        then (auth.jwt() -> 'app_metadata' ->> 'org_id')::uuid
      else null
    end
  );
$$;

-- Create tables first, then functions that reference them
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  headquarters_country text,
  created_by uuid references auth.users (id) on delete set null,
  settings jsonb not null default '{}'::jsonb,
  feature_flags jsonb not null default '{}'::jsonb,
  seed_source text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(name) between 2 and 120),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  display_name text,
  avatar_url text,
  current_organization_id uuid references public.organizations (id) on delete set null,
  preferences jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null default 'viewer',
  status public.membership_status not null default 'invited',
  invited_by uuid references auth.users (id) on delete set null,
  invited_at timestamptz not null default timezone('utc', now()),
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create index idx_organization_members_org_user
  on public.organization_members (organization_id, user_id);
create index idx_organization_members_user
  on public.organization_members (user_id);
create index idx_user_profiles_current_org
  on public.user_profiles (current_organization_id);

-- Create helper functions after tables exist
create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create or replace function public.has_org_role(
  target_org_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.user_profiles.display_name);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  claims jsonb := coalesce(event -> 'claims', '{}'::jsonb);
  target_user_id uuid := nullif(event ->> 'user_id', '')::uuid;
  resolved_org_id uuid;
begin
  if target_user_id is null then
    return event;
  end if;

  select coalesce(profile.current_organization_id, membership.organization_id)
  into resolved_org_id
  from public.user_profiles profile
  left join lateral (
    select organization_id
    from public.organization_members
    where user_id = profile.id
      and status = 'active'
    order by joined_at nulls first, created_at
    limit 1
  ) membership on true
  where profile.id = target_user_id;

  if resolved_org_id is not null then
    claims := jsonb_set(claims, '{org_id}', to_jsonb(resolved_org_id::text), true);
  end if;

  return jsonb_set(event, '{claims}', claims, true);
end;
$$;

grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.user_profiles enable row level security;
alter table public.user_profiles force row level security;
alter table public.organization_members enable row level security;
alter table public.organization_members force row level security;

create policy organizations_select
  on public.organizations
  for select
  using (public.is_org_member(id));

create policy organizations_insert
  on public.organizations
  for insert
  with check (auth.uid() is not null and created_by = auth.uid());

create policy organizations_update
  on public.organizations
  for update
  using (public.has_org_role(id, array['owner', 'admin']::public.app_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.app_role[]));

create policy organizations_delete
  on public.organizations
  for delete
  using (public.has_org_role(id, array['owner']::public.app_role[]));

create policy user_profiles_select
  on public.user_profiles
  for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.organization_members actor_membership
      join public.organization_members target_membership
        on target_membership.organization_id = actor_membership.organization_id
      where actor_membership.user_id = auth.uid()
        and actor_membership.status = 'active'
        and target_membership.user_id = public.user_profiles.id
        and target_membership.status = 'active'
    )
  );

create policy user_profiles_update
  on public.user_profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy organization_members_select
  on public.organization_members
  for select
  using (public.is_org_member(organization_id));

create policy organization_members_insert
  on public.organization_members
  for insert
  with check (
    (
      auth.uid() = user_id
      and role = 'owner'
      and status = 'active'
    )
    or public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[])
  );

create policy organization_members_update
  on public.organization_members
  for update
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy organization_members_delete
  on public.organization_members
  for delete
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

