# useEffect

## What `useEffect` is in React

`useEffect` is a hook you call during render to **register work that should run later**, after React has finished applying this render’s DOM updates (the “commit” phase). The function you pass is the **effect body**: it runs when the component has mounted, and again after commits where the dependency array changed. If the effect body **returns a function**, React treats that as a **cleanup**: it runs before the effect runs again (because deps changed) and once when the component unmounts.

Effects are for **synchronizing with the outside world** — `document.title`, timers, network, subscriptions — not for computing values you could derive during render. React keeps the dependency list so it can skip re-running the effect when nothing relevant changed.

The snippet below keeps the document title in sync with `count` and clears the title on cleanup (when `count` changes to a new effect run, and when the component unmounts).

### Try it

1. **Dev app:** open **`/labs/vanilla-react/lesson-02`** — the guide imports [`use-effect-vanilla.js`](./use-effect-vanilla.js) (keep it aligned with the **Vanilla implementation** block below).
2. **Static only:** `npx --yes serve src/content/05-vanilla-react/02-use-effect`, then open [`index.html`](./index.html).

### Supporting files in this folder

- **[`use-effect-vanilla.js`](./use-effect-vanilla.js)** — same logic as the fenced **Vanilla implementation** block, as an ES module for the lab route.
- **[`index.html`](./index.html)** — standalone runner for `npx serve` on this directory.

---

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
