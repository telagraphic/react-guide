# React Data Flow Patterns

React doesn't ship a "state management framework." It ships a small toolkit of named design patterns whose composition gives you data flow, state ownership, and event handling all at once. The Todo List walkthrough is built entirely out of five of them.

This page names each pattern, points at its classical roots, and shows where it shows up in [the recap code](/course-notes/todo-list-challenge/recap).


In React, your view is a function of your state – both of which you encapsulate inside of a component. To get your application, you compose all of your components together.

To get data down the component tree, you use props. To get data up the component tree, you use callbacks.

Sometimes you need to do things that don't fit into this regular React paradigm, these are called side effects and React provides some escape hatches for these scenarios.

If you have a side effect that is triggered by an event, put it in an event handler. If you have a side effect that is synchronizing your component with some outside system, put it inside of useEffect. If you need to preserve a value across renders, but that value has nothing to do with the view, and therefore, React doesn't need to re-render when it changes, put it in a ref using useRef.



## Summary

| Pattern | Classical name | React mechanism | Problem it solves |
| --- | --- | --- | --- |
| **Unidirectional data flow** | Top-down propagation | Props are read-only; data only flows parent → child | Predictable state path; you can always trace where a value came from |
| **State lifting** | Single source of truth | `useState` in the lowest common ancestor of the components that need the state | No drift between siblings; one writer, many readers |
| **Data down, handlers up** | Inversion of control (Hollywood Principle) | Callback props passed from parent to child | Children trigger state changes without knowing or owning the state |
| **Controlled components** | Mediator | `value` + `onChange` paired on inputs | React state is the source of truth; DOM is just a view |
| **Immutable updates** | Value semantics / persistent data | Spread, `map`, `filter` on state values | New reference signals "something changed" so React re-renders |

