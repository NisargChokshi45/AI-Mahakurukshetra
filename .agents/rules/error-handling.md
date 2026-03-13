# Error Handling Standards

## Overview

Comprehensive error handling ensures stability during demos and production. This covers all error scenarios from Phase 0.

## Error Handling Principles

### 1. Fail Gracefully
- Never show technical error messages to users
- Always provide a clear next action
- Log technical details for debugging

### 2. Validate Early
- Validate at system boundaries (user input, external APIs)
- Use Zod schemas for all inputs
- Return helpful validation errors

### 3. Handle Expected Failures
- Network failures
- API timeouts
- Invalid user input
- Authentication failures
- Rate limit exceeded

### 4. Recover Automatically When Possible
- Retry transient failures
- Fall back to cached data
- Use stale-while-revalidate patterns

## API Error Handling

### HTTP Status Codes

Use consistent status codes:

```typescript
200 OK           // Success
201 Created      // Resource created
204 No Content   // Success, no response body
400 Bad Request  // Invalid input
401 Unauthorized // Not authenticated
403 Forbidden    // Authenticated but not authorized
404 Not Found    // Resource doesn't exist
409 Conflict     // Duplicate resource
429 Too Many Requests // Rate limited
500 Internal Server Error // Server error
503 Service Unavailable // Temporary failure
```

### API Route Error Handling

**Standard pattern**:

```typescript
// app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate input
    const body = await request.json()
    const schema = z.object({
      title: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
    })

    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.format()
        },
        { status: 400 }
      )
    }

    // 3. Business logic
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...result.data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    // 4. Success response
    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    // Log error with context
    logger.error({
      error,
      route: '/api/projects',
      method: 'POST'
    }, 'Failed to create project')

    // Return user-friendly error
    return NextResponse.json(
      { error: 'Failed to create project. Please try again.' },
      { status: 500 }
    )
  }
}
```

### Server Actions Error Handling

**Standard pattern**:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Return type for Server Actions
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

export async function createProject(
  formData: FormData
): Promise<ActionResult<Project>> {
  try {
    // 1. Auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please sign in to continue' }
    }

    // 2. Validate
    const schema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().max(500, 'Description too long').optional(),
    })

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
    }

    const validated = schema.safeParse(rawData)
    if (!validated.success) {
      return {
        success: false,
        error: 'Invalid input',
        details: validated.error.format()
      }
    }

    // 3. Execute
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...validated.data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error({ error, userId: user.id }, 'Database error')
      return { success: false, error: 'Failed to create project' }
    }

    // 4. Revalidate & return
    revalidatePath('/projects')
    return { success: true, data }

  } catch (error) {
    logger.error({ error }, 'Unexpected error in createProject')
    return {
      success: false,
      error: 'Something went wrong. Please try again.'
    }
  }
}
```

## AI Endpoint Error Handling

### AI-Specific Errors

Common failure modes:

```typescript
// AI timeout
{ error: 'AI_TIMEOUT', message: 'Response took too long', retryable: true }

// Invalid prompt
{ error: 'INVALID_PROMPT', message: 'Prompt contains blocked content', retryable: false }

// Rate limit
{ error: 'RATE_LIMIT', message: 'Too many requests', retryAfter: 60 }

// Model error
{ error: 'MODEL_ERROR', message: 'AI model unavailable', retryable: true }
```

### AI Error Handling Pattern

```typescript
// app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const { prompt } = await request.json()

    // Validate prompt
    if (!prompt || prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt must be between 1-4000 characters' },
        { status: 400 }
      )
    }

    // Call AI with streaming
    const stream = await aiProvider.chat({
      prompt,
      stream: true,
      signal: controller.signal
    })

    clearTimeout(timeout)
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' }
    })

  } catch (error) {
    clearTimeout(timeout)

    // Timeout
    if (error.name === 'AbortError') {
      logger.warn({ prompt: prompt.slice(0, 100) }, 'AI timeout')
      return NextResponse.json(
        {
          error: 'AI_TIMEOUT',
          message: 'Response took too long. Please try again.',
          retryable: true
        },
        { status: 504 }
      )
    }

    // Rate limit
    if (error.status === 429) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT',
          message: 'Too many requests. Please wait a moment.',
          retryAfter: 60
        },
        { status: 429 }
      )
    }

    // Generic AI error
    logger.error({ error }, 'AI request failed')
    return NextResponse.json(
      {
        error: 'AI_ERROR',
        message: 'AI is temporarily unavailable. Please try again.',
        retryable: true
      },
      { status: 503 }
    )
  }
}
```

## Client-Side Error Handling

### React Error Boundaries

**Global Error Boundary** (`app/error.tsx`):

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to monitoring service
    logger.error({ error, digest: error.digest }, 'Global error boundary')
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        We're sorry for the inconvenience. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

**Route-Specific Error Boundary** (`app/projects/error.tsx`):

```typescript
'use client'

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-2">Failed to load projects</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || 'Something went wrong'}
      </p>
      <Button onClick={reset}>Reload projects</Button>
    </div>
  )
}
```

### Form Error Handling

**Client-side validation + Server Action**:

```typescript
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createProject } from '@/lib/actions/projects'
import { toast } from 'sonner'

