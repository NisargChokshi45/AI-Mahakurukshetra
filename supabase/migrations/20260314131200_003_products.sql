create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  name text not null,
  sku text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  component_code text,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table public.supplier_components (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  component_id uuid not null references public.components (id) on delete cascade,
  lead_time_days integer,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (supplier_id, component_id)
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  contract_number text not null,
  value_usd numeric(12,2),
  start_date date,
  end_date date,
  sla_terms text,
  renewal_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, contract_number)
);

create index idx_products_org on public.products (organization_id);
create index idx_components_org on public.components (organization_id, product_id);
create index idx_supplier_components_org on public.supplier_components (organization_id, supplier_id);
create index idx_contracts_org on public.contracts (organization_id, supplier_id);

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger components_set_updated_at
before update on public.components
for each row
execute function public.set_updated_at();

create trigger contracts_set_updated_at
before update on public.contracts
for each row
execute function public.set_updated_at();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['products', 'components', 'supplier_components', 'contracts']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format(
      'create policy %I on public.%I for select using (public.is_org_member(organization_id))',
      table_name || '_select',
      table_name
    );
    execute format(
      'create policy %I on public.%I for all using (public.has_org_role(organization_id, array[''owner'',''admin'',''procurement_lead'']::public.app_role[])) with check (public.has_org_role(organization_id, array[''owner'',''admin'',''procurement_lead'']::public.app_role[]))',
      table_name || '_write',
      table_name
    );
  end loop;
end;
$$;

