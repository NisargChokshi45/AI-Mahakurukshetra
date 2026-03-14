create type public.assessment_status as enum ('draft', 'completed', 'archived');
create type public.report_type as enum ('executive_summary', 'supplier_scorecard', 'compliance');
create type public.report_format as enum ('pdf', 'csv');

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  financial_score numeric(5,2) not null default 0,
  operational_score numeric(5,2) not null default 0,
  compliance_score numeric(5,2) not null default 0,
  performance_score numeric(5,2) not null default 0,
  summary text,
  status public.assessment_status not null default 'draft',
  assessed_by uuid references auth.users (id) on delete set null default auth.uid(),
  assessed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default public.current_org_id() references public.organizations (id) on delete cascade,
  report_type public.report_type not null,
  report_format public.report_format not null,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  storage_path text,
  generated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_assessments_org on public.assessments (organization_id, supplier_id);
create index idx_reports_org on public.reports (organization_id, report_type, generated_at desc);

create trigger assessments_set_updated_at
before update on public.assessments
for each row
execute function public.set_updated_at();

alter table public.assessments enable row level security;
alter table public.assessments force row level security;
alter table public.reports enable row level security;
alter table public.reports force row level security;

create policy assessments_select
  on public.assessments
  for select
  using (public.is_org_member(organization_id));

create policy assessments_write
  on public.assessments
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]));

create policy reports_select
  on public.reports
  for select
  using (public.is_org_member(organization_id));

create policy reports_write
  on public.reports
  for all
  using (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin', 'risk_manager', 'procurement_lead']::public.app_role[]));

