# useRef

## What `useRef` is in React

`useRef(initialValue)` returns a **plain mutable object** React guarantees is the **same instance on every render** for that hook slot: `{ current: initialValue }`. Updating **`ref.current = something` does not schedule a re-render** — unlike `setState`, React does not treat `.current` writes as “something the UI might need to read again.” That makes refs good for **values that should survive renders but should not drive them**: previous props, timer ids, or the imperative handle to a DOM node.

For **DOM**, you usually assign `ref.current` to the element (via a callback ref or `useEffect` after mount in older patterns) so code outside render — event handlers, effects — can call things like `.focus()` or read `.scrollHeight` without storing the node in state.

The React snippet below pairs `useState` with `useRef`: state still drives full re-renders; the ref holds a tick counter you bump **without** `setState` (in real React you would still need *some* update path to show the new tick in JSX — here we keep the lesson honest in the vanilla half by updating one DOM node by hand, same as you might in an escape hatch).


## React (reference)

```jsx
import { useRef, useState } from 'react';

function Demo() {
  const [count, setCount] = useState(0);
  const tickRef = useRef(0);
  const inputRef = useRef(null);

  return (
    <>
      <p>state count: {count}</p>
      <p>ref ticks: {tickRef.current}</p>
      <input ref={inputRef} type="text" placeholder="DOM ref focuses here" />
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        increment state (re-render)
      </button>
      <button
        type="button"
        onClick={() => {
          tickRef.current += 1;
        }}
      >
        increment ref only (no re-render — UI for ticks stays stale in React)
      </button>
      <button type="button" onClick={() => inputRef.current?.focus()}>
        focus input
      </button>
    </>
  );
}
```

In real React, the middle button only mutates `tickRef.current`; the line that **displays** `tickRef.current` does not update until something else (here: `setCount`) causes a re-render. The vanilla demo makes the contrast clearer by **patching** the ref line in the click handler so you can see the new tick **without** a full `paint()`.

---

## Vanilla implementation

Same `let count` + `paint()` pattern for **state**. For **refs**, use two objects created **once** outside `paint`: `{ current: … }`. That is the same shape `useRef` hands you. Mutating `tickRef.current` does not call `paint()`; we update the paragraph that shows ticks by finding it in the host and setting `textContent`. **`inputRef.current`** is reassigned **inside** each `paint()` to whatever `<input>` we just created — same idea as React committing a new input node and wiring the ref field.

```javascript
export function mountLesson03(host) {
  let count = 0;

  const tickRef = { current: 0 };
  const inputRef = { current: null };

  function paint() {
    host.replaceChildren();

    const pState = document.createElement('p');
    pState.textContent = `state count: ${count}`;

    const pRef = document.createElement('p');
    pRef.dataset.refLine = '1';
    pRef.textContent = `ref ticks: ${tickRef.current}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'DOM ref focuses here';
    inputRef.current = input;

    const btnState = document.createElement('button');
    btnState.type = 'button';
    btnState.textContent = 'increment state (full paint)';
    btnState.addEventListener('click', () => {
      count += 1;
      paint();
    });

    const btnRef = document.createElement('button');
    btnRef.type = 'button';
    btnRef.textContent = 'increment ref only (no paint)';
    btnRef.addEventListener('click', () => {
      tickRef.current += 1;
      const line = host.querySelector('[data-ref-line="1"]');
      if (line) line.textContent = `ref ticks: ${tickRef.current}`;
    });

    const btnFocus = document.createElement('button');
    btnFocus.type = 'button';
    btnFocus.textContent = 'focus input (ref.current.focus)';
    btnFocus.addEventListener('click', () => {
      inputRef.current?.focus();
    });

    host.append(pState, pRef, input, btnState, btnRef, btnFocus);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## What this vanilla code is doing (step by step)

### `tickRef` and `inputRef` — stable boxes

Both are created when `mountLesson03` runs and **never replaced**. Only their **`.current` fields** change. That matches **`useRef`**: React stores one object per ref slot and reuses it; you mutate `.current`.

### `paint()` — state path vs ref path

- **`count` and `btnState`** — same as lesson 01: changing `count` calls **`paint()`**, which rebuilds every node under `host`. All text reflects the latest `count` and the latest `tickRef.current` (because the ref line is recreated from `tickRef.current` on each paint).

- **`btnRef`** — increments **`tickRef.current`** only. No `paint()`. The ref paragraph would stay visually wrong **unless** we manually set `textContent` on that node. That manual patch is the vanilla spelling of “I changed something React is not going to re-read until the next render.”

- **`inputRef.current = input`** — each full paint creates a **new** `<input>` DOM node (because we wiped `host`). The ref must point at the **live** node; assigning after `createElement` is the same responsibility React’s commit phase has when it sets `ref.current` on the instance that was just mounted or updated.

### `btnFocus` — imperative DOM without state

`inputRef.current?.focus()` does not need `count` or `paint()`. It is exactly the kind of **imperative** work refs are for: talk to the browser API on the node you already hold.

---

## Mapping in one glance

| React | This vanilla |
|--------|----------------|
| `useRef(0)` | `const tickRef = { current: 0 }` created once |
| `useRef(null)` for DOM | `inputRef` + assign `inputRef.current = input` each `paint()` |
| `ref.current++` without `setState` | Same; optional manual DOM patch to show new value |
| Re-render | `paint()` after `count` changes |

---

## Checklist

- [ ] Explain why **`tickRef`** is not recreated inside `paint()`.
- [ ] Explain why **`inputRef.current`** *is* reassigned inside `paint()`.
- [ ] Contrast **`count += 1; paint()`** with **`tickRef.current += 1`** (no `paint()`).

---

## Not in this lesson

Callback ref APIs, ref forwarding, `useImperativeHandle`. See [../REQUIREMENTS.md](../REQUIREMENTS.md) for the wider track.
