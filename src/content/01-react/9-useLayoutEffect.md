# useLayoutEffect


React guarantees that the code inside useLayoutEffect and any state updates scheduled inside it will be processed before the browser repaints the screen. This lets your component use layout information for rendering – as we're doing in our example with the browser's dimensions.


```jsx
import * as React from "react"
import Browser from "./Browser"
import stall from "./stall"

export default function App () {
  const [size, setSize] = React.useState({
    width: null,
    height: null
  })

  React.useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  stall(250)

  return (
    <section>
      <table>
        <tbody>
          <tr>
            <th>width</th>
            <td>{size.width}</td>
          </tr>
          <tr>
            <th>height</th>
            <td>{size.height}</td>
          </tr>
        </tbody>
      </table>
      <Browser size={size} />
    </section>
  )
}
```

---

## What problem `useLayoutEffect` solves

> Run work **after React has updated the DOM** for this commit but **before the browser paints**, so the user does not see a wrong intermediate frame when layout measurements or synchronous DOM tweaks must drive the next render.

**`useLayoutEffect`** has the **same API** as **`useEffect`** (setup function, optional dependency array, optional cleanup). The difference is **timing**:

| Hook | Runs (simplified) | Blocks paint? |
|------|---------------------|---------------|
| **`useLayoutEffect`** | After DOM commit, **before** paint | **Yes** — keep work small |
| **`useEffect`** | After paint (passive) | **No** — preferred default |

The resize example above reads **`window.innerWidth` / `innerHeight`** and calls **`setSize`** inside **`useLayoutEffect`** so the table and **`Browser`** child get dimensions **before** the user sees a frame with `null` sizes (or a visible jump). For subscriptions that do **not** need to block paint — network, analytics, most listeners — default to **`useEffect`**.

---

## `useLayoutEffect` vs `useEffect` (quick comparison)

| Question | Prefer **`useEffect`** | Prefer **`useLayoutEffect`** |
|----------|-------------------------|------------------------------|
| Fetch, WebSocket, logging, analytics? | **Yes** | No |
| User would **notice flicker** if state updates after paint? | Risky | **Often yes** |
| Read **`getBoundingClientRect`**, scroll position, focus? | May flash wrong layout first | **Often yes** |
| Sync third-party widget DOM to React props? | Sometimes | **When flicker matters** |
| Can the fix live in **CSS** or render-only logic? | Try that first | Avoid layout effect |

---

## Pattern: measure then set state (tooltip, popover)

```jsx
import { useLayoutEffect, useRef, useState } from "react";

function Tooltip({ children, label }) {
  const anchorRef = useRef(null);
  const [style, setStyle] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setStyle({ top: rect.bottom + 8, left: rect.left });
  }, [label]);

  return (
    <>
      <span ref={anchorRef}>{children}</span>
      <div style={style} role="tooltip">{label}</div>
    </>
  );
}
```

Measure in **layout effect**, not during render — on first paint the node may still be **`null`** or not yet laid out.

---

## Pattern: scroll restoration or focus before paint

```jsx
useLayoutEffect(() => {
  listRef.current?.scrollTo(0, savedScrollTop);
}, [items]);
```

Same idea as **auto-focus** on mount: run after the input exists in the DOM, before the user sees the wrong scroll position or focus target.

---

## When to reach for `useLayoutEffect` (decision tree)

```text
Need to run something after render?
│
├─ Triggered directly by a user event (save, click)?
│     └─► event handler (Rule #1)
│
├─ Subscribing to external store with getSnapshot?
│     └─► useSyncExternalStore (Rule #4)
│
├─ Sync with outside system, paint timing doesn't matter?
│     └─► useEffect (default)
│
└─ Must read layout / sync DOM before user sees wrong pixels?
      ├─ Can fix with CSS or render-only state?
      │     └─► prefer that — no layout effect
      └─► useLayoutEffect (keep body fast)
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Heavy work in **layout** effect | **Blocks paint** — jank and worse INP |
| Using layout effect for **data fetching** | Wrong tool; use **`useEffect`** or event handlers |
| Reading layout **during render** | Node may be missing; prefer layout effect or events |
| Defaulting to layout effect “to be safe” | Most effects should be **`useEffect`** |
