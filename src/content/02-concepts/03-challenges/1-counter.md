# Challenge: Counter

A warm-up challenge. The goal is to build the smallest possible interactive component end-to-end.

## Prompt

Build a `Counter` component that:

1. Renders a button.
2. The button's text shows the current count, starting at `0`.
3. Clicking the button increments the count by 1.

## Solution

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {count}
    </button>
  );
}
```

## Why the updater form?

Using `setCount((c) => c + 1)` instead of `setCount(count + 1)` is the safer default — if you ever batch multiple updates in one event handler, only the updater form composes correctly.

## Stretch goals

- Add a "reset" button.
- Make the step size configurable via a prop: `<Counter step={5} />`.
- Persist the count to `localStorage` so it survives a page reload.
