# Server Component Standards

## Rule: `params` and `searchParams` must always be awaited

**In Next.js 15+, `params` and `searchParams` are Promises. They must be typed as `Promise<...>` and awaited before accessing any property.**

This applies to every page and layout that receives these props. Accessing them synchronously will result in a runtime error.

---

## `params` — dynamic route segments

```tsx
// ✅ Correct — typed as Promise, destructured after await
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // use workoutId...
}
```

```tsx
// ❌ Wrong — synchronous access, will error at runtime
export default async function WorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // ❌ not awaited
}
```

---

## `searchParams` — query string values

```tsx
// ✅ Correct — typed as Promise, awaited before use
type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { date } = await searchParams;
  // use date...
}
```

```tsx
// ❌ Wrong — synchronous access, will error at runtime
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string }; // ❌ not a Promise
}) {
  const { date } = searchParams; // ❌ not awaited
}
```

---

## Combining both

When a page uses both `params` and `searchParams`, await them in parallel with `Promise.all` to avoid sequential waterfalls:

```tsx
type Props = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function WorkoutPage({ params, searchParams }: Props) {
  const [{ workoutId }, { tab }] = await Promise.all([params, searchParams]);
  // use workoutId and tab...
}
```

---

## Summary

| Prop | Type | Access pattern |
|---|---|---|
| `params` | `Promise<{ [segment]: string }>` | `const { x } = await params` |
| `searchParams` | `Promise<{ [key]?: string }>` | `const { x } = await searchParams` |
| Both together | Both Promises | `await Promise.all([params, searchParams])` |
