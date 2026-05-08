# Deleting a Todo

A delete button per row. Clicking it removes that todo from the list. Same shape as toggle: parent owns the array, child emits an event.

## Goal

Each todo has a "Delete" button. Clicking it removes only that todo.

## React concepts you'll use

- **`.filter` for "remove one item"** — produces a new array with the matching item gone.
- **Handlers down, data up** — same pattern as toggle, just a different verb.
- **Inline arrow handler** — `onClick={() => handleDeleteTodo(todo.id)}` — fine here because the closure is one statement; see [Component conventions](/concepts/components/conventions).

## Hints

1. In `TodoList`, write `handleDeleteTodo(id)`. Use `.filter` to keep all todos except the one with that id.
2. Pass `handleDeleteTodo` to `<Todo />` as a prop.
3. In `Todo`, add a `<button>` with `onClick={() => handleDeleteTodo(todo.id)}`.
4. Render the button next to (or below) the checkbox/label group.

## Try it

Add a Delete button to each row. Clicking it removes that row.

## Solution

```jsx
// src/components/Todo.jsx
export default function Todo({ todo, handleUpdateTodo, handleDeleteTodo }) {
  const handleCheckboxClick = () =>
    handleUpdateTodo({ ...todo, completed: !todo.completed });

  const handleDeleteClick = () => handleDeleteTodo(todo.id);

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
      <button onClick={handleDeleteClick}>Delete</button>
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

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <ul>
      <TodoComposer handleAddTodo={handleAddTodo} />
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          handleUpdateTodo={handleUpdateTodo}
          handleDeleteTodo={handleDeleteTodo}
        />
      ))}
    </ul>
  );
}
```

## Why this works

`.filter` is the inverse of `[...todos, newTodo]` from step 6. They're the two halves of "modify a list immutably":

| Operation         | Pattern                               |
| ----------------- | ------------------------------------- |
| Append            | `[...todos, newTodo]`                 |
| Remove            | `todos.filter((t) => t.id !== id)`    |
| Replace one       | `todos.map((t) => t.id === id ? new : t)` |

All three return a *new* array. None of them mutate `todos`.

The shape of `handleDeleteTodo(id)` is worth noticing: it takes an `id` argument, not the whole todo object. That's because deletion only needs the identifier — there's no "new state" to construct, just an item to remove. Compare to `handleUpdateTodo(updatedTodo)`, which needs the full new object because the caller is the one *building* the change.

A subtle rule that holds across all three handlers: **the child decides what should happen, the parent decides how to record it.** `Todo` knows "the user clicked delete on me." It doesn't know `setTodos` exists. `TodoList` knows the array. It doesn't know which row was clicked until told. Each component sees only what it needs to do its job.

## What you should see now

Each row has a Delete button on the right. Click it — that row disappears, the others remain. Add a new todo via the composer, then delete it — works. Toggle a row's checkbox, then delete it — also works. Each handler is independent of the others.

One feature left: editing the label of an existing todo.
