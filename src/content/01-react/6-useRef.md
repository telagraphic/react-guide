# useRef

> Creates a value that is preserved across renders, but won't trigger a re-render when it changes


**`useRef`** gives you a **mutable object** that survives for the whole life of a component: `{ current: ... }`. React hands you the **same object on every render**.

The important split:

- **`useState`**: changing the value schedules a **re-render**.
- **`useRef`**: mutating `ref.current` does **not** schedule a re-render. It is useful for **stable handles** to DOM nodes, timers, or any value you want to **read and write between renders** without making the UI depend on that write.

```jsx
import * as React from "react"
import { formatTime } from "./utils"

export default function Stopwatch () {
  const [seconds, setSeconds] = React.useState(0)
  const [running, setRunning] = React.useState(false)
  const ref = React.useRef(null) // could use useState but that will cause a re-render on every change which is hacky

  const handleClick = () => {
    if (running === false) {
      ref.current = window.setInterval(() => {
        setSeconds(s => s + 1) 
      }, 1000)
      setRunning(true)
    } else {
      window.clearInterval(ref.current)
      setRunning(false)
    }
  }

  return (
    <main>
      <h1>{formatTime(seconds)}</h1>
      <button
        style={{background: running === true ? 'var(--red)' : 'var(--green)'}}
        onClick={handleClick}>
          {running === true ? 'Stop' : 'Start'}
      </button>
    </main>
  )
}
```

The example above **mutates during render** only to show the object identity; for real work, prefer updating refs in **effects** or **event handlers** unless you have a clear reason not to.

---

## `useRef` vs `useState` (quick comparison)

| Question | `useState` | `useRef` |
|----------|------------|----------|
| Should the user see new UI when this value changes? | **Yes** → state | **No** → ref |
| Track “how many times we did X” without redrawing? | Overkill | **`useRef`** |
| Hold a DOM node? | Not the right tool | **`useRef`** |

If you put **display-only** data in a ref and mutate it, React will **not** know to repaint — so the screen can **lie** until something else causes a re-render.



## DOM References

Whenever you pass a ref as a prop to a React element, React will put a reference to the DOM node it creates into that ref's current property.

```jsx
import * as React from "react"

export default function App () {
  const ref = React.useRef(null)

  const handleClick = () => {
    const node = ref.current
    node.classList.add("🖕-you-react")
    node.innerHTML = "Suck it, React"
  }

  return (
    <button ref={ref} onClick={handleClick}>
      Click Me
    </button>
  )
}
```

But we shouldn't start making changes to the DOM in the above example.
Use the react idoms:




```jsx
export default function App() {
  const [clicked, setClicked] = React.useState(false)

  return (
    <button
      type="button"
      className={clicked ? "🖕-you-react" : ""}
      onClick={() => setClicked(true)}
    >
      {clicked ? "Suck it, React" : "Click Me"}
    </button>
  )
}
```


---

## Pattern: DOM node reference (focus, scroll, measure)

Attach the ref to a JSX element with **`ref={myRef}`**. After commit, **`myRef.current`** is the DOM element (or `null` when unmounted).

```jsx
import { useEffect, useRef } from 'react';

function AutoFocusField() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} aria-label="Search" />;
}
```

**Scroll into view** or **`getBoundingClientRect()`** follow the same idea: read the node from `ref.current`, usually in an effect or event handler (see [React rendering flow](/course-notes/react-rendering-flow) — the node is not guaranteed to be connected at arbitrary render-time reads).

---

## Pattern: `forwardRef` (parent needs the child’s DOM)

When a **parent** must focus or measure a **child’s** inner element, expose a ref with **`forwardRef`**:

```jsx
import { forwardRef, useRef } from 'react';

const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

function Form() {
  const inputRef = useRef(null);

  return (
    <>
      <FancyInput ref={inputRef} />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Focus field
      </button>
    </>
  );
}
```

---

## Pattern: store timer / request id (avoid stale state in cleanup)

You can keep `setInterval` / `requestAnimationFrame` ids on a ref so **any** handler or cleanup can clear the latest one without listing them in `useEffect` dependencies for every shape of logic.

```jsx
import { useEffect, useRef } from 'react';

function useInterval(callback, delay) {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => saved.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}
```

---

## Pattern: previous prop or state (“what was it last render?”)

Refs are a simple way to compare **current** vs **previous** after a render:

```jsx
import { useEffect, useRef } from 'react';

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

On the first render, `ref.current` is `undefined`; after each update effect runs, it stores the last committed `value`. Variants of this pattern power “only run when X **changed from** Y” logic.

---

## Pattern: latest callback without resubscribing

If you subscribe once (e.g. `window.addEventListener`) but want the handler to always see **fresh** props/state, keep the latest function in a ref:

```jsx
import { useEffect, useRef } from 'react';

