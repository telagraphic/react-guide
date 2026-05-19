# Toggling "Completed"

Click a checkbox; the todo flips between completed and not. The pattern is the same one you'll use for editing in step 9: produce a new object with one field changed, and a new array with that one item replaced.

## Goal

Clicking a todo's checkbox toggles its `completed` field. The UI re-renders to show the new checked state.

## React concepts you'll use

- Controlled checkboxes (same shape as step 6's text input)
- Object spread for immutable updates — see [Destructuring and spread](/concepts/modern-js/destructuring-and-spread)
- `.map` to replace one item in an array
- Handlers down, data up

## Implementation

- [ ] `TodoList` exposes a handler that takes an updated todo and replaces the matching item in state immutably
- [ ] That handler is passed to each `<Todo />` as a prop
- [ ] The checkbox in `Todo` has a real `onChange` (drop `disabled` and `readOnly`)
- [ ] When the checkbox changes, `Todo` builds a new todo object with `completed` flipped and asks the parent to apply it
- [ ] The parent's array is updated to a *new* array (not mutated)

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

Two immutable patterns stack: `{ ...todo, completed: !todo.completed }` makes a new object with one field changed, and `todos.map(t => t.id === updated.id ? updated : t)` produces a new array with that item replaced and every other reference preserved. Identity preservation is what lets React skip re-rendering unchanged rows. The conceptual move: `Todo` doesn't *update* anything itself — it builds the object it *wants* to exist and asks the parent to apply it. The parent owns the array, so the parent owns the update.

## What you should see now

Clicking any checkbox flips it. Click again — flips back. The state is real: open React DevTools, watch `TodoList`'s `State` change as you click.

Add a new todo via the composer, then check it off — the new one toggles too. That's because `handleUpdateTodo` finds the right item by `id`, regardless of where it came from.

Next: deletion.
