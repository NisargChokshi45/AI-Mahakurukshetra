alter table public.risk_scores
  add column if not exists risk_event_id uuid references public.risk_events (id) on delete set null,
  add column if not exists triggered_by_source text not null default 'system',
  add column if not exists triggered_by_user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_risk_scores_risk_event_created
  on public.risk_scores (risk_event_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'risk_scores_triggered_by_source_check'
      and conrelid = 'public.risk_scores'::regclass
  ) then
    alter table public.risk_scores
      add constraint risk_scores_triggered_by_source_check
      check (
        triggered_by_source in ('manual_ingestion', 'monitoring_webhook', 'system')
      );
  end if;
end;
$$;
