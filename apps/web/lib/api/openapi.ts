import packageJson from '../../package.json';

const protectedAuth = [{ SupabaseJWT: [] }];

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Supply Chain Risk Intelligence Platform API',
    version: packageJson.version,
    description:
      'Public and protected API surface for supply-chain monitoring, scoring, alerting, and incident response.',
  },
  servers: [
    {
      url: '/',
      description: 'Application origin',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and callback flows' },
    { name: 'Users', description: 'User profile APIs' },
    {
      name: 'Organizations',
      description: 'Organization and member management',
    },
    { name: 'Suppliers', description: 'Supplier and facility APIs' },
    { name: 'Risks', description: 'Risk ingestion and score recalculation' },
    { name: 'Assessments', description: 'Supplier assessment workflows' },
    { name: 'Alerts', description: 'Alert listing and lifecycle updates' },
    { name: 'Disruptions', description: 'Disruption tracking APIs' },
    { name: 'Incidents', description: 'Incident board and status workflows' },
    { name: 'Mitigation', description: 'Mitigation plan workflows' },
    { name: 'Reports', description: 'Reporting and exports' },
    { name: 'Analytics', description: 'Dashboard aggregates and trends' },
    { name: 'Monitoring', description: 'Public signed webhook ingestion' },
    { name: 'Notifications', description: 'Notification records and delivery' },
    { name: 'Integrations', description: 'Connector configuration and status' },
    { name: 'Scenarios', description: 'Scenario simulation APIs' },
    { name: 'Stripe', description: 'Billing checkout, portal, and webhook' },
    { name: 'Health', description: 'Health and readiness endpoints' },
    { name: 'Docs', description: 'OpenAPI document endpoints' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description:
          'Returns Supabase connectivity, Redis connectivity, app version, and uptime.',
        responses: {
          '200': { description: 'Healthy or degraded but serving' },
          '503': { description: 'One or more critical dependencies failed' },
        },
      },
    },
    '/api/openapi': {
      get: {
        tags: ['Docs'],
        summary: 'OpenAPI specification',
        responses: {
          '200': { description: 'JSON OpenAPI document' },
        },
      },
    },
    '/api/docs': {
      get: {
        tags: ['Docs'],
        summary: 'Swagger UI',
        responses: {
          '200': { description: 'Interactive Swagger documentation page' },
        },
      },
    },
    '/api/monitoring': {
      post: {
        tags: ['Monitoring'],
        summary: 'Ingest external monitoring event',
        description:
          'Requires `x-hub-signature-256` HMAC SHA-256 signature and `x-org-id` UUID header.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'event_type',
                  'severity',
                  'source',
                  'summary',
                  'title',
                ],
                properties: {
                  event_type: {
                    type: 'string',
                    enum: [
                      'financial',
                      'geopolitical',
                      'natural_disaster',
                      'operational',
                      'compliance',
                      'delivery',
                    ],
                  },
                  severity: {
                    type: 'string',
                    enum: ['low', 'medium', 'high', 'critical'],
                  },
                  source: { type: 'string' },
                  source_url: { type: 'string', format: 'uri' },
                  summary: { type: 'string' },
                  supplier_ids: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                  title: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Event accepted and processed transactionally',
          },
          '400': { description: 'Validation failure' },
          '401': { description: 'Invalid signature' },
          '429': { description: 'Rate limit exceeded' },
          '500': { description: 'Server configuration or ingestion failure' },
        },
      },
    },
    '/auth/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Supabase auth callback',
        description:
          'Exchanges authorization code and redirects to a sanitized internal next path.',
        responses: {
          '302': { description: 'Redirect to login or dashboard path' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Get current user profile',
        security: protectedAuth,
        responses: { '200': { description: 'Current user profile' } },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user profile',
        security: protectedAuth,
        responses: { '200': { description: 'Profile updated' } },
      },
    },
    '/api/organizations': {
      get: {
        tags: ['Organizations'],
        summary: 'List organizations and memberships',
        security: protectedAuth,
        responses: { '200': { description: 'Organization list' } },
      },
      post: {
        tags: ['Organizations'],
        summary: 'Create organization or invite member',
        security: protectedAuth,
        responses: { '201': { description: 'Mutation accepted' } },
      },
    },
    '/api/suppliers': {
      get: {
        tags: ['Suppliers'],
        summary: 'List suppliers',
        security: protectedAuth,
        responses: { '200': { description: 'Supplier list' } },
      },
      post: {
        tags: ['Suppliers'],
        summary: 'Create supplier',
        security: protectedAuth,
        responses: { '201': { description: 'Supplier created' } },
      },
    },
    '/api/suppliers/alternatives': {
      get: {
        tags: ['Suppliers'],
        summary: 'Match alternative suppliers',
        description:
          'Returns alternative suppliers based on component capability overlap and non-overlapping regions.',
        security: protectedAuth,
        parameters: [
          {
            name: 'supplier_id',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'region_ids',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description:
              'Comma-separated list of region UUIDs to constrain candidates.',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 20 },
          },
        ],
        responses: {
          '200': { description: 'Alternative supplier matches' },
          '400': { description: 'Validation failure' },
          '401': { description: 'Unauthorized' },
          '500': { description: 'Matching failure' },
        },
      },
    },
    '/api/risks': {
      get: {
        tags: ['Risks'],
        summary: 'List risk events and scores',
        security: protectedAuth,
        responses: { '200': { description: 'Risk data' } },
      },
      post: {
        tags: ['Risks'],
        summary: 'Create or update risk ingestion input',
        security: protectedAuth,
        responses: { '201': { description: 'Risk mutation accepted' } },
      },
    },
    '/api/assessments': {
      get: {
        tags: ['Assessments'],
        summary: 'List assessments',
        security: protectedAuth,
        responses: { '200': { description: 'Assessment list' } },
      },
      post: {
        tags: ['Assessments'],
        summary: 'Create assessment',
        security: protectedAuth,
        responses: { '201': { description: 'Assessment created' } },
      },
    },
    '/api/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'List alerts',
        security: protectedAuth,
        responses: { '200': { description: 'Alert list' } },
      },
      patch: {
        tags: ['Alerts'],
        summary: 'Acknowledge, dismiss, or resolve alert',
        security: protectedAuth,
        responses: { '200': { description: 'Alert updated' } },
      },
    },
    '/api/disruptions': {
      get: {
        tags: ['Disruptions'],
        summary: 'List disruptions',
        security: protectedAuth,
        responses: { '200': { description: 'Disruption list' } },
      },
      patch: {
        tags: ['Disruptions'],
        summary: 'Update disruption',
        security: protectedAuth,
        responses: { '200': { description: 'Disruption updated' } },
      },
    },
    '/api/incidents': {
      get: {
        tags: ['Incidents'],
        summary: 'List incidents',
        security: protectedAuth,
        responses: { '200': { description: 'Incident list' } },
      },
      post: {
        tags: ['Incidents'],
        summary: 'Create incident',
        security: protectedAuth,
        responses: { '201': { description: 'Incident created' } },
      },
      patch: {
        tags: ['Incidents'],
        summary: 'Transition incident status',
        security: protectedAuth,
        responses: { '200': { description: 'Incident updated' } },
      },
    },
    '/api/mitigation': {
      get: {
        tags: ['Mitigation'],
        summary: 'List mitigation plans',
        security: protectedAuth,
        responses: { '200': { description: 'Mitigation plans' } },
      },
      post: {
        tags: ['Mitigation'],
        summary: 'Create mitigation plan',
        security: protectedAuth,
        responses: { '201': { description: 'Mitigation plan created' } },
      },
    },
    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List reports',
        security: protectedAuth,
        responses: { '200': { description: 'Reports list' } },
      },
      post: {
        tags: ['Reports'],
        summary: 'Generate report',
        security: protectedAuth,
        responses: { '201': { description: 'Report generation queued' } },
      },
    },
    '/api/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Dashboard aggregates and trends',
        security: protectedAuth,
        responses: { '200': { description: 'Aggregated analytics data' } },
      },
    },
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications',
        security: protectedAuth,
        responses: { '200': { description: 'Notification list' } },
      },
    },
    '/api/integrations': {
      get: {
        tags: ['Integrations'],
        summary: 'List connector status',
        security: protectedAuth,
        responses: { '200': { description: 'Integration status list' } },
      },
      post: {
        tags: ['Integrations'],
        summary: 'Create or update integration',
        security: protectedAuth,
        responses: { '201': { description: 'Integration saved' } },
      },
    },
    '/api/scenarios': {
      get: {
        tags: ['Scenarios'],
        summary: 'List simulation scenarios',
        security: protectedAuth,
        responses: { '200': { description: 'Scenario list' } },
      },
      post: {
        tags: ['Scenarios'],
        summary: 'Create simulation scenario',
        security: protectedAuth,
        responses: { '201': { description: 'Scenario created' } },
      },
    },
    '/api/stripe/checkout': {
      post: {
        tags: ['Stripe'],
        summary: 'Create Stripe Checkout session',
        security: protectedAuth,
        responses: { '200': { description: 'Checkout URL returned' } },
      },
    },
    '/api/stripe/portal': {
      post: {
        tags: ['Stripe'],
        summary: 'Create Stripe billing portal session',
        security: protectedAuth,
        responses: { '200': { description: 'Portal URL returned' } },
      },
    },
    '/api/stripe/webhook': {
      post: {
        tags: ['Stripe'],
        summary: 'Stripe webhook receiver',
        description: 'Public webhook endpoint secured by Stripe signature.',
        responses: {
          '200': { description: 'Webhook accepted' },
          '400': { description: 'Invalid payload/signature' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      SupabaseJWT: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase session access token.',
      },
    },
  },
} as const;
