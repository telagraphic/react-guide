# Rendering a Static List

Before introducing state, render a hardcoded array. This isolates one concept at a time: today, "how do I get an array of objects to show up as `<li>` elements?"

## Goal

`TodoList` renders three `<Todo />` items derived from a hardcoded array, each with its own label. No state, no events, no interactivity.

## React concepts you'll use

- Arrays of elements in JSX
- The `key` prop — see [What is JSX?](/concepts/jsx/what-is-jsx)
- Props

## Implementation

- [ ] `TodoList` declares an array of three todo objects
- [ ] Each todo has at least: an id, a label, and a completed flag
- [ ] The array is iterated to render one `<Todo />` per todo
- [ ] Each rendered `<Todo />` has a unique key
- [ ] Each rendered `<Todo />` receives its todo data as a prop
- [ ] `Todo` reads its prop and displays the label

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

`.map` returns an array of React elements; JSX renders those siblings in order. The `key` prop tells React's reconciler which item is which when the array changes — use a stable id, never the array index. `Todo` doesn't know where its data came from; it just renders whatever todo it's given, which is what makes it reusable in every step from here on.

## What you should see now

A `<ul>` with the composer placeholder followed by three real items: "Learn React", "Learn Next.js", "Learn React Query". Open React DevTools — you'll see one `TodoList` containing one `TodoComposer` and three `Todo` instances.

The list is still hardcoded. The next step makes it state-driven, which is the prerequisite for *changing* the list at runtime.
