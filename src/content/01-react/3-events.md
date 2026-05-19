# onEvent

React wrap the DOM events API with a synthethic events.


## Event handlers

Pass a function to a JSX event prop:

```jsx
export default function AlertButton() {
  const handleClick = () => alert("OUCH")

  return (
    <button onClick={handleClick}>
      Alert
    </button>
  )
}
```

## Encapsulate the event handler into its own function

1. It's common practice to name the function handle + the event name – in our case handleClick
2. The event handler function lives in the component

```jsx
export default function AlertButton({ message }) {
  const handleClick = () => alert(message)

  return (
    <button onClick={handleClick}>
      Alert
    </button>
  )
}
```

We lost lexical scope and have to wrap in another function to execute, this is an **anti-pattern**.

```jsx
const handleClick = (msg) => alert(msg)

export default function AlertButton({ message }) {
  return (
    <button onClick={() => handleClick(message)}>
      Alert
    </button>
  )
}
```


## Pass a reference, not an invocation

**Don't call** the function in JSX (`onClick={handleClick()}`) — that runs it during render.


## A common gotcha

```jsx
const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
};
```

This only increments by 1, because both calls capture the same `count`. Use the updater form to actually increment by 2:

```jsx
const handleClick = () => {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
};
```
