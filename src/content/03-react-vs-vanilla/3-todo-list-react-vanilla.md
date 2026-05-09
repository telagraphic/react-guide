# Todo List: React vs Vanilla

The same UI, mounted to the same `<div id="root">`, written two ways. Read them top-to-bottom, then jump to the differences and trade-offs below.

## React

```jsx
import { useState } from 'react';
import { createRoot } from 'react-dom/client';

function createTodo(label) {
  return {
    id: crypto.randomUUID(),
    label,
    completed: false,
  };
}

function Todo({ todo, handleUpdateTodo, handleDeleteTodo }) {
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

function TodoComposer({ handleAddTodo }) {
  const [label, setLabel] = useState('');

  const handleUpdateLabel = (e) => setLabel(e.target.value);

  const handleAddTodoClick = () => {
    handleAddTodo(createTodo(label));
    setLabel('');
  };

  return (
    <li>
      <input
        placeholder="Add a new todo"
        type="text"
        value={label}
        onChange={handleUpdateLabel}
      />
      <button
        disabled={label.length === 0}
        onClick={handleAddTodoClick}
      >
        Add Todo
      </button>
    </li>
  );
}

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, label: 'Learn React', completed: false },
    { id: 2, label: 'Learn Next.js', completed: false },
    { id: 3, label: 'Learn React Query', completed: false },
  ]);

  const handleAddTodo = (newTodo) => {
    setTodos([...todos, newTodo]);
  };

  const handleUpdateTodo = (updatedTodo) => {
    setTodos(
      todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
    );
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <ul>
      <TodoComposer handleAddTodo={handleAddTodo} />
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          handleUpdateTodo={handleUpdateTodo}
          handleDeleteTodo={handleDeleteTodo}
        />
      ))}
    </ul>
  );
}

createRoot(document.getElementById('root')).render(<TodoList />);
```

The mental model: each component returns the markup it *should* look like for the current state. React figures out which DOM operations make that true.

## Vanilla

```js
function createTodo(label) {
  return {
    id: crypto.randomUUID(),
    label,
    completed: false,
  };
}

class Todo {
  constructor(todo, { onUpdate, onDelete }) {
    this.todo = todo;
    this.onUpdate = onUpdate;
    this.onDelete = onDelete;
    this.editing = false;
    this.el = this.build();
  }

  build() {
    const li = document.createElement('li');

    const label = document.createElement('label');
    label.htmlFor = this.todo.id;

    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.id = this.todo.id;
    this.checkbox.checked = this.todo.completed;
    this.checkbox.addEventListener('change', () => {
      this.onUpdate({ ...this.todo, completed: this.checkbox.checked });
    });

    this.labelView = document.createElement('span');
    this.labelView.textContent = this.todo.label;

    this.labelInput = document.createElement('input');
    this.labelInput.type = 'text';
    this.labelInput.value = this.todo.label;
    this.labelInput.style.display = 'none';
    this.labelInput.addEventListener('input', (e) => {
      this.onUpdate({ ...this.todo, label: e.target.value });
    });

    label.append(this.checkbox, this.labelView, this.labelInput);

    this.editButton = document.createElement('button');
    this.editButton.textContent = 'Edit';
    this.editButton.addEventListener('click', () => {
      this.editing = !this.editing;
      this.update();
    });

    this.deleteButton = document.createElement('button');
    this.deleteButton.textContent = 'Delete';
    this.deleteButton.addEventListener('click', () => {
      this.onDelete(this.todo.id);
    });

    li.append(label, this.editButton, this.deleteButton);
    return li;
  }

  setTodo(todo) {
    this.todo = todo;
    this.update();
  }

  update() {
    this.checkbox.checked = this.todo.completed;
    this.labelView.textContent = this.todo.label;
    this.labelInput.value = this.todo.label;
    this.labelView.style.display = this.editing ? 'none' : '';
    this.labelInput.style.display = this.editing ? '' : 'none';
    this.editButton.textContent = this.editing ? 'Save' : 'Edit';
    this.deleteButton.style.display = this.editing ? 'none' : '';
  }
}

class TodoComposer {
  constructor({ onAdd }) {
    this.onAdd = onAdd;
    this.label = '';
    this.el = this.build();
  }

  build() {
    const li = document.createElement('li');

    this.input = document.createElement('input');
    this.input.placeholder = 'Add a new todo';
    this.input.type = 'text';
    this.input.value = this.label;
    this.input.addEventListener('input', (e) => {
      this.label = e.target.value;
      this.button.disabled = this.label.length === 0;
    });

    this.button = document.createElement('button');
    this.button.textContent = 'Add Todo';
    this.button.disabled = true;
    this.button.addEventListener('click', () => {
      this.onAdd(createTodo(this.label));
      this.label = '';
      this.input.value = '';
      this.button.disabled = true;
    });

    li.append(this.input, this.button);
    return li;
  }
}

class TodoList {
  constructor(root) {
    this.todos = [
      { id: '1', label: 'Learn React', completed: false },
      { id: '2', label: 'Learn Next.js', completed: false },
      { id: '3', label: 'Learn React Query', completed: false },
    ];
    this.instances = new Map();

    this.el = document.createElement('ul');

    this.composer = new TodoComposer({
      onAdd: (newTodo) => this.handleAddTodo(newTodo),
    });
    this.el.append(this.composer.el);

    this.todos.forEach((todo) => this.appendTodo(todo));

    root.append(this.el);
  }

  appendTodo(todo) {
    const instance = new Todo(todo, {
      onUpdate: (updated) => this.handleUpdateTodo(updated),
      onDelete: (id) => this.handleDeleteTodo(id),
    });
    this.instances.set(todo.id, instance);
    this.el.append(instance.el);
  }

  handleAddTodo(newTodo) {
    this.todos = [...this.todos, newTodo];
    this.appendTodo(newTodo);
  }

  handleUpdateTodo(updatedTodo) {
    this.todos = this.todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo,
    );
    this.instances.get(updatedTodo.id).setTodo(updatedTodo);
  }

  handleDeleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.instances.get(id).el.remove();
    this.instances.delete(id);
  }
}

new TodoList(document.getElementById('root'));
```

