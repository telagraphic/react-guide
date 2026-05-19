# useReducer

The API for useReducer is similar to what we saw earlier with Array.reduce, but with one big difference. Instead of just returning the state, similar to useState, useReducer also returns a way to update that state.

`useReducer` tells us what the code should do and contains the imperative code but gives us a wrapper abstraction "API" for updating state over line by line `useState` for more complex data.


To recap, like useState, useReducer allows you to add state to a component that will be preserved across renders and trigger a re-render when it changes. Unlike useState, useReducer allows you to manage that state using the reducer pattern.

useReducer also offers a bit more flexibility than useState since it allows you to decouple how the state is updated from the action that triggered the update - typically leading to more declarative state updates.

If different pieces of state update independently from one another (hovering, selected, etc.), useState should work fine. If your state tends to be updated together or if updating one piece of state is based on another piece of state, go with useReducer.



```jsx
import * as React from "react"

function reducer(state, value) {
  const nextState = state + value

  console.log(
    `Reducer invoked. state: ${state}, value: ${value}, nextState: ${nextState}`
  )

  return nextState
}

const initialState = 0

export default function Counter() {
  const [count, dispatch] = React.useReducer(
    reducer, initialState
  )

  const handleIncrement = () => {
    dispatch(1)
  }

  return (
    <main>
      <h1>{count}</h1>
      <button onClick={handleIncrement}>+</button>
    </main>
  )
}
```


Adding functionality

```jsx
import * as React from "react"

function reducer(state, value) {
  const nextState = state + value

  console.log(
    `Reducer invoked. state: ${state}, value: ${value}, nextState: ${nextState}`
  )

  return nextState
}

const initialState = 0

export default function Counter() {
  const [count, dispatch] = React.useReducer(
    reducer, initialState
  )

  const handleIncrement = () => dispatch(1)
  const handleDecrement = () => dispatch(-1)

  return (
    <main>
      <h1>{count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
      </div>
    </main>
  )
}
```

And with a full complete reducer functionality


```jsx
import * as React from "react"

function reducer(state, action) {
  if (action === "increment") {
    return state + 1
  } else if (action === "decrement") {
    return state - 1
  } else if (action === "reset") {
    return 0
  } else {
    throw new Error("This action type isn't supported.")
  }
}

const initialState = 0

export default function Counter() {
  const [count, dispatch] = React.useReducer(
    reducer, initialState
  )

  const handleIncrement = () => dispatch("increment")
  const handleDecrement = () => dispatch("decrement")
  const handleReset = () => dispatch("reset")

  return (
    <main>
      <h1>{count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
    </main>
  )
}
```


## A more involved step counter

Because the reducer function is passed the current state as the first argument, it's simple to update one piece of state based on another piece of state. In our example, we can see this in how we're updating count based on the value of step.

In fact, I'd go as far as to say whenever updating one piece of state depends on the value of another piece of state, reach for useReducer.




```jsx
import * as React from "react"
import Slider from "./Slider"

function reducer(state, action) {
  if (action.type === "increment") {
    return {
      count: state.count + state.step,
      step: state.step,
    }
  } else if (action.type === "decrement") {
    return {
      count: state.count - state.step,
      step: state.step,
    }
  } else if (action.type === "reset") {
    return {
      count: 0,
      step: state.step,
    }
  } else if (action.type === "updateStep") {
    return {
      count: state.count,
      step: action.step,
    }
  } else {
    throw new Error("This action type isn't supported.")
  }
}

export default function Counter() {
  const [state, dispatch] = React.useReducer(reducer, {
    count: 0,
    step: 1
  })

  const handleIncrement = () => dispatch({type: "increment"})
  const handleDecrement = () => dispatch({type: "decrement"})
  const handleReset = () => dispatch({type: "reset"})
  const handleUpdateStep = (step) => dispatch({type: "updateStep", step})

  return (
    <main>
      <h1>{state.count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
      <Slider 
        min={1}
        max={10}
        onChange={handleUpdateStep} 
      />
    </main>
  )
}

import * as React from "react"

export default function Slider({ min, max, onChange }) {
  const [value, setValue] = React.useState(1)

  return (
    <div className="range">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step="1"
        onChange={(e) => {
          const value = Number(e.target.value)
          onChange(value)
          setValue(value)
        }}
      />
      <div>{value}</div>
    </div>
  )
}

```


## useEffect with useReducer



By not passing in `step` to `useEffect` we avoid resetting the timer interval when the `step` dependency changes.