function useEventListener(event, handler) {
  const saved = useRef(handler);

  useEffect(() => {
    saved.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (e) => saved.current(e);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [event]);
}
```

This is the “**stable listener, fresh closure**” idea; use it when effect deps would otherwise churn.

### What this solves

You want to attach **one** listener to `window` (subscribe once) so you’re not constantly removing and re-adding it whenever `handler` changes. But if you close over `handler` directly in `addEventListener`, you get **stale** behavior: the listener might still call an **old** version of the function that saw **old** props/state.

So you’re torn between:

- **Re-subscribe every time `handler` changes** → correct data, but noisy (remove/add listener repeatedly).
- **Subscribe once with `handler` in the closure** → stable subscription, but possibly **stale** handler.

**What the ref does**

`saved` is a box whose **`.current` is always updated** to the latest `handler` after each render (`useEffect` when `[handler]` changes). The **actual** function registered with the browser is a tiny wrapper:

```js
const listener = (e) => saved.current(e);
```

That wrapper never changes identity in a way that matters for your mental model: you still **add one listener** keyed off `[event]`. When an event fires, the wrapper runs and calls **whatever is in `saved.current right now** — which you kept up to date.

So: **one listener attached to the window** (stable), but each invocation runs the **latest** handler (fresh).

**What “stable listener, fresh closure” means**

- **Stable listener** = the DOM (here `window`) keeps a **single** subscription; you’re not tearing it down and recreating it every time parent state/props change.

- **Fresh closure** = even though that subscription is old, the code that runs still behaves like a **new** closure: it delegates to `saved.current`, which you refresh to point at the newest `handler` after every render.

**One-line summary:**  
You register **one** event listener, but that listener always **forwards** to the **current** handler, so you don’t get stuck with outdated props/state without re-attaching the listener.


## Stable listener, fresh closure (visual)

```text
BROWSER TIME (real) ──►   attach        …events…              detach
                          │─────────────│──────────────────────│
                          │  addEventListener once ([event]) │
                          └─────────────┴──────────────────────┘
                                          │
REACT TIME (renders) ──►   r₀    r₁    r₂    r₃    …     rₙ
                          │────│────│────│────│──────│
                          │    │    │    │    │      │
`handler` identity         H₀   H₁   H₂   H₃        Hₙ   ← new closure each render/props change
                          │    │    │    │    │      │
`saved.current` (ref)      ═══► H₀→H₁→H₂→H₃→ … ──────► Hₙ   ← always “rewired” after render
                          │    sync effect [handler]  │
                          └────┴────┴────┴────┴──────┘

“Wire” from DOM → React:

STABLE PART (does not churn with r₁, r₂, …):
  window  ──►  listener  :  (e) => saved.current(e)   ← ONE function registered
               │                                    │
               │  identity fixed for this effect    │
               │  deps: [event] only                │
               └────────────────────────────────────┘

FRESH PART (changes every time `handler` changes):
  saved.current  ──►  always points at **latest** Hₙ
                      so each event calls **today’s** logic/props/state

---

During any moment between rᵢ and rᵢ₊₁:

opaque (what the browser holds)        │  TRANSPARENT “window” (what you keep updating)
───────────────────────────────────────┼──────────────────────────────────────────────
one real subscription on `window`      │  ref slot: `saved.current`  ⟶  Hᵢ (latest)
same wrapper `(e) => saved.current(e)` │  effect sync keeps slot aligned with renders
no remove/add on every render          │  when user code runs, it sees fresh Hᵢ

---

Equivalent mental substitution:

  “Stable listener”  ⟺  **one** registration; `[event]`-size churn, not `handler`-size churn.

  “Fresh closure”    ⟺  you’re not reviving old H₀…Hₙ₋₁; the **call path** is always
                        `saved.current` → **current** Hₙ, even though the wrapper is old.

---


* Footnote: “Stable” here does **not** mean the **handler’s behavior** is frozen; it means the **DOM subscription object** (add/remove pair) isn’t re-run on every `handler` change. Scroll is not involved; **render count** is the axis that moves `saved.current` forward.

```



---

## Pattern: media elements and third-party instances

- **`<video>` / `<audio>`**: `ref` on the element, then `ref.current.play()`, volume, currentTime, etc.
- **Canvas, maps, charts**: store the **library instance** on a ref (`chartRef.current = new Chart(...)`) and create it **once** (often in `useEffect`), update data when props change, destroy on cleanup. That keeps heavy objects off React state and avoids re-creating them every render.

---

## Callback refs (`ref={(el) => ...}`)

Besides `useRef`, React accepts a **function ref**. It runs with the element (or `null` on unmount). Useful for **measure-on-mount** or **storing the node in state** when you *do* want a re-render when it appears (less common than `useRef`).

```jsx
function Measured({ onReady }) {
  return (
    <div
      ref={(node) => {
        if (node) onReady(node.getBoundingClientRect());
      }}
    />
  );
}
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Expecting a ref to **force** a UI update | Mutating `.current` does **not** re-render. Use **state** for visible data. |
| Reading `ref.current` during render for **layout** | On first paint the node may still be `null` or not yet measured; prefer **effects** / **layout effects** / events. |
| Creating `useRef(new Expensive())` for lazy init | The initializer runs **every** render unless you use the **lazy form**: `useRef()` then assign in `useEffect`, or `useRef(null)` and `if (!ref.current) ref.current = …` in render (pattern used carefully for one-time instances). |

---

## Where to go next

- **Effects and cleanup**: [useEffect](/course-notes/useEffect) — refs often pair with `useEffect` for DOM and subscriptions.
- **Render vs commit**: [React rendering flow](/course-notes/react-rendering-flow) — when DOM nodes exist and when layout is safe.

Official docs: **useRef** and **Manipulating the DOM with Refs** in the React documentation.
