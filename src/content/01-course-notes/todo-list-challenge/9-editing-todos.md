# Editing a Todo

Click "Edit" — the label becomes an editable input. Type — the label updates as you type. Click "Save" — back to display mode. This step introduces a kind of state we haven't used yet: *local component state* that doesn't belong in the parent.

## Goal

Each todo has an "Edit" / "Save" toggle. In edit mode, the label is an `<input>` and the Delete button is hidden. Typing in the input updates `todo.label` live.

## React concepts you'll use

- **Local component state** — `editing` lives inside `Todo`, not `TodoList`. It's per-row UI state.
- **Conditional rendering** — `{editing ? <input /> : <span />}` swaps which element shows.
- **Reusing `handleUpdateTodo`** — editing the label is the same kind of update as toggling completed: produce `{ ...todo, label: e.target.value }` and ask the parent to apply it.

## Hints

1. Add `useState(false)` for `editing` inside `Todo`. Toggle it when the Edit/Save button is clicked.
2. The button label is `editing ? 'Save' : 'Edit'`.
3. While editing, render an `<input>` with `value={todo.label}` and `onChange={…}` instead of the `<span>`.
4. The `onChange` should call `handleUpdateTodo({ ...todo, label: e.target.value })` — same handler you wrote in step 7.
5. Hide the Delete button while editing: `{!editing && <button …>Delete</button>}`.

## Try it

Add edit mode. Click Edit, type a new label, click Save. Refresh the list — your edit persists in state.

## Solution

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

`TodoList.jsx` is unchanged from step 8.

## Why this works

This step is mostly about **deciding where new state lives**.

The `editing` flag is *per-row, transient UI state*. No other component cares whether row #2 is currently in edit mode. Lifting it to `TodoList` would mean either:

- a single "which row is editing" field there (forcing a "one at a time" rule), or
- a parallel array tracking each row's edit state (which is just per-row state, awkwardly stored centrally).

Both are worse than the obvious answer: keep `editing` inside `Todo`. Each `Todo` instance gets its own `editing` cell; React tracks them independently because each is a different *component instance*.

Compare that to `todo.label` and `todo.completed`, which **do** live in the parent's array. Why the difference? Because those fields are *part of the data model* — they get persisted, they get rendered as a list, they survive across the row's lifetime. `editing` is *purely about the UI* and doesn't outlive the user's edit gesture.

A useful rule: **if state would matter on a server or in a database, it lives in the parent (the data layer). If it's only meaningful while the user is interacting with this specific UI, it lives in the component (the view layer).**

The label-edit handler reuses `handleUpdateTodo` from step 7. That's the payoff of the `{ ...todo, field: newValue }` pattern: any field can be updated through the same channel. Whether it's `completed: !todo.completed` or `label: e.target.value`, the parent doesn't need a separate handler per field.

### Cautionary aside: the dead `useState`

The original "Final Code" had this in `Todo`:

```jsx
const [completed, setCompleted] = useState(false);
const [editing, setEditing] = useState(false);
```

…but `completed` and `setCompleted` were never used. The checkbox actually read `todo.completed` (from the parent), not the local `completed`. The local one was leftover code from an earlier draft.

This is a common bug: **shadowing parent state with local state**. If the original had used the local `completed` state for the checkbox, you'd see two sources of truth: the parent's `todo.completed` (what gets persisted, what shows up in the array) and the child's `completed` (what's actually rendered). They'd drift, and the bug would look like "my checkbox toggles but the data doesn't update."

Rule of thumb: if you find yourself adding `useState` for a value that's already a prop, stop. Either use the prop directly, or lift the new requirement up to whoever owns the data.

## What you should see now

The full app works:

- **Add** a todo (composer at top).
- **Toggle** completion (checkbox per row).
- **Edit** a label (Edit → input → Save). The change persists in `TodoList`'s state.
- **Delete** a todo (Delete button per row, hidden while editing).

The Recap page collects the final code in one place and pulls out the patterns.
