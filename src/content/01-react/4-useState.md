# useState

Two big ideas:

1. State is data that, when it changes, should cause the component to re-render.
2. Event handlers are how the user mutates state.


If we break it down, we've seen how you create your View with JSX, and how you encapsulate that View inside of a function to get your component. But there's still one piece of the formula we need to talk about, state.

## useState

`useState` is the blessed way to preserve a value across component renders. It comes built-in with React and can be accessed via React.useState. It takes in a single argument, the initial value for that piece of state, and returns an array with the first item being the state value and the second item being a way to update that state.


```jsx
const stateArray = React.useState("initial state value");
const state = stateArray[0];
const setState = stateArray[1];

// Array Destruturing

const [ state, setstate ] = React. useState("initial state value")
console.log(state) // "initial state value"
setState("new state value")
```


```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

> React re-renders a component whenever its state changes.


State in react is treated as immutable, we don't change it in place but replace with the existing state and any changes.


**Is `useState` “not mutable”?**

- In JavaScript, the value you put in state is still a normal object/array — you *could* mutate it in place (`arr.push(1)`, `obj.x = 2`).
- In **React’s rules**, you should **treat that value as read-only** and only change what users see by calling the setter with a **new** value (or a functional updater that returns a new value). In-place mutation without a proper update breaks React’s assumptions (referential equality, concurrent features, `Object.is` checks, etc.).

**So your summary fits**

- We don’t “edit the array in place” as the primary model; we **replace** state with a new snapshot (copy with the change merged in), e.g. `setItems(items.map(...))` or `[...items, newItem]`, same idea for nested objects with spreads or small helpers.
- Primitives already behave as “replace” (`setCount(c + 1)`).



Things to remember:

- `useState` returns `[value, setter]`.
- The setter does **not** mutate — it schedules a re-render with the new value.
- The setter accepts either a value (`setCount(5)`) or an updater (`setCount((c) => c + 1)`). Use the updater whenever the new value depends on the old one.


```jsx
import * as React from "react";
export default function App() {

	const [mode, setMode] = React.useState("dark");
	const handleDarkMode = () => {
		setMode("dark");
	};

	const handleLightMode = () => {
		setMode("light");
	};

return (
	<main className={mode}>
		{mode === "light" ? (
		<button onClick={handleDarkMode}>Activate Dark Mode</button> ) : (
		<button onClick={handleLightMode}>Activate Light Mode</button>
	)}
	</main>
	);
}
```


## A todo list with useState


Changing the complete status of a todo:


```jsx
import * as React from "react"

export default function Todo () {
  const [completed, setCompleted] = React.useState(false)

  const handleCheckboxClick = () => setCompleted(!completed)

  return (
    <label htmlFor="checkbox">
      <div>
        <input
          type="checkbox"
          id="checkbox"
          checked={completed}
          onChange={handleCheckboxClick}
        />
        <span />
      </div>
      <span>Learn React</span>
    </label>
  )
}
```


Changing the label:


```jsx
import * as React from "react"

export default function Todo () {
  const [label, setLabel] = React.useState("Learn React")
  const [completed, setCompleted] = React.useState(false)
  const [editing, setEditing] = React.useState(false)

  const handleCheckboxClick = () => setCompleted(!completed)
  const handleEditClick = () => setEditing(!editing)

  return (
    <div>
      <label htmlFor="checkbox">
        <div>
          <input
            type="checkbox"
            id="checkbox"
            checked={completed}
            onChange={handleCheckboxClick}
          />
          <span />
        </div>
        <span>{label}</span>
      </label>
      <button onClick={handleEditClick}>
        {editing ? "Save" : "Edit"}
      </button>
    </div>
  )
}
```


Updating the label for the todo:


```jsx
import * as React from "react"

