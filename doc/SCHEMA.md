# Schema Status

No Supabase schema has been implemented yet.

## Planned Initial Tables

- organizations
- user_profiles
- organization_members
- suppliers
- supplier_facilities
- regions
- products
- components
- supplier_components
- risk_events
- alerts
- incidents
- mitigation_plans
- assessments
- integration_connections

## RLS Direction

- All business tables scoped by `organization_id`
- Membership-driven access through `organization_members`
- Admin-only mutation paths for sensitive setup data
- Public endpoints limited to health checks, auth callbacks, and verified webhooks
