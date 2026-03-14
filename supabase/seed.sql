-- ============================================================
-- DEMO SEED — Supply Chain Risk Intelligence Platform
-- Primary demo login : owner@apex-resilience.demo / DemoPass123!
-- Secondary demo     : owner@northstar-logistics.demo / DemoPass123!
--
-- Apex Resilience story:
--   Electronics firm under simultaneous pressure from typhoon, Taiwan
--   Strait geopolitical tension, a key Tier-1 supplier's earnings miss,
--   and a South China port labour dispute. Risk team is actively
--   triaging 5 open incidents while risk scores trend upward for 3/5
--   critical suppliers. Total active disruption cost: $1,005,000.
-- ============================================================

-- ── AUTH USERS ─────────────────────────────────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000001','authenticated','authenticated',
   'owner@apex-resilience.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Sarah Chen"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000002','authenticated','authenticated',
   'owner@northstar-logistics.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Johann Bauer"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000003','authenticated','authenticated',
   'admin@apex-resilience.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Marcus Webb"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000004','authenticated','authenticated',
   'risk@apex-resilience.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Priya Nair"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000005','authenticated','authenticated',
   'procurement@apex-resilience.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Daniel Park"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000006','authenticated','authenticated',
   'cfo@apex-resilience.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Elena Romero"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000007','authenticated','authenticated',
   'admin@northstar-logistics.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Ingrid Halvorsen"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000008','authenticated','authenticated',
   'risk@northstar-logistics.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Amir Hosseini"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000009','authenticated','authenticated',
   'procurement@northstar-logistics.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Katrin Müller"}',
   timezone('utc',now()),timezone('utc',now()),'','','',''),
  ('00000000-0000-0000-0000-000000000000','10000000-0000-0000-0000-000000000010','authenticated','authenticated',
   'coo@northstar-logistics.demo',crypt('DemoPass123!',gen_salt('bf')),timezone('utc',now()),
   '{"provider":"email","providers":["email"]}','{"display_name":"Pieter van der Berg"}',
   timezone('utc',now()),timezone('utc',now()),'','','','')
on conflict (id) do nothing;

