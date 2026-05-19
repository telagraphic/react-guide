# useEffect

## What `useEffect` is in React

`useEffect` is a hook you call during render to **register work that should run later**, after React has finished applying this render’s DOM updates (the “commit” phase). The function you pass is the **effect body**: it runs when the component has mounted, and again after commits where the dependency array changed. If the effect body **returns a function**, React treats that as a **cleanup**: it runs before the effect runs again (because deps changed) and once when the component unmounts.

Effects are for **synchronizing with the outside world** — `document.title`, timers, network, subscriptions — not for computing values you could derive during render. React keeps the dependency list so it can skip re-running the effect when nothing relevant changed.

The snippet below keeps the document title in sync with `count` and clears the title on cleanup (when `count` changes to a new effect run, and when the component unmounts).


## React (reference)

```jsx
import { useEffect, useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `count=${count}`;
    return () => {
      document.title = '';
    };
  }, [count]);

  return (
    <>
      <p>count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        increment
      </button>
    </>
  );
}
```

During render, React **records** this effect and its dependency array. After DOM updates for this commit, React **flushes** passive effects: if `[count]` changed since last flush, it runs the previous cleanup (if any), then the new effect body.

---

## Vanilla implementation

Same counter as lesson 01 (`let count` + `paint()` for the panel). On top of that we keep two pieces of bookkeeping React does for you: **what deps we last ran for**, and **the cleanup function** from the last run. After each paint we **defer** a small step with `queueMicrotask` so the effect does not run in the middle of building nodes — a coarse stand-in for “after commit.”

```javascript
export function mountLesson02(host) {
  let count = 0;
  let alive = true;

  let lastEffectCount = null;
  let passiveCleanup = null;

  function flushPassiveEffects() {
    if (lastEffectCount === count) return;

    if (passiveCleanup) {
      passiveCleanup();
      passiveCleanup = null;
    }

    lastEffectCount = count;
    document.title = `Vanilla lab | count=${count}`;
    passiveCleanup = () => {
      document.title = '';
    };
  }

  function paint() {
    host.replaceChildren();

    const label = document.createElement('p');
    label.textContent = `count: ${count}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'increment';
    btn.addEventListener('click', () => {
      count += 1;
      paint();
    });

    host.append(label, btn);

    queueMicrotask(() => {
      if (!alive) return;
      flushPassiveEffects();
    });
  }

  paint();

  return () => {
    alive = false;
    if (passiveCleanup) {
      passiveCleanup();
      passiveCleanup = null;
    }
    host.replaceChildren();
  };
}
```

---

## What this vanilla code is doing (step by step)

### `paint()` — UI first

Same idea as lesson 01: clear `host`, create the paragraph and button from `count`, wire the click handler to bump `count` and call `paint()` again. Nothing here touches `document.title`; that is deferred on purpose so you can see the split between **“update the subtree we own”** and **“run side effects that observe the outside world.”**

### `queueMicrotask(...)` — why not call `flushPassiveEffects()` inline?

If you called `flushPassiveEffects()` at the bottom of `paint()` synchronously, the title would still update in the same JavaScript turn as the DOM writes. That is valid teaching for “after render logic,” but it does not make the ordering as obvious. Pushing work to a **microtask** means: finish the current `paint()` call stack, then run the effect pass — closer to the mental model **render / commit, then effect flush** (React’s real scheduler is more involved; see [../REQUIREMENTS.md](../REQUIREMENTS.md) §1.3–1.5).

### `alive` and the returned teardown

If the user leaves the page while a microtask is still queued, the effect must not run. **`alive`** is a simple guard. The function returned from `mountLesson02` mirrors **unmount**: clear the title via the saved cleanup, clear `host`, and set `alive` so any pending microtask no-ops.

### `flushPassiveEffects()` — deps, cleanup, re-run

1. **`lastEffectCount === count`** — same dependency value as the last time we successfully ran the effect body → **do nothing** (React skips the effect when `[count]` is unchanged commit-to-commit).

2. Otherwise, if **`passiveCleanup`** is set, call it — this is the **`return () => { ... }`** from the previous effect run, run *before* installing the new title.

3. Record **`lastEffectCount = count`**, set **`document.title`**, store a new **`passiveCleanup`** that clears the title.

On the first run, `lastEffectCount` is `null`, so `lastEffectCount === count` is false (`null === 0` is false), there is no prior cleanup, then we set title for `count === 0`.

---

## Mapping in one glance

| React | This vanilla |
|--------|----------------|
| `useEffect(fn, [count])` | `flushPassiveEffects` + `lastEffectCount === count` guard |
| Effect body | Code that sets `document.title` |
| Cleanup function | `passiveCleanup` — run before next effect and on unmount |
| “After commit” | `queueMicrotask` after DOM updates in `paint()` |
| Unmount | returned function: `alive = false`, run cleanup, clear `host` |

---

## What we are not modeling

- Multiple independent effects (you would add another `lastX` / cleanup pair, or a small array of records).
- Batching, Strict Mode double-invoke, or real “after paint” timing (browser paint boundaries are not guaranteed by `queueMicrotask`).

---

## Checklist

- [ ] Point to where **DOM updates** happen vs where **`document.title`** updates.
- [ ] Explain **why** cleanup runs before the next title write when `count` changes.
- [ ] Explain what **`lastEffectCount === count`** is doing in one sentence.

---

## Not in this lesson

`useLayoutEffect`, `useInsertionEffect`, async effects without cleanup discipline. See [../REQUIREMENTS.md](../REQUIREMENTS.md) for the wider track.




## Deeper Breakdown

In this lesson, React stores **two things** on the fiber; the vanilla code mirrors them with **two variables**:

| Variable | React analogue | What it remembers |
|----------|----------------|-------------------|
| `lastEffectCount` | last dependency array / “did we already flush for this `count`?” | **When** the effect last ran successfully |
| `passiveCleanup` | `destroy` from last effect run | **How to undo** the last run (only the cleanup fn, not the whole effect) |

The **effect body** (set title) is not stored as a function — it is written inline in `flushPassiveEffects`. Only the **cleanup** (`() => { document.title = '' }`) is kept in `passiveCleanup`, like React keeping the function you `return` from `useEffect`.

---

## Mental model: one slot, one cleanup at a time

Think of `passiveCleanup` as a **single hook on the wall**:

```text
  passiveCleanup
       │
       ▼
  ┌─────────────┐
  │  cleanup₀   │  ← "undo the last time we ran the effect"
  └─────────────┘

  (there is never two cleanups stored at once)