The mental model: every class owns a real DOM subtree forever. State changes are paired with the exact DOM mutation that reflects them. The `Map<id, Todo>` is your hand-rolled reconciliation — you decide which instance to update, which to remove, which to append.

## How they differ

Both implementations have the same three units (`TodoList`, `TodoComposer`, `Todo`), the same prop/callback names, and the same `#root` mount point. The interesting differences are concentrated in two places: how events get attached, and where state lives.

### Events

React:

```jsx
<button onClick={handleEditClick}>{editing ? 'Save' : 'Edit'}</button>
```

Vanilla:

```js
this.editButton = document.createElement('button');
this.editButton.textContent = 'Edit';
this.editButton.addEventListener('click', () => {
  this.editing = !this.editing;
  this.update();
});
```

- React attaches the listener for you on every render and removes it when the component unmounts. The handler closes over fresh props each render, so `todo` and `editing` are always current.
- Vanilla attaches the listener once in `build()`. The handler closes over `this`, not over a specific `todo` snapshot — so when `setTodo()` swaps the field, the next click reads the new value. Re-binding on every change would defeat the purpose of the persistent instance.
- Removing a row in React deletes the `<li>` *and* its listeners as one step, because component unmount is the listener-cleanup boundary. In vanilla, `instance.el.remove()` only avoids leaks because every listener was attached to a child of `el`; a stray `document.addEventListener` would leak silently.

### State

React:

```jsx
const [editing, setEditing] = useState(false);
const handleEditClick = () => setEditing(!editing);
```

Vanilla:

```js
this.editing = false;
// ...inside the click handler:
this.editing = !this.editing;
this.update();
```

- React state lives behind a setter that is *also* the trigger for re-rendering. Mutating the closure variable directly does nothing; you go through `setEditing`.
- Vanilla state lives in plain class fields. Reading is free, writing is free, and *nothing happens* in the DOM until you call an update method. The `Map<id, Todo>` in `TodoList` is the manual equivalent of React's keyed reconciliation: you remember which instance corresponds to which row so you can find it again on update or delete.
- React decouples *what to display* (the JSX returned from render) from *when to update* (the state setter). Vanilla couples them — every state mutation is paired with the DOM mutation that reflects it, which is why the vanilla code has methods like `Todo.update()` that touch six fields in lockstep with `this.editing` and `this.todo`.

## Pros and cons

Both approaches solve the same problem. They make different bets about who pays for the DOM↔state sync.

### React

**Strengths**

- UI is a function of state. No `update()` methods, no manual `el.textContent =` lines.
- Component identity manages event lifecycle for free — mount adds, unmount cleans up.
- Reconciliation does the keyed-instance bookkeeping for you. The `Map<id, Todo>` *is* what `key={todo.id}` becomes after compilation.
- Mature ecosystem: hooks, devtools, predictable patterns, off-the-shelf components.

**Costs**

- Runtime + reconciler is ~40 KB+ gzipped on the wire, plus a build step for JSX.
- Hidden rules you can't see in the code: hook order, dependency arrays, key stability, render purity.
- Extra layer between your code and the DOM — debugging "why didn't this element update?" requires understanding reconciliation.

### Vanilla

**Strengths**

- Zero dependencies, zero bundle cost, zero build step. The code in this page runs in the browser as-is.
- Direct, predictable DOM control. No reconciliation, no surprise re-renders, no stale closures over props.
- Smaller mental surface for simple widgets: a script tag, a class, a `new` call. Excellent for progressive enhancement on top of server-rendered HTML.
- Trivial to drop into existing pages, framework-agnostic libraries, or environments where shipping a framework isn't an option.

**Costs**

- DOM↔state sync code grows roughly linearly with features. Adding a "due date" field means touching `build()`, `update()`, and probably `setTodo()` in lockstep.
- Listener lifecycle is your job. Easy to leak when elements come and go, especially with global listeners.
- Per-instance bookkeeping (the `Map<id, Todo>`) is the kind of thing you write once per app, badly, and then maintain forever.
- No declarative component model — UI structure is scattered across `build()` plus a stack of `update()` calls, and the relationship between them is only obvious to whoever just wrote it.

Pick React when state is rich and changes often. Pick vanilla when the page is mostly static with a few interactive islands.
