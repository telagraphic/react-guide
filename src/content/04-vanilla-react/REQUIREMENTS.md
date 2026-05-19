# Vanilla React — requirements and implementation plan

This document captures **what we are building**, **why**, **how it differs from real React**, and **foundational concepts** you need before reading the lessons. It reflects decisions from the planning session (module-of-functions runtime, basics-first, separate integration track, todo capstone, TSX only in `mini-react/`).

---

## 1. Concepts you need outside the lesson code

### 1.1 What is a “render”?

In this project, **render** means: **run your component functions** to decide what the UI *should* be.

Concretely:

1. React (and our teaching runtime) holds a **tree of component instances** (each instance has its own hook state).
2. When something schedules an update (e.g. `setState`), the runtime marks work dirty and eventually **re-enters** the component function for that instance.
3. During that run, hooks like `useState` return the **current** state cells; hooks like `useMemo` may return a cached value.

So “render” here is **synchronous JavaScript execution** of component logic — not yet “pixels on screen.”

### 1.2 What is “commit”?

**Commit** means: **apply the output of render to the host environment** (in the browser: mutate the DOM, or update canvas, etc.).

Typical split:

- **Render phase:** pure-ish component work; compute the next UI description (e.g. virtual tree or patch list).
- **Commit phase:** take that description and **actually update** the DOM.

In real React these phases are more elaborate (interruption, priorities). In our teaching runtime we usually assume: **one render pass, then one commit**, both **synchronous** unless we explicitly introduce a microtask for effects (below).

### 1.3 “Render then flush effects” — what that means

**Effects** (`useEffect`) are **not** meant to run in the middle of every line of render. They observe the world **after** the UI from that render has been committed.

So the invariant we teach is:

1. **Render** components (hook calls run in order; state updates may be batched conceptually).
2. **Commit** DOM updates so what the user sees matches the latest completed render.
3. **Flush passive effects:** run `useEffect` callbacks for instances whose dependencies changed (and run **cleanups** from the *previous* render before the new effect body, when deps changed or on unmount).

That phrase **“render then flush effects”** means: **effects are deferred to a later turn of the event loop** (or a later microtask) relative to the render/commit work, so:

- The DOM you read inside `useEffect` matches the **committed** tree from that render.
- You do not use `useEffect` to “fix layout before paint” — that is a different hook (`useLayoutEffect`), taught in the appendix with explicit approximation notes.

**Why it matters for learning:** If you run effect bodies *during* render, you get double subscriptions, wrong DOM assumptions, and you blur the line between “deriving UI” and “syncing with the world.”

### 1.4 Scheduler (what we mean in this repo)

A **scheduler** is just the **policy and queue** that decides **when** work runs:

- **Render/commit work** might be queued when you call `setState`.
- **Effect flush work** might be queued as a separate job so it runs **after** commit.

In our contrived lesson runtime, the scheduler is intentionally small, for example:

- **Macro model:** “finish this update’s render + commit, then schedule effect flush.”
- **Implementation sketch:** `queueMicrotask(flushPassiveEffects)` or `setTimeout(0, …)` depending on the lesson — we will **label** which we use and what behavior differs from React.

Real React’s scheduler handles priorities, starvation, concurrent features, etc. **We do not.**

### 1.5 Paint timing and “phase ordering”

The browser roughly does:

1. **JavaScript** runs (your render/commit and maybe layout reads/writes).
2. **Style** is computed, **layout** is calculated.
3. **Paint** draws pixels; **composite** layers.

**Phase ordering** in React’s *mental model* (simplified):

1. **Render** (compute)
2. **Commit** (mutate DOM)
3. **`useLayoutEffect`** fires **before the browser paints** (so you can measure DOM and synchronously correct layout before the user sees inconsistent frames — in real React this is tied to the host config).
4. **`useEffect` (passive)** fires **after paint** (or at least “later”; userland cannot fully control paint).

**Teaching constraint:** In plain JS you cannot perfectly hook “after layout, before paint” without leaning on browser-specific APIs and still not matching React. So:

- We teach **ordering**: layout effects before passive effects; passive effects after commit.
- We document **approximation:** our timing is “microtask after commit” (or similar), **not** a guarantee about paint.

---

## 2. Project goals and non-goals

### 2.1 Goals

- Teach **how to think** in vanilla JS about React’s core invariants: hook order, instance state, render vs commit, effect flush semantics, refs, context, memoization as a concept.
- Use **vertical slices**: each slice adds one concept while keeping a coherent narrative.
- Use a **lesson page structure** (for markdown elsewhere in the repo): checklist → recipe → numbered steps → pattern discussion → full solution.
- Include a **todo capstone** that uses **core** hooks in a natural way.
- Provide a **Phase 2** `mini-react/` TSX implementation that composes the same ideas into a runnable kernel (not a production framework).

