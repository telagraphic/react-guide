# Toggling "Completed"

Click a checkbox; the todo flips between completed and not. The pattern is the same one you'll use for editing in step 9: produce a new object with one field changed, and a new array with that one item replaced.

## Goal

Clicking a todo's checkbox toggles its `completed` field. The UI re-renders to show the new checked state.

## React concepts you'll use

- **Controlled checkboxes** — `checked={todo.completed} onChange={…}`. Same pattern as the text input from step 6.
- **Object spread for immutable updates** — `{ ...todo, completed: !todo.completed }`. New object, one field overridden.
- **`.map` for "replace one item in an array"** — produces a new array where the matching item is the new object and everything else is unchanged.
- **Handlers down, data up** — `Todo` calls a callback; the parent decides what to do with the new value.

## Hints

1. In `TodoList`, write `handleUpdateTodo(updatedTodo)`. It uses `.map` to replace the todo with the matching `id` and leave the rest alone.
2. Pass `handleUpdateTodo` to `<Todo />` as a prop.
3. In `Todo`, write `handleCheckboxClick` — it calls `handleUpdateTodo({ ...todo, completed: !todo.completed })`.
4. Wire it to the checkbox via `onChange={handleCheckboxClick}`.
5. Drop the `disabled` and `readOnly` attributes from the checkbox now that it has a real `onChange`.

## Try it

Make the checkboxes interactive. Clicking a todo's checkbox flips its completion state.

## Solution

```jsx
// src/components/Todo.jsx
export default function Todo({ todo, handleUpdateTodo }) {
  const handleCheckboxClick = () =>
    handleUpdateTodo({ ...todo, completed: !todo.completed });

  return (
    <li>
      <label htmlFor={todo.id}>
        <input
          type="checkbox"
          id={todo.id}
          checked={todo.completed}
          onChange={handleCheckboxClick}
        />
        <span>{todo.label}</span>
      </label>
    </li>
  );
}
```

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

  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  const handleUpdateTodo = (updatedTodo) => {
    setTodos(
      todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
    );
  };

  return (
    <ul>
      <TodoComposer handleAddTodo={handleAddTodo} />
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          handleUpdateTodo={handleUpdateTodo}
        />
      ))}
    </ul>
  );
}
```

## Why this works

This is the central state-update pattern in React, and you'll use it everywhere. It comes in two layers:

**Layer 1 — new object, one field changed:**

```js
{ ...todo, completed: !todo.completed }
```

The spread copies every property from `todo`, then `completed: !todo.completed` overwrites the one field we want to change. The original `todo` is untouched. This is *the* immutable update pattern for objects.

**Layer 2 — new array, one item replaced:**

```js
todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
```

`.map` produces a new array. For the matching todo it returns the *new* object; for every other todo it returns the *same* reference. That preserves identity for unchanged items, which means React's reconciler won't re-render them — only the one that changed.

The conceptual move worth internalizing: `Todo` doesn't *update* anything itself. It builds the new object it *wants* to exist (`{ ...todo, completed: !todo.completed }`) and asks its parent to apply it. The parent owns the array, so the parent owns the update.

This is "data down, handlers up": the parent passes data (`todo`) and handlers (`handleUpdateTodo`) down through props, and the child invokes the handler when something needs to change. The child has no idea where the data is stored, and it stays a pure function of its inputs.

## What you should see now

Clicking any checkbox flips it. Click again — flips back. The state is real: open React DevTools, watch `TodoList`'s `State` change as you click.

Add a new todo via the composer, then check it off — the new one toggles too. That's because `handleUpdateTodo` finds the right item by `id`, regardless of where it came from.

Next: deletion.