export default function Todo () {
  const [label, setLabel] = React.useState("Learn React")
  const [completed, setCompleted] = React.useState(false)
  const [editing, setEditing] = React.useState(false)

  const handleCheckboxClick = () => setCompleted(!completed)
  const handleEditClick = () => setEditing(!editing)
  const handleUpdateLabel = (e) => setLabel(e.target.value)

  return (
    <div>
      <label htmlFor="checkbox">
        <div>
          <input
            type="checkbox"
            id="checkbox"
            checked={completed}
            onChange={handleCheckboxClick}
          />
          <span />
        </div>
        {editing === true ? (
          <input
            type="text"
            value={label}
            onChange={handleUpdateLabel}
          />
        ) : (
          <span>{label}</span>
        )}
      </label>
      <button onClick={handleEditClick}>
        {editing ? "Save" : "Edit"}
      </button>
    </div>
  )
}
```


> It's important to note that when you pass a value to useState's updater function, whatever value you pass will always replace the current piece of state.

> What this means is that if you have a piece of state that is an object, it won't be merged with the current state.


## Determining where the state lives

Here's the rule of thumb – whenever you have state that multiple components depend on, you'll want to lift that state up to the nearest parent component and then pass it down via props.

Whenever you're in a situation like this, what you'll want to do is create a function in the component where the state is located, and then pass that function down via props.
Then, you can pass data back up to the parent component by passing an argument to the function you passed down.

Whenever the state you're updating lives in a different location from the event handlers that update that state, you'll create an updater function in the component where the state lives and you'll invoke that function from the component where the event handlers live.


See [todo-list-challenge](/course-notes/todo-list-challenge/setup)



### Best practices for updating state without mutations

```jsx
import * as React from "react"
import Todo from "./Todo"

export default function TodoList() {
  const [todos, setTodos] = React.useState([
    { id: 1, label: "Learn React", completed: false },
    { id: 2, label: "Learn Next.js", completed: false },
    { id: 3, label: "Learn React Query", completed: false }
  ])

  // Component functionality/API goes here

  return (
    <ul>
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
        />
      ))}
    </ul>
  )
}
```



To add an element to an array, use JavaScript's spread operator (...) to spread all the existing elements onto a new array with the new element.


```jsx
  const handleUpdateTodo = (updatedTodo) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    )
    setTodos(newTodos)
  }
```


```jsx
  const handleDeleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
  }
```


```jsx
  const handleAddTodo = (newTodo) => {
    const newTodos = [...todos, newTodo]
    setTodos(newTodos)
  }
```


Which leads our TodoList to look like:



```jsx

import * as React from "react"
import Todo from "./Todo"
import TodoComposer from "./TodoComposer"

export default function TodoList() {
  const [todos, setTodos] = React.useState([
    { id: 1, label: "Learn React", completed: false },
    { id: 2, label: "Learn Next.js", completed: false },
    { id: 3, label: "Learn React Query", completed: false }
  ])

  const handleUpdateTodo = (updatedTodo) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    )
    setTodos(newTodos)
  }

  const handleDeleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
  }

  const handleAddTodo = (newTodo) => {
    const newTodos = [...todos, newTodo]
    setTodos(newTodos)
  }

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
  )
}
```


## Rendering in React

When is it rendered?
Rendering is just a fancy way of saying that React calls your component (function) with the intent of eventually updating the View.


When React renders a component, two things happen.

1. React creates a snapshot of your component which captures everything React needs to update the view at that particular moment in time. props, state, event handlers, and a description of the UI (based on those props and state) are all captured in this snapshot.

From there, React takes that description of the UI and uses it to update the View.



When does React re-render?
React will only re-render when the state of a component changes
The only thing that can trigger a re-render of a component in React is a state change.


```jsx

import * as React from "react"

function Greeting ({ name }) {
  const [index, setIndex] = React.useState(0)

  const greetings = ['Hello', "Hola", "Bonjour"]

  const handleClick = () => {
    const nextIndex = index === greetings.length - 1
      ? 0
      : index + 1
    setIndex(nextIndex)
  }

  return (
    <main>
      <h1>{greetings[index]}, {name}</h1>
      <button onClick={handleClick}>Next Greeting</button>
    </main>
  )
}