-- ── AUTH IDENTITIES ────────────────────────────────────────────────────────
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','{"sub":"10000000-0000-0000-0000-000000000001","email":"owner@apex-resilience.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','{"sub":"10000000-0000-0000-0000-000000000002","email":"owner@northstar-logistics.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','{"sub":"10000000-0000-0000-0000-000000000003","email":"admin@apex-resilience.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004','{"sub":"10000000-0000-0000-0000-000000000004","email":"risk@apex-resilience.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000005','{"sub":"10000000-0000-0000-0000-000000000005","email":"procurement@apex-resilience.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000006','{"sub":"10000000-0000-0000-0000-000000000006","email":"cfo@apex-resilience.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000007','{"sub":"10000000-0000-0000-0000-000000000007","email":"admin@northstar-logistics.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000008','{"sub":"10000000-0000-0000-0000-000000000008","email":"risk@northstar-logistics.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000009','{"sub":"10000000-0000-0000-0000-000000000009","email":"procurement@northstar-logistics.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now())),
  ('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000010','{"sub":"10000000-0000-0000-0000-000000000010","email":"coo@northstar-logistics.demo"}','email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now()))
on conflict (id) do nothing;

-- ── ORGANIZATIONS ──────────────────────────────────────────────────────────
insert into public.organizations (id, name, slug, industry, headquarters_country, created_by, seed_source, feature_flags)
values
  ('30000000-0000-0000-0000-000000000001','Apex Resilience','apex-resilience','Electronics','United States',
   '10000000-0000-0000-0000-000000000001','seed','{"scenario_simulation":true,"predictive_recommendations":true}'),
  ('30000000-0000-0000-0000-000000000002','Northstar Logistics','northstar-logistics','Industrial Manufacturing','Germany',
   '10000000-0000-0000-0000-000000000002','seed','{"scenario_simulation":false,"predictive_recommendations":false}')
on conflict (id) do nothing;

-- ── USER PROFILES ──────────────────────────────────────────────────────────
insert into public.user_profiles (id, email, display_name, current_organization_id, onboarding_completed_at)
values
  ('10000000-0000-0000-0000-000000000001','owner@apex-resilience.demo','Sarah Chen','30000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000002','owner@northstar-logistics.demo','Johann Bauer','30000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000003','admin@apex-resilience.demo','Marcus Webb','30000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000004','risk@apex-resilience.demo','Priya Nair','30000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000005','procurement@apex-resilience.demo','Daniel Park','30000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000006','cfo@apex-resilience.demo','Elena Romero','30000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000007','admin@northstar-logistics.demo','Ingrid Halvorsen','30000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000008','risk@northstar-logistics.demo','Amir Hosseini','30000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000009','procurement@northstar-logistics.demo','Katrin Müller','30000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('10000000-0000-0000-0000-000000000010','coo@northstar-logistics.demo','Pieter van der Berg','30000000-0000-0000-0000-000000000002',timezone('utc',now()))
on conflict (id) do update
  set current_organization_id = excluded.current_organization_id,
      onboarding_completed_at  = excluded.onboarding_completed_at;

-- ── ORGANIZATION MEMBERS ───────────────────────────────────────────────────
insert into public.organization_members (id, organization_id, user_id, role, status, invited_by, joined_at)
values
  ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','owner','active','10000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','owner','active','10000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','admin','active','10000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','risk_manager','active','10000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','procurement_lead','active','10000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000006','viewer','active','10000000-0000-0000-0000-000000000001',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000007','admin','active','10000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000008','risk_manager','active','10000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000009','procurement_lead','active','10000000-0000-0000-0000-000000000002',timezone('utc',now())),
  ('40000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000010','viewer','active','10000000-0000-0000-0000-000000000002',timezone('utc',now()))
on conflict (organization_id, user_id) do nothing;

-- ── REGIONS ────────────────────────────────────────────────────────────────
insert into public.regions (id, organization_id, name, code, country, sub_region, continent, geopolitical_risk, disaster_risk)
values
  ('50000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','North America East','NA-EAST','United States','East Coast','North America',25,18),
  ('50000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Taiwan Manufacturing Cluster','TW-MFG','Taiwan','Northern Taiwan','Asia',68,42),
  ('50000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','South China Port Belt','CN-PORT','China','Guangdong','Asia',62,29),
  ('50000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','Central Europe Rail','EU-RAIL','Germany','Bavaria','Europe',19,11),
  ('50000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000002','Nordics Energy Corridor','NORDIC-EN','Sweden','Stockholm County','Europe',21,8),
  ('50000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001','South Korea Tech Belt','KR-TECH','South Korea','Gyeonggi','Asia',44,23),
  ('50000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001','Penang Electronics Hub','MY-PEN','Malaysia','Penang','Asia',37,19),
  ('50000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000001','Andes Mining Corridor','CL-AND','Chile','Antofagasta','South America',33,27),
  ('50000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000002','Poland Industrial Belt','PL-IND','Poland','Silesia','Europe',24,12),
  ('50000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000002','Netherlands Port Network','NL-PORT','Netherlands','South Holland','Europe',18,10),
  ('50000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000002','Danube Metals Corridor','HU-DNB','Hungary','Pest County','Europe',28,16)
on conflict do nothing;

-- ── SUPPLIERS ──────────────────────────────────────────────────────────────
insert into public.suppliers (id, organization_id, name, slug, tier, status, country, website, primary_contact_email, current_risk_score, notes)
values
  ('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   'Pacific Circuits','pacific-circuits','tier_1','watchlist','Taiwan',
   'https://pacific-circuits.example','ops@pacific-circuits.example',81,
   'Primary microcontroller fab partner in Hsinchu Science Park. Critical path for Edge Sensor Hub (MCB-9). High exposure: active typhoon threat + Taiwan Strait geopolitical escalation. Score trending sharply upward over 4 weeks.'),
  ('60000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',
   'Delta Silicon','delta-silicon','tier_1','watchlist','South Korea',
   'https://delta-silicon.example','risk@delta-silicon.example',73,
   'Tier-1 foundry in Gyeonggi province supplying advanced logic chips. Score elevated due to ongoing Taiwan Strait military exercises limiting cross-strait logistics corridors. Dual-source qualification in progress.'),
  ('60000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001',
   'Harbor Micro Logistics','harbor-micro-logistics','tier_2','active','China',
   'https://harbor-micro-logistics.example','dispatch@harbor-micro-logistics.example',67,
   'Primary inbound logistics partner via Shenzhen port for Asia-Pacific component flows. Port congestion and an ongoing labour dispute have doubled container dwell times. Lead time variance +9 days vs. SLA.'),
  ('60000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
   'Atlas Rare Materials','atlas-rare-materials','tier_3','active','Chile',
   'https://atlas-rare-materials.example','sales@atlas-rare-materials.example',58,
   'Tier-3 rare-earth and specialty metals supplier in Antofagasta. Moderate risk profile; new Chilean export compliance rules require updated documentation. No active disruption; monitoring ongoing.'),
  ('60000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',
   'Meridian Power Systems','meridian-power-systems','tier_1','watchlist','Malaysia',
   'https://meridian-power.example','support@meridian-power.example',76,
   'Penang-based power module supplier for Edge Sensor Hub (PRM-4). Q4 revenue miss of 18% signalled financial stress; delivery slots slipping by 3–4 weeks. Backup sourcing evaluation underway with three shortlisted alternatives.'),
  ('60000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000002',
   'Rhein Auto Components','rhein-auto-components','tier_1','active','Germany',
   'https://rhein-auto.example','ops@rhein-auto.example',39,
   'Tier-1 automotive components supplier in Munich. Stable throughput with minimal compliance risk. Long-term contract through Jan 2027.'),
  ('60000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000002',
   'Polar Forge','polar-forge','tier_2','active','Sweden',
   'https://polar-forge.example','ops@polar-forge.example',44,
   'Precision forging supplier in the Nordics. Energy cost sensitivity is rising but operational throughput remains stable.'),
  ('60000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000002',
   'Danube Battery Metals','danube-battery-metals','tier_3','watchlist','Hungary',
   'https://danube-battery.example','trade@danube-battery.example',69,
   'Tier-3 lithium and battery metals supplier. Compliance audit delay is blocking release of processed inventory. Remediation expected within 10 days.'),
  ('60000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000002',
   'Baltic Motion Controls','baltic-motion-controls','tier_1','active','Poland',
   'https://baltic-motion.example','hello@baltic-motion.example',33,
   'Motion controls supplier in Silesia industrial belt. Low risk profile with consistent on-time delivery.'),
  ('60000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000002',
   'Nordline Carriers','nordline-carriers','tier_2','watchlist','Netherlands',
   'https://nordline.example','fleet@nordline.example',62,
   'Rotterdam-based intermodal carrier. Port congestion at Rotterdam is causing moderate delays on inbound component flows.'),
  -- Additional suppliers for global coverage
  ('60000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000001',
   'Shanghai Assembly Works','shanghai-assembly','tier_2','active','China',
   'https://shanghai-assembly.example','ops@shanghai-assembly.example',54,
   'Assembly facility in Shanghai Free Trade Zone. Moderate risk from regulatory changes.'),
  ('60000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000001',
   'Vietnam Precision Parts','vietnam-precision','tier_2','active','Vietnam',
   'https://vietnam-precision.example','contact@vietnam-precision.example',41,
   'Precision machining in Ho Chi Minh City. Growing capacity, stable operations.'),
  ('60000000-0000-0000-0000-000000000013','30000000-0000-0000-0000-000000000001',
   'Bangkok Electronics Hub','bangkok-electronics','tier_3','active','Thailand',
   'https://bangkok-electronics.example','sales@bangkok-electronics.example',47,
   'Electronics components distributor. Regional logistics hub.'),
  ('60000000-0000-0000-0000-000000000014','30000000-0000-0000-0000-000000000001',
   'Mumbai Materials','mumbai-materials','tier_3','active','India',
   'https://mumbai-materials.example','trade@mumbai-materials.example',52,
   'Raw materials supplier. Monsoon season creates periodic delays.'),
  ('60000000-0000-0000-0000-000000000015','30000000-0000-0000-0000-000000000001',
   'Tokyo Precision Industries','tokyo-precision','tier_1','active','Japan',
   'https://tokyo-precision.example','quality@tokyo-precision.example',28,
   'High-precision components manufacturer. Excellent quality track record.'),
  ('60000000-0000-0000-0000-000000000016','30000000-0000-0000-0000-000000000001',
   'Singapore Port Services','singapore-port','tier_2','active','Singapore',
   'https://singapore-port.example','ops@singapore-port.example',35,
   'Port logistics and warehousing. Strategic regional hub.'),
  ('60000000-0000-0000-0000-000000000017','30000000-0000-0000-0000-000000000001',
   'Jakarta Manufacturing','jakarta-mfg','tier_3','active','Indonesia',
   'https://jakarta-mfg.example','factory@jakarta-mfg.example',59,
   'Contract manufacturer. Infrastructure challenges create moderate risk.'),
  ('60000000-0000-0000-0000-000000000018','30000000-0000-0000-0000-000000000001',
   'Manila Assembly Center','manila-assembly','tier_3','active','Philippines',
   'https://manila-assembly.example','ops@manila-assembly.example',56,
   'Electronics assembly. Typhoon exposure creates seasonal risk.'),
  ('60000000-0000-0000-0000-000000000019','30000000-0000-0000-0000-000000000002',
   'Prague Tech Components','prague-tech','tier_2','active','Czech Republic',
   'https://prague-tech.example','sales@prague-tech.example',36,
   'Technology components supplier. Central European operations.'),
  ('60000000-0000-0000-0000-000000000020','30000000-0000-0000-0000-000000000002',
   'Barcelona Logistics','barcelona-logistics','tier_2','active','Spain',
   'https://barcelona-logistics.example','port@barcelona-logistics.example',42,
   'Mediterranean logistics hub. Strong port infrastructure.'),
  ('60000000-0000-0000-0000-000000000021','30000000-0000-0000-0000-000000000002',
   'Milan Industrial Supply','milan-industrial','tier_3','active','Italy',
   'https://milan-industrial.example','italy@milan-industrial.example',45,
   'Industrial materials supplier. Stable European operations.'),
  ('60000000-0000-0000-0000-000000000022','30000000-0000-0000-0000-000000000002',
   'Manchester Manufacturing','manchester-mfg','tier_2','active','United Kingdom',
   'https://manchester-mfg.example','uk@manchester-mfg.example',38,
   'UK manufacturing base. Post-Brexit compliance stabilized.'),
  ('60000000-0000-0000-0000-000000000023','30000000-0000-0000-0000-000000000002',
   'Paris Components','paris-components','tier_2','active','France',
   'https://paris-components.example','france@paris-components.example',40,
   'French manufacturing. Strong quality systems.'),
  ('60000000-0000-0000-0000-000000000024','30000000-0000-0000-0000-000000000002',
   'Brussels Distribution','brussels-dist','tier_3','active','Belgium',
   'https://brussels-dist.example','belgium@brussels-dist.example',34,
   'European distribution center. Central location advantage.'),
  ('60000000-0000-0000-0000-000000000025','30000000-0000-0000-0000-000000000001',
   'Austin Electronics','austin-electronics','tier_2','active','United States',
   'https://austin-electronics.example','texas@austin-electronics.example',31,
   'US electronics manufacturing. Strong domestic capability.'),
  ('60000000-0000-0000-0000-000000000026','30000000-0000-0000-0000-000000000001',
   'Detroit Auto Parts','detroit-auto','tier_2','active','United States',
   'https://detroit-auto.example','michigan@detroit-auto.example',37,
   'Automotive components. Established supply base.'),
  ('60000000-0000-0000-0000-000000000027','30000000-0000-0000-0000-000000000001',
   'Los Angeles Logistics','la-logistics','tier_3','active','United States',
   'https://la-logistics.example','california@la-logistics.example',43,
   'West Coast port operations. High volume gateway.'),
  ('60000000-0000-0000-0000-000000000028','30000000-0000-0000-0000-000000000001',
   'Tijuana Assembly','tijuana-assembly','tier_2','active','Mexico',
   'https://tijuana-assembly.example','mexico@tijuana-assembly.example',48,
   'Near-shore manufacturing. Border logistics proximity.'),
  ('60000000-0000-0000-0000-000000000029','30000000-0000-0000-0000-000000000001',
   'Guadalajara Tech Park','guadalajara-tech','tier_2','active','Mexico',
   'https://guadalajara-tech.example','jalisco@guadalajara-tech.example',46,
   'Technology manufacturing cluster. Growing capabilities.'),
  ('60000000-0000-0000-0000-000000000030','30000000-0000-0000-0000-000000000002',
   'Toronto Industrial','toronto-industrial','tier_2','active','Canada',
   'https://toronto-industrial.example','ontario@toronto-industrial.example',32,
   'Canadian manufacturing. Stable operations.'),
  ('60000000-0000-0000-0000-000000000031','30000000-0000-0000-0000-000000000001',
   'São Paulo Manufacturing','sao-paulo-mfg','tier_2','active','Brazil',
   'https://sao-paulo-mfg.example','brazil@sao-paulo-mfg.example',55,
   'South American manufacturing hub. Currency volatility risk.'),
  ('60000000-0000-0000-0000-000000000032','30000000-0000-0000-0000-000000000001',
   'Buenos Aires Materials','buenos-aires-materials','tier_3','active','Argentina',
   'https://buenos-aires-materials.example','argentina@buenos-aires-materials.example',61,
   'Materials supplier. Economic instability creates elevated risk.'),
  ('60000000-0000-0000-0000-000000000033','30000000-0000-0000-0000-000000000002',
   'Istanbul Production','istanbul-production','tier_2','active','Turkey',
   'https://istanbul-production.example','turkey@istanbul-production.example',53,
   'Bridge between Europe and Asia. Geopolitical positioning.'),
  ('60000000-0000-0000-0000-000000000034','30000000-0000-0000-0000-000000000002',
   'Dubai Logistics Hub','dubai-logistics','tier_3','active','United Arab Emirates',
   'https://dubai-logistics.example','uae@dubai-logistics.example',29,
   'Middle East logistics gateway. Modern infrastructure.'),
  ('60000000-0000-0000-0000-000000000035','30000000-0000-0000-0000-000000000001',
   'Johannesburg Metals','johannesburg-metals','tier_3','active','South Africa',
   'https://johannesburg-metals.example','sa@johannesburg-metals.example',57,
   'African metals supplier. Mining sector exposure.'),
  ('60000000-0000-0000-0000-000000000036','30000000-0000-0000-0000-000000000001',
   'Casablanca Port Services','casablanca-port','tier_3','active','Morocco',
   'https://casablanca-port.example','morocco@casablanca-port.example',51,
   'North African port hub. Growing trade corridor.'),
  ('60000000-0000-0000-0000-000000000037','30000000-0000-0000-0000-000000000001',
   'Bangalore Tech Solutions','bangalore-tech','tier_2','active','India',
   'https://bangalore-tech.example','india@bangalore-tech.example',44,
   'Technology solutions provider. Strong engineering base.'),
  ('60000000-0000-0000-0000-000000000038','30000000-0000-0000-0000-000000000001',
   'Hanoi Manufacturing','hanoi-mfg','tier_3','active','Vietnam',
   'https://hanoi-mfg.example','hanoi@hanoi-mfg.example',49,
   'Northern Vietnam manufacturing. Expanding capacity.'),
  ('60000000-0000-0000-0000-000000000039','30000000-0000-0000-0000-000000000002',
   'Copenhagen Green Tech','copenhagen-green','tier_2','active','Denmark',
   'https://copenhagen-green.example','denmark@copenhagen-green.example',27,
   'Sustainable technology components. Low risk profile.'),
  ('60000000-0000-0000-0000-000000000040','30000000-0000-0000-0000-000000000002',
   'Oslo Energy Systems','oslo-energy','tier_2','active','Norway',
   'https://oslo-energy.example','norway@oslo-energy.example',30,
   'Energy sector components. Stable Nordic operations.'),
  ('60000000-0000-0000-0000-000000000041','30000000-0000-0000-0000-000000000001',
   'Chengdu Electronics','chengdu-electronics','tier_2','watchlist','China',
   'https://chengdu-electronics.example','chengdu@chengdu-electronics.example',64,
   'Western China electronics hub. Supply chain resilience concerns.'),
  ('60000000-0000-0000-0000-000000000042','30000000-0000-0000-0000-000000000001',
   'Suzhou Precision Works','suzhou-precision','tier_2','active','China',
   'https://suzhou-precision.example','suzhou@suzhou-precision.example',50,
   'Precision manufacturing near Shanghai. Established operations.'),
  ('60000000-0000-0000-0000-000000000043','30000000-0000-0000-0000-000000000002',
   'Vienna Advanced Materials','vienna-materials','tier_2','active','Austria',
   'https://vienna-materials.example','austria@vienna-materials.example',35,
   'Advanced materials supplier. High quality standards.'),
  ('60000000-0000-0000-0000-000000000044','30000000-0000-0000-0000-000000000002',
   'Zurich Precision','zurich-precision','tier_1','active','Switzerland',
   'https://zurich-precision.example','swiss@zurich-precision.example',26,
   'Swiss precision manufacturing. Premium quality, low risk.'),
  ('60000000-0000-0000-0000-000000000045','30000000-0000-0000-0000-000000000001',
   'Kuala Lumpur Distribution','kl-distribution','tier_3','active','Malaysia',
   'https://kl-distribution.example','kl@kl-distribution.example',45,
   'Southeast Asia distribution center. Regional coverage.'),
  ('60000000-0000-0000-0000-000000000046','30000000-0000-0000-0000-000000000001',
   'Osaka Manufacturing','osaka-mfg','tier_2','active','Japan',
   'https://osaka-mfg.example','osaka@osaka-mfg.example',33,
   'Japanese manufacturing excellence. Reliable partner.'),
  ('60000000-0000-0000-0000-000000000047','30000000-0000-0000-0000-000000000002',
   'Helsinki Tech Industries','helsinki-tech','tier_2','active','Finland',
   'https://helsinki-tech.example','finland@helsinki-tech.example',31,
   'Nordic technology manufacturing. Innovation focus.'),
  ('60000000-0000-0000-0000-000000000048','30000000-0000-0000-0000-000000000002',
   'Lisbon Components','lisbon-components','tier_3','active','Portugal',
   'https://lisbon-components.example','portugal@lisbon-components.example',46,
   'Portuguese manufacturing. Atlantic logistics access.'),
  ('60000000-0000-0000-0000-000000000049','30000000-0000-0000-0000-000000000001',
   'Seattle Advanced Tech','seattle-tech','tier_1','active','United States',
   'https://seattle-tech.example','washington@seattle-tech.example',29,
   'Advanced technology components. Strong US presence.'),
  ('60000000-0000-0000-0000-000000000050','30000000-0000-0000-0000-000000000001',
   'Atlanta Distribution','atlanta-dist','tier_3','active','United States',
   'https://atlanta-dist.example','georgia@atlanta-dist.example',36,
   'Southeastern US distribution hub. Strategic location.')
on conflict (organization_id, slug) do update
  set notes = excluded.notes;

-- ── SUPPLIER FACILITIES ────────────────────────────────────────────────────
insert into public.supplier_facilities (id, organization_id, supplier_id, name, facility_type, city, country, latitude, longitude)
values
  -- Original facilities
  ('61000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Hsinchu Fab 2','factory','Hsinchu','Taiwan',24.8138,120.9675),
  ('61000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','Shenzhen Port Hub','port','Shenzhen','China',22.5431,114.0579),
  ('61000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000006','Munich Assembly North','factory','Munich','Germany',48.1351,11.5820),
  ('61000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000010','Rotterdam Carrier Yard','warehouse','Rotterdam','Netherlands',51.9244,4.4777),
  ('61000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Suwon Logic Fab','factory','Suwon','South Korea',37.2636,127.0286),
  ('61000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','Bayan Lepas Plant','factory','Penang','Malaysia',5.3117,100.4020),
  ('61000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000004','Antofagasta Mine Site','warehouse','Antofagasta','Chile',-23.6509,-70.3975),
  ('61000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000007','Stockholm Forge','factory','Stockholm','Sweden',59.3293,18.0686),
  ('61000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008','Budapest Metals Depot','warehouse','Budapest','Hungary',47.4979,19.0402),
  ('61000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000009','Katowice Motion Plant','factory','Katowice','Poland',50.2649,19.0238),
  -- China facilities
  ('61000000-0000-0000-0000-000000000011','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000011','Shanghai Assembly Plant','factory','Shanghai','China',31.2304,121.4737),
  ('61000000-0000-0000-0000-000000000012','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000011','Shanghai Warehouse','warehouse','Shanghai','China',31.1500,121.6694),
  ('61000000-0000-0000-0000-000000000013','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000041','Chengdu Tech Park','factory','Chengdu','China',30.5728,104.0668),
  ('61000000-0000-0000-0000-000000000014','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000042','Suzhou Industrial Zone','factory','Suzhou','China',31.2989,120.5853),
  -- Vietnam facilities
  ('61000000-0000-0000-0000-000000000015','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000012','Ho Chi Minh Factory','factory','Ho Chi Minh City','Vietnam',10.8231,106.6297),
  ('61000000-0000-0000-0000-000000000016','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000038','Hanoi Manufacturing Hub','factory','Hanoi','Vietnam',21.0285,105.8542),
  -- Thailand facilities
  ('61000000-0000-0000-0000-000000000017','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000013','Bangkok Electronics Center','warehouse','Bangkok','Thailand',13.7563,100.5018),
  -- India facilities
  ('61000000-0000-0000-0000-000000000018','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000014','Mumbai Port Terminal','port','Mumbai','India',19.0760,72.8777),
  ('61000000-0000-0000-0000-000000000019','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000037','Bangalore Tech Campus','factory','Bangalore','India',12.9716,77.5946),
  -- Japan facilities
  ('61000000-0000-0000-0000-000000000020','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000015','Tokyo Precision Facility','factory','Tokyo','Japan',35.6762,139.6503),
  ('61000000-0000-0000-0000-000000000021','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000046','Osaka Manufacturing Complex','factory','Osaka','Japan',34.6937,135.5023),
  -- Singapore facilities
  ('61000000-0000-0000-0000-000000000022','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000016','Singapore Port Hub','port','Singapore','Singapore',1.2897,103.8501),
  -- Indonesia facilities
  ('61000000-0000-0000-0000-000000000023','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000017','Jakarta Industrial Park','factory','Jakarta','Indonesia',-6.2088,106.8456),
  -- Philippines facilities
  ('61000000-0000-0000-0000-000000000024','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000018','Manila Assembly Facility','factory','Manila','Philippines',14.5995,120.9842),
  -- Malaysia facilities
  ('61000000-0000-0000-0000-000000000025','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000045','Kuala Lumpur Warehouse','warehouse','Kuala Lumpur','Malaysia',3.1390,101.6869),
  -- Europe - Czech Republic
  ('61000000-0000-0000-0000-000000000026','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000019','Prague Tech Center','factory','Prague','Czech Republic',50.0755,14.4378),
  -- Spain
  ('61000000-0000-0000-0000-000000000027','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000020','Barcelona Port Facility','port','Barcelona','Spain',41.3851,2.1734),
  -- Italy
  ('61000000-0000-0000-0000-000000000028','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000021','Milan Logistics Center','warehouse','Milan','Italy',45.4642,9.1900),
  -- United Kingdom
  ('61000000-0000-0000-0000-000000000029','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000022','Manchester Production','factory','Manchester','United Kingdom',53.4808,-2.2426),
  -- France
  ('61000000-0000-0000-0000-000000000030','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000023','Paris Manufacturing Hub','factory','Paris','France',48.8566,2.3522),
  -- Belgium
  ('61000000-0000-0000-0000-000000000031','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000024','Brussels Distribution Center','warehouse','Brussels','Belgium',50.8503,4.3517),
  -- Austria
  ('61000000-0000-0000-0000-000000000032','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000043','Vienna Materials Lab','factory','Vienna','Austria',48.2082,16.3738),
  -- Switzerland
  ('61000000-0000-0000-0000-000000000033','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000044','Zurich Precision Works','factory','Zurich','Switzerland',47.3769,8.5417),
  -- Denmark
  ('61000000-0000-0000-0000-000000000034','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000039','Copenhagen Green Facility','factory','Copenhagen','Denmark',55.6761,12.5683),
  -- Norway
  ('61000000-0000-0000-0000-000000000035','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000040','Oslo Energy Plant','factory','Oslo','Norway',59.9139,10.7522),
  -- Finland
  ('61000000-0000-0000-0000-000000000036','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000047','Helsinki Tech Factory','factory','Helsinki','Finland',60.1699,24.9384),
  -- Portugal
  ('61000000-0000-0000-0000-000000000037','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000048','Lisbon Components Plant','factory','Lisbon','Portugal',38.7223,-9.1393),
  -- North America - United States
  ('61000000-0000-0000-0000-000000000038','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000025','Austin Tech Campus','factory','Austin','United States',30.2672,-97.7431),
  ('61000000-0000-0000-0000-000000000039','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000026','Detroit Auto Complex','factory','Detroit','United States',42.3314,-83.0458),
  ('61000000-0000-0000-0000-000000000040','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000027','Los Angeles Port','port','Los Angeles','United States',33.7491,-118.2441),
  ('61000000-0000-0000-0000-000000000041','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000049','Seattle Tech Center','factory','Seattle','United States',47.6062,-122.3321),
  ('61000000-0000-0000-0000-000000000042','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000050','Atlanta Distribution Hub','warehouse','Atlanta','United States',33.7490,-84.3880),
  -- Mexico
  ('61000000-0000-0000-0000-000000000043','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000028','Tijuana Assembly Plant','factory','Tijuana','Mexico',32.5149,-117.0382),
  ('61000000-0000-0000-0000-000000000044','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000029','Guadalajara Tech Hub','factory','Guadalajara','Mexico',20.6597,-103.3496),
  -- Canada
  ('61000000-0000-0000-0000-000000000045','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000030','Toronto Industrial Park','factory','Toronto','Canada',43.6532,-79.3832),
  -- South America - Brazil
  ('61000000-0000-0000-0000-000000000046','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000031','São Paulo Factory','factory','São Paulo','Brazil',-23.5505,-46.6333),
  -- Argentina
  ('61000000-0000-0000-0000-000000000047','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000032','Buenos Aires Depot','warehouse','Buenos Aires','Argentina',-34.6037,-58.3816),
  -- Middle East - Turkey
  ('61000000-0000-0000-0000-000000000048','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000033','Istanbul Production Center','factory','Istanbul','Turkey',41.0082,28.9784),
  -- UAE
  ('61000000-0000-0000-0000-000000000049','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000034','Dubai Logistics Terminal','warehouse','Dubai','United Arab Emirates',25.2048,55.2708),
  -- Africa - South Africa
  ('61000000-0000-0000-0000-000000000050','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000035','Johannesburg Mining Hub','warehouse','Johannesburg','South Africa',-26.2041,28.0473),
  -- Morocco
  ('61000000-0000-0000-0000-000000000051','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000036','Casablanca Port','port','Casablanca','Morocco',33.5731,-7.5898),
  -- Additional major cities for better coverage
  -- Germany (additional)
  ('61000000-0000-0000-0000-000000000052','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000006','Munich Warehouse','warehouse','Munich','Germany',48.1351,11.5820),
  -- South Korea (additional)
  ('61000000-0000-0000-0000-000000000053','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Seoul Office','office','Seoul','South Korea',37.5665,126.9780),
  -- Taiwan (additional)
  ('61000000-0000-0000-0000-000000000054','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Taipei Office','office','Taipei','Taiwan',25.0330,121.5654),
  -- Additional China facilities
  ('61000000-0000-0000-0000-000000000055','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','Guangzhou Port','port','Guangzhou','China',23.1291,113.2644),
  ('61000000-0000-0000-0000-000000000056','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000042','Ningbo Port','port','Ningbo','China',29.8683,121.5440),
  -- US additional facilities
  ('61000000-0000-0000-0000-000000000057','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000049','Portland Warehouse','warehouse','Portland','United States',45.5152,-122.6784),
  ('61000000-0000-0000-0000-000000000058','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000025','Houston Port','port','Houston','United States',29.7604,-95.3698),
  ('61000000-0000-0000-0000-000000000059','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000026','Chicago Warehouse','warehouse','Chicago','United States',41.8781,-87.6298),
  ('61000000-0000-0000-0000-000000000060','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000027','San Francisco Office','office','San Francisco','United States',37.7749,-122.4194)
on conflict do nothing;

-- ── SUPPLIER REGION LINKS ─────────────────────────────────────────────────
insert into public.supplier_region_links (organization_id, supplier_id, region_id)
values
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000006'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000008'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000007'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000005'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000011'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000009','50000000-0000-0000-0000-000000000009'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000010','50000000-0000-0000-0000-000000000010')
on conflict do nothing;

-- ── PRODUCTS & COMPONENTS ─────────────────────────────────────────────────
insert into public.products (id, organization_id, name, sku, description)
values
  ('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Edge Sensor Hub','ESH-100','Industrial IoT gateway with 6-axis sensor input and cloud telemetry'),
  ('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Adaptive Drive Unit','ADU-300','Electric drivetrain assembly for commercial EV platforms')
on conflict do nothing;

insert into public.components (id, organization_id, product_id, name, component_code, description)
values
  ('71000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','Microcontroller Board','MCB-9','Primary compute board, ARM Cortex-M7 architecture'),
  ('71000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','70000000-0000-0000-0000-000000000001','Power Regulation Module','PRM-4','Buck-boost power conditioning, 5V/3.3V rails'),
  ('71000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','70000000-0000-0000-0000-000000000002','Battery Pack Shell','BPS-2','Injection-moulded protective shell for 48V battery pack')
on conflict do nothing;

insert into public.supplier_components (organization_id, supplier_id, component_id, lead_time_days, is_primary)
values
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001',28,true),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','71000000-0000-0000-0000-000000000002',34,true),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008','71000000-0000-0000-0000-000000000003',21,true)
on conflict do nothing;

-- ── CONTRACTS ─────────────────────────────────────────────────────────────
insert into public.contracts (id, organization_id, supplier_id, contract_number, value_usd, start_date, end_date, sla_terms, renewal_date)
values
  ('72000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','AR-2026-001',2400000,'2026-01-01','2026-12-31','OTIF 96%, max dwell 14 days','2026-11-15'),
  ('72000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','AR-2026-002',1800000,'2026-01-15','2026-12-31','Lead time under 35 days, defect rate <0.5%','2026-10-20'),
  ('72000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000006','NL-2026-004',3100000,'2026-02-01','2027-01-31','PPM defects under 250','2026-12-10')
on conflict do nothing;

-- ── RISK SCORE CONFIGURATION ───────────────────────────────────────────────
insert into public.risk_score_configs (organization_id, financial_weight, geopolitical_weight, natural_disaster_weight, operational_weight, compliance_weight, delivery_weight, alert_threshold)
values
  ('30000000-0000-0000-0000-000000000001',18,22,20,15,10,15,70),
  ('30000000-0000-0000-0000-000000000002',20,15,10,20,10,25,65)
on conflict (organization_id) do nothing;

-- ============================================================
-- RISK EVENTS  (6 for Apex Resilience, 1 for Northstar)
-- ============================================================
insert into public.risk_events (id, organization_id, title, event_type, severity, source, region_id, summary, detected_at, created_by)
values
  -- [1] CRITICAL natural disaster – active typhoon
  ('80000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   'Typhoon Kiran approaching Hsinchu semiconductor zone',
   'natural_disaster','critical','JMA / PAGASA alert feed',
   '50000000-0000-0000-0000-000000000002',
   'Category 3 typhoon tracking directly toward Northern Taiwan. Wind speed 185 km/h. Pacific Circuits Hsinchu Fab 2 is within projected impact corridor. 72-hour fab shutdown expected; TSMC-adjacent logistics routes closed.',
   timezone('utc',now()) - interval '6 hours',
   '10000000-0000-0000-0000-000000000001'),

  -- [2] HIGH delivery – South China port congestion
  ('80000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',
   'Port congestion spike at Yantian / Shekou terminals',
   'delivery','high','Harbor Micro logistics monitor',
   '50000000-0000-0000-0000-000000000003',
   'Container dwell time at Yantian and Shekou terminals has doubled to 11 days vs. contractual 5-day SLA. MCB-9 inbound shipment ETA shifted from T+8 to T+19 days. South China logistics disruption index at 3-year high.',
   timezone('utc',now()) - interval '18 hours',
   '10000000-0000-0000-0000-000000000001'),

  -- [3] HIGH geopolitical – Taiwan Strait exercises
  ('80000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
   'PLA naval exercises restrict Taiwan Strait commercial corridors',
   'geopolitical','high','Geopolitical intelligence brief',
   '50000000-0000-0000-0000-000000000002',
   'PLA has declared a temporary exclusion zone covering key Taiwan Strait shipping lanes. Cross-strait freight rerouted +2,400 km via Luzon Strait. Delta Silicon Suwon fab is sourcing mask blanks via affected corridor, adding 8–12 days to supply cycle.',
   timezone('utc',now()) - interval '3 days',
   '10000000-0000-0000-0000-000000000004'),

  -- [4] HIGH financial – Meridian earnings miss
  ('80000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',
   'Meridian Power Systems Q4 2025 revenue miss – 18% below guidance',
   'financial','high','Supplier financial monitor',
   '50000000-0000-0000-0000-000000000007',
   'Meridian Power Systems reported Q4 2025 revenue 18% below analyst guidance, citing component shortages and delayed project completions. Credit outlook downgraded by two agencies. Risk of capacity de-prioritisation for Apex PRM-4 module orders; 3–4 week delivery slippage already observed.',
   timezone('utc',now()) - interval '5 days',
   '10000000-0000-0000-0000-000000000001'),

  -- [5] MEDIUM operational – Harbor labor dispute
  ('80000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001',
   'Harbor Micro Shenzhen warehouse workers strike threat',
   'operational','medium','Operations monitoring',
   '50000000-0000-0000-0000-000000000003',
   'A union representing 340 warehouse staff at Harbor Micro Shenzhen has issued a 48-hour strike notice citing wage disputes. If action proceeds, outbound component processing will halt. Impact on Apex MCB-9 inbound pipeline: estimated 5–7 additional day delay on top of existing port congestion.',
   timezone('utc',now()) - interval '2 days',
   '10000000-0000-0000-0000-000000000004'),

  -- [6] Northstar – compliance hold
  ('80000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002',
   'Battery metals compliance audit delay – Danube Battery Metals',
   'compliance','high','Compliance analyst',
   '50000000-0000-0000-0000-000000000005',
   'Delayed environmental audit approval threatens upstream material release. EU battery regulation documentation incomplete; regulatory hold blocks all outbound inventory.',
   timezone('utc',now()) - interval '1 day',
   '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- ============================================================
-- DISRUPTIONS  (4 active; 3 for Apex = $1,005,000 total impact)
-- ============================================================
insert into public.disruptions (id, organization_id, risk_event_id, supplier_id, title, impact_summary, financial_impact_usd, started_at)
values
  -- Pacific Circuits: fab output -30% (typhoon)
  ('81000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   '80000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',
   'Pacific Circuits output reduced 30% — typhoon impact',
   'Hsinchu Fab 2 shifted to storm-safe skeleton crew. MCB-9 production rate reduced from 12,000 to 8,400 units/day. Finished goods buffer covers ~9 days at current demand; minimum safe buffer is 14 days.',
   450000,
   timezone('utc',now()) - interval '5 hours'),

  -- Delta Silicon: fab delays (Taiwan Strait)
  ('81000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001',
   '80000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000002',
   'Delta Silicon inbound mask-blank supply delayed — Taiwan Strait reroute',
   'Mask-blank shipments rerouted via Luzon Strait adding 10 days to supply cycle. Delta Silicon Suwon fab has begun rationing production slots. Logic chip allocation to Apex reduced by 22% for next two scheduled runs.',
   380000,
   timezone('utc',now()) - interval '2 days'),

  -- Meridian Power Systems: delivery gap (financial distress)
  ('81000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
   '80000000-0000-0000-0000-000000000005','60000000-0000-0000-0000-000000000005',
   'Meridian PRM-4 power module delivery 3-week slip',
   'Meridian has deprioritised Apex PRM-4 purchase orders following financial restructuring. Scheduled delivery of 4,200 units deferred from March 22 to April 14. Edge Sensor Hub line will exhaust PRM-4 buffer in 11 days at current build rate.',
   175000,
   timezone('utc',now()) - interval '4 days'),

  -- Northstar: Danube battery metals
  ('81000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',
   '80000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000008',
   'Danube Battery Metals shipment held — compliance regulatory block',
   'Regulatory hold blocks release of processed lithium inventory pending EU battery passport audit sign-off. 18-tonne shipment of battery-grade lithium carbonate frozen at Győr warehouse.',
   260000,
   timezone('utc',now()) - interval '20 hours')
on conflict do nothing;

-- ============================================================
-- RISK SCORES  (historical trend + current, Apex suppliers)
-- ============================================================
-- Pacific Circuits: escalating over 4 weeks (52 → 58 → 65 → 74 → 81)
insert into public.risk_scores (organization_id, target_type, supplier_id, risk_event_id, financial_score, geopolitical_score, natural_disaster_score, operational_score, compliance_score, delivery_score, composite_score, score_reason, triggered_by_source, triggered_by_user_id, created_at)
values
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000001',null,42,55,55,48,50,50,52,'Baseline periodic assessment — low seasonal risk','system',null, timezone('utc',now()) - interval '28 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000001',null,46,60,62,50,50,54,58,'Taiwan strait tension monitoring elevated','system',null, timezone('utc',now()) - interval '21 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000001',null,52,68,70,57,48,60,65,'Geopolitical risk upgraded following naval exercise announcement','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '14 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000001',null,58,76,82,65,46,66,74,'Typhoon season activation and Strait exclusion zone in effect','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '7 days'),
  -- current (referenced in disruption)
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001',60,74,90,82,44,66,81,'Typhoon risk and constrained fab capacity — threshold breach','manual_ingestion','10000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '5 hours'),

-- Delta Silicon: rising (42 → 48 → 58 → 66 → 73)
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000002',null,40,42,28,45,50,45,42,'Baseline — stable foundry throughput, low regional risk','system',null, timezone('utc',now()) - interval '28 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000002',null,44,50,30,47,50,48,48,'Geopolitical watch flag raised for Korea-adjacent strait','system',null, timezone('utc',now()) - interval '21 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000002',null,50,58,33,52,48,55,58,'Taiwan Strait exercise impact on cross-strait logistics','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '14 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000002',null,54,65,36,58,46,60,66,'Mask-blank supply reroute confirmed — delivery impact quantified','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '3 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000004',58,72,38,64,44,66,73,'Strait exclusion zone confirmed; allocation reduced 22%','manual_ingestion','10000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '2 days'),

-- Harbor Micro Logistics: creeping upward (38 → 45 → 55 → 67)
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000003',null,38,40,28,40,44,42,38,'Stable port conditions, no significant dwell anomalies','system',null, timezone('utc',now()) - interval '28 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000003',null,40,42,30,44,44,50,45,'Early congestion signals at Yantian terminal','system',null, timezone('utc',now()) - interval '21 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000003',null,44,46,32,52,44,62,55,'Dwell time doubled; labour dispute notice filed','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '7 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000002',48,50,34,60,44,74,67,'Port congestion at 3-year high; labour action imminent','manual_ingestion','10000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '18 hours'),

-- Atlas Rare Materials: moderate, slowly rising (31 → 38 → 45 → 58)
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000004',null,30,33,28,32,44,30,31,'Low baseline — stable mining output, no active flags','system',null, timezone('utc',now()) - interval '28 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000004',null,34,36,30,36,48,34,38,'Chile export compliance updates flagged for review','system',null, timezone('utc',now()) - interval '21 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000004',null,40,40,32,42,54,38,45,'Documentation backlog on new export classification','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '7 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000004',null,50,44,34,50,66,44,58,'Compliance gap confirmed; remediation plan submitted','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '1 day'),

-- Meridian Power Systems: escalating sharply (41 → 50 → 61 → 68 → 76)
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000005',null,40,38,28,42,46,45,41,'Stable operational baseline — no significant risk signals','system',null, timezone('utc',now()) - interval '28 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000005',null,44,40,30,48,46,52,50,'Delivery SLA slippage first observed','system',null, timezone('utc',now()) - interval '21 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000005',null,54,44,33,57,46,62,61,'Q4 pre-announcement revenue warning published','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '14 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000005',null,60,48,36,65,47,68,68,'Q4 earnings miss confirmed; credit outlook downgraded','manual_ingestion','10000000-0000-0000-0000-000000000004', timezone('utc',now()) - interval '5 days'),
  ('30000000-0000-0000-0000-000000000001','supplier','60000000-0000-0000-0000-000000000005','80000000-0000-0000-0000-000000000005',66,52,38,72,48,78,76,'Delivery deferral confirmed; financial distress signal active','manual_ingestion','10000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '4 days'),

-- Northstar – Danube Battery Metals (existing pattern)
  ('30000000-0000-0000-0000-000000000002','supplier','60000000-0000-0000-0000-000000000008','80000000-0000-0000-0000-000000000003',66,34,24,58,81,49,69,'Compliance delay on upstream metals source','manual_ingestion','10000000-0000-0000-0000-000000000002', timezone('utc',now()))
on conflict do nothing;

-- ============================================================
-- ALERTS  (5 for Apex: 3 new, 2 acknowledged; 1 for Northstar)
-- ============================================================
insert into public.alerts (id, organization_id, supplier_id, region_id, risk_event_id, severity, title, summary, status)
values
  -- Critical: Pacific Circuits crossed 80 — new
  ('82000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000001',
   'critical','Pacific Circuits risk score crossed 80 — immediate action required',
   'Composite supplier risk score reached 81 after Typhoon Kiran confirmed on direct path to Hsinchu. Score exceeds org threshold of 70 by +11 points. MCB-9 production buffer: 9 days remaining.',
   'new'),

  -- High: South China port — acknowledged
  ('82000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000002',
   'high','South China port dwell time doubled — MCB-9 inbound at risk',
   'Container dwell at Yantian/Shekou averaged 11 days vs. 5-day SLA. Inbound MCB-9 shipment ETA revised to +19 days. Labour action notice compounds existing congestion risk.',
   'acknowledged'),

  -- High: Taiwan Strait geopolitical — new
  ('82000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000004',
   'high','Taiwan Strait exclusion zone — Delta Silicon allocation cut 22%',
   'PLA naval exercise exclusion zone has diverted cross-strait mask-blank logistics. Delta Silicon Suwon has reduced Apex allocation by 22% for next two production runs, impacting logic chip availability.',
   'new'),

  -- High: Meridian financial — new
  ('82000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000007','80000000-0000-0000-0000-000000000005',
   'high','Meridian Power Systems risk score 76 — financial distress signal',
   'Composite score reached 76 following confirmed Q4 earnings miss and credit downgrade. PRM-4 delivery deferred 3 weeks. Edge Sensor Hub production buffer will be exhausted in 11 days without alternative sourcing.',
   'new'),

  -- Medium: Delta Silicon compliance — acknowledged
  ('82000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000006','80000000-0000-0000-0000-000000000004',
   'medium','Delta Silicon export control review — dual-source qualification expedited',
   'Geopolitical exposure has triggered an export control compliance review for Delta Silicon. Procurement has expedited dual-source qualification. Review expected to complete by March 22.',
   'acknowledged'),

  -- Northstar: compliance hold
  ('82000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002',
   '60000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000005','80000000-0000-0000-0000-000000000003',
   'high','Compliance hold on Danube battery metals feedstock',
   'Audit delay places battery pack (BPS-2) production at risk. Regulatory sign-off expected within 10 days; contingency sourcing from Czech Republic initiated.',
   'new')
on conflict do nothing;

-- ============================================================
-- INCIDENTS  (6 for Apex: 1 critical, 3 high, 1 medium open; 1 resolved)
-- ============================================================
insert into public.incidents (id, organization_id, disruption_id, risk_event_id, title, summary, status, priority, owner_user_id, created_by)
values
  -- [1] CRITICAL investigating — Pacific Circuits typhoon
  ('83000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   '81000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001',
   'Stabilise Edge Sensor Hub MCB-9 supply — Pacific Circuits typhoon impact',
   'Typhoon Kiran threatens 48–72 hour fab shutdown at Pacific Circuits Hsinchu. Current MCB-9 buffer: 9 days. Target: restore 14-day minimum buffer by activating secondary Kaohsiung routing and pre-positioning finished goods at East Coast warehouse.',
   'investigating','critical',
   '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'),

  -- [2] HIGH investigating — Taiwan Strait / Delta Silicon
  ('83000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000001',
   '81000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000004',
   'Manage Delta Silicon allocation reduction — Taiwan Strait disruption',
   'Delta Silicon has cut Apex logic chip allocation by 22% due to mask-blank supply disruption from Taiwan Strait rerouting. Risk team to quantify downstream ESH-100 production shortfall and identify spot-market alternative.',
   'investigating','high',
   '10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004'),

  -- [3] HIGH mitigating — Meridian power modules
  ('83000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000001',
   '81000000-0000-0000-0000-000000000004','80000000-0000-0000-0000-000000000005',
   'Source alternative PRM-4 power modules — Meridian delivery slip',
   'Meridian has deferred 4,200 PRM-4 units to April 14. Procurement has shortlisted three alternative power module suppliers (Murata, TDK, Cosel). Samples and qualification test results expected by March 20. SLA penalty clause review underway.',
   'mitigating','high',
   '10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004'),

  -- [4] HIGH new — qualify backup for Meridian (pre-existing)
  ('83000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001',
   null,null,
   'Qualify second-source power module supplier for long-term resilience',
   'Meridian delivery slips over two consecutive quarters have surfaced a single-source dependency risk for PRM-4. Procurement and risk teams are jointly qualifying a backup supplier to eliminate the critical path exposure.',
   'new','high',
   '10000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000004'),

  -- [5] MEDIUM new — Delta Silicon compliance review
  ('83000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000001',
   null,'80000000-0000-0000-0000-000000000004',
   'Delta Silicon export control compliance review — geopolitical flag',
   'Geopolitical escalation in the Taiwan Strait has triggered a mandatory export control compliance review for Delta Silicon. Legal and procurement to confirm whether current purchase agreements require ITAR/EAR re-classification.',
   'new','medium',
   '10000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000004'),

  -- [6] RESOLVED — South China port lane reallocation
  ('83000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001',
   null,'80000000-0000-0000-0000-000000000002',
   'South China port lane reallocation — prior congestion event resolved',
   'Carrier mix and lane controls restored expected lead-time variance after January port congestion event. Post-incident playbook published. Current congestion event is a separate, escalated recurrence.',
   'resolved','medium',
   '10000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003'),

  -- [Northstar] mitigating — battery metals
  ('83000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',
   '81000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000003',
   'Recover Danube battery metals release schedule',
   'Track compliance remediation and alternate sourcing for Danube Battery Metals. Czech secondary source qualification underway.',
   'mitigating','high',
   '10000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- ============================================================
-- INCIDENT ACTIONS
-- ============================================================
insert into public.incident_actions (organization_id, incident_id, description, assignee_user_id, due_date, status)
values
  -- Incident 83001: Pacific Circuits typhoon (critical)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000001',
   'Confirm 7-day finished goods buffer at East Coast warehouse — target raise to 14 days',
   '10000000-0000-0000-0000-000000000001', current_date + 1, 'in_progress'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000001',
   'Evaluate alternative carrier allocation from Kaohsiung port for MCB-9 boards',
   '10000000-0000-0000-0000-000000000001', current_date + 2, 'todo'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000001',
   'Contact Pacific Circuits ops team for fab restart timeline and priority customer ranking',
   '10000000-0000-0000-0000-000000000003', current_date + 1, 'in_progress'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000001',
   'Prepare executive briefing note on MCB-9 supply risk for CFO and board',
   '10000000-0000-0000-0000-000000000001', current_date + 1, 'todo'),

  -- Incident 83005: Delta Silicon / Taiwan Strait (high)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000005',
   'Quantify ESH-100 production shortfall from 22% logic chip reduction',
   '10000000-0000-0000-0000-000000000004', current_date + 2, 'in_progress'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000005',
   'Identify spot-market logic chip alternatives (GlobalFoundries, SMIC) for gap fill',
   '10000000-0000-0000-0000-000000000005', current_date + 3, 'todo'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000005',
   'Request priority re-allocation letter from Delta Silicon key account manager',
   '10000000-0000-0000-0000-000000000003', current_date + 2, 'todo'),

  -- Incident 83006: Meridian power modules (high mitigating)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000006',
   'Issue emergency PO to Murata for equivalent power modules — sample order 200 units',
   '10000000-0000-0000-0000-000000000005', current_date + 1, 'in_progress'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000006',
   'Review Meridian contractual SLA penalty clause — calculate clawback for 3-week slip',
   '10000000-0000-0000-0000-000000000003', current_date + 2, 'todo'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000006',
   'Complete qualification test for TDK and Cosel power module alternatives',
   '10000000-0000-0000-0000-000000000005', current_date + 5, 'todo'),

  -- Incident 83003: Long-term Meridian second source (high new)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000003',
   'Validate backup supplier quality checklist against ESH-100 power rail requirements',
   '10000000-0000-0000-0000-000000000005', current_date + 3, 'todo'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000003',
   'Initiate NDA and supplier qualification audit with top-ranked alternative',
   '10000000-0000-0000-0000-000000000003', current_date + 5, 'todo'),

  -- Incident 83007: Delta Silicon compliance review (medium new)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000007',
   'Submit TSMC export control questionnaire — confirm Delta Silicon indirect exposure',
   '10000000-0000-0000-0000-000000000005', current_date + 4, 'todo'),
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000007',
   'Brief legal team on Taiwan Strait geopolitical exposure to purchase agreements',
   '10000000-0000-0000-0000-000000000003', current_date + 3, 'todo'),

  -- Incident 83004: Resolved (done action)
  ('30000000-0000-0000-0000-000000000001','83000000-0000-0000-0000-000000000004',
   'Publish post-incident lane reallocation playbook for South China congestion events',
   '10000000-0000-0000-0000-000000000003', current_date - 1, 'done'),

  -- Northstar 83002
  ('30000000-0000-0000-0000-000000000002','83000000-0000-0000-0000-000000000002',
   'Escalate audit documentation with regional compliance counsel',
   '10000000-0000-0000-0000-000000000002', current_date + 1, 'in_progress'),
  ('30000000-0000-0000-0000-000000000002','83000000-0000-0000-0000-000000000002',
   'Expedite qualification of Czech Republic secondary metals source',
   '10000000-0000-0000-0000-000000000009', current_date + 4, 'todo')
