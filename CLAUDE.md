# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs-first rule

**Before writing any code, always read the relevant file(s) in `/docs` first and follow the standards defined there.**

| Area | Docs file |
|---|---|
| UI components, date formatting, theming | `docs/ui.md` |
| Data fetching, database queries, data ownership | `docs/data-fetching.md` |
| Authentication, auth provider, protected routes | `docs/auth.md` |
| Data mutations, server actions, Zod validation | `docs/data-mutations.md` |

If a `/docs` file exists that is relevant to the task at hand, its rules are mandatory and override any default behaviour or personal preference.

---

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a **Next.js 16 App Router** project with **React 19**, **TypeScript**, and **Tailwind CSS v4**.

- `src/app/` — App Router root. Each folder becomes a route segment.
- `src/app/layout.tsx` — Root layout with Geist font variables applied to `<body>`.
- `src/app/page.tsx` — Home route (`/`).
- `src/app/globals.css` — Global styles; Tailwind is imported here.
- `@/*` path alias maps to `./src/*`.

TypeScript strict mode is enabled. ESLint uses `eslint-config-next` with Core Web Vitals and TypeScript rules.
