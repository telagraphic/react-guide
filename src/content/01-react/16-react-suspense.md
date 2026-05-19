# React.Suspense

> Tell React: **“this part of the tree might not be ready yet”** — show a **fallback** (spinner, skeleton) until the real UI is ready, without blocking the rest of the page.

**`<Suspense fallback={...}>`** is a component, not a hook. You wrap slow or async UI inside it. While React is still preparing that subtree, users see **`fallback`** instead of a blank hole or a frozen screen.

This is an **advanced** pattern, but the idea is simple: **graceful loading boundaries** in your component tree.

---

## Beginner-friendly overview

So far, most of your components **return JSX immediately** on each render. Real apps often wait on:

- **Code** that has not downloaded yet (route-based splitting).
- **Data** that is not ready yet (fetch, database).

Without Suspense, you usually wire loading yourself:

```jsx
if (loading) return <Spinner />;
if (error) return <Error />;
return <Results data={data} />;
```

That works, but every screen repeats the same `if (loading)` pattern. **Suspense** moves the “not ready yet” contract to a **boundary**: children can **suspend**, and the nearest `<Suspense>` shows **`fallback`** until they are ready.

```text
<Page>                         ← renders immediately
  <Header />                   ← renders immediately
  <Suspense fallback={<Skeleton />}>
    <SlowPart />               ← "suspends" while loading
  </Suspense>
  <Footer />                   ← still renders; not blocked by SlowPart
</Page>
```

Think of Suspense as a **placeholder frame** around a slow region of the UI.

---

## What problem it solves

| Without Suspense | With Suspense |
|------------------|---------------|
| Loading flags in every component | One **fallback** per boundary |
| Easy to forget error/loading states | Clear **not-ready** region in the tree |
| Heavy route blocks whole app shell | Shell + nav can paint; content area loads inside boundary |
| Hard to coordinate nested async work | Nested boundaries can show **layered** fallbacks |

Suspense does **not** fetch data by itself. Something in the child tree must **signal** “I am not ready” (lazy component, or a library/React feature that throws a Promise while loading). Suspense **catches** that signal and shows **`fallback`**.

---

## Timeline: suspend → resolve

```text
TIME ──►

t0   User navigates to /dashboard
     <Suspense fallback={<Skeleton />}> mounts
     fallback visible ─────────────────────┐
                                           │
t1   Child starts loading (lazy import / data promise)
     React keeps showing fallback          │
                                           │
t2   Load completes                        │
     React renders real child              │
     fallback hidden ◄─────────────────────┘
```

If the user navigates away before `t2`, React **discards** the in-flight work for that boundary (when wired correctly) instead of updating unmounted UI.

---

## Pattern: lazy-loaded route (code splitting)

Split a heavy page so the initial bundle stays small. **`React.lazy`** + **`Suspense`** is the classic pair.

```jsx
import { lazy, Suspense } from "react";

const AnalyticsPage = lazy(() => import("./AnalyticsPage"));

function App() {
  return (
    <Suspense fallback={<p>Loading analytics…</p>}>
      <AnalyticsPage />
    </Suspense>
  );
}
```

```text
First visit to /analytics
─────────────────────────
1. User clicks link
2. Suspense shows fallback
3. Browser downloads AnalyticsPage.js chunk
4. Suspense replaces fallback with <AnalyticsPage />
```

---

## Pattern: nested boundaries (shell + panel)

```jsx
function Dashboard() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<ShellSkeleton />}>
        <Header />
        <Suspense fallback={<ChartSkeleton />}>
          <SalesChart />
        </Suspense>
        <Suspense fallback={<TableSkeleton />}>
          <RecentOrders />
        </Suspense>
      </Suspense>
    </div>
  );
}
```

Outer boundary: whole main column. Inner boundaries: chart and table can resolve **independently** — chart skeleton disappears when chart data is ready, even if the table is still loading.

---

## Pattern: Suspense + `useTransition` (keep UI responsive)

When navigation triggers slow data, wrap the update in **`startTransition`** so the **current** screen stays interactive while the Suspense boundary shows **`fallback`** for the incoming view.

```jsx
const [isPending, startTransition] = useTransition();

function onSelectTab(tab) {
  startTransition(() => {
    setTab(tab);
  });
}

return (
  <>
    <TabBar active={tab} pending={isPending} />
    <Suspense fallback={<PanelSkeleton />}>
      <TabPanel tab={tab} />
    </Suspense>
  </>
);
```

See [useTransition](/react/useTransition) — transitions and Suspense are designed to work together.

---

## What Suspense is not (yet / by itself)

| Expectation | Reality |
|-------------|---------|
| “Wrap any `useEffect` fetch” | Classic client `useEffect` fetch does **not** suspend unless you use a Suspense-aware data layer |
| “Replaces error handling” | Use an **error boundary** for failures; Suspense is for **loading** |
| “One Suspense for whole app” | Prefer **several** boundaries so shells and sidebars stay visible |

For **client-only** apps today, Suspense shines with **`lazy`**, frameworks (Next.js, Remix), and libraries built for Suspense (Relay, TanStack Query Suspense mode, etc.).

---

## Suspense vs manual loading state

```text
Manual (useState + useEffect)
─────────────────────────────
Parent owns loading, error, data
Child assumes data exists

Suspense boundary
─────────────────
Parent: <Suspense fallback>
Child: throws/suspends until ready
Boundary swaps fallback ↔ child
```

| Question | Manual `loading` flag | `<Suspense>` |
|----------|----------------------|--------------|
| Few one-off screens? | Fine | Optional |
| Many async regions? | Repetitive | **Scales better** |
| Need fine-grained skeleton layout? | Full control | **fallback** per boundary |
| Team on Next.js App Router? | Still valid | **Very common** |

---

## When to reach for Suspense (decision tree)

```text
Part of UI waits on async work?
│
├─ User clicked button → one-off action?
│     └─► local loading on button / useOptimistic — not Suspense
│
├─ Whole route chunk not downloaded?
│     └─► React.lazy + Suspense
│
├─ Framework provides async Server Component or Suspense data?
│     └─► Suspense boundaries around those children
│
├─ Small fetch in one leaf with useEffect?
│     └─► manual loading is OK to start
│
└─ Many nested regions load at different speeds?
      └─► nested Suspense + skeleton fallbacks
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| No **`fallback`** or empty fallback | Layout shift; users see blank space |
| Suspense **too high** in the tree | Entire page becomes one spinner |
| Forgetting **error boundary** above/beside Suspense | Load failures are uncaught |
| Mixing Suspense with non-Suspense data fetching | Boundary never triggers; fallback never shows |

---

## Where to go next

- **Low-priority navigation while loading**: [useTransition](/react/useTransition)
- **Render phases and when work runs**: [React rendering flow](/concepts/react-rendering-flow)
- **Server-fetched UI without client waterfalls**: [Server Components](/react/server-components)
- **Optimistic mutations**: [useOptimistic](/react/useOptimistic)

Official docs: **Suspense** and **lazy** in the React documentation.