### 2.2 Non-goals

- Concurrent React, time slicing, transitions, full fiber reconciler, streaming SSR, production event system, full keyed reconciliation (unless explicitly added as a later slice).
- Pixel-perfect replication of React 19’s scheduler and paint integration.

---

## 3. Phased delivery

### Phase 1 — Teaching track (numbered slice folders)

- **Plain JavaScript** in lesson artifacts and snippets (easy to read and copy).
- **Early slices** follow the same idea as [`03-react-vs-vanilla/3-todo-list-react-vanilla.md`](../03-react-vs-vanilla/3-todo-list-react-vanilla.md): short React snippet, plain JS that maps 1:1, then “what changed” — not necessarily a miniature `createRoot` / reconciler until a later slice calls for it.
- Each slice is a **single markdown file** next to `mini-react/` (e.g. `01-instance-and-useState.md`) with fenced vanilla implementations in the prose.
- Content lives alongside or is referenced from existing docs (e.g. `docs/FEATURE-2.md`); this tree holds **code** and runnable sandboxes.

### Phase 2 — Integration track (`mini-react/`)

- **TypeScript / TSX** implementation of the “mini runtime” and the **todo** demo.
- **Appendix hooks** live as **separate small examples** under `mini-react/` (or `mini-react/examples/`), **not** imported by the minimal todo app, unless we add an explicit **Todo+** optional branch later.

---

## 4. Hook scope

### 4.1 Core (todo-driven)

- `useState`
- `useEffect` (+ cleanup), taught with **render → commit → flush effects**
- `useRef`
- `createContext` + consumer pattern (minimal `useContext` equivalent)
- `useReducer` **or** emphasize `useState` first then introduce reducer for complex updates (pick one primary story per lesson series; both need not be “heavy” in the todo)
- `useMemo` / `useCallback` — teach correctness and unnecessary work, not micro-optimization culture
- **One custom hook** (e.g. `useTodos` wrapping persistence)

### 4.2 Appendix (labeled; separate demos)

- `useLayoutEffect` (with paint / phase approximation disclaimer)
- `useSyncExternalStore` (subscription + snapshot; tearing discussion partial)
- `useEffectEvent` or equivalent **“stable latest callback”** pattern (API may differ from React 19; teach intent)

---

## 5. Todo capstone

- **Minimal todo:** add, toggle, delete, filter — needs state + optional persistence effect + optional ref for focus; context for a cross-cutting concern is enough to teach context without forcing it.
- **Todo+ (optional later):** threads appendix hooks only where they teach something real, without making the minimal todo depend on them.

---

## 6. “Breaks for learning” (document in each slice markdown file)

| Topic | Teaching runtime | Real React (informal) |
|--------|------------------|------------------------|
| Render scheduling | Usually synchronous, single pass | Can be concurrent / interrupted |
| Effect timing | Microtask / explicit queue — **approximate** “after paint” | Integrated scheduler + host |
| `useLayoutEffect` | Order vs passive effects taught; paint boundary approximate | Host-flush semantics |
| Strict Mode | Only if we add it deliberately | Dev double-invoke, etc. |
| Context / memo edge cases | Mental model first | More subtle update skipping rules |
| `useSyncExternalStore` / tearing | Pattern + partial discussion | Full concurrent semantics |

---

## 7. Repository layout (this folder)

```text
src/content/04-vanilla-react/
  REQUIREMENTS.md              ← this file
  01-instance-and-useState.md  ← Phase 1 slice: prose + fenced vanilla code
  02-use-effect.md
  03-use-ref.md
  04-create-context.md
  05-use-reducer.md
  06-use-memo-callback.md
  07-use-sync-external-store.md
  08-use-layout-effect.md
  09-use-effect-event.md
  10-custom-hook.md
  mini-react/                  ← Phase 2: TSX kernel + todo + appendix examples
```

Boundary rule: **do not import** real `react` / `react-dom` from `mini-react` lesson code. Slices are read in the wiki at `/vanilla-react/<slice-slug>` (same markdown pipeline as other sections).

---

## 8. Implementation conventions (for future build-out)

- **Runtime style:** module of functions (narrow exports: e.g. `createRoot`, `h`, hooks, internal `flushEffects`).
- **State model:** per-component-instance hook state array (or equivalent) with a **current instance** pointer during render.
- **Effects:** linked list or per-hook cells; cleanups before re-run; flush queued after commit.
- **Docs in each lesson:** checklist of React semantics → recipe → numbered steps → pattern notes → full solution, per `docs/FEATURE-2.md`.

---

## 9. Open items (none blocking)

- Exact public API names (`h` vs `createElement`, etc.) — decide when writing the first slice.
- New slices — add a numbered `NN-topic.md` file in this folder; it is picked up automatically by the content nav.
