create or replace function public.enforce_risk_link_organization_integrity()
returns trigger
language plpgsql
as $$
declare
  supplier_org_id uuid;
  risk_event_org_id uuid;
begin
  if new.supplier_id is not null then
    select organization_id
      into supplier_org_id
      from public.suppliers
     where id = new.supplier_id;

    if supplier_org_id is null then
      raise exception 'Invalid supplier reference: %', new.supplier_id
        using errcode = '23503';
    end if;

    if supplier_org_id <> new.organization_id then
      raise exception
        'Supplier % does not belong to organization %',
        new.supplier_id,
        new.organization_id
        using errcode = '23514';
    end if;
  end if;

  if new.risk_event_id is not null then
    select organization_id
      into risk_event_org_id
      from public.risk_events
     where id = new.risk_event_id;

    if risk_event_org_id is null then
      raise exception 'Invalid risk event reference: %', new.risk_event_id
        using errcode = '23503';
    end if;

    if risk_event_org_id <> new.organization_id then
      raise exception
        'Risk event % does not belong to organization %',
        new.risk_event_id,
        new.organization_id
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists disruptions_enforce_risk_link_org_integrity on public.disruptions;
create trigger disruptions_enforce_risk_link_org_integrity
before insert or update of organization_id, supplier_id, risk_event_id
on public.disruptions
for each row
execute function public.enforce_risk_link_organization_integrity();

drop trigger if exists risk_scores_enforce_risk_link_org_integrity on public.risk_scores;
create trigger risk_scores_enforce_risk_link_org_integrity
before insert or update of organization_id, supplier_id, risk_event_id
on public.risk_scores
for each row
execute function public.enforce_risk_link_organization_integrity();

drop trigger if exists alerts_enforce_risk_link_org_integrity on public.alerts;
create trigger alerts_enforce_risk_link_org_integrity
before insert or update of organization_id, supplier_id, risk_event_id
on public.alerts
for each row
execute function public.enforce_risk_link_organization_integrity();
