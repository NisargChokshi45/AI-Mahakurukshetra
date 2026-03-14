# Judge Walkthrough Script (5 Minutes)

## Demo Account

- Email: `risk@apex-resilience.demo`
- Password: `DemoPass123!`

## 0:00 - 0:30 Problem + Setup

- Open `/login`.
- State: platform monitors supplier disruptions, auto-scores risk, and drives incident response.
- Sign in with the demo account.

## 0:30 - 1:30 Alert-Driven Dashboard

- Land on `/dashboard`.
- Show:
  - total suppliers
  - at-risk suppliers
  - open incidents
  - latest alerts
- Mention org-scoped data and RLS-backed tenancy.

## 1:30 - 2:15 Supplier Risk Breakdown

- Navigate to `/suppliers`.
- Open `Pacific Circuits`.
- Highlight:
  - category risk breakdown
  - active alerts
  - linked incidents/events

## 2:15 - 3:30 Create Incident

- Open `/incidents`.
- In "Create incident", submit:
  - Title: `Power module alternate source escalation`
  - Priority: `high`
  - Summary: `Escalate alternate supplier qualification due to repeated delivery slippage.`
- Show redirect to `/incidents/[id]?created=1`.

## 3:30 - 4:20 Resolve Incident

- In incident workspace, click `Mark as resolved`.
- Show:
  - success banner
  - `Current status: resolved`
- Explain that role-based checks restrict create/resolve actions to owner/admin/risk_manager.

## 4:20 - 5:00 Reports + API Readiness

- Open `/reports` to show reporting surface.
- Open `/api/docs` to show Swagger UI + endpoint groups.
- Open `/api/health` to show runtime health payload (DB, Redis, version, uptime).
