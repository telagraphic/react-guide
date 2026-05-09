# Setup

Before writing any logic, create the file structure. Stubbing the components first means the imports work end-to-end on day one, and each later step is just filling in the bodies.

## Goal

Three component files, each rendering a placeholder, wired together so a stub `<TodoList />` shows up when you run the app.

## What you'll do

In your scratch React project, create three files in `src/components/`:

```
src/components/
  TodoList.jsx
  Todo.jsx
  TodoComposer.jsx
```

Each owns one job:

| Component       | Owns                                                       |
| --------------- | ---------------------------------------------------------- |
| `TodoList`      | The array of todos, the handlers that mutate it            |
| `Todo`          | Rendering one item; emitting toggle/edit/delete events     |
| `TodoComposer`  | The input field for typing a new todo, and the "Add" button |

Then import `TodoList` somewhere in your app and render it.

## Implementation

- [ ] Three component files exist: `TodoList.jsx`, `Todo.jsx`, `TodoComposer.jsx`
- [ ] Each is a default export
- [ ] `Todo` and `TodoComposer` each render a placeholder `<li>`
- [ ] `TodoList` renders a `<ul>` containing one `<TodoComposer />` and one `<Todo />`
- [ ] `TodoList` is mounted somewhere in your app and visible on the page

## Try it

Stub each component so that:

- `TodoList` renders a `<ul>` containing one `<TodoComposer />` and a single hardcoded `<Todo />`.
- `TodoComposer` renders an `<li>` with the text "composer goes here".
- `Todo` renders an `<li>` with the text "todo goes here".

Run the app. You should see a list with two items.

## Solution

```jsx
// src/components/TodoComposer.jsx
export default function TodoComposer() {
  return <li>composer goes here</li>;
}
```

```jsx
// src/components/Todo.jsx
export default function Todo() {
  return <li>todo goes here</li>;
}
```

```jsx
// src/components/TodoList.jsx
import Todo from './Todo';
import TodoComposer from './TodoComposer';

export default function TodoList() {
  return (
    <ul>
      <TodoComposer />
      <Todo />
    </ul>
  );
}
```

In whatever your app entry is:

```jsx
import TodoList from './components/TodoList';

export default function App() {
  return <TodoList />;
}
```

## Why this works

Stubbing all three files first means imports work end-to-end before any logic exists. The shape — `TodoList` as parent, `Todo` and `TodoComposer` as siblings — is the structural decision the rest of the walkthrough builds on.

## What you should see now

A page with a `<ul>` containing two list items: "composer goes here" and "todo goes here". No interactivity yet. The next step adds real data.
