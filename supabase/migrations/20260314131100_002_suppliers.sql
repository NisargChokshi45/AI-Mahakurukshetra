create type public.supplier_tier as enum ('tier_1', 'tier_2', 'tier_3');
create type public.supplier_status as enum ('active', 'watchlist', 'inactive');
create type public.facility_type as enum ('factory', 'warehouse', 'port', 'office');

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  name text not null,
  code text not null,
  country text not null,
  sub_region text,
  continent text,
  geopolitical_risk numeric(5,2) not null default 0,
  disaster_risk numeric(5,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, code)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  tier public.supplier_tier not null,
  status public.supplier_status not null default 'active',
  country text not null,
  website text,
  primary_contact_email citext,
  current_risk_score numeric(5,2) not null default 0,
  notes text,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

create table public.supplier_facilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  name text not null,
  facility_type public.facility_type not null,
  city text,
  country text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.supplier_region_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  region_id uuid not null references public.regions (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (supplier_id, region_id)
);

create index idx_regions_org on public.regions (organization_id);
create index idx_suppliers_org on public.suppliers (organization_id);
create index idx_suppliers_org_status on public.suppliers (organization_id, status);
create index idx_supplier_facilities_org on public.supplier_facilities (organization_id, supplier_id);
create index idx_supplier_region_links_org on public.supplier_region_links (organization_id, supplier_id);

create trigger regions_set_updated_at
before update on public.regions
for each row
execute function public.set_updated_at();

create trigger suppliers_set_updated_at
before update on public.suppliers
for each row
execute function public.set_updated_at();

create trigger supplier_facilities_set_updated_at
before update on public.supplier_facilities
for each row
execute function public.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['regions', 'suppliers', 'supplier_facilities', 'supplier_region_links']
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

create policy regions_write
  on public.regions
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]));

create policy suppliers_write
  on public.suppliers
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]));

create policy supplier_facilities_write
  on public.supplier_facilities
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]));

create policy supplier_region_links_write
  on public.supplier_region_links
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]));