```

When deps change, you **use** that hook (call cleanup), **take it down** (`= null`), do new work, **hang a new hook** (new cleanup).

You do **not** keep the old effect body around — only the undo button.

---

## The two phases (this is the whole trick)

```text
  paint()                         microtask (later)
  ───────                         ─────────────────
  • update DOM                    flushPassiveEffects()
  • do NOT touch document.title   • maybe run OLD cleanup
  • queueMicrotask(flush)         • run NEW effect (set title)
                                  • store NEW cleanup
```

`paint` ≈ render + commit.  
`flushPassiveEffects` ≈ `useEffect` flush.

---

## ASCII timeline: `passiveCleanup` over time

### 1) First load (`count = 0`)

```text
paint: count=0, DOM built
       lastEffectCount=null, passiveCleanup=null

microtask → flushPassiveEffects()
       │
       ├─ lastEffectCount === count ?  null === 0  → NO, continue
       ├─ passiveCleanup ?  NO
       ├─ lastEffectCount = 0
       ├─ document.title = "… count=0"     ← effect BODY (runs inline)
       └─ passiveCleanup = cleanup₀        ← STORE cleanup

  MEMORY AFTER:
  ┌──────────────────┬─────────────────────────────┐
  │ lastEffectCount  │ 0                           │
  │ passiveCleanup   │ cleanup₀  (clears title)    │
  └──────────────────┴─────────────────────────────┘
```

### 2) Click increment (`count` 0 → 1)

```text
paint: count=1, DOM rebuilt
       (passiveCleanup STILL cleanup₀ — not touched in paint)

microtask → flushPassiveEffects()
       │
       ├─ lastEffectCount === count ?  0 === 1  → NO, continue
       │
       ├─ passiveCleanup exists?
       │      YES → call cleanup₀()     ← OLD undo runs
       │           passiveCleanup = null  ← REMOVED from slot
       │
       ├─ lastEffectCount = 1
       ├─ document.title = "… count=1"   ← NEW effect body
       └─ passiveCleanup = cleanup₁      ← NEW cleanup stored

  MEMORY AFTER:
  ┌──────────────────┬─────────────────────────────┐
  │ lastEffectCount  │ 1                           │
  │ passiveCleanup   │ cleanup₁                    │
  └──────────────────┴─────────────────────────────┘

  cleanup₀ is gone — it already ran; we don't keep it.
