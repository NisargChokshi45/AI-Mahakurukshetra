# Coding Standards

## TypeScript Standards

### Type Safety

**Always:**
```typescript
// ✅ Use strict types
interface User {
  id: string
  email: string
  name: string | null
}

// ✅ Prefer interfaces for object shapes
interface Props {
  user: User
  onUpdate: (user: User) => void
}

// ✅ Use enums for known values
enum Status {
  Active = 'active',
  Inactive = 'inactive',
}

// ✅ Runtime validation with Zod
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
})
```

**Never:**
```typescript
// ❌ Avoid 'any' type
const data: any = fetchData()

// ❌ Use 'unknown' instead when type is truly unknown
const data: unknown = fetchData()
if (isValidData(data)) {
  // Type guard narrows to known type
}

// ❌ Don't use @ts-ignore
// @ts-ignore
someFunction()

// ✅ Fix the underlying issue or use @ts-expect-error with comment
// @ts-expect-error - Waiting for library type fix (issue #123)
someFunction()
```

### Naming Conventions

```typescript
// Files
// ✅ Components: PascalCase.tsx
UserProfile.tsx
// ✅ Utilities: kebab-case.ts
format-date.ts
// ✅ Hooks: use-camel-case.ts
use-user.ts
// ✅ Types: types.ts or specific-types.ts
user-types.ts

// Variables & Functions
// ✅ camelCase
const userName = 'John'
function getUserById() {}

// ✅ Boolean variables start with is/has/should
const isActive = true
const hasPermission = false
const shouldUpdate = true

// Constants
// ✅ SCREAMING_SNAKE_CASE
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'

// Types & Interfaces
// ✅ PascalCase
interface UserProfile {}
type ApiResponse<T> = {}

// ✅ Generics: Single uppercase letter or descriptive PascalCase
type Result<T> = {}
type ApiResponse<TData, TError> = {}
```

### Function Design

```typescript
// ✅ Single Responsibility
function getUserById(id: string): Promise<User> {
  return db.user.findUnique({ where: { id } })
}

// ❌ Don't mix concerns
function getUserAndUpdateLastSeen(id: string) {
  // Doing two things!
}

// ✅ Pure functions when possible
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ Clear return types
function processUser(user: User): Result<ProcessedUser, Error> {
  // Explicit error handling
}

// ✅ Short functions (< 20 lines ideal)
function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

// ✅ Descriptive names (not too short, not too long)
// ❌ Bad
function u(d) {}

// ❌ Bad
function updateUserProfileWithEmailAndNameAndPhoneNumber() {}

// ✅ Good
function updateUserProfile(data: UserProfileUpdate) {}
```

### Async/Await

```typescript
// ✅ Use async/await over promises
async function fetchUser(id: string) {
  try {
    const response = await fetch(`/api/users/${id}`)
    const user = await response.json()
    return user
  } catch (error) {
    logger.error({ error, userId: id }, 'Failed to fetch user')
    throw error
  }
}

// ✅ Handle errors explicitly
async function createProject(data: CreateProjectInput) {
  try {
    const project = await db.project.create({ data })
    return { project }
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Validation failed', details: error.format() }
    }
    return { error: 'Failed to create project' }
  }
}

// ✅ Use Promise.all for parallel operations
async function loadDashboard() {
  const [user, projects, stats] = await Promise.all([
    fetchUser(),
    fetchProjects(),
    fetchStats(),
  ])
  return { user, projects, stats }
}
```

## React/Next.js Standards

### Component Structure

```typescript
// ✅ Standard component structure
'use client' // Only if needed

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'
import type { User } from '@/types'

// Types/Interfaces first
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
}

// Component
export function UserCard({ user, onEdit }: UserCardProps) {
  // Hooks
  const [isEditing, setIsEditing] = useState(false)

  // Event handlers
  const handleEdit = () => {
    setIsEditing(true)
    onEdit?.(user)
  }

  // Early returns
  if (!user) {
    return <div>No user</div>
  }

  // Render
  return (
    <div className="border rounded p-4">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <Button onClick={handleEdit}>Edit</Button>
    </div>
  )
}
```

### Server Components vs Client Components

```typescript
// ✅ Server Component (default)
// app/projects/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ProjectsList } from '@/components/projects/projects-list'

export default async function ProjectsPage() {
  const supabase = createClient()
  const { data: projects } = await supabase.from('projects').select('*')

  return (
    <div>
      <h1>Projects</h1>
      <ProjectsList projects={projects || []} />
    </div>
  )
}

// ✅ Client Component (only when needed)
// components/projects/create-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CreateButton() {
  const [open, setOpen] = useState(false)

  return <Button onClick={() => setOpen(true)}>Create</Button>
}
```

### Hooks

```typescript
// ✅ Custom hooks start with 'use'
function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser().then(setUser).finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

// ✅ Extract complex logic to custom hooks
function useProjects(filters?: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchProjects(filters)
      setProjects(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { projects, loading, error, refetch }
}
```

### Server Actions

```typescript
// ✅ Server Actions for mutations
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema } from '@/lib/validations/projects'
import { logger } from '@/lib/logger'

export async function createProject(formData: FormData) {
  // 1. Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 2. Parse and validate
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
  }

  const result = createProjectSchema.safeParse(rawData)

  if (!result.success) {
    return { error: 'Validation failed', details: result.error.format() }
  }

  // 3. Business logic
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ ...result.data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    // 4. Log and revalidate
    logger.info({ userId: user.id, projectId: project.id }, 'Project created')
    revalidatePath('/projects')

    return { project }
  } catch (error) {
    logger.error({ error, userId: user.id }, 'Failed to create project')
    return { error: 'Failed to create project' }
  }
}
```

