# Rendering a Static List

Before introducing state, render a hardcoded array. This isolates one concept at a time: today, "how do I get an array of objects to show up as `<li>` elements?"

## Goal

`TodoList` renders three `<Todo />` items derived from a hardcoded array, each with its own label. No state, no events, no interactivity.

## React concepts you'll use

- **Arrays of elements** — JSX accepts arrays. `{todos.map(...)}` produces one element per item.
- **`key` prop** — React's identity hint for each item in a rendered list. See [What is JSX?](/concepts/jsx/what-is-jsx).
- **Props** — `Todo` will receive its data via a `todo` prop.

## Hints

1. Define the `todos` array as a `const` inside the `TodoList` function body, above the `return`.
2. Each todo is an object: `{ id, label, completed }`.
3. Inside the `<ul>`, use `{todos.map((todo) => …)}` to produce one `<Todo />` per item.
4. Pass each todo to `<Todo />` as a `todo` prop. Set the `key` prop too.
5. In `Todo`, destructure the `todo` prop and render `todo.label` in the `<li>`.

## Try it

Render this list:

```js
[
  { id: 1, label: 'Learn React', completed: false },
  { id: 2, label: 'Learn Next.js', completed: false },
  { id: 3, label: 'Learn React Query', completed: false },
]
```

You should see three list items, each showing its label, plus the composer placeholder.

## Solution

```jsx
// src/components/Todo.jsx
export default function Todo({ todo }) {
  return <li>{todo.label}</li>;
}
```

```jsx
// src/components/TodoList.jsx
import Todo from './Todo';
import TodoComposer from './TodoComposer';

export default function TodoList() {
  const todos = [
    { id: 1, label: 'Learn React', completed: false },
    { id: 2, label: 'Learn Next.js', completed: false },
    { id: 3, label: 'Learn React Query', completed: false },
  ];

  return (
    <ul>
      <TodoComposer />
      {todos.map((todo) => (
        <Todo key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

## Why this works

Three things are happening here, all at the JSX-as-function-calls layer:

1. **`.map` returns an array of React elements**. JSX treats an array of elements just like a list of siblings — it renders each one in order.
2. **`key` is React's identity hint.** When the list changes, React uses keys to figure out which items moved, were added, or were removed, so it can update the DOM minimally. Use a stable id, never the array index.
3. **`todo` is just a prop.** `Todo` doesn't know where the data came from — it could be from a state hook, a server response, or a hardcoded array. The component is decoupled from the data source.

Notice what you *didn't* do: you didn't write any DOM-manipulation code. You described what the list looks like as a function of the array, and React figured out the rest. That declarative shape is what React buys you over manual `appendChild` calls.

## What you should see now

A `<ul>` with the composer placeholder followed by three real items: "Learn React", "Learn Next.js", "Learn React Query". Open React DevTools — you'll see one `TodoList` containing one `TodoComposer` and three `Todo` instances.

The list is still hardcoded. The next step makes it state-driven, which is the prerequisite for *changing* the list at runtime.
