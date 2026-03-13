---
name: api-spec
description: Generate or update OpenAPI specification for API endpoints
---

# API Specification Skill

Generates or updates OpenAPI YAML specifications for API endpoints.

## Usage

```
/api-spec [endpoint_path]
```

## Example

```
/api-spec /api/projects
```

This will:
1. Analyze the API route handler
2. Extract request/response types from Zod schemas
3. Generate OpenAPI YAML spec
4. Update the appropriate spec file in `api-specs/`

## Generated Spec Structure

```yaml
paths:
  /api/projects:
    get:
      summary: List all projects
      tags: [Projects]
      security:
        - BearerAuth: []
      parameters:
        - in: query
          name: status
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProjectsResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
```

## Integration

The skill will:
1. ✅ Extract types from Zod schemas
2. ✅ Generate request/response examples
3. ✅ Document error responses
4. ✅ Add proper security schemes
5. ✅ Update main `openapi.yaml` with references

## Best Practices

1. **Keep schemas in sync with Zod**
2. **Document all error responses**
3. **Include examples**
4. **Use proper HTTP status codes**
5. **Tag endpoints by feature**

## File Organization

```
api-specs/
├── openapi.yaml          # Main spec with $ref
├── auth.yaml             # Auth endpoints
├── projects.yaml         # Projects endpoints
├── stripe.yaml           # Payment endpoints
└── components/
    ├── schemas.yaml      # Shared schemas
    ├── responses.yaml    # Common responses
    └── parameters.yaml   # Reusable parameters
```
