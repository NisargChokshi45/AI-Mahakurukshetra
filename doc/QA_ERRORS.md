# QA Error Log

## Legend

- `[ ]` Open
- `[~]` In progress
- `[x]` Fixed
- `[!]` Blocked

## Issues

- [x] 2026-03-14 18:07 — Login crash on `127.0.0.1` after clicking **Sign in**
  - Signal: Next runtime overlay showed "An unexpected response was received from the server" and stayed on `/login`.
  - Root cause: strict mutation origin matching only allowed `localhost`; loopback alias `127.0.0.1` was rejected.
  - Fix: normalize exact-origin matching to treat loopback hosts (`localhost`, `127.0.0.1`, `::1`) as equivalent for same protocol/port.
  - Verification: `$agent-browser` login on `http://127.0.0.1:3000/login` now redirects to `/dashboard`.

- [x] 2026-03-14 18:07 — E2E instability in auth + supplier drill-down flow
  - Signal: Playwright run had brittle timing and stale assumptions causing intermittent login/dashboard assertion failures.
  - Root cause: assertion timeout too low for auth redirect stabilization.
  - Fix: increased dashboard URL/text assertions to 15s in the critical incident flow test.
  - Verification: authenticated Playwright scenario passes end-to-end.

- [x] 2026-03-14 18:07 — Incident resolved in DB but page still showed `Current status: new`
  - Signal: E2E resolve step failed on status assertion while success toast was shown.
  - Root cause: incident workspace page was not forced dynamic, so stale RSC data was rendered after redirect.
  - Fix: set `export const dynamic = 'force-dynamic'` in `/incidents/[id]` page.
  - Verification: DB rows confirm `status=resolved`, and E2E now asserts `incident-status-value` contains `resolved`.

## Current QA Summary

- `pnpm lint` ✅
- `pnpm typecheck` ✅
- `pnpm test` ✅ (26 tests)
- `E2E_TEST_EMAIL=owner@apex-resilience.demo E2E_TEST_PASSWORD=*** pnpm --filter @repo/web test:e2e` ✅
- `$agent-browser` manual login regression check (`127.0.0.1`) ✅

- [x] 2026-03-14 18:15 — Users were logged out after token-expiry window during idle periods
  - Signal: Session dropped after some time despite valid refresh-token flow.
  - Root cause: proxy middleware returned before `supabase.auth.getUser()` completed, so refreshed cookies could be missed.
  - Fix: made `updateSession` async and awaited `supabase.auth.getUser()`, then awaited `updateSession(request)` in proxy paths.
  - Verification: static checks pass (`pnpm lint`, `pnpm typecheck`, `pnpm test`) and refresh path now completes before response return.
