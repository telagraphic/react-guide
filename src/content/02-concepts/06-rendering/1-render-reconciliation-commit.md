# Re-render, reconciliation, and commit

When React “updates the screen,” it does **not** jump straight from `setState` to touching the DOM. There are distinct phases. This page names them in order, ties them to the usual **virtual tree** mental model, and ends with **ASCII timelines** you can skim in a hurry.

For a longer tour (mount, event loop, effects order), see [React rendering flow (course notes)](/course-notes/react-rendering-flow).

---

## Words people mix up

| Term | In one sentence |
|------|------------------|
| **Render** (React) | Your **component functions run** and return **elements** — a *description* of UI, not necessarily DOM writes yet. |
| **Virtual DOM (informal)** | The **tree of elements** React keeps from those returns (plain objects: type, props, children). React’s implementation uses **Fibers** internally; “VDOM” still describes the *idea*: compare a lightweight tree before touching the real DOM. |
| **Reconciliation** | **Diff** the new element tree vs the last one, reuse or replace component instances, decide **what should change** (DOM ops, mount, unmount). |
| **Commit** | **Apply** those decisions: mutate the real DOM in one pass (insert/update/remove nodes, text, attributes). |
| **Re-render** | A **later** render of a component that **already exists** (often after state/props/context updates). |

So: **render** produces the next *virtual* description; **reconciliation** decides the minimal plan; **commit** runs the plan on the **real** DOM.

---

## What actually runs first?

Something **schedules** an update: `setState`, parent re-render with new props, context `value` change, etc. React often **batches** multiple updates from the same event.

Then, in simplified order:

1. **Render phase** — Call components (from root of the scheduled subtree), build the **new** element tree, reconcile against the **previous** tree. This work should stay **pure**: no accidental side effects in render; don’t assume the DOM has been updated yet.
2. **Commit phase** — Perform DOM mutations. **Mount** / **update** / **unmount** instances as reconciliation decided.
3. **Browser** — Style, layout, **paint** (pixels on screen).
4. **Effects** — `useLayoutEffect` runs in the commit pipeline **before paint**; `useEffect` runs **after paint** (see the course notes page for ordering).

If a child’s output is **identical** to before (same element type at that position and React’s rules say “reuse”), React may **skip** calling that component again — but you should not rely on “render count” for logic; assume render can run whenever React needs a consistent tree.

---

## How this “hooks in” to the virtual tree

Think of two layers:

```text
COMPONENT LAYER                          DOM LAYER
(functions run here)                     (browser nodes here)
      │                                        ▲
      │   elements → reconcile → commit        │
      └────────────────────────────────────────┘
```

- **Re-render** = component layer: functions execute, new virtual tree is computed.
- **Reconciliation** = compares **virtual** old vs new; output is **effects on instances** (update this instance, create that child, tear down another).
- **Commit** = DOM layer: the tree on screen is brought in sync.

So the VDOM (element tree) is the **bridge language** between “what React components think should be true” and “what the document actually contains.”

---

## ASCII timeline: one state update

Read left → right as **time**. `══` = work spans; `▲` = handoff to next phase.

```text
USER / TIMER / PARENT                REACT (main thread)
     │                                     │
     │ setState / dispatch                 │
     ├──────────► SCHEDULE ◄──────────────┤  (may batch with other updates)
     │                                     │
     │                    RENDER PHASE     │  Call components; compute new tree
     │                    ═══════════      │
     │                         │          │
     │              RECONCILIATION        │  Diff old vs new virtual tree
     │                    ═══════════    │
     │                         │          │
     │                         ▼          │
     │                    COMMIT PHASE    │  insert | update | delete real DOM
     │                    ═══════════     │
     │                         │          │
     │                         ▼          ▼
     │              useLayoutEffect       │  after DOM commit, before paint
     │              (if any)              │
     │                         │          │
     │                         ▼          │
     │              PAINT (pixels)        │  browser draws
     │                    (browser)       │
     │                         │          │
     │                         ▼          │
     │              useEffect             │  after paint; async-ish work
     │              (subscriptions,      │
     │               fetch, logs)         │
     ▼                                     ▼
   idle ─────────────────────────────► wait for next event
```

Not every step runs on **every** update (e.g. no mount if nothing new appeared). The diagram is the **full skeleton**.

---

## ASCII timeline: zoom into render vs commit

Same moment in the story, **two stacks** — what changes in memory vs what touches the page:

```text
RENDER + RECONCILE (mostly JS objects)          COMMIT (DOM mutations)

  call App()                                       createTextNode / setAttribute
       │                                                    │
  call Child()            ═════ diff ═════►           insertBefore / removeChild
       │                          │                        │
  element tree (virtual)           │                 real DOM updates
       │                          │                        │
       └───────── “what IF” ───────┴───────── “what IS on screen now” ───►
```

**Rule of thumb:** If it **must not flicker** (measure size, focus control), look at **`useLayoutEffect`**; if it **should not block paint** (network, timers), **`useEffect`**.

---

## What “only some components re-rendered” means here

Scheduling an update does **not** always mean **every** component in the app runs again. React tries to **prune** unchanged subtrees when props/position allow.

But **every** component that **does** re-render still goes through: **render → (as part of tree) reconcile → commit** for the affected fibers. The **DOM** step remains **minimal** because reconciliation already narrowed the work.

---

## Where to read next

- **Fuller pipeline + effects order**: [React rendering flow](/course-notes/react-rendering-flow)
- **Hooks that run after paint vs before**: [useEffect](/concepts/hooks/useEffect) and course notes on `useLayoutEffect` if you add them later.

Official docs: **Render and commit** (and **Reconciliation**) in the React documentation.
