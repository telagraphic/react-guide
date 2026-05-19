# Deleting a Todo

A delete button per row. Clicking it removes that todo from the list. Same shape as toggle: parent owns the array, child emits an event.

## Goal

Each todo has a "Delete" button. Clicking it removes only that todo.

## React concepts you'll use

- `.filter` to remove one item from an array
- Handlers down, data up (same shape as toggle)
- Inline arrow handlers — see [Component conventions](/concepts/components/conventions)

## Implementation

- [ ] `TodoList` exposes a handler that takes an id and removes the matching todo from state immutably
- [ ] That handler is passed to each `<Todo />` as a prop
- [ ] Each `Todo` renders a Delete button
- [ ] Clicking Delete calls the parent handler with this row's id

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

`.filter` is the inverse of `[...todos, newTodo]`: append vs. remove, both producing new arrays.

| Operation     | Pattern                                              |
| ------------- | ---------------------------------------------------- |
| Append        | `[...todos, newTodo]`                                |
| Remove        | `todos.filter((t) => t.id !== id)`                   |
| Replace one   | `todos.map((t) => t.id === id ? next : t)`           |

Notice the asymmetry: `handleDeleteTodo` takes only an `id`, while `handleUpdateTodo` takes a whole new object. Deletion needs only the identifier; updates need the new value. Each handler accepts the smallest input that does its job.

## What you should see now

Each row has a Delete button on the right. Click it — that row disappears, the others remain. Add a new todo via the composer, then delete it — works. Toggle a row's checkbox, then delete it — also works. Each handler is independent of the others.

One feature left: editing the label of an existing todo.
