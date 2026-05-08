# Extracting `<Todo />`

You already extracted `Todo` into its own file in step 2 and pass it a `todo` prop in step 3. This step is about *what makes that decomposition worth it* — the seams it creates for the next several steps to work cleanly.

## Goal

`Todo` renders the per-item structure that all later features (checkbox, edit input, delete button) will hang off of. `TodoList` keeps the list-level concerns: the array, eventually the handlers.

## React concepts you'll use

- **Single-responsibility components** — see [Component conventions](/concepts/components/conventions).
- **Props as the interface** — `Todo` receives data; later it'll also receive callbacks. The shape of the props *is* the contract.
- **Destructuring in the parameter list** — `function Todo({ todo })` reads the `todo` prop from the props object.

## Hints

1. `Todo` already takes a `todo` prop and renders `todo.label`. Now expand its return to a richer structure that future steps can extend.
2. Render a `<label>` containing a checkbox and a span with the label. The checkbox should be `disabled` for now (we'll wire it up in step 7).
3. `<label htmlFor={…}>` needs a matching `id` on the input. Use `todo.id` for both.
4. Don't add any state to `Todo` yet. It's a pure rendering component — same `todo` in, same DOM out.

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

The decomposition is doing two things simultaneously:

1. **It separates "list-level" from "item-level" concerns.** Anything that varies per item — checkbox state, edit mode, delete button — lives in `Todo`. Anything that operates on the array as a whole — adding, deleting, the `useState` call — lives in `TodoList`. That clean cut is what makes the next steps short.

2. **It defines a *contract* via props.** `Todo` says: "give me a `todo` object and I'll render it." That's a small, stable interface. Later steps will widen the contract (`Todo` will also accept `handleUpdateTodo` and `handleDeleteTodo`) but the principle holds: the parent talks to the child only through props.

About the `disabled` + `readOnly` on the checkbox: React will warn if you set `checked` on a checkbox without an `onChange` handler, because that's normally a controlled-component bug. Adding `readOnly` tells React "I know, this is intentional for now." Step 7 wires up the real `onChange` and we drop both attributes.

If you skipped this step and went straight from "static list" to "toggle checkbox," `TodoList` would end up doing both list management *and* per-item rendering. That's the "and" smell from the [conventions page](/concepts/components/conventions) — it's why we split now, before things get more complex.

## What you should see now

Each list item is now a checkbox followed by its label. The checkboxes are visible but unclickable. `<TodoComposer />` is still a placeholder.

Step 6 wires up the composer so you can add new todos.
