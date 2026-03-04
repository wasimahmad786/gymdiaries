# Data Fetching Standards

## Rule: Server components only

**All data fetching must be done exclusively in server components. No exceptions.**

- ✅ Fetch data in `page.tsx`, `layout.tsx`, or any other server component
- ❌ Do NOT fetch data in client components (`'use client'`)
- ❌ Do NOT fetch data via route handlers (`src/app/api/`)
- ❌ Do NOT use `useEffect` + `fetch` or any client-side data fetching pattern
- ❌ Do NOT use SWR, React Query, or any client-side data fetching library

If a client component needs data, pass it down as props from the nearest server component parent.

---

## Rule: All database queries go in `/src/data`

**Every database query must live in a helper function inside the `/src/data` directory.** Pages and layouts must never query the database directly — they call a helper function from `/src/data` instead.

### Structure

```
src/data/
  workouts.ts       # queries relating to workouts
  exercises.ts      # queries relating to exercises
  sets.ts           # queries relating to sets
```

### Example

```ts
// src/data/workouts.ts
import db from '@/db';
import { workouts } from '@/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

export async function getWorkoutsByDate(userId: string, date: string) {
  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, new Date(`${date}T00:00:00Z`)),
        lt(workouts.startedAt, new Date(`${date}T23:59:59.999Z`)),
      ),
    );
}
```

```ts
// src/app/dashboard/page.tsx  (server component)
import { getWorkoutsByDate } from '@/data/workouts';

export default async function DashboardPage() {
  const workouts = await getWorkoutsByDate(userId, date);
  // ...
}
```

---

## Rule: Drizzle ORM only — no raw SQL

**All queries must use Drizzle ORM.** Raw SQL (`db.execute`, template literal SQL strings, or any other raw query mechanism) is strictly forbidden.

- ✅ Use Drizzle's query builder: `.select()`, `.insert()`, `.update()`, `.delete()`
- ✅ Use Drizzle's filter operators: `eq`, `and`, `or`, `gte`, `lt`, `like`, etc.
- ❌ Do NOT use `db.execute('SELECT ...')`
- ❌ Do NOT use raw SQL strings in any form

---

## Rule: Users can only access their own data

**This is a hard security requirement.** Every query that returns user-owned data must filter by the authenticated user's `userId`. A logged-in user must never be able to read or modify another user's data.

### Requirements

- Every helper function that accesses user-owned data must accept a `userId` parameter.
- The `userId` must always be obtained from the Clerk `auth()` helper in the server component — it must never come from a URL param, query string, request body, or any client-supplied source.
- The `userId` filter must be applied inside the helper function itself via a Drizzle `where` clause, not left to the caller.

### Example

```ts
// ✅ Correct — userId is a required parameter, filtered in the query
export async function getWorkoutsByDate(userId: string, date: string) {
  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),   // 👈 always enforced
        gte(workouts.startedAt, new Date(`${date}T00:00:00Z`)),
        lt(workouts.startedAt, new Date(`${date}T23:59:59.999Z`)),
      ),
    );
}
```

```ts
// ✅ Correct — userId comes from Clerk auth(), never from the URL
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const workouts = await getWorkoutsByDate(userId, date);
}
```

```ts
// ❌ Wrong — fetching by a route param without enforcing ownership
export async function getWorkout(workoutId: string) {
  return db.select().from(workouts).where(eq(workouts.id, workoutId));
  // Missing userId filter — any user could access any workout
}
```

---

## Summary

| Rule | Requirement |
|---|---|
| Where to fetch data | Server components only |
| Where to write queries | `/src/data` helper functions only |
| Query method | Drizzle ORM only, no raw SQL |
| Data ownership | Every query must filter by `userId` from Clerk `auth()` |
