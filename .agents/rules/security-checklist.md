# Security Checklist

Run before every commit to prevent common security issues.

## Environment Variables
- [ ] No secrets in code (use env vars)
- [ ] All secrets in `.env.example` are placeholders (e.g., `your-secret-here`)
- [ ] `.env` files listed in `.gitignore`
- [ ] No hardcoded API keys, database URLs, or tokens

## Database Security
- [ ] RLS policies enabled on ALL tables
- [ ] Policies tested for user isolation (users can't access others' data)
- [ ] No service role key exposed to client-side code
- [ ] Foreign keys properly constrained

## API Routes
- [ ] Input validation with Zod on all endpoints
- [ ] Rate limiting configured on public endpoints
- [ ] Authentication checks on protected routes
- [ ] CORS configured correctly (no `*` in production)
- [ ] Error messages don't leak sensitive info

## Common Mistakes
- ❌ Committing `.env` files
- ❌ Using service role key in browser code
- ❌ Missing RLS policies on new tables
- ❌ No input validation on API routes
- ❌ Exposing internal error details to users