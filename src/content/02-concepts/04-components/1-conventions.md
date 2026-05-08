# Component Conventions

React lets you write components a thousand ways. These are the conventions that have become standard in modern codebases — not the only correct choices, but the ones that make code easier to read for someone new to it.

## File and component naming

- One component per file when the component is non-trivial. Named `PascalCase.jsx`.
- The default export is the component the file is named after.
- Tiny helper components used only by one parent can live in the same file as siblings or beneath the main component.

```
src/components/
  TodoList.jsx       ← default export: TodoList
  Todo.jsx           ← default export: Todo
  TodoComposer.jsx   ← default export: TodoComposer
```

## Function components only

Class components still work, but every modern code base uses function components. Hooks (`useState`, `useEffect`, …) are how you get behaviour that used to require classes.

```jsx
function Todo({ todo }) {
  return <li>{todo.label}</li>;
}
```

## Props: destructure in the signature

```jsx
function Todo({ todo, onUpdate, onDelete }) { ... }
```

Reads as a self-documenting list of what the component takes. Avoid:

```jsx
function Todo(props) {
  const todo = props.todo;
  // …
}
```

…unless you specifically need the whole `props` object (rare).

## Handler naming

Two complementary conventions:

- **Inside a component**, prefix internal handlers with `handle…`:

  ```jsx
  const handleClick = () => setOpen(true);
  ```

- **For props passed to a child**, prefix with `on…`:

  ```jsx
  <Modal onClose={handleClose} />
  ```

`on…` mirrors DOM events (`onClick`, `onChange`). `handle…` reads naturally as the verb that *does* the thing.

The provided "Final Code" in this challenge uses `handle…` for both internal handlers and prop names (`handleAddTodo`, `handleUpdateTodo`). That works, but the `on…` convention for prop names is the modern default — we'll stay consistent with whichever pattern the source uses, but in your own code `onAdd` / `onUpdate` reads more naturally.

## One responsibility per component

A good rule of thumb: a component should be describable in one sentence without using "and."

- `TodoList`: holds the array of todos and renders them.
- `Todo`: renders a single todo with its controls.
- `TodoComposer`: collects user input and emits a new todo.

The moment you say "TodoList holds the todos *and* manages the input *and* renders the list," it's time to split.

## Co-locate the handlers with the state they touch

If a piece of state lives in `TodoList`, the handlers that *update* that state live in `TodoList` too. Children receive those handlers as props.

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const handleAddTodo = (newTodo) => setTodos([...todos, newTodo]);
  return <TodoComposer handleAddTodo={handleAddTodo} />;
}
```

The child has no idea where `todos` lives. It just knows "call this when the user wants to add one." This is what people mean by **lifting state up**.

## Inline arrow functions in JSX: when is it OK?

```jsx
<button onClick={() => setOpen(true)}>Open</button>
```

This is fine for handlers that close over small amounts of state. The performance cost (a new function reference per render) only matters when the child is wrapped in `React.memo` or is inside a long list with stable identity requirements.

For anything more than one statement, name the handler:

```jsx
const handleSubmit = () => {
  validate();
  send();
  reset();
};
return <form onSubmit={handleSubmit}>…</form>;
```
