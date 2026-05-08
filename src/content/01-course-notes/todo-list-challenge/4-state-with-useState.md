# Holding the List in State

The visible result won't change. The mechanism does. Move the array from a plain `const` into a `useState` call so that — once we add handlers in later steps — the UI re-renders when the list changes.

## Goal

The `todos` array lives in `useState`. The rendered output is identical to step 3, but the list is now ready to be mutated.

## React concepts you'll use

- **`useState`** — see [`useState`](/concepts/hooks/usestate). Returns `[value, setter]`.
- **Initial state via the `useState` argument** — pass the starting array as the argument.
- **Why state at all** — calling the setter triggers a re-render with the new value. A `const` doesn't.

## Hints

1. Import `useState` from `'react'` (named import).
2. Replace `const todos = […]` with `const [todos, setTodos] = useState([…])`.
3. The starting array is the same one from step 3 — pass it directly as the `useState` argument.
4. You don't need `setTodos` yet. Just declaring it sets up the next step.

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

The visible result is the same, but the *machinery* is different. Some things to internalize:

- **`useState` returns the same `[value, setter]` shape every render.** The `value` (`todos`) is whatever it was last set to; the `setter` (`setTodos`) is stable across renders.
- **The argument to `useState` is only used on the first render.** It's the *initial* value. After that, the value comes from whatever `setTodos` was last called with.
- **Calling `setTodos(newArray)` schedules a re-render.** It does *not* mutate the array, and it does *not* change `todos` synchronously in the current render. The new value shows up on the next render.

If you tried to mutate the array in place — `todos.push(newTodo)` — React wouldn't notice. The reference is the same, so React's `Object.is` check sees no change, and nothing re-renders. **You must produce a new array** (via `[...todos, newTodo]` or `.filter` or `.map`) for state updates to register. We'll lean on this in every step from here on.

The reason `useState` exists at all is so React can tie a *component instance* to a piece of memory across renders. A plain `let todos = [...]` declared inside the function body would be reinitialized every render — useless for anything that needs to change over time.

## What you should see now

The same three list items as step 3. Open React DevTools and click on `TodoList` — you should now see a `State` entry showing the array. That's the new memory cell `useState` carved out.

The list is still effectively read-only. The next step extracts a clean `<Todo />` component so we have somewhere to add interactivity in steps 6+.
