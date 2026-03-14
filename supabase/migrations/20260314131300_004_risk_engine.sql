create type public.risk_event_type as enum (
  'geopolitical',
  'natural_disaster',
  'financial',
  'operational',
  'compliance',
  'delivery'
);

create type public.severity_level as enum ('low', 'medium', 'high', 'critical');
create type public.risk_score_target as enum ('supplier', 'region');

create table public.risk_score_configs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  financial_weight numeric(5,2) not null default 20,
  geopolitical_weight numeric(5,2) not null default 20,
  natural_disaster_weight numeric(5,2) not null default 20,
  operational_weight numeric(5,2) not null default 15,
  compliance_weight numeric(5,2) not null default 15,
  delivery_weight numeric(5,2) not null default 10,
  alert_threshold numeric(5,2) not null default 70,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id)
);

create table public.risk_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  title text not null,
  event_type public.risk_event_type not null,
  severity public.severity_level not null,
  source text not null,
  source_url text,
  region_id uuid references public.regions (id) on delete set null,
  summary text not null,
  detected_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.disruptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  risk_event_id uuid not null references public.risk_events (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  title text not null,
  impact_summary text,
  financial_impact_usd numeric(12,2),
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  target_type public.risk_score_target not null,
  supplier_id uuid references public.suppliers (id) on delete cascade,
  region_id uuid references public.regions (id) on delete cascade,
  financial_score numeric(5,2) not null default 0,
  geopolitical_score numeric(5,2) not null default 0,
  natural_disaster_score numeric(5,2) not null default 0,
  operational_score numeric(5,2) not null default 0,
  compliance_score numeric(5,2) not null default 0,
  delivery_score numeric(5,2) not null default 0,
  composite_score numeric(5,2) not null default 0,
  score_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  check (
    (target_type = 'supplier' and supplier_id is not null and region_id is null)
    or (target_type = 'region' and region_id is not null and supplier_id is null)
  )
);

create index idx_risk_events_org_severity on public.risk_events (organization_id, severity);
create index idx_disruptions_org on public.disruptions (organization_id, risk_event_id);
create index idx_risk_scores_supplier_created on public.risk_scores (supplier_id, created_at desc);
create index idx_risk_scores_region_created on public.risk_scores (region_id, created_at desc);

create trigger risk_score_configs_set_updated_at
before update on public.risk_score_configs
for each row
execute function public.set_updated_at();

create trigger risk_events_set_updated_at
before update on public.risk_events
for each row
execute function public.set_updated_at();

create trigger disruptions_set_updated_at
before update on public.disruptions
for each row
execute function public.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['risk_score_configs', 'risk_events', 'disruptions', 'risk_scores']
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

create policy risk_score_configs_write
  on public.risk_score_configs
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy risk_events_write
  on public.risk_events
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy disruptions_write
  on public.disruptions
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

create policy risk_scores_write
  on public.risk_scores
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager']::public.app_role[]));

