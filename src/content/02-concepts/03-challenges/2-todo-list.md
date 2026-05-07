# Challenge: Todo List

The classic. Tests state-as-array, controlled inputs, and immutable updates.

## Prompt

Build a `TodoList` component that:

1. Has an input where the user can type a new todo.
2. Pressing **Enter** (or clicking an "Add" button) adds the todo to a list.
3. Each todo can be toggled "done" by clicking it.
4. Each todo can be deleted via a small `×` button.

## Solution

```jsx
import { useState } from 'react';

function TodoList() {
  const [draft, setDraft] = useState('');
  const [todos, setTodos] = useState([]);

  function add() {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, done: false },
    ]);
    setDraft('');
  }

  function toggle(id) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function remove(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
        placeholder="What needs doing?"
      />
      <button onClick={add}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <span
              onClick={() => toggle(t.id)}
              style={{ textDecoration: t.done ? 'line-through' : 'none' }}
            >
              {t.text}
            </span>
            <button onClick={() => remove(t.id)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Things this exercises

- **Immutable updates.** `[...prev, new]`, `.map`, `.filter` — never mutate `todos` directly.
- **Controlled inputs.** `value` + `onChange` is React's way of owning form state.
- **Stable keys.** `crypto.randomUUID()` gives each row a stable identity.