export default function App () {
  return <Greeting name="Tyler" />
}
```

Now whenever our button is clicked, our handleClick event handler will run. The state (index) inside of handleClick will be the same as the state in the most recent snapshot. From there, React sees there's a call to setIndex and that the value passed to it is different than the state in the snapshot – triggering a re-render.


We know that when our handleClick event handler runs, it has access to the props and state as they were in the moment in time when the snapshot was created – in that moment, status was clean. Therefore, when we alert status, we get clean.

Now click the button again. You'll notice that because our previous button click triggered a re-render and created a new snapshot with the status of dirty, on any clicks after the initial click we get dirty.




```jsx
import * as React from "react"

export default function VibeCheck () {
  const [status, setStatus] = React.useState("clean")

  const handleClick = () => {
    setStatus("dirty")
    alert(status)
  }

  return (
    <button onClick={handleClick}>
      {status}
    </button>
  )
}

// first click: clean
// second click: dirty

```



### Batching updates



Whenever React encounters multiple invocations of the same updater function (e.g. setCount in our example), it will keep track of each of them, but only the result of the last invocation will be used as the new state.

React refers to this algorithm as "batching".

```jsx
const handleClick = () => {
  setCount(1)
  setCount(2)
  setCount(3)
}

// 3
```


```jsx
const handleClick = () => {
  setCount(1)
  setCount((c) => c + 3)
  setCount(7)
  setCount((c) => c + 10)
}
// 17

```


Whenever state changes, React will re-render the component that owns that state and all of its child components – regardless of whether or not those child components accept any props.









---


Your intuition is logical in normal JavaScript: assign first, then read. React does **not** work that way inside an event handler. `setStatus("dirty")` does **not** change the `status` variable that `handleClick` is already using. It **schedules** a future re-render; `alert(status)` reads the value from the **current snapshot’s closure**, which is still `"clean"`.


### Three layers (how your course notes name them)

| Layer | What it is | When it updates |
|-------|------------|-----------------|
| **Component** | Your function `VibeCheck()` runs | Each render |
| **Snapshot** | Frozen `status`, props, and handlers for *this* render | New snapshot only on the **next** render |
| **View** | What the user sees (button label, DOM) | After **commit**, when React applies the new snapshot |

**Render** = run the component → build a new snapshot (state + JSX description).  
**Commit** = push that description to the real DOM (the View).

`setStatus` does not patch the snapshot you are standing in. It tells React: “on the **next** render, use `"dirty"` as state.”

---

#### Why `alert` shows the old value

When React renders `VibeCheck`, it effectively does:

1. `status` is `"clean"` for **this** render.
2. `handleClick` is created and **closes over** that `status` (`"clean"`).
3. JSX uses the same `status` → button shows `clean`.

On click, **the same** `handleClick` from that snapshot runs:

```js
setStatus("dirty")  // schedule next snapshot; does NOT change local `status`
alert(status)       // still the closed-over "clean"
```

Only **after** the handler finishes does React run render → new snapshot (`status === "dirty"`) → commit → button shows `dirty`.

---

### Sequencing

Time flows **down**. Each horizontal “frame” is one moment.

```text
═══════════════════════════════════════════════════════════════════════════════
PHASE A — INITIAL MOUNT (first paint on screen)
═══════════════════════════════════════════════════════════════════════════════

  React calls VibeCheck()
       │
       ▼
  ┌─────────────────────────────────────┐
  │ SNAPSHOT #1                         │
  │   status = "clean"                  │
  │   handleClick → closes over "clean" │
  │   JSX  → <button>clean</button>     │
  └─────────────────────────────────────┘
       │
       ▼ commit
  ┌─────────────────────────────────────┐
  │ VIEW (DOM)                          │
  │   button text: "clean"              │
  └─────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
