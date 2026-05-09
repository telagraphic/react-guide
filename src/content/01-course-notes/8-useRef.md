# useRef — common use cases and patterns

**`useRef`** gives you a **mutable object** that survives for the whole life of a component: `{ current: ... }`. React hands you the **same object on every render**.

The important split:

- **`useState`**: changing the value schedules a **re-render**.
- **`useRef`**: mutating `ref.current` does **not** schedule a re-render. It is useful for **stable handles** to DOM nodes, timers, or any value you want to **read and write between renders** without making the UI depend on that write.

```jsx
import { useRef } from 'react';

function Example() {
  const r = useRef(0);

  // Same object every render; .current can change freely
  r.current += 1;

  return <p>This component body has run {r.current} times.</p>;
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
