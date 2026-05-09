# Adding Todos

Two pieces have to land together: the composer needs its own state for the input field, and `TodoList` needs a handler that appends a new todo to its array. The composer doesn't know how the list works; it just calls a callback.

## Goal

Typing a label and clicking "Add Todo" appends a new todo to the list. The input clears. The "Add" button is disabled when the input is empty.

## React concepts you'll use

- Controlled inputs
- Lifting state up — see [Component conventions](/concepts/components/conventions)
- Handlers passed as props
- Immutable append — see [Destructuring and spread](/concepts/modern-js/destructuring-and-spread)
- Stable IDs (`crypto.randomUUID()`)

## Implementation

- [ ] `TodoComposer` holds the current input draft in its own state
- [ ] The input is controlled (its value comes from state, typing updates state)
- [ ] The Add button is disabled while the input is empty
- [ ] Clicking Add creates a new todo with a unique id, the current draft as its label, and `completed: false`
- [ ] After adding, the input clears
- [ ] `TodoList` provides a handler that appends a new todo to its state, immutably
- [ ] That handler is passed to `TodoComposer` as a prop, and `TodoComposer` calls it on Add

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

The two pieces of state live where they're each needed: the input draft is local to `TodoComposer` (no one else cares); the array lives in `TodoList` (multiple children need it). When state is shared between siblings, lift it to their lowest common ancestor — that's `TodoList`. The composer never writes to the array; it calls the prop callback the parent gave it. `[...todos, newTodo]` produces a new array reference, which is what triggers React's re-render — `todos.push` mutates in place and would do nothing. `crypto.randomUUID()` replaces `Math.random()` to avoid duplicate keys, which look like state-update bugs and are notoriously hard to diagnose.

## What you should see now

Type a label, click Add. The new item appears at the bottom of the list. The input clears. The button is disabled until you type something.

The checkboxes still don't do anything — fix that next.
