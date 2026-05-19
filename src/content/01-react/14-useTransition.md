# useTransition

> Mark a **state update** (or **async action**) as **non-urgent** so React can keep the UI responsive — finish typing, clicks, and animations first, then apply heavier tree updates when ready.

**`const [isPending, startTransition] = useTransition()`** returns:

- **`startTransition(fn)`** — run `fn` (sync or **async**) inside a **transition**; updates scheduled inside it are **lower priority**.
- **`isPending`** — `true` while a transition is in progress (use for spinners, dimmed UI, disabled tabs).

This is the **imperative** sibling of [useDeferredValue](/course-notes/useDeferredValue): you choose **which** `setState` calls are allowed to interrupt, instead of deferring a value copy.

---

## What problem it solves

Same class of apps as deferred search — dashboards, route changes, tab panels, filters — but you often have **several** state updates and want explicit control:

```text
URGENT (default)                    TRANSITION (low priority)
────────────────                    ───────────────────────────
setQuery(e.target.value)            startTransition(() => {
                                      setTab(nextTab)
onClick focus / hover                 setFilteredHugeList(...)
                                    })
input caret, button press           await fetchPage(nextTab)  ← async OK (React 19+)
```

Without transitions, switching tabs might **block** the main thread long enough that the tab highlight feels late. With **`startTransition`**, React can paint the tab change (or keep the old screen responsive) while preparing the heavy panel.

---

## Priority timeline (one user gesture)

```text
TIME ──►

User clicks "Analytics" tab
│
├─ [urgent] setActiveTab("analytics")     ← can run immediately (if outside transition)
│
└─ startTransition(() => {
       setReportData(computeHuge(report))   ← scheduled transition update
   })
│
│  isPending true ────────────────────────────────┐
│                                                  │
▼  React may render other urgent work first        ▼
   Paint tab UI / keep previous panel interactive   isPending false
   Then commit transition update when ready
```

---

## `useTransition` vs `useDeferredValue` vs `useMemo`

| Tool | You say… | Typical trigger |
|------|----------|-----------------|
| **`useDeferredValue`** | “Read this **lagged** value in render” | Fast `query` → slow `<Results query={deferred} />` |
| **`useTransition`** | “This **update** is allowed to wait” | Tab change, router state, bulk filter `setState` |
| **`useMemo`** | “Don’t recompute unless deps change” | Same render priority as parent |

---

## Pattern: tabbed settings (SaaS admin)

```jsx
import { useState, useTransition } from "react";

function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [isPending, startTransition] = useTransition();

  function selectTab(next) {
    startTransition(() => {
      setTab(next);
    });
  }

  return (
    <div>
      <nav aria-busy={isPending}>
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id}
            onClick={() => selectTab(id)}
          >
            {id}
          </button>
        ))}
      </nav>
      <div className={isPending ? "panel pending" : "panel"}>
        {tab === "profile" && <ProfileForm />}
        {tab === "billing" && <BillingHistory />}
        {tab === "api" && <ApiKeysPanel />}
      </div>
    </div>
  );
}
```

**`isPending`** drives subtle feedback (opacity, skeleton) without blocking the tab buttons.

---

## Pattern: search — transition around filter state

```jsx
function SearchPage({ index }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function onQueryChange(next) {
    setQuery(next); // urgent — input

    startTransition(() => {
      setResults(filterIndex(index, next)); // heavy derive
    });
  }

  return (
    <>
      <input value={query} onChange={(e) => onQueryChange(e.target.value)} />
      {isPending && <span>Searching…</span>}
      <ResultList items={results} />
    </>
  );
}
```

Alternative: keep one `query` and use **`useDeferredValue(query)`** for results — pick whichever reads clearer in your component.

---

## Pattern: `startTransition` with async (React 19+)

Transitions can wrap **async** work so **`isPending`** stays true until the async function completes (including any `await` and subsequent `setState` inside it).

```jsx
import { useState, useTransition } from "react";

function TeamPicker() {
  const [teamId, setTeamId] = useState("eng");
  const [members, setMembers] = useState([]);
  const [isPending, startTransition] = useTransition();

  function onTeamChange(nextId) {
    startTransition(async () => {
      setTeamId(nextId);
      const data = await fetchMembers(nextId);
      setMembers(data);
    });
  }

  return (
    <>
      <select value={teamId} onChange={(e) => onTeamChange(e.target.value)} disabled={isPending}>
        <option value="eng">Engineering</option>
        <option value="sales">Sales</option>
      </select>
      {isPending ? <SkeletonRows /> : <MemberTable rows={members} />}
    </>
  );
}
```

```text
Async transition lifecycle
──────────────────────────
startTransition(async () => { ... }) called
  isPending = true
  await fetch(...)        ← UI can stay interactive; urgent updates still win
  setMembers(data)        ← still part of transition
async fn settles
  isPending = false
```

**Note:** Errors thrown inside async transitions should be handled (error boundary or `try/catch` + `setError`) — same as any async event handler.

---

## Pattern: `useTransition` + Server Actions / forms (Next.js App Router)

In frameworks that expose **actions**, wrapping navigation or refetch in **`startTransition`** avoids locking the shell UI:

```jsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

function SaveButton({ saveAction }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await saveAction();
          router.refresh();
        });
      }}
    >
      {isPending ? "Saving…" : "Save"}
    </button>
  );
}
```

Pair with **`useOptimistic`** when you want instant UI before the server responds ([useOptimistic](/course-notes/useOptimistic)).

---

## Pattern: `startTransition` from library code

`import { startTransition } from "react"` works outside components when a store or router needs to schedule low-priority updates without calling the hook.

---

## When to reach for `useTransition` (decision tree)

```text
UI feels blocked after setState from tabs, routing, or big filter?
│
├─ Only one prop to child is heavy?
│     └─► useDeferredValue on that input
│
├─ Several setStates or async fetch on navigation?
│     └─► startTransition (maybe async)
│
├─ Need global isPending for section?
│     └─► useTransition + isPending UI
│
└─ Side effect / subscription?
      └─► useEffect — not a transition
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Wrapping **urgent** updates (controlled input value) | Input lag — only transition **heavy** updates |
| Expecting transition to **cancel** in-flight fetch automatically | Abort/network logic is still yours |
| Using transition instead of **fixing** O(n²) render | Profile first |
| Ignoring **`isPending`** | User clicks twice; no feedback during slow tab |

---

## Where to go next

- **Defer a value declaratively**: [useDeferredValue](/course-notes/useDeferredValue)
- **Instant UI before server confirms**: [useOptimistic](/course-notes/useOptimistic)
- **Memoize heavy pure work**: [useMemo / useCallback](/course-notes/useMemo-useCallback)
- **Render priority mental model**: [React rendering flow](/course-notes/react-rendering-flow)

Official docs: **useTransition**, **startTransition**, and **Suspense** in the React documentation.
