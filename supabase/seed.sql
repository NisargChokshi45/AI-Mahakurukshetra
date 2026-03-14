insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'owner@apex-resilience.demo',
    crypt('DemoPass123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Apex Owner"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'owner@northstar-logistics.demo',
    crypt('DemoPass123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Northstar Owner"}',
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '{"sub":"10000000-0000-0000-0000-000000000001","email":"owner@apex-resilience.demo"}',
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '{"sub":"10000000-0000-0000-0000-000000000002","email":"owner@northstar-logistics.demo"}',
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (id) do nothing;

insert into public.organizations (
  id,
  name,
  slug,
  industry,
  headquarters_country,
  created_by,
  seed_source,
  feature_flags
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    'Apex Resilience',
    'apex-resilience',
    'Electronics',
    'United States',
    '10000000-0000-0000-0000-000000000001',
    'seed',
    '{"scenario_simulation":false,"predictive_recommendations":false}'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'Northstar Logistics',
    'northstar-logistics',
    'Industrial Manufacturing',
    'Germany',
    '10000000-0000-0000-0000-000000000002',
    'seed',
    '{"scenario_simulation":false,"predictive_recommendations":false}'
  )
on conflict (id) do nothing;

insert into public.user_profiles (
  id,
  email,
  display_name,
  current_organization_id,
  onboarding_completed_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'owner@apex-resilience.demo',
    'Apex Owner',
    '30000000-0000-0000-0000-000000000001',
    timezone('utc', now())
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'owner@northstar-logistics.demo',
    'Northstar Owner',
    '30000000-0000-0000-0000-000000000002',
    timezone('utc', now())
  )
on conflict (id) do update
  set current_organization_id = excluded.current_organization_id,
      onboarding_completed_at = excluded.onboarding_completed_at;

insert into public.organization_members (
  id,
  organization_id,
  user_id,
  role,
  status,
  invited_by,
  joined_at
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'owner',
    'active',
    '10000000-0000-0000-0000-000000000001',
    timezone('utc', now())
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    'owner',
    'active',
    '10000000-0000-0000-0000-000000000002',
    timezone('utc', now())
  )
on conflict (organization_id, user_id) do nothing;

insert into public.regions (id, organization_id, name, code, country, sub_region, continent, geopolitical_risk, disaster_risk)
values
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'North America East', 'NA-EAST', 'United States', 'East Coast', 'North America', 25, 18),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Taiwan Manufacturing Cluster', 'TW-MFG', 'Taiwan', 'Northern Taiwan', 'Asia', 58, 42),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'South China Port Belt', 'CN-PORT', 'China', 'Guangdong', 'Asia', 62, 29),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Central Europe Rail', 'EU-RAIL', 'Germany', 'Bavaria', 'Europe', 19, 11),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'Nordics Energy Corridor', 'NORDIC-EN', 'Sweden', 'Stockholm County', 'Europe', 21, 8)
on conflict do nothing;

