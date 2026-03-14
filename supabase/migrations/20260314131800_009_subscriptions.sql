create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');
create type public.price_interval as enum ('month', 'year');
create type public.payment_event_status as enum ('succeeded', 'failed');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id)
);

create table public.prices (
  id uuid primary key default gen_random_uuid(),
  stripe_price_id text not null unique,
  nickname text not null,
  currency text not null default 'usd',
  unit_amount integer not null,
  interval public.price_interval not null,
  supplier_limit integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  price_id uuid references public.prices (id) on delete set null,
  stripe_subscription_id text not null unique,
  status public.subscription_status not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id)
);

create table public.payment_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  stripe_invoice_id text,
  amount integer not null,
  currency text not null default 'usd',
  status public.payment_event_status not null,
  paid_at timestamptz not null default timezone('utc', now())
);

create index idx_customers_org on public.customers (organization_id);
create index idx_subscriptions_org on public.subscriptions (organization_id, status);
create index idx_payment_history_org on public.payment_history (organization_id, paid_at desc);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.customers force row level security;
alter table public.prices enable row level security;
alter table public.prices force row level security;
alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;
alter table public.payment_history enable row level security;
alter table public.payment_history force row level security;

create policy customers_select
  on public.customers
  for select
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy customers_write
  on public.customers
  for all
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy prices_select
  on public.prices
  for select
  using (auth.uid() is not null);

create policy subscriptions_select
  on public.subscriptions
  for select
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy subscriptions_write
  on public.subscriptions
  for all
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy payment_history_select
  on public.payment_history
  for select
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]));

create policy payment_history_write
  on public.payment_history
  for all
  using (public.has_org_role(organization_id, array['owner']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner']::public.app_role[]));