PHASE B — USER CLICKS (still inside Snapshot #1)
═══════════════════════════════════════════════════════════════════════════════

  User clicks
       │
       ▼
  handleClick() runs  ◄── still Snapshot #1's handler
       │
       ├─► setStatus("dirty")
       │        │
       │        └──► React: "queue re-render with status = dirty"
       │             (Snapshot #1 is NOT mutated; status var still "clean")
       │
       └─► alert(status)
                │
                └──► reads closure → "clean"  ◄── what you see on 1st click

  Handler ends.  Snapshot #1 is still the "current" one until render runs.


═══════════════════════════════════════════════════════════════════════════════
PHASE C — RE-RENDER (new snapshot, then view catches up)
═══════════════════════════════════════════════════════════════════════════════

  React render phase (scheduled by setStatus)
       │
       ▼
  React calls VibeCheck() again
       │
       ▼
  ┌─────────────────────────────────────┐
  │ SNAPSHOT #2                         │
  │   status = "dirty"                  │
  │   handleClick → closes over "dirty" │  ◄── NEW function, NEW closure
  │   JSX  → <button>dirty</button>     │
  └─────────────────────────────────────┘
       │
       ▼ commit
  ┌─────────────────────────────────────┐
  │ VIEW (DOM)                          │
  │   button text: "dirty"              │
  └─────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
PHASE D — SECOND CLICK (now inside Snapshot #2)
═══════════════════════════════════════════════════════════════════════════════

  User clicks again
       │
       ▼
  handleClick() runs  ◄── Snapshot #2's handler
       │
       ├─► setStatus("dirty")   (already dirty; may skip or no-op batch)
       │
       └─► alert(status)
                │
                └──► reads closure → "dirty"  ◄── what you see on 2nd click
```

---

#### One-line timeline (left = earlier)

```text
MOUNT          CLICK #1                         RE-RENDER           CLICK #2
  │               │                                  │                  │
  ▼               ▼                                  ▼                  ▼
Snap#1         Snap#1 still                       Snap#2             Snap#2
clean          setStatus → queue                    dirty              alert → dirty
View:clean     alert → clean  ──render/commit──►  View:dirty         (setStatus again)
```

---

### Mental model that fixes the confusion

Think of each render as a **photograph**:

- The photograph has `status: "clean"` and a `handleClick` that only knows about that photo.
- `setStatus("dirty")` is “take a **new** photo after this handler finishes,” not “develop the photo in my hand right now.”
- `alert(status)` always looks at the photo the handler was born from.

That matches what your `4-useState.md` notes say: handlers see props and state **as they were when the snapshot was created**; the update applies on the **next** snapshot.

---

### If you need “dirty” inside the same click

Use the value you are setting, not the stale closure:

```js
const handleClick = () => {
  const next = "dirty"
  setStatus(next)
  alert(next)   // "dirty" — you chose it; state will match after re-render
}
```

Or read after the update is committed (effect, or `flushSync` only when you truly need synchronous DOM/state — rare for alerts).

---

### Short answers to your expectations

| Expectation | What actually happens |
|-------------|-------------------------|
| `setStatus` then `alert` should show `"dirty"` on first click | `setStatus` schedules a **future** snapshot; `alert(status)` reads the **current** snapshot’s `status` |
| Button updates to `dirty` after first click | Yes — **View** updates on the **next** render/commit, after the handler returns |
| Second click alerts `"dirty"` | Yes — `handleClick` now comes from Snapshot #2, which closed over `"dirty"` |

**Component** runs → **snapshot** (state + handlers + JSX description) → **view** (DOM after commit). Event handlers always execute in the snapshot they were created in; `useState` setters move you to the **next** snapshot, not the one you are still inside.




That sentence is from your `useState` lesson. It contrasts **how you update UI in React** with **how you might do it in plain JavaScript**.

---

## Two different “homes” for the value

Every time React renders your component, it **calls your function again**. That creates a **new set of local variables** for that run:

```jsx
function VibeCheck() {
  const [status, setStatus] = React.useState("clean")  // `status` for THIS render only
  // ...
}
```

Render 1: `status` is the local name for `"clean"`.  
Render 2 (after click): `status` is a **new** local name for `"dirty"`.

Those are not the same variable in memory. They are two **snapshots**. The old `status` from render 1 still exists only inside the old `handleClick` closure until garbage collection — you do not “go back and edit” it.

**“Previous render’s variables”** = `status`, `count`, `handleClick`, etc. from the last time the function ran.

---

## What “you do not mutate … yourself” means

**Mutate** = change something in place, expecting everyone to see the new value immediately.

In vanilla JS you might do:

```js
let count = 0

button.onclick = () => {
  count++                    // you own the variable; you changed it
  label.textContent = count  // you drive the UI yourself
}
```

In React, this is the wrong mental model:

```js
// Wrong — does not schedule a re-render, React does not know
status = "dirty"

// Wrong for objects/arrays — same reference, React may skip update
todos.push(newTodo)
```

You do **not** treat `status` or `count` as the source of truth you edit by assignment. You call the setter:

```js
setStatus("dirty")   // “React, next render should use this value”
```

The `status` in the **current** render’s scope does not flip to `"dirty"` inside that same run (hence `alert(status)` still showing `"clean"`). You are not supposed to “fix” that by mutating `status`; you either accept the snapshot model or pass the new value explicitly (`alert("dirty")`).

So: **you don’t update the old render’s locals; you request a new render with new state.**

---

## What “React keeps the canonical value” means

**Canonical** = the one official copy React trusts, stored **outside** your function, tied to **this component instance** and **this hook slot** (first `useState`, second `useState`, etc.).

Rough picture:

```text
YOUR COMPONENT FUNCTION          REACT (per instance)
───────────────────────          ───────────────────
Render 1 runs                    Hook memory slot 0: "clean"
  const status = "clean"  ◄──── reads from slot
  setStatus("dirty")      ────► writes "dirty" to slot, schedules render

Render 2 runs                    Hook memory slot 0: "dirty"  ← canonical
  const status = "dirty"  ◄──── reads from slot
```

Your local `status` each render is a **copy for this snapshot**. The **canonical** value lives in React’s hook list and survives between renders. `setStatus` updates **that**, not “the `status` variable from last time.”

---

## What “drives the UI from it” means

After the canonical value changes, React:

1. **Re-runs** your component (new snapshot).
2. **Builds** new JSX from the new `status` / `count`.
3. **Reconciles** with the previous tree and **commits** DOM updates (button text, etc.).

You do not write `button.textContent = status` on every change. The UI is **derived** from state on each render:

```jsx
return <button>{status}</button>   // description of UI from canonical state
```

**“Drives the UI”** = React uses the stored state → new render → DOM patch. State leads; the view follows.

---

## Vanilla vs React in one diagram

```text
VANILLA (you are the driver)
────────────────────────────
  let count = 0     ← canonical (you keep it)
       │
       ├─ count++   ← you mutate
       └─ el.textContent = count   ← you update view


REACT (React is the driver)
──────────────────────────
  React hook slot: 0   ← canonical (React keeps it)
       │
       ├─ setCount(1)   ← you request change (no local mutation)
       │
       ├─ re-render: const [count] = useState → reads 1
       └─ <p>{count}</p> → reconcile → commit → view updates
```

---

## Tie-in to events (from your earlier question)

Same idea for handlers: each render’s `handleClick` closes over **that render’s** `status`. You don’t mutate that closure’s `status` when you `setStatus`; React updates the **canonical** slot and builds a **new** handler on the **next** render that closes over `"dirty"`.

---

## One sentence unpacked

| Phrase | Meaning |
|--------|---------|
| **Do not mutate the previous render’s variables** | Don’t assign to `status` / `count` or mutate state objects in place; don’t expect locals from an old run to update mid-handler. |
| **React keeps the canonical value** | Official state lives in React’s per-instance hook storage, not in your function’s locals. |
| **Drives the UI from it** | `setState` → re-render → JSX from new state → DOM updates; you describe UI, React syncs the screen. |

That is the core contract of `useState`: **replace via setter + re-render**, not **mutate locals + patch DOM yourself**.