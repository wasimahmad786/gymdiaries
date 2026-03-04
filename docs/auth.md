# Authentication Standards

## Rule: Clerk is the only authentication provider

**This app uses [Clerk](https://clerk.com) for all authentication. No other auth library, custom session logic, or JWT handling is permitted.**

---

## Setup

### Provider

The root layout (`src/app/layout.tsx`) wraps the entire app in `<ClerkProvider>`. This must never be removed or replaced.

```tsx
// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Middleware

Clerk middleware runs on every request via `src/proxy.ts`. This file is the Next.js middleware entry point and must export `clerkMiddleware()`.

```ts
// src/proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

Do not modify the middleware matcher unless there is an explicit routing requirement. Do not replace `clerkMiddleware` with a custom middleware.

---

## Reading the current user

### In server components (pages, layouts, data helpers)

Use `auth()` from `@clerk/nextjs/server`. This is the only approved way to obtain the `userId` on the server.

```ts
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  // pass userId to data helpers
}
```

- Always `redirect('/')` (or another public route) if `userId` is `null` — never render protected content for unauthenticated users.
- Never read `userId` from URL params, query strings, cookies, or any client-supplied source.

### In client components

Use Clerk's client-side hooks when auth state is needed in a `'use client'` component:

```tsx
import { useUser, useAuth } from '@clerk/nextjs';

// Check if signed in
const { isSignedIn, userId } = useAuth();

// Access the full user profile
const { user } = useUser();
```

Only use client-side hooks for UI state (e.g. conditionally rendering a button). Never use client-side hooks to gate access to data — that must be enforced server-side.

---

## UI: sign-in, sign-up, and user management

Use Clerk's pre-built UI components. Do not build custom auth flows.

| Purpose | Component | Import |
|---|---|---|
| Sign-in trigger | `<SignInButton>` | `@clerk/nextjs` |
| Sign-up trigger | `<SignUpButton>` | `@clerk/nextjs` |
| User avatar / account menu | `<UserButton>` | `@clerk/nextjs` |
| Conditional rendering by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` | `@clerk/nextjs` |

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from '@clerk/nextjs';

<Show when="signed-out">
  <SignInButton mode="modal"><Button variant="outline">Sign in</Button></SignInButton>
  <SignUpButton mode="modal"><Button>Sign up</Button></SignUpButton>
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

- Always open `<SignInButton>` and `<SignUpButton>` in `mode="modal"` so users stay on the current page.
- Do not create custom sign-in or sign-up forms.
- Do not create a custom user profile page — use Clerk's hosted or embedded profile UI.

---

## What is not allowed

| Prohibited | Use instead |
|---|---|
| `next-auth`, `lucia`, `iron-session`, or any other auth library | Clerk |
| Custom JWT creation or verification | Clerk session tokens (managed automatically) |
| Storing passwords or session tokens in the database | Clerk manages credentials |
| Reading `userId` from URL params or request bodies | `auth()` from `@clerk/nextjs/server` |
| Custom sign-in / sign-up forms | `<SignInButton>` / `<SignUpButton>` |
| Rendering protected content when `userId` is null | Always redirect unauthenticated users |

---

## Summary

| Concern | Standard |
|---|---|
| Auth provider | Clerk — no alternatives |
| Middleware | `clerkMiddleware()` in `src/proxy.ts` |
| Root provider | `<ClerkProvider>` in `src/app/layout.tsx` |
| Getting `userId` server-side | `auth()` from `@clerk/nextjs/server` |
| Getting auth state client-side | `useAuth()` / `useUser()` from `@clerk/nextjs` |
| Sign-in / sign-up UI | `<SignInButton>` / `<SignUpButton>` in modal mode |
| User account UI | `<UserButton>` |
| Unauthenticated access | Always redirect — never render protected content |