on conflict do nothing;

-- ============================================================
-- MITIGATION PLANS  (5 plans for Apex, 2 for Northstar)
-- ============================================================
insert into public.mitigation_plans (organization_id, supplier_id, risk_event_id, title, mitigation_type, status, owner_user_id, details)
values
  -- Pacific Circuits: buffer stock increase
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','80000000-0000-0000-0000-000000000001',
   'Expand MCB-9 finished goods safety stock to 18 days',
   'inventory_buffer','active','10000000-0000-0000-0000-000000000001',
   'Increase MCB-9 board coverage from 9 to 18 days at East Coast distribution centre. Triggered by typhoon threat. Pre-position 3,600 units by March 18 via expedited air-freight from Kaohsiung. Cost estimate: $42,000 premium freight.'),

  -- Delta Silicon: dual source
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000004',
   'Qualify GlobalFoundries US fab as secondary logic chip source',
   'dual_source','planned','10000000-0000-0000-0000-000000000005',
   'Initiate supplier qualification for GlobalFoundries Malta NY fab as secondary source for Apex logic chips. Target: dual-source 30% of logic chip volume by Q3 2026. Estimated qualification timeline: 90 days. Removes Taiwan Strait single-point-of-failure.'),

  -- Meridian: alternative route / emergency procurement
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','80000000-0000-0000-0000-000000000005',
   'Emergency PRM-4 power module procurement from Murata and TDK',
   'dual_source','active','10000000-0000-0000-0000-000000000004',
   'Activate emergency procurement from Murata (200-unit sample) and TDK (150-unit sample) to bridge 3-week Meridian delivery gap. Target delivery: March 22. Qualification testing running in parallel to ensure ESH-100 compatibility before full PO placement.'),

  -- Harbor Micro: alternative route
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000002',
   'Activate Kaohsiung alternative routing for MCB-9 inbound',
   'alternative_route','active','10000000-0000-0000-0000-000000000001',
   'Reroute MCB-9 inbound shipments from Shenzhen via Kaohsiung port to bypass Yantian/Shekou congestion. Kaohsiung lane adds 2 days transit but restores SLA compliance. Carrier: Evergreen Marine, confirmed capacity for next 3 sailings.'),

  -- Atlas: compliance fix
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000004',null,
   'Complete Chilean export reclassification documentation for rare earths',
   'compliance_fix','planned','10000000-0000-0000-0000-000000000005',
   'Atlas Rare Materials requires updated export classification under new Chilean Mining Ministry directive effective April 1, 2026. Legal has engaged local counsel; documentation package due March 28. No disruption expected if completed on schedule.'),

  -- Northstar: dual source battery metals
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008','80000000-0000-0000-0000-000000000003',
   'Qualify secondary battery metals source in Czech Republic',
   'dual_source','planned','10000000-0000-0000-0000-000000000002',
   'Qualify Lithium Bohemia s.r.o. (Pardubice) as secondary processed lithium carbonate source. Target: 40% volume allocation by Q2 2026 to reduce Danube Battery Metals single-source dependency.'),

  -- Northstar: supplier recovery
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008','80000000-0000-0000-0000-000000000003',
   'Danube Battery Metals EU Battery Passport compliance remediation',
   'compliance_fix','active','10000000-0000-0000-0000-000000000008',
   'Coordinate with Danube Battery Metals legal team to complete EU battery passport documentation. Regional compliance counsel engaged. Audit sign-off expected by March 25, 2026.')
