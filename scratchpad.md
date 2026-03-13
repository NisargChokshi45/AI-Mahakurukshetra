## Project Phases (Next.js + Supabase + Vercel)

### Phase 0 — Hackathon MVP (Demo-Ready)

Focus: ship a stable, demoable core.

- Auth: Email/Password, Session management, Logout, Protected routes
- Database: CRUD + RLS
- AI core: Call AI model, Save prompt history, Return responses
- AI chat UI: Chat UI, Streaming response, Message history, Threads, Timestamp, Loading indicator, Scroll to latest, Copy response
- Dashboard: Sidebar navigation, Recent activity, User projects/chats, Quick actions
- File upload (basic): Upload + Preview (limit to one file type initially)
- Error handling (basic): API failures, AI timeout, Invalid prompts, Empty states
- Deployment basics: Env vars, Supabase keys, AI API key, Production build
- UX basics: Skeleton loaders, Toast notifications, Mobile responsive UI

### Phase 1 — Production Core (Post-Hackathon)

Focus: security, stability, and observability.

- Security: RLS hardening, Auth-protected APIs, Input validation, Rate limiting on AI endpoints
- Monitoring: Sentry, Telemetry, Grafana configuration
- Error pages with proper redirection
- Delete account, Export account data
- Search: Chats/Projects + Prompt history, Filter results
- Notifications/Activity feed: AI completed, New responses, Activity log
- Analytics: Prompt counts, Feature usage, AI usage stats

### Phase 2 — Product Maturity

Focus: polish, scale, and user trust.

- OAuth providers: Google + GitHub (defer others)
- Magic link login (optional)
- Realtime updates (if use-case demands)
- File upload AI: PDF summarize, Image caption, Dataset insights
- AI features: Suggest prompts, Remember user context
- UX polish: Typing animation, Dark/Light theme, Accessibility (a11y), i18n
- Status page for downtime detection
- Feature flags
- Subscription-based feature access (gated UI and APIs)
- Swagger/OpenAPI spec (YAML) - Routes exposed to Developers
- Test cases + Code coverage reports - Routes exposed to Developers
- Component library / Design system / Storybook - Routes exposed to Developers

### Phase 3 — Integrations & Growth

Focus: ecosystem and monetization.

- Payments: Stripe or Razorpay (pick one)
- Third-party tools: Gmail, Calendar, Zoom, Slack, Jira/ClickUp, GitHub issues
- Alerts/Comms: Slack channel, Google Chat, Email alerts
- Admin dashboard (geo analytics + state-based analysis)

### Phase 4 — Nice-to-Haves / Experiments

Focus: optional or high-effort features.

- Offline mode support
- AI auto actions
- Voice input + AI speech output
- Collaborative workspace
- Share AI conversations + Public link sharing
- Export responses to PDF
- News/Marquee section for trends
- SDK-based implementation
- "AGENT: review codebase and score 10/10" (not a production feature; can be a CI check later)
