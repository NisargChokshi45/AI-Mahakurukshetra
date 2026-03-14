[2026-03-14] BLOCKER — codex
Problem: Phase 2 hosted-Supabase verification is still pending because migrations, seed data, and the custom access-token hook have not yet been applied/configured in the development Supabase project.
Attempted: Authored `supabase/config.toml`, migrations `001`–`009`, and `seed.sql`; implemented app auth/onboarding code; installed the Supabase CLI; validated app build, lint, typecheck, and test locally without inspecting env values.
Needs: Run the SQL files against the development Supabase project, configure the `public.custom_access_token_hook` in the Supabase dashboard, and then verify seeded demo visibility plus org-scoped auth/RLS behavior.