on conflict do nothing;

-- ============================================================
-- ASSESSMENTS  (historical + current per Apex supplier)
-- ============================================================
insert into public.assessments (organization_id, supplier_id, financial_score, operational_score, compliance_score, performance_score, summary, status, assessed_by, assessed_at)
values
  -- Pacific Circuits: 3 assessments over 6 weeks (degrading)
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',
   72,80,65,74,'February baseline review: strong fab throughput, low compliance risk. Typhoon season exposure flagged as seasonal watch item.','completed',
   '10000000-0000-0000-0000-000000000001','2026-02-01T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',
   68,75,58,70,'Mid-February review: geopolitical watch added after Taiwan Strait tension reports. Fab quality unchanged; logistics risk elevated.','completed',
   '10000000-0000-0000-0000-000000000004','2026-02-22T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001',
   64,72,51,69,'March review: typhoon season activation and Strait geopolitical escalation have elevated climate and logistics exposure significantly.','completed',
   '10000000-0000-0000-0000-000000000001','2026-03-09T00:00:00Z'),

  -- Delta Silicon: 2 assessments
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002',
   68,72,64,70,'February review: stable foundry throughput, compliance maintained. Geopolitical watch activated for Taiwan Strait corridor dependency.','completed',
   '10000000-0000-0000-0000-000000000005','2026-02-15T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002',
   61,69,58,63,'March review: foundry throughput stable but geopolitical and compliance exposure elevated. Dual-source qualification recommended.','completed',
   '10000000-0000-0000-0000-000000000005','2026-03-07T00:00:00Z'),

  -- Harbor Micro: 2 assessments
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003',
   60,68,54,62,'February review: port operations stable. Dwell time within SLA. Labour relations neutral.','completed',
   '10000000-0000-0000-0000-000000000001','2026-02-10T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003',
   55,62,49,58,'March review: port congestion worsening; customs delay risk persists. Labour dispute notice increases operational risk.','completed',
   '10000000-0000-0000-0000-000000000001','2026-03-05T00:00:00Z'),

  -- Atlas Rare Materials: 2 assessments
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000004',
   58,64,66,60,'February review: stable mining output, good compliance posture. Export regulation change on radar.','completed',
   '10000000-0000-0000-0000-000000000003','2026-02-12T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000004',
   52,57,60,54,'March review: mining output steady; new Chilean export compliance rules require documentation update by April 1. Moderate ESG follow-ups in progress.','completed',
   '10000000-0000-0000-0000-000000000003','2026-03-01T00:00:00Z'),

  -- Meridian Power Systems: 3 assessments (deteriorating)
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005',
   68,70,60,66,'January review: power systems supplier stable; minor lead-time variance. No financial concerns.','completed',
   '10000000-0000-0000-0000-000000000004','2026-01-20T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005',
   62,67,57,63,'February review: delivery slippage first observed (+8 days on last PO). Financial pre-announcement warning published.','completed',
   '10000000-0000-0000-0000-000000000004','2026-02-18T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005',
   59,65,55,61,'March review: Q4 earnings miss confirmed. Credit outlook downgraded. Lead-time volatility flagged; backup sourcing evaluation initiated.','completed',
   '10000000-0000-0000-0000-000000000004','2026-03-11T00:00:00Z'),

  -- Northstar suppliers
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000006',70,73,68,71,'Assembly capacity strong, minimal compliance issues noted.','completed','10000000-0000-0000-0000-000000000002','2026-03-10T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000007',63,66,62,60,'Forging throughput stable; energy cost sensitivity rising.','completed','10000000-0000-0000-0000-000000000008','2026-03-04T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000008',58,61,83,55,'Supplier requires compliance remediation to stay within guardrails.','completed','10000000-0000-0000-0000-000000000002','2026-03-08T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000009',74,71,69,73,'Controls supplier trending healthy with low disruption risk.','completed','10000000-0000-0000-0000-000000000009','2026-03-06T00:00:00Z'),
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000010',60,64,57,59,'Carrier network steady; monitor port congestion exposure.','completed','10000000-0000-0000-0000-000000000010','2026-03-12T00:00:00Z')
on conflict do nothing;