export function CreateProjectForm() {
  const [state, formAction] = useFormState(createProject, null)

  useEffect(() => {
    if (state?.success === false) {
      toast.error(state.error)
    } else if (state?.success === true) {
      toast.success('Project created!')
    }
  }, [state])

  return (
    <form action={formAction}>
      <Input
        name="title"
        placeholder="Project title"
        required
        minLength={1}
        maxLength={100}
      />

      {state?.success === false && state.details?.title && (
        <p className="text-sm text-destructive mt-1">
          {state.details.title._errors[0]}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Project'}
    </Button>
  )
}
```

### Fetch Error Handling

**Client-side fetch with retry**:

```typescript
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        // Retry server errors (5xx)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }

  throw new Error('Max retries exceeded')
}
```

## Empty States

### No Data States

**Always handle empty states**:

```typescript
// app/projects/page.tsx
export default async function ProjectsPage() {
  const { data: projects } = await supabase
    .from('projects')
    .select('*')

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <FolderIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first project
        </p>
        <Button asChild>
          <Link href="/projects/new">Create Project</Link>
        </Button>
      </div>
    )
  }

  return <ProjectsList projects={projects} />
}
```

### Loading States

**Use Suspense boundaries**:

```typescript
// app/projects/page.tsx
import { Suspense } from 'react'
import { ProjectsSkeleton } from '@/components/projects/skeleton'

export default function ProjectsPage() {
  return (
    <Suspense fallback={<ProjectsSkeleton />}>
      <ProjectsList />
    </Suspense>
  )
}
```

## Database Error Handling

### RLS Policy Violations

```typescript
// Will throw if user doesn't have access
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single()

if (error) {
  // RLS policy violation
  if (error.code === 'PGRST116') {
    return { success: false, error: 'Project not found or access denied' }
  }

  // Other database errors
  logger.error({ error }, 'Database error')
  return { success: false, error: 'Failed to fetch project' }
}
```

### Unique Constraint Violations

```typescript
const { data, error } = await supabase
  .from('projects')
  .insert({ slug: 'my-project', user_id: userId })

if (error) {
  // Unique constraint violation
  if (error.code === '23505') {
    return {
      success: false,
      error: 'A project with this name already exists'
    }
  }

  // Foreign key violation
  if (error.code === '23503') {
    return {
      success: false,
      error: 'Invalid reference'
    }
  }
}
```

## Authentication Errors

### Unauthenticated Requests

```typescript
// Middleware (middleware.ts)
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/login?redirectTo=' + request.nextUrl.pathname, request.url)
    )
  }

  return NextResponse.next()
}
```

### Session Expired

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SessionMonitor() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          router.refresh()
        }

        if (event === 'USER_DELETED') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return null
}
```

## User-Facing Error Messages

### Error Message Guidelines

**DO**:
- ✅ "Failed to save project. Please try again."
- ✅ "Your session expired. Please sign in again."
- ✅ "This project name is already taken."
- ✅ "Please enter a valid email address."

**DON'T**:
- ❌ "ECONNREFUSED: Connection refused"
- ❌ "Uncaught TypeError: Cannot read property 'id' of undefined"
- ❌ "PostgreSQL error 23505"
- ❌ "Internal server error"

### Toast Notifications

```typescript
import { toast } from 'sonner'

// Success
toast.success('Project created successfully')

// Error
toast.error('Failed to save changes', {
  description: 'Please try again or contact support',
  action: {
    label: 'Retry',
    onClick: () => handleRetry()
  }
})

// Warning
toast.warning('Your changes are not saved', {
  description: 'Click save to keep your changes'
})

// Info
toast.info('Feature coming soon')
```

## Logging Standards

### What to Log

**Always log**:
- Authentication events (login, logout, failed attempts)
- Authorization failures (access denied)
- Payment events (checkout, subscription changes)
- AI requests (prompt, response, timing)
- API errors (500s)
- Database errors
- Rate limit hits

**Never log**:
- Passwords
- API keys
- Tokens
- Credit card numbers
- Full Zod error details (may contain sensitive data)

### Structured Logging

```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
})

// Usage
logger.info({ userId, projectId }, 'Project created')
logger.error({ error, userId, action: 'create_project' }, 'Failed to create project')
logger.warn({ userId, endpoint: '/api/ai/chat' }, 'Rate limit exceeded')
```

## Error Monitoring Checklist

Before deployment:

- [ ] All API routes have try/catch
- [ ] All Server Actions return Result type
- [ ] Error boundaries on all routes
- [ ] Empty states for all lists
- [ ] Loading states with Suspense
- [ ] User-friendly error messages (no technical jargon)
- [ ] Validation errors show field-specific messages
- [ ] AI timeouts handled gracefully
- [ ] Network failures trigger retry UI
- [ ] Form validation errors displayed inline
- [ ] Toast notifications for async operations
- [ ] Session expiry redirects to login
- [ ] Database errors logged with context
- [ ] No sensitive data in logs

## Quick Reference

**Phase 0 Error Types**:
1. **API failures** → Try/catch with user-friendly message + retry
2. **AI timeout** → 30s timeout + retry button
3. **Invalid prompts** → Zod validation + field errors
4. **Empty states** → Helpful empty state component + CTA

**Error Response Format**:
```typescript
{
  error: string           // User-facing message
  details?: unknown       // Optional validation details
  retryable?: boolean     // Can user retry?
  retryAfter?: number     // Seconds to wait (rate limits)
}
```
