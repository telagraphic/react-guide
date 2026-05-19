# useDeferredValue

> Show a **lagged copy** of a fast-changing value so **urgent** UI (typing, focus, animations) can commit first, while **expensive** UI catches up when React has spare render time.

**`useDeferredValue(value)`** returns a value that **trails** `value`. When `value` changes, React may **keep rendering** child trees with the **previous** deferred value first, then update the deferred value in a **lower-priority** render — similar in *feel* to debouncing, but tied to React’s scheduler (when high-priority work finishes), not an arbitrary `setTimeout`.

---

## What problem it solves

Typical product UI: search box + heavy results list, large chart, map, or markdown preview. If every keystroke **synchronously** re-renders the heavy part, input **stutters**.

```text
WITHOUT deferral — one priority
────────────────────────────────
keystroke "r" → render Search + Filter(10k rows) → paint
keystroke "e" → render Search + Filter(10k rows) → paint   ← input waits on filter

WITH useDeferredValue — split urgency
─────────────────────────────────────
keystroke "r" → render Search (urgent) → paint              ← input stays crisp
              → render Results(deferred "r") → paint later
keystroke "e" → render Search (urgent) → paint
              → may skip showing "r" results; jump toward "e" when ready
```

You are not “debouncing at 300ms.” You are telling React: **this derived UI may lag** behind the real input until the scheduler catches up.

---

## `useDeferredValue` vs alternatives

| Approach | What it optimizes | Tradeoff |
|----------|-------------------|----------|
| **`useState` only** | Simplicity | Heavy child runs on every keystroke |
| **`debounce` in JS** | Fewer updates | Fixed delay; feels laggy; not integrated with React priority |
| **`useDeferredValue`** | Input responsiveness | Results can show **stale** data briefly |
| **`useTransition`** | You **choose** which **setState** is low priority | Imperative; often paired with `isPending` |
| **`useMemo` on filter** | Skips recompute when deps same | Still runs in **same** render as typing if `query` is direct |

**Pairing:** `deferredQuery = useDeferredValue(query)` **plus** `useMemo(() => filter(items, deferredQuery), [items, deferredQuery])` is common in production search UIs.

---

## Timeline: urgent vs deferred render

```text
USER TYPES:  h ──► he ──► hel ──► hell ──► hello
             │      │       │        │         │
query state  h      he      hel     hell      hello   ← always immediate (urgent)

deferred     h      h       he      hel       hell    ← may skip intermediate paints
(might lag)  │      │       │       │         │
             ▼      ▼       ▼       ▼         ▼
Heavy <List> re-render scheduled when React finishes urgent work
```

React may **discard** in-progress deferred renders if `query` moves again before they finish (like interruptible work).

---

## Pattern: search with stale-results hint (e-commerce, docs)

```jsx
import { useDeferredValue, useMemo, useState } from "react";

function CatalogSearch({ products }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => filterProducts(products, deferredQuery),
    [products, deferredQuery]
  );

  const isStale = query !== deferredQuery;

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
      {isStale && <p className="hint">Updating results…</p>}
      <ProductGrid products={results} aria-busy={isStale} />
    </>
  );
}
```

**`isStale`** is the standard UX signal: input shows **`query`**, list shows **`deferredQuery`**, user understands results are catching up.

---

## Pattern: defer a prop into a child (composition)

Parent owns fast state; child receives deferred prop:

```jsx
function Page() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);

  return (
    <>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <MarkdownPreview markdown={deferredText} />
    </>
  );
}
```

Child does not need to know about deferral — only that **`markdown`** updates less aggressively than the textarea.

---

## Pattern: defer `value` passed to `memo` child

```jsx
const deferredItems = useDeferredValue(items);

return <VirtualizedList items={deferredItems} />;
```

When **`items`** changes rapidly, list reconciliation waits on the deferred snapshot.

---

## `useDeferredValue` vs `useTransition`

| | **`useDeferredValue`** | **`useTransition`** |
|---|------------------------|---------------------|
| **Style** | Declarative — “lag this **value**” | Imperative — `startTransition(() => setState(...))` |
| **Best when** | Value already exists; pass to children | You control **which** state updates are non-urgent |
| **Pending UI** | Compare `value !== deferredValue` | Built-in **`isPending`** |

```text
Same goal — keep typing smooth:

useDeferredValue:  query ──defer──► deferredQuery ──► <Results />

useTransition:     onChange ──► setQuery(urgent)
                              └── startTransition(() => setHeavyFilter(...))
```

See [useTransition](/course-notes/useTransition) for marking updates and async actions.

---

## When to reach for `useDeferredValue` (decision tree)

```text
Typing or interaction feels janky because of heavy child render?
│
├─ Heavy work is cheap (< few ms)?
│     └─► plain state + maybe useMemo — profile first
│
├─ Heavy work is pure filter/sort on large data?
│     └─► useDeferredValue + useMemo
│
├─ You control multiple setStates and want isPending?
│     └─► useTransition
│
└─ Need exact "wait 300ms after last key"?
      └─► debounce (not React scheduler) — different tradeoff
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Expecting **no** stale UI | Deferred value **intentionally** lags — design loading/stale states |
| Deferring **everything** | Only defer **expensive** subtrees; keep control state urgent |
| Using deferral instead of **virtualization** | 100k DOM nodes still hurt eventually — combine techniques |
| **`useDeferredValue` on object recreated each render** | Deps churn; defer a **stable** primitive or memoized input |

---

## Where to go next

- **Mark updates low-priority explicitly**: [useTransition](/course-notes/useTransition)
- **Skip repeat filter work**: [useMemo / useCallback](/course-notes/useMemo-useCallback)
- **Scheduler + phases**: [React rendering flow](/course-notes/react-rendering-flow)
- **Optimistic server actions**: [useOptimistic](/course-notes/useOptimistic)

Official docs: **useDeferredValue** in the React documentation.