-- ============================================================
-- REPORTS
-- ============================================================
insert into public.reports (organization_id, report_type, report_format, created_by, storage_path, generated_at)
values
  ('30000000-0000-0000-0000-000000000001','executive_summary','pdf','10000000-0000-0000-0000-000000000001',
   'reports/apex-resilience/executive-summary-march-2026.pdf', timezone('utc',now()) - interval '2 days'),
  ('30000000-0000-0000-0000-000000000001','supplier_scorecard','csv','10000000-0000-0000-0000-000000000004',
   'reports/apex-resilience/supplier-scorecard-march-2026.csv', timezone('utc',now()) - interval '3 days'),
  ('30000000-0000-0000-0000-000000000001','executive_summary','pdf','10000000-0000-0000-0000-000000000001',
   'reports/apex-resilience/executive-summary-february-2026.pdf', timezone('utc',now()) - interval '30 days'),
  ('30000000-0000-0000-0000-000000000001','compliance','csv','10000000-0000-0000-0000-000000000005',
   'reports/apex-resilience/compliance-report-q1-2026.csv', timezone('utc',now()) - interval '10 days'),
  ('30000000-0000-0000-0000-000000000002','supplier_scorecard','csv','10000000-0000-0000-0000-000000000002',
   'reports/northstar-logistics/supplier-scorecard-march.csv', timezone('utc',now()) - interval '1 day')
