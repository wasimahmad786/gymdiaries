# UI Coding Standards

## Rule: Use shadcn/ui components exclusively

**All UI in this project must be built using [shadcn/ui](https://ui.shadcn.com) components. No custom UI components are to be created under any circumstances.**

---

## What this means

- Every interactive element, layout primitive, and visual widget must come from the shadcn/ui component library.
- If a required component does not yet exist in the project, install it via the CLI before building with it:
  ```bash
  npx shadcn@latest add <component-name>
  ```
- Installed components live in `src/components/ui/` and must not be modified except for bug fixes or project-wide theming adjustments.
- Do **not** create files in `src/components/` that wrap, extend, or replicate shadcn/ui components.

---

## What is allowed

- Composing shadcn/ui components together inside page or feature files (e.g. placing a `<Card>` inside a `<Dialog>`).
- Passing standard props and Tailwind utility classes to shadcn/ui components via their `className` prop.
- Using Tailwind CSS directly on plain HTML elements (`<div>`, `<p>`, `<span>`, etc.) for structural layout only — spacing, flex/grid, sizing.
- Adding data fetching logic, server actions, and business logic in page and layout files.

---

## What is not allowed

| Prohibited | Use instead |
|---|---|
| Custom button component | `Button` from shadcn/ui |
| Custom input component | `Input` from shadcn/ui |
| Custom modal/overlay | `Dialog` from shadcn/ui |
| Custom dropdown | `DropdownMenu` from shadcn/ui |
| Custom date picker | `Calendar` + `Popover` from shadcn/ui |
| Custom table | `Table` from shadcn/ui |
| Custom card layout | `Card`, `CardHeader`, `CardContent` from shadcn/ui |
| Custom toast/alert | `Toast` or `Alert` from shadcn/ui |
| Any component in `src/components/` that is not from shadcn/ui | — |

---

## Adding a new component

1. Check the [shadcn/ui component list](https://ui.shadcn.com/docs/components) to confirm the component exists.
2. Run:
   ```bash
   npx shadcn@latest add <component-name>
   ```
3. Import directly from `@/components/ui/<component-name>` and use it in your page or layout file.

---

## Theming

Global design tokens (colors, radius, fonts) are defined as CSS variables in `src/app/globals.css`. Adjust values there — never by overriding component internals.

---

## Date formatting

All dates must be formatted using [date-fns](https://date-fns.org). Do not use `Date.prototype.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.

The standard display format for dates throughout the UI is:

```
do MMM yyyy   →   1st Sep 2025 / 2nd Aug 2025 / 3rd Jan 2026
```

Use `format` and `parseISO` from `date-fns`:

```ts
import { format, parseISO } from 'date-fns';

format(parseISO('2025-09-01'), 'do MMM yyyy') // "1st Sep 2025"
format(parseISO('2026-01-03'), 'do MMM yyyy') // "3rd Jan 2026"
```

For times, use `HH:mm` (24-hour):

```ts
format(date, 'HH:mm') // "07:00"
```

---

## Rationale

Enforcing a single component source ensures visual consistency, eliminates redundant abstractions, and keeps the codebase predictable. Every developer working on this project should be able to find any UI primitive in `src/components/ui/` without hunting through custom component trees.
