# State

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


