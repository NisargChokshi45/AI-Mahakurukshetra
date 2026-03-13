# Available Agents

This file provides a quick reference for all available specialized agents.

## Agent Invocation

To use an agent, simply ask Claude and mention which agent to use:

```
[Your task description]
Use the [agent-name] agent.
```

Claude will invoke the appropriate agent with full context.

## Agent Directory

### 1. Code Reviewer
**File**: `code-reviewer.md`

**Use when:**
- Reviewing code before commits
- Ensuring 10/10 code quality
- Pre-deployment quality checks
- Pull request reviews
- Validating against project standards

**Example:**
```
Review the changes I just made and ensure they meet 10/10 quality standards.
Use the code-reviewer agent.
```

**What it checks:**
- Type safety and TypeScript standards
- Security (RLS, env vars, input validation)
- Architecture compliance
- Code quality and maintainability
- Performance optimizations
- Test coverage
- Adherence to all `.agents/rules/`

---

### 2. Database Architect
**File**: `database-architect.md`

**Use when:**
- Designing database schemas
- Creating migrations
- Writing RLS policies
- Optimizing queries
- Setting up indexes

**Example:**
```
Design the schema for user subscriptions with Stripe integration.
Use the database-architect agent.
```

---

### 3. Stripe Integration
**File**: `stripe-integration.md`

**Use when:**
- Setting up Stripe checkout
- Handling webhooks
- Managing subscriptions
- Implementing billing UI
- Testing payments

**Example:**
```
Implement the checkout flow for Pro plan subscription.
Use the stripe-integration agent.
```

---

### 4. API Builder
**File**: `api-builder.md`

**Use when:**
- Creating API routes
- Adding validation
- Implementing rate limiting
- Writing OpenAPI specs
- Building RESTful endpoints

**Example:**
```
Create a RESTful API for projects with CRUD operations.
Use the api-builder agent.
```

---

### 5. UI Builder
**File**: `ui-builder.md`

**Use when:**
- Building React components
- Implementing Server Components
- Integrating shadcn/ui
- Creating layouts
- Responsive design

**Example:**
```
Build the dashboard layout with sidebar and header.
Use the ui-builder agent.
```

---

### 6. Test Engineer
**File**: `test-engineer.md`

**Use when:**
- Writing unit tests
- Creating integration tests
- Building E2E tests
- Setting up coverage
- Testing API routes

**Example:**
```
Write comprehensive tests for the auth flow.
Use the test-engineer agent.
```

---

### 7. Deployment Specialist
**File**: `deployment-specialist.md`

**Use when:**
- Deploying to Vercel
- Setting up CI/CD
- Configuring environments
- Monitoring production
- Troubleshooting deployments

**Example:**
```
Set up the GitHub Actions CI/CD pipeline.
Use the deployment-specialist agent.
```

---

## Agent Selection Guide

Not sure which agent to use? Follow this decision tree:

```
Is it about code quality/review?
  → code-reviewer

Is it about database/SQL?
  → database-architect

Is it about payments/Stripe?
  → stripe-integration

Is it about API routes/endpoints?
  → api-builder

Is it about UI/components?
  → ui-builder

Is it about testing?
  → test-engineer

Is it about deployment/CI/CD?
  → deployment-specialist
```

## Multi-Agent Workflows

For complex tasks, you can chain multiple agents:

**Example 1: Full Feature Implementation**
```
Let's build the projects feature:

1. Use database-architect to create the schema
2. Use api-builder to create the API routes
3. Use ui-builder to create the UI components
4. Use test-engineer to write the tests
5. Use code-reviewer to ensure 10/10 quality
```

**Example 2: Production Deployment**
```
Prepare for production:

1. Use code-reviewer to validate code quality
2. Use test-engineer to ensure all tests pass
3. Use deployment-specialist to set up CI/CD
4. Use deployment-specialist to deploy to Vercel
```

**Example 3: Pre-Commit Review**
```
Before committing major changes:

1. Use code-reviewer to validate changes
2. Fix any issues found
3. Use /git-commit skill to create proper commit
```

## Tips for Working with Agents

1. **Be Specific**: Provide clear context about what you need
2. **Reference Docs**: Agents can access project documentation
3. **Use Memory**: Agents have access to project memory
4. **Chain Tasks**: Break complex work into agent-specific tasks
5. **Follow Rules**: Agents follow the coding standards and architecture rules

## Creating New Agents

To add a new specialized agent:

1. Create `agents/agent-name.md`
2. Use the frontmatter format:
```yaml
---
name: agent-name
description: Brief description
model: sonnet
---
```
3. Include relevant expertise and patterns
4. Update this AGENTS.md file
5. Update .claude/README.md