on conflict do nothing;

-- ============================================================
-- SCENARIOS
-- ============================================================
insert into public.scenarios (organization_id, title, assumptions, expected_impact, created_by)
values
  ('30000000-0000-0000-0000-000000000001',
   '72-hour Pacific Circuits fab shutdown — Typhoon Kiran worst case',
   'Full fab shutdown at Hsinchu Fab 2 for 72 hours. No alternate production ramp possible within window. East Coast buffer limited to 9 days at current demand rate.',
   'MCB-9 availability drops to zero on Day 10 after shutdown. Edge Sensor Hub production halts on Day 12. Revenue at risk: ~$1.8M over 3-week recovery window unless Kaohsiung routing activated by Day 3.',
   '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001',
   'Compound Asia risk scenario — simultaneous typhoon + Taiwan Strait closure',
   'Typhoon Kiran closes Pacific Circuits. Taiwan Strait exclusion zone persists for 30 days, blocking Delta Silicon inbound supply and extending Harbor Micro lead times by additional 2 weeks.',
   'Two of three Tier-1 suppliers in simultaneous disruption. MCB-9 and logic chip supply both constrained. ESH-100 production capacity reduced to 35% within 14 days. Total revenue at risk: $4.2M over 6-week scenario window. Activate all mitigation plans simultaneously.',
   '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000001',
   'Meridian Power Systems insolvency — worst case financial distress',
   'Meridian enters administration within 60 days of Q4 earnings miss. All PRM-4 purchase orders cancelled. No new supplier qualified yet.',
   'PRM-4 power module supply halts. ESH-100 production line stops within 11 days. Revenue at risk: $2.6M per month until alternative source qualified (est. 90 days). Immediate action: advance qualify Murata and TDK emergency suppliers.',
   '10000000-0000-0000-0000-000000000004'),
  ('30000000-0000-0000-0000-000000000002',
   'Danube metals hold extends 3 weeks',
   'EU battery passport compliance hold is not resolved within 10 days. Czech alternate source requires 3-week qualification.',
   'Battery pack (BPS-2) production drops 18% without alternate source. ADU-300 shipment commitments to two OEM customers at risk.',
   '10000000-0000-0000-0000-000000000002')
