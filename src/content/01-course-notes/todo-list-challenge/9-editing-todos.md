# Editing a Todo

Click "Edit" — the label becomes an editable input. Type — the label updates as you type. Click "Save" — back to display mode. This step introduces a kind of state we haven't used yet: *local component state* that doesn't belong in the parent.

## Goal

Each todo has an "Edit" / "Save" toggle. In edit mode, the label is an `<input>` and the Delete button is hidden. Typing in the input updates `todo.label` live.

## React concepts you'll use

- Local component state (per-row UI state, not lifted)
- Conditional rendering — see [Conditional rendering](/concepts/jsx/conditional-rendering)
- Reusing `handleUpdateTodo` from step 7

## Implementation

- [ ] `Todo` holds an `editing` boolean in its own state
- [ ] An Edit/Save button toggles `editing` and shows "Edit" or "Save" depending on the current value
- [ ] When editing, the label area renders an `<input>` instead of the `<span>`
- [ ] Typing in the input updates `todo.label` via the same parent handler used for toggling
- [ ] The Delete button is hidden while editing

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

`editing` is *transient UI state* — only meaningful while this row is being edited — so it lives inside `Todo`. Compare to `todo.label` and `todo.completed`, which are part of the data model and live in the parent's array. A useful rule: state that would matter on a server lives in the parent (the data layer); state that only matters while the user interacts with this specific row lives in the component (the view layer). Editing reuses `handleUpdateTodo` from step 7 — any field on a todo can flow through the same channel.

### Cautionary aside: the dead `useState`

The original "Final Code" had `const [completed, setCompleted] = useState(false)` in `Todo`, declared but never used (the checkbox actually read `todo.completed` from props). This is the **shadowed-parent-state** bug: two sources of truth that quietly drift. Rule of thumb: if you're about to add `useState` for a value that's already a prop, stop — use the prop directly, or lift the new requirement up to whoever owns the data.

## What you should see now

The full app works:

- **Add** a todo (composer at top).
- **Toggle** completion (checkbox per row).
- **Edit** a label (Edit → input → Save). The change persists in `TodoList`'s state.
- **Delete** a todo (Delete button per row, hidden while editing).

The Recap page collects the final code in one place and pulls out the patterns.
