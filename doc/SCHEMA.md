# Schema Status

No Supabase schema has been implemented yet. Migrations are planned under `supabase/migrations/`.

---

## Tables

### Auth & Organizations

| Table | Description |
|-------|-------------|
| `organizations` | Top-level tenant. All business data is scoped to an org. |
| `user_profiles` | Extends Supabase `auth.users` with display name, avatar, preferences. |
| `organization_members` | Join table: user ↔ org with role (owner, admin, risk_manager, procurement_lead, viewer). |

### Supplier Registry

| Table | Description |
|-------|-------------|
| `suppliers` | Supplier company record with tier (1/2/3), status, country, and current risk score. |
| `supplier_facilities` | Physical facilities linked to a supplier (factory, warehouse, port). Includes lat/lng for map. |
| `regions` | Geographic risk zones (country, sub-region, continent). Carries base geopolitical and disaster risk scores. |
| `supplier_region_links` | Many-to-many: supplier operates in multiple regions. |

### Products & Supply Chain Structure

| Table | Description |
|-------|-------------|
| `products` | Products that the organization sells or depends on. |
| `components` | Sub-components or raw materials used in products. |
| `supplier_components` | Which supplier supplies which component. Supports multi-tier mapping. |
| `contracts` | Supply contracts between org and supplier: value, start/end date, SLA terms, renewal date. |
| `inventories` | Current inventory levels and buffer stock targets per component per facility. |
| `shipments` | In-transit shipment records: origin, destination, carrier, ETA, status. |

### Risk Engine

| Table | Description |
|-------|-------------|
| `risk_events` | An event that introduces or escalates risk (geopolitical, natural, financial, operational, compliance). Includes severity, affected regions, and source. |
| `disruptions` | A confirmed supply chain disruption linked to a risk event. Has financial impact estimate. |
| `risk_scores` | Point-in-time risk score records for a supplier or region. Captures individual category scores and composite. Enables trend history. |
| `risk_score_configs` | Per-org configurable weights for each risk scoring category. |
| `alerts` | Generated alerts tied to a supplier or region when score crosses threshold or event is created. Status: new, acknowledged, dismissed, resolved. |

### Incident Response

| Table | Description |
|-------|-------------|
| `incidents` | An active supply chain incident. Linked to a disruption or risk event. Has status (new, investigating, mitigating, resolved), owner, and priority. |
| `incident_actions` | Individual action items within an incident (task description, assignee, due date, status). |
| `mitigation_plans` | Formal risk mitigation strategy: linked to supplier or risk event, type (dual-source, inventory buffer, alternative route, etc.), status. |

### Assessments & Reports

| Table | Description |
|-------|-------------|
| `assessments` | Supplier risk assessment record. Captures scores across dimensions (financial, operational, compliance, performance). Created by risk_manager or admin. |
| `reports` | Generated reports: type (executive summary, compliance, supplier scorecard), format (PDF, CSV), generated at, created by. |

### Analytics & Scenario Planning

| Table | Description |
|-------|-------------|
| `scenarios` | Hypothetical disruption scenarios for planning. Describes assumptions and expected impact on supplier scores. (Feature-flagged: scenario_simulation) |
| `metrics` | Time-series org-level KPI snapshots: total supplier count, at-risk suppliers, open incidents, MTTR, alert false-positive rate. Stored for trend charts. |
| `notifications` | Delivery log for alerts sent to users (in-app, email). Tracks sent_at, read_at. |

### Integrations & Billing

| Table | Description |
|-------|-------------|
| `integration_connections` | ERP or external feed connector config per org. Stores type, credentials (encrypted), status, last_sync_at. |
| `customers` | Stripe customer ID linked to org. |
| `subscriptions` | Active Stripe subscription with plan tier, status, current_period_end. |
| `prices` | Available pricing plans synced from Stripe. |
| `payment_history` | Log of payment events (succeeded, failed). |

---

## Full Table List

```
organizations
user_profiles
organization_members
suppliers
supplier_facilities
regions
supplier_region_links
products
components
supplier_components
contracts
inventories
shipments
risk_events
disruptions
risk_scores
risk_score_configs
alerts
incidents
incident_actions
mitigation_plans
assessments
reports
scenarios
metrics
notifications
integration_connections
customers
subscriptions
prices
payment_history
```

---

## RLS Direction

- All business tables have `organization_id` column
- RLS enabled on every table; default deny
- Read/write access gates through `organization_members` membership check
- Custom JWT claim `org_id` set on session to avoid per-row subquery overhead
- Admin-only mutation paths: `risk_score_configs`, `integration_connections`, `organization_members`
- Public (no auth): `GET /api/health`, `POST /api/auth/callback`, `POST /api/monitoring` (signature-verified), `POST /api/stripe/webhook` (signature-verified)
- Service role used only in seed scripts and webhook handlers — never exposed to client

---

## Indexing Strategy

Key indexes beyond primary keys:

```sql
-- Most queries filter by org first
CREATE INDEX idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX idx_risk_events_org_severity ON risk_events(organization_id, severity);
CREATE INDEX idx_alerts_org_status ON alerts(organization_id, status);
CREATE INDEX idx_incidents_org_status ON incidents(organization_id, status);
CREATE INDEX idx_risk_scores_supplier_created ON risk_scores(supplier_id, created_at DESC);
CREATE INDEX idx_metrics_org_created ON metrics(organization_id, recorded_at DESC);
```
