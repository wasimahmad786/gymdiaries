# Data Mutation Standards

## Rule: All mutations go through `/src/data` helper functions

**Every database write (insert, update, delete) must be wrapped in a helper function inside `/src/data`. Server actions and any other caller must never write to the database directly.**

- ✅ Call a helper from `/src/data` inside a server action
- ❌ Do NOT call `db.insert()`, `db.update()`, or `db.delete()` directly in a server action or page
- ❌ Do NOT use raw SQL — all queries must use Drizzle ORM (see `docs/data-fetching.md`)

### Structure

```
src/data/
  workouts.ts       # reads and writes relating to workouts
  exercises.ts      # reads and writes relating to exercises
  sets.ts           # reads and writes relating to sets
```

Mutation helpers live in the same file as their read counterparts, grouped by entity.

### Example

```ts
// src/data/workouts.ts
import db from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

---

## Rule: All mutations are triggered via server actions

**Client components must trigger mutations through Next.js server actions. No route handlers (`src/app/api/`) are to be used for mutations.**

- ✅ Define server actions with `'use server'` at the top of the function or file
- ✅ Call server actions directly from client components or form `action` props
- ❌ Do NOT use `fetch` + API routes to trigger mutations
- ❌ Do NOT perform mutations inside server components — use server actions

---

## Rule: Server actions must be in colocated `actions.ts` files

**Server actions must be defined in a file named `actions.ts` colocated with the route segment that uses them. Do not define server actions inline inside component files or in a global shared file.**

```
src/app/dashboard/
  page.tsx
  actions.ts        # ✅ server actions for the dashboard route
  date-picker.tsx

src/app/workouts/[id]/
  page.tsx
  actions.ts        # ✅ server actions for the workout detail route
```

Each `actions.ts` file must begin with `'use server'`:

```ts
// src/app/dashboard/actions.ts
'use server';

// actions defined here...
```

---

## Rule: Server action parameters must be typed — no `FormData`

**All server action parameters must use explicit TypeScript types. `FormData` is not permitted as a parameter type.**

```ts
// ✅ Correct — explicit typed parameters
export async function createWorkout(name: string, startedAt: string) { ... }

// ❌ Wrong — FormData is not allowed
export async function createWorkout(data: FormData) { ... }
```

Define a dedicated type or inline the parameters directly. If multiple parameters are logically grouped, use an object type:

```ts
type CreateWorkoutInput = {
  name: string;
  startedAt: string;
};

export async function createWorkout(input: CreateWorkoutInput) { ... }
```

---

## Rule: All server actions must validate arguments with Zod

**Every server action must validate its arguments using [Zod](https://zod.dev) before doing anything else. Never trust that the caller passed valid data.**

```ts
// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  startedAt: z.string().datetime(),
});

export async function createWorkoutAction(input: { name: string; startedAt: string }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  return createWorkout(userId, parsed.data.name, parsed.data.startedAt);
}
```

### Zod validation rules

- Define the schema as a named `const` adjacent to its action — one schema per action.
- Use `safeParse` and throw (or return an error object) on failure; never use `parse` and let Zod throw unhandled.
- The Zod schema is the source of truth for what the action accepts — the TypeScript parameter type should match the schema's input shape.

---

## Rule: `userId` must always come from Clerk — never from the caller

**Server actions must obtain the `userId` from `auth()` (`@clerk/nextjs/server`), not from the action's arguments. A caller must never be able to supply or override the `userId`.**

```ts
// ✅ Correct — userId sourced from Clerk server-side
export async function deleteWorkoutAction(workoutId: string) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  await deleteWorkout(userId, workoutId);
}

// ❌ Wrong — userId passed in by the caller
export async function deleteWorkoutAction(userId: string, workoutId: string) { ... }
```

---

## Full example

```
src/app/dashboard/
  page.tsx
  actions.ts
src/data/
  workouts.ts
```

```ts
// src/data/workouts.ts
import db from '@/db';
import { workouts } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();
  return workout;
}

export async function deleteWorkout(userId: string, workoutId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// src/app/dashboard/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createWorkout, deleteWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createWorkoutAction(input: { name: string }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  return createWorkout(userId, parsed.data.name);
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkoutAction(input: { workoutId: string }) {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const parsed = deleteWorkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid input');

  await deleteWorkout(userId, parsed.data.workoutId);
}
```

---

## Summary

| Rule | Requirement |
|---|---|
| Where to write db mutations | `/src/data` helper functions only |
| ORM | Drizzle ORM only — no raw SQL |
| How mutations are triggered | Server actions only — no API route handlers |
| Where server actions live | Colocated `actions.ts` files, one per route segment |
| Parameter types | Explicit TypeScript types — no `FormData` |
| Input validation | Zod `safeParse` on every action, before any logic |
| `userId` source | `auth()` from `@clerk/nextjs/server` — never from the caller |
