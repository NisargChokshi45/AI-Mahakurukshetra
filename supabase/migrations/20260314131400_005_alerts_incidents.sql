create type public.alert_status as enum ('new', 'acknowledged', 'dismissed', 'resolved');
create type public.incident_status as enum ('new', 'investigating', 'mitigating', 'resolved');
create type public.incident_priority as enum ('low', 'medium', 'high', 'critical');
create type public.action_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type public.mitigation_type as enum ('dual_source', 'inventory_buffer', 'alternative_route', 'compliance_fix', 'supplier_recovery');
create type public.mitigation_status as enum ('planned', 'active', 'completed', 'cancelled');

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  region_id uuid references public.regions (id) on delete set null,
  risk_event_id uuid references public.risk_events (id) on delete set null,
  severity public.severity_level not null,
  title text not null,
  summary text not null,
  status public.alert_status not null default 'new',
  acknowledged_by uuid references auth.users (id) on delete set null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  disruption_id uuid references public.disruptions (id) on delete set null,
  risk_event_id uuid references public.risk_events (id) on delete set null,
  title text not null,
  summary text not null,
  status public.incident_status not null default 'new',
  priority public.incident_priority not null default 'medium',
  owner_user_id uuid references auth.users (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.incident_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  incident_id uuid not null references public.incidents (id) on delete cascade,
  description text not null,
  assignee_user_id uuid references auth.users (id) on delete set null,
  due_date date,
  status public.action_status not null default 'todo',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.mitigation_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  risk_event_id uuid references public.risk_events (id) on delete set null,
  title text not null,
  mitigation_type public.mitigation_type not null,
  status public.mitigation_status not null default 'planned',
  owner_user_id uuid references auth.users (id) on delete set null,
  details text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_alerts_org_status on public.alerts (organization_id, status);
create index idx_incidents_org_status on public.incidents (organization_id, status);
create index idx_incident_actions_org on public.incident_actions (organization_id, incident_id);
create index idx_mitigation_plans_org on public.mitigation_plans (organization_id, status);

create trigger alerts_set_updated_at
before update on public.alerts
for each row
execute function public.set_updated_at();

create trigger incidents_set_updated_at
before update on public.incidents
for each row
execute function public.set_updated_at();

create trigger incident_actions_set_updated_at
before update on public.incident_actions
for each row
execute function public.set_updated_at();

create trigger mitigation_plans_set_updated_at
before update on public.mitigation_plans
for each row
execute function public.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['alerts', 'incidents', 'incident_actions', 'mitigation_plans']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format(
      'create policy %I on public.%I for select using (public.is_org_member(organization_id))',
      table_name || '_select',
      table_name
    );
  end loop;
end;
$$;

create policy alerts_write
  on public.alerts
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]));

create policy incidents_write
  on public.incidents
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy incident_actions_write
  on public.incident_actions
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy mitigation_plans_write
  on public.mitigation_plans
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

