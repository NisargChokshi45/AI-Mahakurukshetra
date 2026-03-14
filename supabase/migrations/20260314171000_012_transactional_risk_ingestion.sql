create or replace function public.process_risk_event_ingestion(
  p_organization_id uuid,
  p_title text,
  p_event_type public.risk_event_type,
  p_severity public.severity_level,
  p_source text,
  p_source_url text default null,
  p_summary text default '',
  p_supplier_ids uuid[] default array[]::uuid[],
  p_actor_user_id uuid default null,
  p_ingestion_source text default 'system',
  p_risk_event_id uuid default null
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_risk_event_id uuid;
  v_is_update boolean := p_risk_event_id is not null;
  v_normalized_supplier_ids uuid[] := array[]::uuid[];
  v_previous_supplier_ids uuid[] := array[]::uuid[];
  v_impacted_supplier_ids uuid[] := array[]::uuid[];

  v_alerts_created integer := 0;
  v_scores_inserted integer := 0;
  v_escalation_alert_created boolean := false;

  v_base_score numeric(5, 2);
  v_bump numeric(5, 2) := 15;

  v_financial numeric(5, 2);
  v_geopolitical numeric(5, 2);
  v_natural_disaster numeric(5, 2);
  v_operational numeric(5, 2);
  v_compliance numeric(5, 2);
  v_delivery numeric(5, 2);

  v_financial_weight numeric(5, 2);
  v_geopolitical_weight numeric(5, 2);
  v_natural_disaster_weight numeric(5, 2);
  v_operational_weight numeric(5, 2);
  v_compliance_weight numeric(5, 2);
  v_delivery_weight numeric(5, 2);
  v_alert_threshold numeric(5, 2);

  v_weighted_sum numeric(12, 4);
  v_total_weight numeric(12, 4);
  v_composite numeric(5, 2);
  v_previous_composite numeric(5, 2);
  v_threshold_crossed boolean;
  v_score_severity public.severity_level;
  v_threshold_severity public.severity_level;

  v_supplier_id uuid;
  v_supplier_name text;
begin
  if p_organization_id is null then
    raise exception 'organization_id is required' using errcode = '23502';
  end if;

  if p_ingestion_source not in ('manual_ingestion', 'monitoring_webhook', 'system') then
    raise exception 'Invalid ingestion source: %', p_ingestion_source using errcode = '23514';
  end if;

  select coalesce(array_agg(distinct supplier_id), array[]::uuid[])
    into v_normalized_supplier_ids
    from unnest(coalesce(p_supplier_ids, array[]::uuid[])) as supplier_id;

  if cardinality(v_normalized_supplier_ids) > 0 then
    if (
      select count(*)
      from public.suppliers
      where organization_id = p_organization_id
        and id = any(v_normalized_supplier_ids)
    ) <> cardinality(v_normalized_supplier_ids) then
      raise exception
        'One or more supplier IDs are invalid for organization %',
        p_organization_id
        using errcode = '23514';
    end if;
  end if;

  insert into public.risk_score_configs (
    organization_id,
    financial_weight,
    geopolitical_weight,
    natural_disaster_weight,
    operational_weight,
    compliance_weight,
    delivery_weight,
    alert_threshold
  )
  values (
    p_organization_id,
    20,
    20,
    20,
    15,
    15,
    10,
    70
  )
  on conflict (organization_id) do nothing;

  select
    financial_weight,
    geopolitical_weight,
    natural_disaster_weight,
    operational_weight,
    compliance_weight,
    delivery_weight,
    alert_threshold
    into
      v_financial_weight,
      v_geopolitical_weight,
      v_natural_disaster_weight,
      v_operational_weight,
      v_compliance_weight,
      v_delivery_weight,
      v_alert_threshold
    from public.risk_score_configs
   where organization_id = p_organization_id;

  if not found then
    raise exception
      'Risk score config not found for organization %',
      p_organization_id
      using errcode = 'P0001';
  end if;

  if v_is_update then
    select id
      into v_risk_event_id
      from public.risk_events
     where id = p_risk_event_id
       and organization_id = p_organization_id;

    if v_risk_event_id is null then
      raise exception
        'Risk event % not found for organization %',
        p_risk_event_id,
        p_organization_id
        using errcode = 'P0001';
    end if;

    select coalesce(array_agg(distinct supplier_id), array[]::uuid[])
      into v_previous_supplier_ids
      from public.disruptions
     where organization_id = p_organization_id
       and risk_event_id = v_risk_event_id
       and supplier_id is not null;

    update public.risk_events
       set title = p_title,
           event_type = p_event_type,
           severity = p_severity,
           source = p_source,
           source_url = nullif(p_source_url, ''),
           summary = p_summary,
           detected_at = timezone('utc', now())
     where id = v_risk_event_id
       and organization_id = p_organization_id;

    delete from public.disruptions
     where organization_id = p_organization_id
       and risk_event_id = v_risk_event_id;
  else
    insert into public.risk_events (
      organization_id,
      title,
      event_type,
      severity,
      source,
      source_url,
      summary,
      created_by,
      detected_at
    )
    values (
      p_organization_id,
      p_title,
      p_event_type,
      p_severity,
      p_source,
      nullif(p_source_url, ''),
      p_summary,
      p_actor_user_id,
      timezone('utc', now())
    )
    returning id into v_risk_event_id;
  end if;

  if cardinality(v_normalized_supplier_ids) > 0 then
    insert into public.disruptions (
      organization_id,
      risk_event_id,
      supplier_id,
      title,
      impact_summary
    )
    select
      p_organization_id,
      v_risk_event_id,
      supplier_id,
      'Disruption: ' || p_title,
      p_summary
    from unnest(v_normalized_supplier_ids) as supplier_id;
  end if;

  if v_is_update then
    select coalesce(array_agg(distinct supplier_id), array[]::uuid[])
      into v_impacted_supplier_ids
      from unnest(v_previous_supplier_ids || v_normalized_supplier_ids) as supplier_id;
  else
    v_impacted_supplier_ids := v_normalized_supplier_ids;
  end if;

  if p_severity = 'low' then
    v_base_score := 25;
  elsif p_severity = 'medium' then
    v_base_score := 45;
  elsif p_severity = 'high' then
    v_base_score := 70;
  else
    v_base_score := 90;
  end if;

  foreach v_supplier_id in array v_impacted_supplier_ids
  loop
    v_financial := v_base_score;
    v_geopolitical := v_base_score;
    v_natural_disaster := v_base_score;
    v_operational := v_base_score;
    v_compliance := v_base_score;
    v_delivery := v_base_score;

    case p_event_type
      when 'geopolitical' then
        v_geopolitical := least(100, v_geopolitical + v_bump);
      when 'natural_disaster' then
        v_natural_disaster := least(100, v_natural_disaster + v_bump);
      when 'financial' then
        v_financial := least(100, v_financial + v_bump);
      when 'operational' then
        v_operational := least(100, v_operational + v_bump);
      when 'compliance' then
        v_compliance := least(100, v_compliance + v_bump);
      when 'delivery' then
        v_delivery := least(100, v_delivery + v_bump);
      else
        null;
    end case;

    select composite_score
      into v_previous_composite
      from public.risk_scores
     where organization_id = p_organization_id
       and target_type = 'supplier'
       and supplier_id = v_supplier_id
     order by created_at desc
     limit 1;

    v_weighted_sum :=
      v_financial * v_financial_weight +
      v_geopolitical * v_geopolitical_weight +
      v_natural_disaster * v_natural_disaster_weight +
      v_operational * v_operational_weight +
      v_compliance * v_compliance_weight +
      v_delivery * v_delivery_weight;

    v_total_weight :=
      v_financial_weight +
      v_geopolitical_weight +
      v_natural_disaster_weight +
      v_operational_weight +
      v_compliance_weight +
      v_delivery_weight;

    if v_total_weight = 0 then
      v_composite := 0;
    else
      v_composite := round(greatest(0, least(100, (v_weighted_sum / v_total_weight)))::numeric, 2);
    end if;

    insert into public.risk_scores (
      organization_id,
      target_type,
      supplier_id,
      risk_event_id,
      financial_score,
      geopolitical_score,
      natural_disaster_score,
      operational_score,
      compliance_score,
      delivery_score,
      composite_score,
      score_reason,
      triggered_by_source,
      triggered_by_user_id
    )
    values (
      p_organization_id,
      'supplier',
      v_supplier_id,
      v_risk_event_id,
      v_financial,
      v_geopolitical,
      v_natural_disaster,
      v_operational,
      v_compliance,
      v_delivery,
      v_composite,
      'Recalculated from ' || p_event_type || ' event (' || p_severity || ' severity)',
      p_ingestion_source,
      p_actor_user_id
    );

    v_scores_inserted := v_scores_inserted + 1;

    v_threshold_crossed :=
      v_composite >= v_alert_threshold and
      (v_previous_composite is null or v_previous_composite < v_alert_threshold);

    if not v_threshold_crossed then
      continue;
    end if;

    if v_composite >= 90 then
      v_score_severity := 'critical';
    elsif v_composite >= 80 then
      v_score_severity := 'high';
    elsif v_composite >= 70 then
      v_score_severity := 'medium';
    else
      v_score_severity := 'low';
    end if;

    if (
      case v_score_severity
        when 'low' then 0
        when 'medium' then 1
        when 'high' then 2
        when 'critical' then 3
      end
    ) >= (
      case p_severity
        when 'low' then 0
        when 'medium' then 1
        when 'high' then 2
        when 'critical' then 3
      end
    ) then
      v_threshold_severity := v_score_severity;
    else
      v_threshold_severity := p_severity;
    end if;

    select coalesce(nullif(trim(name), ''), v_supplier_id::text)
      into v_supplier_name
      from public.suppliers
     where organization_id = p_organization_id
       and id = v_supplier_id
     limit 1;

    insert into public.alerts (
      organization_id,
      supplier_id,
      risk_event_id,
      severity,
      title,
      summary,
      status
    )
    values (
      p_organization_id,
      v_supplier_id,
      v_risk_event_id,
      v_threshold_severity,
      'Risk threshold crossed: ' || v_supplier_name,
      'Composite score ' ||
      to_char(v_composite, 'FM999990.00') ||
      ' crossed threshold ' ||
      to_char(v_alert_threshold, 'FM999990.00') ||
      ' after "' || p_title || '".',
      'new'
    );

    v_alerts_created := v_alerts_created + 1;
  end loop;

  if not v_is_update and cardinality(v_normalized_supplier_ids) > 3 then
    insert into public.alerts (
      organization_id,
      risk_event_id,
      severity,
      title,
      summary,
      status
    )
    values (
      p_organization_id,
      v_risk_event_id,
      'critical',
      'Escalation: broad supplier impact detected',
      '"' || p_title || '" currently impacts ' || cardinality(v_normalized_supplier_ids) || ' suppliers. Escalated to critical triage.',
      'new'
    );

    v_escalation_alert_created := true;
    v_alerts_created := v_alerts_created + 1;
  end if;

  return jsonb_build_object(
    'alerts_created', v_alerts_created,
    'escalation_alert_created', v_escalation_alert_created,
    'is_update', v_is_update,
    'risk_event_id', v_risk_event_id,
    'scores_inserted', v_scores_inserted
  );
end;
$$;