The remaining sections work through each pattern in order. The last section, [How they compose](#how-they-compose), traces a single user action through all five at once.

## 1. Unidirectional data flow

The umbrella pattern. Data flows in one direction: parent → child via props. There is no opposite channel — no two-way binding, no `$emit` from child to parent, no shared mutable container both can write to. The only way "back up" is to call a function the parent handed you, which puts you back inside the parent's code.

**React mechanism**: props are immutable function arguments.

```jsx
<Todo
  todo={todo}                         // data flowing down
  handleUpdateTodo={handleUpdateTodo} // upward channel, but it's the parent's function
  handleDeleteTodo={handleDeleteTodo}
/>
```

**Why it matters**: at any point you can answer "where does this value come from?" by walking up the tree. You never have to reason about a grandchild secretly mutating a grandparent's state — because there's no API for that.

## 2. State lifting (single source of truth)

The classical name is **single source of truth**: every piece of state lives in exactly one place. React's phrasing is "lift state up to the lowest common ancestor of the components that need it."

**React mechanism**: `useState` placed at the lowest level where multiple children need the same data.

From the recap, three different state values, three different homes:

- `todos` lives in `TodoList` — both `Todo` and `TodoComposer` need to read or change it.
- `label` (the input draft) lives in `TodoComposer` — nothing outside that component cares.
- `editing` lives in `Todo` — it's per-row UI state.

**Why it matters**: state placed too high causes unnecessary re-renders and prop drilling. State placed too low means siblings can't agree on what's true. The right answer is always "the lowest node that has visibility into every component that reads or writes this value."

## 3. Data down, handlers up (inversion of control)

The classical name is **Inversion of Control**, sometimes called the Hollywood Principle: *don't call us, we'll call you*. The child doesn't know who handles its events. It just invokes the function it was given. The *parent* injects the strategy.

**React mechanism**: callback props.

```jsx
// Parent (TodoList) — owns the state and the "what does delete mean" logic
const handleDeleteTodo = (id) => {
  setTodos(todos.filter((todo) => todo.id !== id));
};

return <Todo todo={todo} handleDeleteTodo={handleDeleteTodo} />;

// Child (Todo) — owns the UI, doesn't own deletion
const handleDeleteClick = () => handleDeleteTodo(todo.id);

return <button onClick={handleDeleteClick}>Delete</button>;
```

This is also where the *"child further customizes the handler with UI logic"* shape comes from. The parent gives you `handleDeleteTodo(id)` — generic over any todo. The child wraps it in `handleDeleteClick`, a closure that knows *which* row this is. The child contributes the local context (`todo.id`); the parent contributes the global behavior (filter the array).

**Why it matters**: the child is decoupled from *what* deletion means in this app. Swap `TodoList` for a `TrashView` that recovers todos instead of removing them, and `Todo` itself doesn't change. This is the same shape as the Strategy pattern at runtime — except instead of injecting an object with a `delete()` method, you inject a function.

## 4. Controlled components (mediator)

The classical analogue is the **Mediator pattern**: a single object coordinates communication between parties that would otherwise talk directly. Here, React state mediates between user input and the DOM.

In a vanilla `<input>`, the DOM is the source of truth — whatever the user typed is *in* the input's `value` property, and you query it on demand. In React's controlled-component pattern, the DOM is just a view of state; React owns the value, and every keystroke goes through React first.

**React mechanism**: `value` + `onChange` paired together.

```jsx
<input
  value={label}
  onChange={(e) => setLabel(e.target.value)}
/>
<button disabled={label.length === 0} onClick={handleAddTodoClick}>
  Add Todo
</button>
```

**Why it matters**: validation, formatting, and conditional UI all become natural reads of state — `disabled={label.length === 0}` "just works" because `label` is always current. In vanilla, conditional disabling means subscribing to `input` events on the input *and* keeping a separate variable in sync, *and* updating the button's `disabled` attribute manually each time. React's pattern collapses three concerns into one read.

## 5. Immutable updates

Classical analogue: **value semantics** / persistent data structures. State changes are expressed as new values, not mutations of existing ones.

**React mechanism**: every state setter expects a new reference. Spread, `map`, `filter`.

```js
setTodos([...todos, newTodo]);                              // append
setTodos(todos.filter((t) => t.id !== id));                 // remove
setTodos(todos.map((t) => (t.id === id ? next : t)));       // update one
setTodos((prev) => [...prev, newTodo]);                     // setter form
```

**Why it matters**: React decides whether to re-render by comparing old and new state references with `===`. Mutate in place — `todos.push(newTodo); setTodos(todos)` — and the reference doesn't change, so React thinks nothing happened. New references are how you signal "something is different." This is the same principle behind `React.memo`, `useMemo`, and `useEffect` dependency arrays: they all use reference equality as the change detector, and they all assume you play by the immutability rules.

## How they compose

The patterns are meaningful individually but they're designed to work together. Trace a single user action — toggling a todo's `completed` flag — and you'll touch all five:

1. User clicks the checkbox inside `<Todo>`. The `onChange` handler the child registered fires.
2. The handler closure builds the new value `{ ...todo, completed: !todo.completed }` — that's an **immutable update** at the object level — and invokes `handleUpdateTodo(updated)` — that's **data down, handlers up** carrying the new value back to the owner.
3. `<TodoList>`'s `handleUpdateTodo` calls `setTodos(todos.map(...))` — an **immutable update** at the array level — committing the change to the **single source of truth** for the list.
4. React re-renders `<TodoList>`. Fresh `todo` props flow into each `<Todo>` — **unidirectional data flow** carrying the new state back down the tree.
5. `<Todo>` re-renders. Its `<input type="checkbox">` reflects `todo.completed` — the **controlled component** stays in sync because its `checked` prop is read from state, not from the DOM.

No event was subscribed to a state field. No object was mutated in place. No child reached into a parent's internals. Every step is one of the five patterns, and each pattern is doing exactly one job.

## See also

A few neighboring patterns this page didn't cover but you'll meet soon:

- **Co-located state** — keep state as private as possible. The `editing` flag in `Todo` is co-located: nothing outside that one row needs it, so nothing outside that row sees it. Same shape as state lifting, applied in the *opposite* direction.
- **Reconciliation by identity** — the `key` prop tells React which child instance is which across renders. State (like `editing`) survives a re-render because the component identity, anchored by `key`, survives. Drop the key or use array index and you'll see state attach to the wrong row when items reorder.
- **Custom hooks** — once a piece of stateful behavior is reusable (the four `add` / `update` / `delete` / `toggle` handlers around `useState([])`), wrap it in a `useTodos()` hook and the *behavior* becomes shareable across components. The patterns above don't change; they just live behind one more import.
