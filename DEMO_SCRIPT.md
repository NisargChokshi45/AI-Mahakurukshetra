# Demo Script — AI Mahakurukshetra

**Supply Chain Risk Intelligence Platform | 5-Minute Demo**

---

## 0. Opening (30s)

> "Supply chain disruptions cost companies $184M per year on average. Today I'll show you AI Mahakurukshetra — a real-time supply chain risk intelligence platform that gives risk managers, procurement leads, and operations teams the visibility they need to act before disruptions become disasters."

---

## 1. Login & Onboarding (30s)

1. **Navigate to landing page** — point out the value proposition and pricing tiers.
2. **Sign up / Log in** — show email/password flow with validation.
3. **Organization setup** — quick onboarding form to create a workspace.

> "Multi-tenant from day one — each org has full data isolation via Supabase RLS policies."

---

## 2. Dashboard (45s)

1. **Executive KPI bar** — at-risk suppliers, open incidents, risk events this week.
2. **AI Insight Card** — live AI-generated summary of the current risk landscape.
3. **Live alerts panel** — recent high-severity events surfaced automatically.

> "The AI insight card calls our configurable AI backend — supports OpenAI, Anthropic, or any provider the org sets up in Settings."

---

## 3. Supplier Directory (45s)

1. **Filter & search** — show filters by region, tier, risk score.
2. **Supplier detail page** — risk score breakdown, facility info, historical assessments.
3. **AI Supplier Summary** — click to generate an executive summary for the supplier.
4. **Alternative Suppliers** — AI suggests alternatives ranked by risk and proximity.

> "Risk scores update as new events are ingested — no manual scoring required."

---

## 4. Risk Events Feed (45s)

1. **Feed view** — severity/type/region chips, sortable list.
2. **Ingest a new event** — fill the manual ingestion form (supplier, type, severity, region).
3. **Event detail page** — affected suppliers listed, linked incidents.

> "Events can come in via the UI or the public API — ERP and third-party feeds can push directly."

---

## 5. Incident Management (45s)

1. **Incidents board** — Kanban columns: Open → Investigating → Mitigating → Resolved.
2. **Incident workspace** — timeline of actions, stakeholder notes, linked risk events.
3. **AI Summary** — generate an executive incident brief in one click.

> "Audit trail is immutable — every status change and action is timestamped for compliance."

---

## 6. Supply Chain Map (30s)

1. **Interactive graph** — org node → Tier-1 suppliers → Tier-2 suppliers.
2. **Color coding** — green/yellow/red by live risk score.
3. **Click a node** — drill into the supplier detail.

> "Visual dependency mapping shows exactly where concentration risk lives."

---

## 7. Reports & Assessments (20s)

1. **Reports page** — generate and export executive summaries (PDF/CSV).
2. **Assessments** — create structured supplier assessments; track completion status.

---

## 8. Settings — AI & Billing (20s)

1. **AI Settings** — per-org API key, provider selection, model config.
2. **Billing** — Stripe-powered Starter / Professional / Enterprise plans, usage shown.
3. **Team Members** — invite with role: owner, admin, risk_manager, procurement_lead, viewer.

> "Role-based access control enforced at the database layer, not just the UI."

---

## 9. API Docs (15s)

1. **Navigate to `/api/docs`** — live Swagger UI.
2. **Show health check** at `/api/health`.

> "Full public API means enterprise customers can integrate without touching the UI."

---

## 10. Closing (15s)

> "AI Mahakurukshetra delivers real-time risk intelligence, AI-powered insights, and enterprise-grade security — built in under 10 hours on a production-ready Next.js + Supabase stack. Questions?"

---

## Key Talking Points

| Theme      | One-liner                                                        |
| ---------- | ---------------------------------------------------------------- |
| Security   | RLS on every table, encrypted AI keys, RBAC enforced at DB layer |
| AI         | Provider-agnostic — swap OpenAI ↔ Anthropic per org              |
| Scale      | Multi-tenant monorepo, Stripe billing, rate-limited public API   |
| Speed      | Built in 10 hours; Core Web Vitals green; sub-200ms API targets  |
| Compliance | Immutable audit trail, structured logging with pino              |

---

## Demo Credentials (if needed)

- **URL**: `http://localhost:3000` (or Vercel preview URL)
- **Demo org**: pre-seeded via `scripts/seed-database.sh`
