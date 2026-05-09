# Extracting `<Todo />`

You already extracted `Todo` into its own file in step 2 and pass it a `todo` prop in step 3. This step is about *what makes that decomposition worth it* — the seams it creates for the next several steps to work cleanly.

## Goal

`Todo` renders the per-item structure that all later features (checkbox, edit input, delete button) will hang off of. `TodoList` keeps the list-level concerns: the array, eventually the handlers.

## React concepts you'll use

- Single-responsibility components — see [Component conventions](/concepts/components/conventions)
- Props as the interface between parent and child
- Destructuring in the parameter list

## Implementation

- [ ] `Todo` renders a `<label>` wrapping a checkbox input and a span containing the label
- [ ] The checkbox's checked state mirrors the todo's `completed` field
- [ ] The checkbox is disabled (and read-only) so React doesn't warn about a controlled input without `onChange`
- [ ] The `<label>` and the checkbox are linked via matching `id` / `htmlFor`
- [ ] `Todo` holds no internal state yet — same `todo` in, same DOM out

## Try it

Expand `Todo` so each list item shows a checkbox (visible, disabled) followed by the todo's label. The TodoList itself doesn't need to change.

## Solution

```jsx
// src/components/Todo.jsx
export default function Todo({ todo }) {
  return (
    <li>
      <label htmlFor={todo.id}>
        <input
          type="checkbox"
          id={todo.id}
          checked={todo.completed}
          disabled
          readOnly
        />
        <span>{todo.label}</span>
      </label>
    </li>
  );
}
```

```jsx
// src/components/TodoList.jsx — unchanged from step 4
```

## Why this works

Splitting list-level concerns (the array, eventually the handlers) from item-level concerns (rendering a row, eventually its checkbox/edit/delete events) is what lets each remaining step be one small change. `Todo` becomes a pure function of its `todo` prop — same input, same DOM. The `disabled` + `readOnly` on the checkbox silences a React warning about controlled inputs without `onChange`; both drop in step 7 when a real handler arrives.

## What you should see now

Each list item is now a checkbox followed by its label. The checkboxes are visible but unclickable. `<TodoComposer />` is still a placeholder.

Step 6 wires up the composer so you can add new todos.
