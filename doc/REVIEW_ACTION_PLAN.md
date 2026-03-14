# Code Review Action Plan (2026-03-14)

## Scope And Method

- Reviewed `/doc` context, core auth/API/server-action paths, Supabase migrations, and security helpers.
- Executed quality gates:
  - `pnpm lint` -> pass
  - `pnpm typecheck` -> pass
  - `pnpm test` -> pass (`--passWithNoTests`; no unit tests detected)

## 10/10 Review Checklist

| Area                                       | Status        | Notes                                                                |
| ------------------------------------------ | ------------- | -------------------------------------------------------------------- |
| Lint                                       | Pass          | No current lint errors.                                              |
| Type safety (`strict`)                     | Pass          | `strict: true` is enabled.                                           |
| AuthN/AuthZ correctness                    | **Fail (P0)** | Risk event mutation path can bypass role policy.                     |
| Tenant isolation                           | **Fail (P0)** | Supplier-linked writes are not org-validated end-to-end.             |
| Redirect and URL safety                    | **Fail (P0)** | Callback route trusts unvalidated `next` URL.                        |
| Transactional data integrity               | **Fail (P1)** | Event/disruption/score/alert flow can partially persist on failure.  |
| API hardening (CORS/rate limit/signatures) | Pass          | Middleware/proxy controls exist; webhook signature check exists.     |
| Test depth (unit + E2E)                    | **Fail (P1)** | No `.test.ts/.test.tsx` files present for critical logic.            |
| Observability completeness                 | Partial       | Logger utility exists; route-level structured logging still pending. |
| Documentation traceability                 | Pass          | Findings and actions logged in `/doc`.                               |

## Prioritized Remediation Plan

### P0 (Blocker) - Fix before release

1. Enforce RBAC in risk event mutations
   - Location: `apps/web/lib/actions/risk.ts`
   - Issue: `createRiskEventAction()` authorizes only by session + JWT `org_id`, then uses service-role writes.
   - Action:
     - Use `requireOrganizationContext()` and explicitly allow only `owner|admin|risk_manager`.
     - Stop trusting `user.app_metadata.org_id` as mutation source of truth.
   - Acceptance:
     - Viewer/procurement users receive authorization error for create/update.
     - Owner/admin/risk_manager can still create/update.

2. Prevent open redirect in auth callback
   - Location: `apps/web/app/auth/callback/route.ts`
   - Issue: `next` query param is redirected without strict path validation.
   - Action:
     - Only allow safe internal paths (must start with `/`, reject `//`, reject absolute URLs).
     - Fallback to `/dashboard` on invalid input.
   - Acceptance:
     - `?next=https://evil.example` and `?next=//evil.example` never leave app origin.

3. Enforce org-safe supplier linkage in risk pipeline
   - Locations:
     - `apps/web/lib/actions/risk.ts`
     - `apps/web/lib/risk-pipeline.ts`
     - `supabase/migrations/20260314131300_004_risk_engine.sql`
   - Issue: User-supplied supplier UUIDs are accepted without confirming ownership by `organization_id`.
   - Action:
     - Resolve and whitelist supplier IDs by current org before writes.
     - Add DB-level guard (constraint/trigger/RPC transaction) so cross-org supplier linkage is impossible.
   - Acceptance:
     - Cross-org supplier UUID submission is rejected and no rows are written.

### P1 (High) - Fix in current sprint

4. [Completed 2026-03-14] Make risk ingestion writes atomic
   - Locations:
     - `apps/web/lib/actions/risk.ts`
     - `apps/web/app/api/monitoring/route.ts`
   - Issue: Risk event insert happens before downstream pipeline; failures can leave partial state.
   - Action:
     - Move create/update + downstream writes into one transactional DB function.
     - Status: implemented via migration `20260314171000_012_transactional_risk_ingestion.sql` and wired in manual + webhook ingestion handlers.
   - Acceptance:
     - Any injected pipeline failure rolls back event/disruption/score/alert writes.

5. Add baseline automated coverage for critical paths
   - Scope:
     - `apps/web/lib/risk-engine.ts`
     - `apps/web/lib/validations/*.ts`
     - auth/session and mutation authorization paths
     - webhook route signature + org header handling
   - Action:
     - Add unit tests and at least one E2E happy path + one denial path for risk event creation.
   - Acceptance:
     - `pnpm test` executes real tests (not empty suite).

### P2 (Quality hardening)

6. Remove non-null assertion usage in scripts
   - Location: `apps/web/scripts/apply-migrations.ts`
   - Action: replace `process.env.*!` with validated parsing + explicit error path.

7. Add structured request logging in API handlers
   - Scope: include request ID, org ID, status, latency for public API routes.

## Execution Order

1. P0-1 RBAC in risk actions
2. P0-2 callback redirect sanitization
3. P0-3 supplier org validation + DB guard
4. P1-4 transactional ingestion refactor
5. P1-5 tests
6. P2 hardening items
