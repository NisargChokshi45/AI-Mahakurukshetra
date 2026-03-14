## 2026-03-14

### Decision: Build MVP around organization-scoped risk operations

Reason:
The blueprint emphasizes enterprise supply chain monitoring, so the data model and UI should be centered on organizations, suppliers, regions, risk events, and incident workflows instead of a generic SaaS starter.

### Decision: Treat cross-domain support as a first-class requirement

Reason:
The app should not assume a single hostname. Plan for multiple frontend domains, preview deployments, webhook callers, and external integrations by using origin allowlists, redirect URL management, and stateless API access where needed.

### Decision: Keep the first release narrow and demoable

Reason:
The hackathon is time-boxed. The strongest deliverable is a polished seeded MVP with supplier risk monitoring, alerts, incident management, and a simple dependency view rather than a half-built predictive platform.