on conflict do nothing;

-- ============================================================
-- METRICS  (weekly snapshots for 6 weeks, both orgs)
-- ============================================================
insert into public.metrics (organization_id, recorded_at, total_suppliers, at_risk_suppliers, open_incidents, mttr_hours, false_positive_rate)
values
  -- Apex Resilience — 6 historical snapshots (improving MTTR, worsening risk)
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '42 days', 5, 0, 0, 32.0, 8.2),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '35 days', 5, 1, 0, 29.5, 7.4),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '28 days', 5, 1, 1, 26.2, 6.8),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '21 days', 5, 2, 1, 22.8, 5.9),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '14 days', 5, 2, 2, 20.1, 5.1),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '7 days',  5, 2, 3, 18.4, 4.5),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '1 day',   5, 3, 4, 19.5, 4.2),
  ('30000000-0000-0000-0000-000000000001', timezone('utc',now()) - interval '4 hours', 5, 3, 5, 16.8, 3.8),

  -- Northstar Logistics — 4 snapshots
  ('30000000-0000-0000-0000-000000000002', timezone('utc',now()) - interval '28 days', 5, 1, 0, 18.0, 3.5),
  ('30000000-0000-0000-0000-000000000002', timezone('utc',now()) - interval '14 days', 5, 1, 1, 16.2, 3.2),
  ('30000000-0000-0000-0000-000000000002', timezone('utc',now()) - interval '1 day',   5, 2, 1, 15.0, 3.1),
  ('30000000-0000-0000-0000-000000000002', timezone('utc',now()) - interval '4 hours', 5, 2, 1, 13.4, 2.9)
