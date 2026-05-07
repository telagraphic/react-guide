# Building React from Scratch — Overview

The fastest way to demystify React is to build a tiny version of it yourself. This section walks through a minimal "React" in roughly 200 lines, focusing on:

1. **`createElement`** — turning JSX-like calls into a virtual DOM tree.
2. **`render`** — turning that tree into real DOM nodes.
3. **`useState`** — letting components hold state across renders.
4. **Reconciliation** — diffing two trees and only updating what changed.

## Why bother?

Reading other people's React tutorials feels like staring at a black box. Once you've written your own three-line `useState`, the real one stops being magic.

## What we're not building

- Concurrent rendering, Suspense, server components — these are real React's hard parts. We're skipping them.
- The synthetic event system. We'll use plain `addEventListener`.
- Hooks beyond `useState`. The same machinery extends to `useEffect`, `useRef`, etc., but one hook is enough to see the pattern.

## What success looks like

By the end of this section, the following will run on top of our hand-rolled "React":

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

render(<Counter />, document.getElementById('root'));
```

…and clicking the button increments the number, with no real React in the bundle.
