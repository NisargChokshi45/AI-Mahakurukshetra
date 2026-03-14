create type public.shipment_status as enum ('planned', 'in_transit', 'delayed', 'delivered', 'cancelled');

create table public.inventories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete cascade,
  facility_id uuid references public.supplier_facilities (id) on delete set null,
  quantity_on_hand integer not null default 0,
  buffer_target integer not null default 0,
  updated_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, component_id, facility_id)
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  component_id uuid references public.components (id) on delete set null,
  origin text not null,
  destination text not null,
  carrier text,
  eta_date date,
  status public.shipment_status not null default 'planned',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index idx_inventories_org on public.inventories (organization_id, component_id);
create index idx_shipments_org on public.shipments (organization_id, status);

create trigger inventories_set_updated_at
before update on public.inventories
for each row
execute function public.set_updated_at();

create trigger shipments_set_updated_at
before update on public.shipments
for each row
execute function public.set_updated_at();

alter table public.inventories enable row level security;
alter table public.inventories force row level security;
alter table public.shipments enable row level security;
alter table public.shipments force row level security;

create policy inventories_select
  on public.inventories
  for select
  using (public.is_org_member(organization_id));

create policy inventories_write
  on public.inventories
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]));

create policy shipments_select
  on public.shipments
  for select
  using (public.is_org_member(organization_id));

create policy shipments_write
  on public.shipments
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'procurement_lead']::public.app_role[]));

