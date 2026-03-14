create or replace function public.find_alternative_suppliers(
  p_org_id uuid,
  p_supplier_id uuid,
  p_region_ids uuid[] default null,
  p_limit integer default 5
)
returns table (
  supplier_id uuid,
  supplier_slug text,
  name text,
  tier public.supplier_tier,
  status public.supplier_status,
  country text,
  current_risk_score numeric,
  matched_component_count integer,
  matched_components text[],
  regions text[]
)
language sql
stable
as $$
  with target_components as (
    select component_id
    from public.supplier_components
    where organization_id = p_org_id
      and supplier_id = p_supplier_id
  ),
  target_regions as (
    select region_id
    from public.supplier_region_links
    where organization_id = p_org_id
      and supplier_id = p_supplier_id
  ),
  candidate_suppliers as (
    select distinct s.id
    from public.suppliers s
    join public.supplier_components sc
      on sc.supplier_id = s.id
    where s.organization_id = p_org_id
      and s.id <> p_supplier_id
      and sc.component_id in (select component_id from target_components)
      and (
        (select count(*) from target_regions) = 0
        or not exists (
          select 1
          from public.supplier_region_links overlap
          where overlap.organization_id = p_org_id
            and overlap.supplier_id = s.id
            and overlap.region_id in (select region_id from target_regions)
        )
      )
      and (
        p_region_ids is null
        or exists (
          select 1
          from public.supplier_region_links scope
          where scope.organization_id = p_org_id
            and scope.supplier_id = s.id
            and scope.region_id = any(p_region_ids)
        )
      )
  )
  select
    s.id as supplier_id,
    s.slug as supplier_slug,
    s.name,
    s.tier,
    s.status,
    s.country,
    s.current_risk_score,
    count(distinct sc.component_id)::integer as matched_component_count,
    array_agg(distinct c.name) filter (where c.name is not null) as matched_components,
    array_agg(distinct r.name) filter (where r.name is not null) as regions
  from public.suppliers s
  join public.supplier_components sc
    on sc.supplier_id = s.id
  join public.components c
    on c.id = sc.component_id
  left join public.supplier_region_links srl
    on srl.supplier_id = s.id
  left join public.regions r
    on r.id = srl.region_id
  where s.organization_id = p_org_id
    and s.id in (select id from candidate_suppliers)
    and sc.component_id in (select component_id from target_components)
  group by s.id
  order by
    matched_component_count desc,
    case s.status
      when 'active' then 0
      when 'watchlist' then 1
      else 2
    end,
    avg(sc.lead_time_days) asc nulls last,
    s.current_risk_score asc nulls last
  limit greatest(p_limit, 1);
$$;
