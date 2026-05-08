# Recap

The full final code, plus a tour of the patterns that show up across React apps generally.

## Final code

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

```jsx
// src/components/TodoComposer.jsx
import { useState } from 'react';

function createTodo(label) {
  return {
    id: crypto.randomUUID(),
    label,
    completed: false,
  };
}

export default function TodoComposer({ handleAddTodo }) {
  const [label, setLabel] = useState('');

  const handleUpdateLabel = (e) => setLabel(e.target.value);

  const handleAddTodoClick = () => {
    handleAddTodo(createTodo(label));
    setLabel('');
  };

  return (
    <li>
      <input
        placeholder="Add a new todo"
        type="text"
        value={label}
        onChange={handleUpdateLabel}
      />
      <button
        disabled={label.length === 0}
        onClick={handleAddTodoClick}
      >
        Add Todo
      </button>
    </li>
  );
}
```

```jsx
// src/components/Todo.jsx
import { useState } from 'react';

export default function Todo({ todo, handleUpdateTodo, handleDeleteTodo }) {
  const [editing, setEditing] = useState(false);

  const handleCheckboxClick = () =>
    handleUpdateTodo({ ...todo, completed: !todo.completed });

  const handleEditClick = () => setEditing(!editing);

  const handleEditTodo = (e) =>
    handleUpdateTodo({ ...todo, label: e.target.value });

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
        {editing ? (
          <input
            type="text"
            value={todo.label}
            onChange={handleEditTodo}
          />
        ) : (
          <span>{todo.label}</span>
        )}
      </label>
      <button onClick={handleEditClick}>{editing ? 'Save' : 'Edit'}</button>
      {!editing && <button onClick={handleDeleteClick}>Delete</button>}
    </li>
  );
}
```

## Patterns to internalize

### 1. Data down, handlers up

The parent owns state. It passes data down via props (`todo`) and handlers down via props (`handleUpdateTodo`, `handleDeleteTodo`). Children call those handlers when something needs to change. They never reach into the parent's state directly.

This is the most important shape in React. Every time you find yourself wanting a child to "modify state in the parent," the answer is: pass a callback.

### 2. Lift state to the lowest common ancestor

The array of todos lives in `TodoList`, not `Todo`, because two children (`Todo` and `TodoComposer`) need it. The input draft lives in `TodoComposer`, not `TodoList`, because nothing else needs it. The `editing` flag lives in `Todo`, not `TodoList`, because it's per-row UI state.

Where state lives is a *design* decision. Get it right and the rest of the code falls out. Get it wrong and you fight the framework.

### 3. Immutable updates

Three patterns, used everywhere:

```js
[...arr, item]                                   // append
arr.filter((x) => x.id !== id)                   // remove
arr.map((x) => x.id === id ? { ...x, field: v } : x)  // update one
```

React detects state changes by reference equality. Mutating in place (`arr.push`, `obj.field = v`) doesn't change the reference, so React doesn't re-render. New references are non-negotiable.

### 4. Controlled inputs

For every form input you care about, render `value` from state and update state in `onChange`. The component owns the value; the DOM is just a mirror.

```jsx
<input value={label} onChange={(e) => setLabel(e.target.value)} />
```

### 5. Conditional rendering

```jsx
{editing ? <input … /> : <span>{todo.label}</span>}
{!editing && <button>Delete</button>}
```

Ternary for "A or B"; logical-AND for "A or nothing." JSX is just expressions, so any expression that returns an element (or `null`) works.

## Common pitfalls (and where this walkthrough cleaned them up)

| Pitfall                             | What it looks like                                                  | Fix                                          |
| ----------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| **Duplicate keys**                  | `Math.random() * 10000` for IDs → collisions at scale               | `crypto.randomUUID()` (step 6)               |
| **Shadowed parent state**           | `const [completed, setCompleted] = useState(...)` next to `todo.completed` | Read `todo.completed` directly (step 9)      |
| **Mutated state**                   | `todos.push(newTodo); setTodos(todos)` — same reference, no re-render | `setTodos([...todos, newTodo])`              |
| **Uncontrolled-then-controlled input** | `<input value={undefined} … />` then later setting a value          | Initialize state to `''` from day one         |
| **Missing `onChange` on `checked` input** | React warns "you provided `checked` without `onChange`"           | Add the real handler in step 7                |
| **Index as key**                    | `todos.map((t, i) => <Todo key={i} … />)`                           | Use a stable id; index breaks when rows reorder |

## Where to go from here

- **Add persistence.** Wrap `setTodos` in a function that also writes to `localStorage`, and read from `localStorage` as the initial value of `useState`. The function-form initializer is in [`useState`](/concepts/hooks/usestate).
- **Switch to `useReducer`.** Once you have four handlers (`add`, `update`, `delete`, plus a future `clearCompleted` or `reorder`), `useReducer` consolidates the update logic into one `dispatch(action)` call. Same data model; cleaner shape.
- **Extract a `useTodos` custom hook.** Wraps `useState` + the four handlers and returns `{ todos, add, update, delete }`. `TodoList` becomes a pure rendering component; the *behavior* is reusable.
- **Add filters.** "Show all / active / completed" derives from the same `todos` state — no new state, just a `useState('all')` for the filter and a `.filter(...)` on the rendered list. Practice in derivative state.

Each of those is a half-day of focused work and teaches one new React pattern. Pick one, do it from scratch, then come back to the recap.
