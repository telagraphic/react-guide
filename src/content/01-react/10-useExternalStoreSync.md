# useSyncExternalStore

> Subscribe to **data that lives outside React** (module store, browser API, global singleton) and re-render when that source changes — with a **snapshot** read path React can use safely during render, including in concurrent mode.

**`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)`** connects your component to an **external** source of truth:

- **`getSnapshot()`** — return the value this render should display (must be **immutable** for that snapshot; if the store mutates in place, return a copy or a cached immutable view).
- **`subscribe(onStoreChange)`** — register a listener; call **`onStoreChange`** whenever the external value may have changed. Return an **unsubscribe** function.
- **`getServerSnapshot`** (optional) — snapshot for SSR when the browser-only store is unavailable.

React calls **`getSnapshot`** during render and re-renders when **`subscribe`** fires. This is the hook behind **Rule #4** in the overview: prefer it over **`useEffect` + `useState`** when you are **subscribing to a store**, not just running a one-off sync.

---

## What problem it solves

Vanilla apps often keep state in a **module**, **Zustand/Redux-style store**, or **browser API** (`matchMedia`, `navigator.onLine`). Components need to:

1. **Read** the current value during render.
2. **Re-render** when the store changes **without** prop-drilling every update.
3. Avoid **tearing** (different components showing different snapshots mid-render) when React concurrent features are in play — React’s built-in store subscription path handles this better than ad-hoc `useEffect` reads.

**`useEffect` + `setState`** after reading a store can work for simple cases but duplicates subscription logic, runs **after** paint, and is easier to get wrong under concurrency. **`useSyncExternalStore`** is the intended integration point.

---

## `useSyncExternalStore` vs alternatives (quick comparison)

| Question | Prefer **`useState` / props** | Prefer **`useEffect` + `useState`** | Prefer **`useSyncExternalStore`** |
|----------|------------------------------|-------------------------------------|-----------------------------------|
| State owned entirely inside React? | **Yes** | — | — |
| One-off read on mount (e.g. `localStorage` once)? | — | **Often yes** | Overkill |
| External store with **subscribe** API? | — | Fragile | **Yes** |
| Many components read same **external** source? | Prop drilling | Duplicated effects | **Yes** |
| Need correct behavior with **concurrent** rendering? | N/A | Risk of tearing | **Yes** |

---

## Pattern: tiny module store

```jsx
import { useSyncExternalStore } from "react";

const listeners = new Set();
let count = 0;

export const counterStore = {
  getSnapshot() {
    return count;
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  increment() {
    count += 1;
    for (const l of listeners) l();
  },
};

function CounterDisplay() {
  const n = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot
  );
  return <p>{n}</p>;
}
```

The store **mutates** `count` but **`getSnapshot`** returns a **primitive** — each read is a consistent value for that render. For object snapshots, return a **new reference** when data changes so React can detect updates.

---

## Pattern: browser API (`matchMedia`, online status)

```jsx
function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches
  );
}
```

Same shape: **subscribe** to changes, **getSnapshot** for the current boolean. Prefer this over an effect that only sets state on mount.

---

## Pattern: third-party store (e.g. Zustand)

Libraries aimed at React often expose **`useStore(selector)`** built on **`useSyncExternalStore`** internally. If you integrate a custom store, implement **`subscribe`** + **`getSnapshot`** (and **`getServerSnapshot`** for SSR) so all readers share one subscription contract.

---

## When to reach for `useSyncExternalStore` (decision tree)

```text
Component needs data from outside React?
│
├─ Data passed from parent as props?
│     └─► props (no hook)
│
├─ One-time sync on mount (read once, no ongoing subscription)?
│     └─► useEffect with [] or event handler
│
├─ External source exposes subscribe + getCurrentValue?
│     └─► useSyncExternalStore
│
└─ User event writes to external system only?
      └─► event handler (+ optional useState for UI)
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| **`getSnapshot` returns new object every call** without real change | Infinite re-renders or unnecessary updates — stabilize or return primitives |
| **Mutating** snapshot in place | Concurrent renders can see inconsistent data |
| Missing **`getServerSnapshot`** in SSR | Hydration mismatch for browser-only APIs |
| Using the hook for **fully internal** React state | Unnecessary — use **`useState`** / **`useReducer`** |

---