on conflict do nothing;

-- ============================================================
-- INVENTORIES
-- ============================================================
insert into public.inventories (organization_id, component_id, facility_id, quantity_on_hand, buffer_target, updated_by)
values
  -- MCB-9 at Hsinchu Fab 2 — below buffer (crisis signal)
  ('30000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','61000000-0000-0000-0000-000000000001',
   1240, 1800, '10000000-0000-0000-0000-000000000001'),
  -- PRM-4 at Shenzhen Port Hub — also below target
  ('30000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002','61000000-0000-0000-0000-000000000002',
   680, 900, '10000000-0000-0000-0000-000000000001'),
  -- BPS-2 at Munich Assembly — below target
  ('30000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000003','61000000-0000-0000-0000-000000000003',
   420, 700, '10000000-0000-0000-0000-000000000002')
on conflict (organization_id, component_id, facility_id) do nothing;

-- ============================================================
-- SHIPMENTS
-- ============================================================
insert into public.shipments (organization_id, supplier_id, component_id, origin, destination, carrier, eta_date, status)
values
  -- MCB-9 from Shenzhen — delayed (port congestion)
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000001',
   'Shenzhen','Los Angeles','Apex Ocean Line', current_date + 19, 'delayed'),
  -- BPS-2 Rotterdam → Munich — in transit
  ('30000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000010','71000000-0000-0000-0000-000000000003',
   'Rotterdam','Munich','Nordline Rail', current_date + 3, 'in_transit'),
  -- MCB-9 via Kaohsiung — in transit (mitigation routing)
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001',
   'Kaohsiung','Los Angeles','Evergreen Marine', current_date + 10, 'in_transit'),
  -- PRM-4 from Penang — delayed (Meridian slip)
  ('30000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000005','71000000-0000-0000-0000-000000000002',
   'Penang','San Jose','Meridian Air Freight', current_date + 30, 'delayed')
on conflict do nothing;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
insert into public.notifications (organization_id, user_id, alert_id, channel, sent_at)
values
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   '82000000-0000-0000-0000-000000000001','email', timezone('utc',now()) - interval '5 hours'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',
   '82000000-0000-0000-0000-000000000004','in_app', timezone('utc',now()) - interval '3 days'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004',
   '82000000-0000-0000-0000-000000000005','email', timezone('utc',now()) - interval '4 days'),
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004',
   '82000000-0000-0000-0000-000000000002','in_app', timezone('utc',now()) - interval '18 hours'),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002',
   '82000000-0000-0000-0000-000000000003','in_app', timezone('utc',now()) - interval '20 hours')
on conflict do nothing;

-- ============================================================
-- INTEGRATION CONNECTIONS
-- ============================================================
insert into public.integration_connections (organization_id, name, integration_type, credentials, status, last_sync_at)
values
  ('30000000-0000-0000-0000-000000000001','ERP Sandbox','erp',
   '{"endpoint":"https://erp.apex.demo","version":"v2"}','connected', timezone('utc',now()) - interval '2 hours'),
  ('30000000-0000-0000-0000-000000000001','Risk Monitoring Webhook','webhook',
   '{"shared_secret":"demo-hmac-secret-apex","endpoint":"/api/monitoring"}','connected', timezone('utc',now()) - interval '30 minutes'),
  ('30000000-0000-0000-0000-000000000002','Webhook Monitor','webhook',
   '{"shared_secret":"demo-secret"}','degraded', timezone('utc',now()) - interval '8 hours')
on conflict do nothing;

-- ============================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================
insert into public.customers (id, organization_id, stripe_customer_id)
values
  ('90000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','cus_apex_demo'),
  ('90000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','cus_northstar_demo')
on conflict do nothing;

insert into public.prices (id, stripe_price_id, nickname, currency, unit_amount, interval, supplier_limit, is_active)
values
  ('91000000-0000-0000-0000-000000000001','price_starter_demo','Starter','usd',9900,'month',25,true),
  ('91000000-0000-0000-0000-000000000002','price_professional_demo','Professional','usd',29900,'month',100,true)
on conflict do nothing;

insert into public.subscriptions (id, organization_id, customer_id, price_id, stripe_subscription_id, status, current_period_end)
values
  ('92000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
   '90000000-0000-0000-0000-000000000001','91000000-0000-0000-0000-000000000002',
   'sub_apex_demo','active', timezone('utc',now()) + interval '25 days'),
  ('92000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002',
   '90000000-0000-0000-0000-000000000002','91000000-0000-0000-0000-000000000001',
   'sub_northstar_demo','trialing', timezone('utc',now()) + interval '12 days')
on conflict do nothing;

insert into public.payment_history (organization_id, subscription_id, stripe_invoice_id, amount, currency, status, paid_at)
values
  ('30000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000001',
   'in_apex_demo_001',29900,'usd','succeeded', timezone('utc',now()) - interval '10 days'),
  ('30000000-0000-0000-0000-000000000001','92000000-0000-0000-0000-000000000001',
   'in_apex_demo_002',29900,'usd','succeeded', timezone('utc',now()) - interval '40 days'),
  ('30000000-0000-0000-0000-000000000002','92000000-0000-0000-0000-000000000002',
   'in_northstar_demo_001',9900,'usd','succeeded', timezone('utc',now()) - interval '6 days')
on conflict do nothing;
