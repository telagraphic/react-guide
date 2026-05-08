# Adding Todos

Two pieces have to land together: the composer needs its own state for the input field, and `TodoList` needs a handler that appends a new todo to its array. The composer doesn't know how the list works; it just calls a callback.

## Goal

Typing a label and clicking "Add Todo" appends a new todo to the list. The input clears. The "Add" button is disabled when the input is empty.

## React concepts you'll use

- **Controlled inputs** — `value={label} onChange={…}`. The component owns the input's value via state.
- **Lifting state up** — the *list* is in `TodoList`, but the *draft input text* is in `TodoComposer`. Each piece of state lives where it's needed.
- **Handlers as props** — `TodoList` gives `TodoComposer` a callback (`handleAddTodo`) that the composer invokes when the user clicks Add.
- **Immutable append** — `[...todos, newTodo]`. See [Destructuring and spread](/concepts/modern-js/destructuring-and-spread).
- **Stable IDs** — `crypto.randomUUID()` instead of `Math.random()` to avoid duplicate-key bugs.

## Hints

1. `TodoComposer` needs its own `useState` for the input value. Call it `label`.
2. Wire the input as controlled: `value={label}` and `onChange={(e) => setLabel(e.target.value)}`.
3. Disable the Add button when `label` is empty.
4. When the user clicks Add, build a todo object: `{ id: crypto.randomUUID(), label, completed: false }`. Pass it to a prop callback (`handleAddTodo`). Then clear the input.
5. In `TodoList`, declare `const handleAddTodo = (newTodo) => setTodos([...todos, newTodo])`. Pass it to `<TodoComposer handleAddTodo={handleAddTodo} />`.

## Try it

Wire the composer end-to-end: typing creates a label, clicking Add appends to the list, the input clears.

## Solution

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

  return (
    <ul>
      <TodoComposer handleAddTodo={handleAddTodo} />
      {todos.map((todo) => (
        <Todo key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

## Why this works

There's a clean split between **whose state goes where**:

- The **input field's draft text** is local to `TodoComposer`. No other component cares what's currently typed.
- The **array of todos** lives in `TodoList`. Multiple children (`Todo`, `TodoComposer`) need to interact with it, so it lives at the lowest common ancestor.

That principle has a name: **lift state to the lowest common ancestor of the components that use it.** In practice, this means: when you find yourself wanting to share state between siblings, move it to their parent.

The composer never reaches into `TodoList`'s array. Instead, it calls `handleAddTodo(newTodo)` — which is just a function reference passed down as a prop. The composer doesn't know that `handleAddTodo` calls `setTodos([...todos, newTodo])` internally. From the composer's perspective, it's just "tell my parent I want a new todo." That decoupling is what lets you swap the parent's storage (eventually a server, a context, a reducer) without touching the composer.

About the `id`: an earlier draft of this code used `Math.floor(Math.random() * 10000)` for IDs. With ~50 todos that has roughly a 25% chance of producing a duplicate — and duplicate `key` props are one of the most insidious React bugs because the symptom (state from one row appearing on another) looks like a state-update bug, not a key bug. `crypto.randomUUID()` is built into modern browsers and gives you a guaranteed-unique ID for free.

About the `[...todos, newTodo]` pattern: this is the immutable append from the [destructuring and spread page](/concepts/modern-js/destructuring-and-spread). `setTodos([...todos, newTodo])` produces a *new* array; React's `Object.is` check sees the change and re-renders. `todos.push(newTodo)` would mutate in place, the reference wouldn't change, and nothing would re-render.

## What you should see now

Type a label, click Add. The new item appears at the bottom of the list. The input clears. The button is disabled until you type something.

The checkboxes still don't do anything — fix that next.