```jsx
import * as React from "react"
import Slider from "./Slider"

function reducer(state, action) {
  if (action.type === "increment") {
    return {
      count: state.count + state.step,
      step: state.step,
    }
  } else if (action.type === "decrement") {
    return {
      count: state.count - state.step,
      step: state.step,
    }
  } else if (action.type === "reset") {
    return {
      count: 0,
      step: state.step,
    }
  } else if (action.type === "updateStep") {
    return {
      count: state.count,
      step: action.step,
    }
  } else {
    throw new Error("This action type isn't supported.")
  }
}

export default function Counter() {
  const [state, dispatch] = React.useReducer(reducer, {
    count: 0,
    step: 1
  })

  const handleIncrement = () => dispatch({ type: "increment" })
  const handleDecrement = () => dispatch({ type: "decrement" })
  const handleReset = () => dispatch({ type: "reset" })
  const handleUpdateStep = (step) => dispatch({ type: "updateStep", step })

  React.useEffect(() => {
    console.log("useEffect called")
    const id = window.setInterval(() => {
      dispatch({ type: "increment" })
    }, 1000)

    return () => window.clearInterval(id)
  }, [])

  return (
    <main>
      <h1>{state.count}</h1>
      <div>
        <button onClick={handleDecrement}>-</button>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleReset}>0</button>
      </div>
      <Slider 
        min={1}
        max={10}
        onChange={handleUpdateStep} 
      />
    </main>
  )
}
```

---

## What problem `useReducer` solves

> When several pieces of state **move together** or one update **depends on another field’s current value**, describe changes as **actions** and centralize the transition logic in a **reducer** instead of scattering `setState` calls across handlers.

**`useReducer(reducer, initialState)`** returns **`[state, dispatch]`**. You send **actions** (a string, number, or `{ type, ...payload }` object); **`reducer(state, action)`** returns the **next** state. React stores that state on the instance and re-renders when `dispatch` produces a new snapshot — same re-render contract as **`useState`**, but updates are **named events** with **one place** that knows how state evolves.

The step-counter examples above show the payoff: `increment` reads **`state.step`** inside the reducer, so handlers stay thin (`dispatch({ type: "increment" })`) and you avoid bugs from stale closures when multiple fields must stay in sync.

---

## `useReducer` vs `useState` (quick comparison)

| Question | Prefer **`useState`** | Prefer **`useReducer`** |
|----------|----------------------|-------------------------|
| One primitive or a single object with simple updates? | **Yes** | Often overkill |
| Do several fields update **together** on one user gesture? | Awkward (many setters) | **Often yes** |
| Does updating field A require reading field B’s **current** value? | Easy to get stale reads | **Reducer** sees full `state` |
| Do you want a log of **actions** (undo, analytics, tests)? | Harder | **Natural fit** |
| Is the next state a **pure function** of `(state, action)`? | Either works | **Reducer** documents that contract |

---

## Pattern: action objects and a typed reducer

Prefer **`{ type: "increment", ... }`** over magic strings once the machine grows. One function, many branches — easy to test without rendering:

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + state.step };
    case "updateStep":
      return { ...state, step: action.step };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}
```

---

## Pattern: `dispatch` inside `useEffect` (stable interval)

The timer example above dispatches **`{ type: "increment" }`** from an effect with **`[]` deps**. The reducer always reads **fresh** `state.step` when the interval fires, so you do **not** need `step` in the effect dependency array just to keep the tick correct. Compare with multiple `useState` setters, where an effect often re-subscribes when any piece of state it closes over changes.

---

## Pattern: reducer in a context provider

When **many** descendants need the same state machine, pair **`useReducer`** with **`useContext`**: the provider holds `[state, dispatch]`; leaves call **`dispatch`** instead of receiving five setter props. Split **state** and **dispatch** into two contexts if only some children need to fire actions (see [useContext](/course-notes/useContext)).

---

## When to reach for `useReducer` (decision tree)

```text
Need local state in one component?
│
├─ Single value, updates don't depend on other fields?
│     └─► useState
│
├─ Object/array with a few independent toggles?
│     └─► useState (often fine)
│
├─ Update to field A uses current value of field B?
│     └─► useReducer
│
├─ Same gesture updates multiple fields in one transaction?
│     └─► useReducer
│
└─ Many event types / next state is a table of rules?
      └─► useReducer (or consider a small state-machine library)
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Reducer **mutates** `state` | Breaks React’s immutability assumptions; bail-out and concurrent features can misbehave |
| Putting **async** or **side effects** inside the reducer | Reducers must be **pure**; fetch, timers, and DOM belong in effects or event handlers |
| Giant reducer with no structure | Hard to read — extract helpers, use `switch`, or split domains |
| `useReducer` for a lone `count++` | Extra ceremony without clarity — **`useState`** is simpler |