insert into public.suppliers (
  id,
  organization_id,
  name,
  slug,
  tier,
  status,
  country,
  website,
  primary_contact_email,
  current_risk_score
)
values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Pacific Circuits', 'pacific-circuits', 'tier_1', 'active', 'Taiwan', 'https://pacific-circuits.example', 'ops@pacific-circuits.example', 81),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Delta Silicon', 'delta-silicon', 'tier_1', 'watchlist', 'South Korea', 'https://delta-silicon.example', 'risk@delta-silicon.example', 73),
  ('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Harbor Micro Logistics', 'harbor-micro-logistics', 'tier_2', 'active', 'China', 'https://harbor-micro-logistics.example', 'dispatch@harbor-micro-logistics.example', 67),
  ('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Atlas Rare Materials', 'atlas-rare-materials', 'tier_3', 'active', 'Chile', 'https://atlas-rare-materials.example', 'sales@atlas-rare-materials.example', 58),
  ('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'Meridian Power Systems', 'meridian-power-systems', 'tier_1', 'watchlist', 'Malaysia', 'https://meridian-power.example', 'support@meridian-power.example', 76),
  ('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', 'Rhein Auto Components', 'rhein-auto-components', 'tier_1', 'active', 'Germany', 'https://rhein-auto.example', 'ops@rhein-auto.example', 39),
  ('60000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', 'Polar Forge', 'polar-forge', 'tier_2', 'active', 'Sweden', 'https://polar-forge.example', 'ops@polar-forge.example', 44),
  ('60000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', 'Danube Battery Metals', 'danube-battery-metals', 'tier_3', 'watchlist', 'Hungary', 'https://danube-battery.example', 'trade@danube-battery.example', 69),
  ('60000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000002', 'Baltic Motion Controls', 'baltic-motion-controls', 'tier_1', 'active', 'Poland', 'https://baltic-motion.example', 'hello@baltic-motion.example', 33),
  ('60000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000002', 'Nordline Carriers', 'nordline-carriers', 'tier_2', 'watchlist', 'Netherlands', 'https://nordline.example', 'fleet@nordline.example', 62)
on conflict do nothing;

insert into public.supplier_facilities (id, organization_id, supplier_id, name, facility_type, city, country, latitude, longitude)
values
  ('61000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Hsinchu Fab 2', 'factory', 'Hsinchu', 'Taiwan', 24.8138, 120.9675),
  ('61000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'Shenzhen Port Hub', 'port', 'Shenzhen', 'China', 22.5431, 114.0579),
  ('61000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000006', 'Munich Assembly North', 'factory', 'Munich', 'Germany', 48.1351, 11.5820),
  ('61000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000010', 'Rotterdam Carrier Yard', 'warehouse', 'Rotterdam', 'Netherlands', 51.9244, 4.4777)
on conflict do nothing;

insert into public.supplier_region_links (organization_id, supplier_id, region_id)
values
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000005')
on conflict do nothing;

insert into public.products (id, organization_id, name, sku, description)
values
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Edge Sensor Hub', 'ESH-100', 'Industrial IoT gateway'),
  ('70000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Adaptive Drive Unit', 'ADU-300', 'Electric drivetrain assembly')
on conflict do nothing;

insert into public.components (id, organization_id, product_id, name, component_code, description)
values
  ('71000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Microcontroller Board', 'MCB-9', 'Primary compute board'),
  ('71000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Power Regulation Module', 'PRM-4', 'Power conditioning module'),
  ('71000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000002', 'Battery Pack Shell', 'BPS-2', 'Protective shell for battery pack')
on conflict do nothing;

insert into public.supplier_components (organization_id, supplier_id, component_id, lead_time_days, is_primary)
values
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 28, true),
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000005', '71000000-0000-0000-0000-000000000002', 34, true),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000008', '71000000-0000-0000-0000-000000000003', 21, true)
on conflict do nothing;

insert into public.contracts (id, organization_id, supplier_id, contract_number, value_usd, start_date, end_date, sla_terms, renewal_date)
values
  ('72000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'AR-2026-001', 2400000, '2026-01-01', '2026-12-31', 'OTIF 96%', '2026-11-15'),
  ('72000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000005', 'AR-2026-002', 1800000, '2026-01-15', '2026-12-31', 'Lead time under 35 days', '2026-10-20'),
  ('72000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000006', 'NL-2026-004', 3100000, '2026-02-01', '2027-01-31', 'PPM defects under 250', '2026-12-10')
on conflict do nothing;

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
values
  ('30000000-0000-0000-0000-000000000001', 18, 22, 20, 15, 10, 15, 70),
  ('30000000-0000-0000-0000-000000000002', 20, 15, 10, 20, 10, 25, 65)
on conflict (organization_id) do nothing;

insert into public.risk_events (
  id,
  organization_id,
  title,
  event_type,
  severity,
  source,
  region_id,
  summary,
  detected_at,
  created_by
)
values
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Typhoon warning near Hsinchu production zone', 'natural_disaster', 'critical', 'Manual feed', '50000000-0000-0000-0000-000000000002', 'Weather models indicate 72-hour disruption potential for advanced semiconductor production.', timezone('utc', now()) - interval '6 hours', '10000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Port congestion spike in South China', 'delivery', 'high', 'Logistics monitor', '50000000-0000-0000-0000-000000000003', 'Container dwell time has doubled at critical handoff ports.', timezone('utc', now()) - interval '18 hours', '10000000-0000-0000-0000-000000000001'),
  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 'Battery metals compliance audit delay', 'compliance', 'high', 'Compliance analyst', '50000000-0000-0000-0000-000000000005', 'Delayed environmental audit approval threatens upstream material release.', timezone('utc', now()) - interval '1 day', '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.disruptions (
  id,
  organization_id,
  risk_event_id,
  supplier_id,
  title,
  impact_summary,
  financial_impact_usd,
  started_at
)
values
  ('81000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Pacific Circuits output reduced 30%', 'Fab shift reductions are expected for at least 48 hours.', 450000, timezone('utc', now()) - interval '5 hours'),
  ('81000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000008', 'Danube battery metals shipment held', 'Regulatory hold blocks release of processed lithium inventory.', 260000, timezone('utc', now()) - interval '20 hours')
