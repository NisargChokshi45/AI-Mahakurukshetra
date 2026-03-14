# Security Checklist (Phase 6)

Last verified: 2026-03-14

## 1) No Secrets In Client Bundle

- Status: Pass
- Evidence:
  - Service-role key usage is confined to server-only code paths (`lib/supabase/admin.ts`, server env parsing, scripts).
  - No `SUPABASE_SERVICE_ROLE_KEY` references under client route/components trees.

## 2) All Mutations Require Auth

- Status: Pass
- Evidence:
  - Server mutations (`createRiskEventAction`, incident create/resolve actions) use `requireOrganizationContext()`.
  - Public API mutation (`POST /api/monitoring`) requires HMAC signature verification and strict org header validation.
  - Non-mutating public routes: `GET /api/health`, `GET /api/openapi`, `GET /auth/callback`.

## 3) Webhooks Verify Signatures

- Status: Pass
- Evidence:
  - `POST /api/monitoring` enforces `x-hub-signature-256` HMAC SHA-256 with timing-safe comparison.
  - Rejects unsigned/mismatched payloads with `401`.

## 4) Input Validation On API Routes

- Status: Pass
- Evidence:
  - Monitoring webhook validates both JSON schema (`monitoringWebhookSchema`) and `x-org-id` UUID.
  - API routes without request bodies (`/api/health`, `/api/openapi`) do not accept mutation payloads.

## 5) Observability For API Requests

- Status: Pass
- Evidence:
  - Route handlers (`/api/monitoring`, `/api/health`, `/api/openapi`, `/auth/callback`) emit structured pino logs with:
    - `request_id`
    - `pathname`
    - `method`
    - `status`
    - `latency_ms`
