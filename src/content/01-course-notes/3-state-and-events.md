# State and Events

Two big ideas:

1. State is data that, when it changes, should cause the component to re-render.
2. Event handlers are how the user mutates state.

## useState

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Things to remember:

- `useState` returns `[value, setter]`.
- The setter does **not** mutate — it schedules a re-render with the new value.
- The setter accepts either a value (`setCount(5)`) or an updater (`setCount((c) => c + 1)`). Use the updater whenever the new value depends on the old one.

## Event handlers

Pass a function to a JSX event prop:

```jsx
<button onClick={handleClick}>Click</button>
```

**Don't call** the function in JSX (`onClick={handleClick()}`) — that runs it during render.

## A common gotcha

```jsx
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
};
```

This only increments by 1, because both calls capture the same `count`. Use the updater form to actually increment by 2:

```jsx
const handleClick = () => {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
};
```