on conflict do nothing;

insert into public.risk_scores (
  organization_id,
  target_type,
  supplier_id,
  financial_score,
  geopolitical_score,
  natural_disaster_score,
  operational_score,
  compliance_score,
  delivery_score,
  composite_score,
  score_reason
)
values
  ('30000000-0000-0000-0000-000000000001', 'supplier', '60000000-0000-0000-0000-000000000001', 60, 74, 90, 82, 44, 66, 81, 'Typhoon risk and constrained fab capacity'),
  ('30000000-0000-0000-0000-000000000001', 'supplier', '60000000-0000-0000-0000-000000000005', 57, 68, 51, 75, 46, 79, 76, 'Power module shortages and delivery slippage'),
  ('30000000-0000-0000-0000-000000000002', 'supplier', '60000000-0000-0000-0000-000000000008', 66, 34, 24, 58, 81, 49, 69, 'Compliance delay on upstream metals source')
on conflict do nothing;

insert into public.alerts (
  id,
  organization_id,
  supplier_id,
  region_id,
  risk_event_id,
  severity,
  title,
  summary,
  status
)
values
  ('82000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'critical', 'Pacific Circuits score crossed 80', 'Composite supplier risk exceeded org alert threshold after typhoon escalation.', 'new'),
  ('82000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000002', 'high', 'South China port dwell time doubled', 'Logistics disruption is threatening microcontroller inbound delivery windows.', 'acknowledged'),
  ('82000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000005', '80000000-0000-0000-0000-000000000003', 'high', 'Compliance hold on metals feedstock', 'Audit delay places battery pack production at risk.', 'new')
on conflict do nothing;

insert into public.incidents (
  id,
  organization_id,
  disruption_id,
  risk_event_id,
  title,
  summary,
  status,
  priority,
  owner_user_id,
  created_by
)
values
  ('83000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Stabilize Edge Sensor Hub board supply', 'Coordinate alternate routing and inventory buffers for Pacific Circuits output drop.', 'investigating', 'critical', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('83000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000003', 'Recover battery metals release schedule', 'Track compliance remediation and alternate sourcing for Danube Battery Metals.', 'mitigating', 'high', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.incident_actions (
  organization_id,
  incident_id,
  description,
  assignee_user_id,
  due_date,
  status
)
values
  ('30000000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', 'Confirm 7-day finished goods buffer at east coast warehouse', '10000000-0000-0000-0000-000000000001', current_date + 1, 'in_progress'),
  ('30000000-0000-0000-0000-000000000001', '83000000-0000-0000-0000-000000000001', 'Evaluate alternate carrier allocation from Kaohsiung', '10000000-0000-0000-0000-000000000001', current_date + 2, 'todo'),
  ('30000000-0000-0000-0000-000000000002', '83000000-0000-0000-0000-000000000002', 'Escalate audit documentation with regional compliance counsel', '10000000-0000-0000-0000-000000000002', current_date + 1, 'in_progress')
on conflict do nothing;

insert into public.mitigation_plans (
  organization_id,
  supplier_id,
  risk_event_id,
  title,
  mitigation_type,
  status,
  owner_user_id,
  details
)
values
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Expand board safety stock', 'inventory_buffer', 'active', '10000000-0000-0000-0000-000000000001', 'Increase finished module coverage from 10 to 18 days until weather risk normalizes.'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000008', '80000000-0000-0000-0000-000000000003', 'Dual source battery metals', 'dual_source', 'planned', '10000000-0000-0000-0000-000000000002', 'Qualify secondary metals source in Czech Republic.')
on conflict do nothing;

insert into public.assessments (
  organization_id,
  supplier_id,
  financial_score,
  operational_score,
  compliance_score,
  performance_score,
  summary,
  status,
  assessed_by
)
values
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 64, 72, 51, 69, 'Periodic review shows strong quality but elevated climate exposure.', 'completed', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000008', 58, 61, 83, 55, 'Supplier requires compliance remediation to stay within guardrails.', 'completed', '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.reports (
  organization_id,
  report_type,
  report_format,
  created_by,
  storage_path
)
values
  ('30000000-0000-0000-0000-000000000001', 'executive_summary', 'pdf', '10000000-0000-0000-0000-000000000001', 'reports/apex-resilience/executive-summary-march.pdf'),
  ('30000000-0000-0000-0000-000000000002', 'supplier_scorecard', 'csv', '10000000-0000-0000-0000-000000000002', 'reports/northstar-logistics/supplier-scorecard-march.csv')
on conflict do nothing;

insert into public.inventories (
  organization_id,
  component_id,
  facility_id,
  quantity_on_hand,
  buffer_target,
  updated_by
)
values
  ('30000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', '61000000-0000-0000-0000-000000000001', 1240, 1800, '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000002', '61000000-0000-0000-0000-000000000002', 680, 900, '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000003', '61000000-0000-0000-0000-000000000003', 420, 700, '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.shipments (
  organization_id,
  supplier_id,
  component_id,
  origin,
  destination,
  carrier,
  eta_date,
  status
)
values
  ('30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000001', 'Shenzhen', 'Los Angeles', 'Apex Ocean', current_date + 8, 'delayed'),
  ('30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000010', '71000000-0000-0000-0000-000000000003', 'Rotterdam', 'Munich', 'Nordline Rail', current_date + 3, 'in_transit')
on conflict do nothing;

insert into public.scenarios (
  organization_id,
  title,
  assumptions,
  expected_impact,
  created_by
)
values
  ('30000000-0000-0000-0000-000000000001', '48-hour Pacific Circuits outage', 'Assumes weather shutdown extends through next production cycle.', 'Board availability falls below target buffer in 6 days.', '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', 'Danube metals hold extends 2 weeks', 'Assumes compliance hold blocks all outbound loads.', 'Battery line output drops 18% without alternate source.', '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

insert into public.metrics (
  organization_id,
  recorded_at,
  total_suppliers,
  at_risk_suppliers,
  open_incidents,
  mttr_hours,
  false_positive_rate
)
values
  ('30000000-0000-0000-0000-000000000001', timezone('utc', now()) - interval '1 day', 5, 3, 1, 19.5, 4.2),
  ('30000000-0000-0000-0000-000000000002', timezone('utc', now()) - interval '1 day', 5, 2, 1, 15.0, 3.1)
on conflict do nothing;

insert into public.notifications (
  organization_id,
  user_id,
  alert_id,
  channel,
  sent_at
)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001', 'email', timezone('utc', now()) - interval '5 hours'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000003', 'in_app', timezone('utc', now()) - interval '20 hours')
on conflict do nothing;

insert into public.integration_connections (
  organization_id,
  name,
  integration_type,
  credentials,
  status,
  last_sync_at
)
values
  ('30000000-0000-0000-0000-000000000001', 'ERP Sandbox', 'erp', '{"endpoint":"https://erp.apex.demo"}', 'connected', timezone('utc', now()) - interval '2 hours'),
  ('30000000-0000-0000-0000-000000000002', 'Webhook Monitor', 'webhook', '{"shared_secret":"demo-secret"}', 'degraded', timezone('utc', now()) - interval '8 hours')
on conflict do nothing;

insert into public.customers (id, organization_id, stripe_customer_id)
values
  ('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'cus_apex_demo'),
  ('90000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'cus_northstar_demo')
on conflict do nothing;

insert into public.prices (id, stripe_price_id, nickname, currency, unit_amount, interval, supplier_limit, is_active)
values
  ('91000000-0000-0000-0000-000000000001', 'price_starter_demo', 'Starter', 'usd', 9900, 'month', 25, true),
  ('91000000-0000-0000-0000-000000000002', 'price_professional_demo', 'Professional', 'usd', 29900, 'month', 100, true)
on conflict do nothing;

insert into public.subscriptions (
  id,
  organization_id,
  customer_id,
  price_id,
  stripe_subscription_id,
  status,
  current_period_end
)
values
  ('92000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 'sub_apex_demo', 'active', timezone('utc', now()) + interval '25 days'),
  ('92000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', 'sub_northstar_demo', 'trialing', timezone('utc', now()) + interval '12 days')
on conflict do nothing;

insert into public.payment_history (
  organization_id,
  subscription_id,
  stripe_invoice_id,
  amount,
  currency,
  status,
  paid_at
)
values
  ('30000000-0000-0000-0000-000000000001', '92000000-0000-0000-0000-000000000001', 'in_apex_demo_001', 29900, 'usd', 'succeeded', timezone('utc', now()) - interval '10 days'),
  ('30000000-0000-0000-0000-000000000002', '92000000-0000-0000-0000-000000000002', 'in_northstar_demo_001', 9900, 'usd', 'succeeded', timezone('utc', now()) - interval '6 days')
on conflict do nothing;
