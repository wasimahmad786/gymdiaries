# Routing Standards

## Route structure

All application routes live under `/dashboard`. The root route (`/`) is a public landing page only — it must not render protected content.

```
/                          → public landing page
/dashboard                 → protected app home
/dashboard/workout/new     → protected: create a workout
/dashboard/workout/[id]    → protected: view / edit a workout
```

Every new route segment must be added under `src/app/dashboard/`.

---

## Rule: Route protection goes in middleware — not in pages

**All `/dashboard` routes must be protected at the middleware layer via `src/proxy.ts`. Do not rely solely on per-page auth guards to block unauthenticated access.**

The middleware runs on every request before any page code executes, making it the correct place to enforce authentication for the entire `/dashboard` subtree.

```ts
// src/proxy.ts  ✅ Correct — protect /dashboard/* in middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

```ts
// ❌ Wrong — relying only on a per-page redirect, no middleware protection
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/'); // ❌ middleware should have already blocked this
}
```

---

## Rule: Pages may still guard with `auth()` as a second layer

Even though the middleware protects `/dashboard`, individual pages should still call `auth()` and redirect if `userId` is null. This provides defence-in-depth and ensures TypeScript knows `userId` is non-null for the rest of the page.

```ts
// src/app/dashboard/page.tsx  ✅ Correct — second auth check after middleware
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');   // safety net — middleware should already prevent this
  // ...
}
```

---

## Rule: Never create protected routes outside `/dashboard`

Any page that requires authentication must live under `src/app/dashboard/`. Do not create protected pages at the root level or in other top-level segments — they will not be covered by the middleware matcher.

```
src/app/dashboard/settings/page.tsx   ✅ protected by middleware
src/app/settings/page.tsx             ❌ outside /dashboard — not protected
```

---

## Rule: Do not use the Next.js `middleware.ts` filename — use `proxy.ts`

The middleware entry point in this project is `src/proxy.ts`, not the Next.js default `src/middleware.ts`. Do not create a `middleware.ts` file.

---

## Summary

| Rule | Requirement |
|---|---|
| Where app routes live | Under `/dashboard` in `src/app/dashboard/` |
| How routes are protected | Clerk middleware in `src/proxy.ts` using `createRouteMatcher` |
| Per-page auth check | Still required as a second layer — call `auth()` and redirect if no `userId` |
| Protected routes outside `/dashboard` | Not allowed |
| Middleware filename | `src/proxy.ts` — never `src/middleware.ts` |
