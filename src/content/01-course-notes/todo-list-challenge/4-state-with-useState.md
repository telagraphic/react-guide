# Holding the List in State

The visible result won't change. The mechanism does. Move the array from a plain `const` into a `useState` call so that — once we add handlers in later steps — the UI re-renders when the list changes.

## Goal

The `todos` array lives in `useState`. The rendered output is identical to step 3, but the list is now ready to be mutated.

## React concepts you'll use

- `useState` — see [`useState`](/concepts/hooks/usestate)
- Initial state via the `useState` argument
- Why state at all (a `const` doesn't trigger re-renders)

## Implementation

- [ ] `useState` is imported from `react`
- [ ] The todos array is held in `useState` instead of a plain `const`
- [ ] The initial value of state is the same array from step 3
- [ ] The setter is destructured but not yet called (later steps use it)
- [ ] The rendered output is identical to step 3

## Try it

Convert the hardcoded array into `useState`. The page should look unchanged.

## Solution

```jsx
// src/components/TodoList.jsx
import { useState } from 'react';
import Todo from './Todo';
import TodoComposer from './TodoComposer';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, label: 'Learn React', completed: false },
    { id: 2, label: 'Learn Next.js', completed: false },
    { id: 3, label: 'Learn React Query', completed: false },
  ]);

  return (
    <ul>
      <TodoComposer />
      {todos.map((todo) => (
        <Todo key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

## Why this works

`useState` ties a piece of memory to the component across renders — a plain `let` would reset every render. The argument is only used on the first render; after that, the value comes from whatever the setter was last called with. Calling the setter schedules a re-render; it doesn't change `todos` in the current render, and it doesn't mutate. Every state update from here on produces a *new* array (`[...todos, x]`, `.filter`, `.map`), never an in-place mutation — React detects changes by reference equality, so a new reference is non-negotiable.

## What you should see now

The same three list items as step 3. Open React DevTools and click on `TodoList` — you should now see a `State` entry showing the array. That's the new memory cell `useState` carved out.

The list is still effectively read-only. The next step extracts a clean `<Todo />` component so we have somewhere to add interactivity in steps 6+.