## Code Organization

### File Structure

```typescript
// ✅ One component per file
// components/user/user-card.tsx
export function UserCard() {}

// ✅ Group related utilities
// lib/utils/dates.ts
export function formatDate() {}
export function parseDate() {}
export function addDays() {}

// ✅ Co-locate types with usage
// lib/actions/projects.ts
import type { Project } from '@/types/project'

export async function createProject() {}

// ✅ Barrel exports for cleaner imports
// components/ui/index.ts
export * from './button'
export * from './input'
export * from './card'

// Now can import:
import { Button, Input, Card } from '@/components/ui'
```

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Third-party libraries
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal utilities/lib
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

// 4. Components
import { Button } from '@/components/ui/button'
import { UserCard } from '@/components/user/user-card'

// 5. Types
import type { User } from '@/types/user'

// 6. Styles (if any)
import styles from './component.module.css'
```

## Validation Standards

### Zod Schemas

```typescript
// ✅ Define schemas for all inputs
import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  status: z.enum(['active', 'archived', 'completed'])
    .default('active'),
})

// ✅ Export inferred types
export type CreateProjectInput = z.infer<typeof createProjectSchema>

// ✅ Use schema in both client and server
function ProjectForm() {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  })
}

async function createProject(data: unknown) {
  const validated = createProjectSchema.parse(data)
  // validated is now CreateProjectInput
}

// ✅ Compose schemas
const baseProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const createProjectSchema = baseProjectSchema.extend({
  status: z.enum(['active', 'archived']).default('active'),
})

export const updateProjectSchema = baseProjectSchema.partial()
```

## Error Handling

### Consistent Error Handling

```typescript
// ✅ Use Result type for functions that can fail
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return { success: false, error: new Error('User not found') }
    }
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

// Usage
const result = await fetchUser(id)
if (!result.success) {
  logger.error({ error: result.error }, 'Failed to fetch user')
  return
}

const user = result.data // TypeScript knows this is User

// ✅ Custom error classes
class ValidationError extends Error {
  constructor(public details: unknown) {
    super('Validation failed')
    this.name = 'ValidationError'
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// ✅ Centralized error handling in API routes
async function handleError(error: unknown): Promise<Response> {
  if (error instanceof ValidationError) {
    return Response.json(
      { error: error.message, details: error.details },
      { status: 400 }
    )
  }

  if (error instanceof UnauthorizedError) {
    return Response.json({ error: error.message }, { status: 401 })
  }

  logger.error({ error }, 'Unexpected error')
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## Comments and Documentation

### When to Comment

```typescript
// ✅ Complex business logic
function calculateSubscriptionPrice(plan: Plan, seats: number) {
  // Apply volume discount for seats > 10
  // Pricing structure:
  // - 1-10 seats: full price
  // - 11-50 seats: 10% discount
  // - 50+ seats: 20% discount
  const basePrice = plan.pricePerSeat * seats

  if (seats <= 10) return basePrice
  if (seats <= 50) return basePrice * 0.9
  return basePrice * 0.8
}

// ✅ Workarounds or non-obvious solutions
// Note: Using setTimeout instead of requestAnimationFrame
// because RAF doesn't work in hidden tabs (requirement from product)
setTimeout(() => {
  updateStats()
}, 1000)

// ✅ TODO/FIXME with context
// TODO: Replace with proper pagination after MVP
// Currently fetching all projects, which is fine for <100 projects
const projects = await fetchAllProjects()

// ❌ Don't state the obvious
// Bad: Sets the user name
setUserName(name)

// ❌ Don't use comments to explain bad code (refactor instead)
// Bad:
// This function is complex because it does many things
function complexFunction() {
  // ... 100 lines
}

// Good: Break it down
function validateInput() {}
function processData() {}
function saveResult() {}
```

### JSDoc (Optional, for libraries only)

```typescript
// ✅ Use JSDoc for shared utilities/libraries
/**
 * Formats a date to human-readable string
 * @param date - Date to format
 * @param format - Format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 * @example
 * formatDate(new Date('2024-03-13')) // 'Mar 13, 2024'
 */
export function formatDate(
  date: Date | string,
  format = 'MMM dd, yyyy'
): string {
  // ...
}
```

## Performance Considerations

```typescript
// ✅ Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ Debounce user input
const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    searchProjects(query)
  },
  300
)

// ✅ Lazy load heavy components
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false,
})

// ✅ Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
}: Props) {
  // ...
})
```

## Security Standards

```typescript
// ✅ Sanitize user input
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(userInput)

// ✅ Never trust client input
async function updateProject(formData: FormData) {
  // ❌ Don't trust userId from client
  const userId = formData.get('userId') // BAD!

  // ✅ Get userId from session
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user.id // GOOD!
}

// ✅ Use parameterized queries (Supabase handles this)
// ❌ Never concatenate SQL
const query = `SELECT * FROM users WHERE id = '${userId}'` // BAD!

// ✅ Supabase/ORM handles parameterization
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId) // GOOD!
```

These coding standards ensure consistency, maintainability, and security across the codebase.
