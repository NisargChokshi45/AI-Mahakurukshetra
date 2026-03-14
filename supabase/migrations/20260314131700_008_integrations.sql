create type public.integration_type as enum ('erp', 'webhook', 'csv_import');
create type public.integration_status as enum ('connected', 'degraded', 'disconnected');
create type public.notification_channel as enum ('in_app', 'email');

create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  title text not null,
  assumptions text not null,
  expected_impact text,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  recorded_at timestamptz not null default timezone('utc', now()),
  total_suppliers integer not null default 0,
  at_risk_suppliers integer not null default 0,
  open_incidents integer not null default 0,
  mttr_hours numeric(8,2) not null default 0,
  false_positive_rate numeric(5,2) not null default 0
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  alert_id uuid references public.alerts (id) on delete cascade,
  channel public.notification_channel not null,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  name text not null,
  integration_type public.integration_type not null,
  credentials jsonb not null default '{}'::jsonb,
  status public.integration_status not null default 'disconnected',
  last_sync_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_metrics_org_created on public.metrics (organization_id, recorded_at desc);
create index idx_notifications_org on public.notifications (organization_id, user_id);
create index idx_integration_connections_org on public.integration_connections (organization_id, status);

create trigger scenarios_set_updated_at
before update on public.scenarios
for each row
execute function public.set_updated_at();

create trigger integration_connections_set_updated_at
before update on public.integration_connections
for each row
execute function public.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['scenarios', 'metrics', 'notifications', 'integration_connections']
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

create policy scenarios_write
  on public.scenarios
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy metrics_write
  on public.metrics
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy notifications_write
  on public.notifications
  for all
  using (
    user_id = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[])
  )
  with check (
    user_id = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[])
  );

create policy integration_connections_write
  on public.integration_connections
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