```

That is exactly your question: **stored → run when executing again → cleared (`null`) → replaced by the new cleanup.**

### 3) Click again but `count` still 1 (re-paint, deps unchanged)

```text
paint: count=1

microtask → flushPassiveEffects()
       │
       └─ lastEffectCount === count ?  1 === 1  → YES, return early

  cleanup₁ never runs
  title unchanged
  passiveCleanup still cleanup₁
```

Same as React skipping `useEffect` when `[count]` did not change.

### 4) Unmount (returned teardown)

```text
alive = false
passiveCleanup()   ← run latest cleanup (cleanup₁)
passiveCleanup = null
clear host

(any queued microtask sees !alive and skips)
```

---

## `flushPassiveEffects` as a flowchart

```text
                    flushPassiveEffects()
                              │
                              ▼
              ┌───────────────────────────────┐
              │ lastEffectCount === count ?   │
              └───────────────────────────────┘
                     │              │
                    YES             NO
                     │              │
                     ▼              ▼
                  [STOP]    ┌─────────────────────┐
                            │ passiveCleanup set? │
                            └─────────────────────┘
                                   │         │
                                  YES        NO
                                   │         │
                                   ▼         │
                            call cleanup     │
                            passiveCleanup   │
                              = null  ◄──────┘
                                   │
                                   ▼
                         lastEffectCount = count
                         set document.title      ← effect body
                         passiveCleanup = new fn ← store cleanup
```

---

## Line-by-line (minimal)

```javascript
let lastEffectCount = null;   // "last time we ran effect, count was …"
let passiveCleanup = null;    // "how to undo that run" (or null)
```

```javascript
if (lastEffectCount === count) return;
// Deps unchanged since last successful flush → skip (like React).
```

```javascript
if (passiveCleanup) {
  passiveCleanup();      // Run OLD cleanup (undo previous effect)
  passiveCleanup = null; // Slot empty — old cleanup is consumed
}
```

```javascript
lastEffectCount = count;              // Remember we flushed for this count
document.title = `... count=${count}`; // Effect BODY (not stored as fn)
passiveCleanup = () => { document.title = ''; }; // Store NEW cleanup only
```

So: **old cleanup stored → on next flush, call it and null it → new title + new cleanup.**

---

## React vs this file (same idea)

```jsx
useEffect(() => {
  document.title = `count=${count}`;  // body — runs on flush
  return () => { document.title = ''; }; // cleanup — React stores this
}, [count]);
```

| Step | React (conceptual) | Vanilla |
|------|-------------------|---------|
| After render | Record `[count]`, schedule flush | `queueMicrotask(flush)` |
| Flush, deps changed | Call stored **destroy** | `passiveCleanup()` |
| Then | Run effect body | `document.title = ...` |
| Then | Store new **destroy** | `passiveCleanup = () => ...` |

---

## Common confusions

**“Is the old effect stored?”**  
Only the **cleanup** is stored (`passiveCleanup`). The “set title” part is not a saved function; it is code that runs again inside `flushPassiveEffects`.

**“Why set `passiveCleanup = null` after calling it?”**  
So you do not run the same undo twice, and the slot is empty until the new effect installs a new cleanup.

**“When is cleanup *not* run?”**  
When `lastEffectCount === count` (early return) — same deps, no re-sync.

**“Why `queueMicrotask`?”**  
So `paint()` finishes DOM work first, then effects run — like “after commit,” not in the middle of building nodes.

---

## One picture to remember

```text
  count changes
       │
       ▼
   paint() ──────────────► DOM updated (count on screen)
       │
       └── queueMicrotask
                 │
                 ▼
         flushPassiveEffects
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
 run OLD      run NEW      store NEW
 cleanup      effect       cleanup
 (if any)      (title)      (for next time)
    │            │            │
    └─ null ─────┴────────────┘
         only ONE cleanup
         lives in memory
```

Your mental model is right: **one saved undo function; when the effect runs again because deps changed, call undo, clear the slot, do new work, save a new undo.** If you want this folded into `LESSON.md` as a short “Memory over time” section with these diagrams, say so and we can add it there.