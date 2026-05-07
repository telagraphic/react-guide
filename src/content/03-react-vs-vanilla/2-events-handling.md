# Event Handling

Vanilla JS uses `addEventListener`. React uses **synthetic events** — a thin wrapper that pools, normalizes, and delegates events for you.

## Vanilla

```js
const button = document.querySelector('#submit');
function handleClick(e) {
  e.preventDefault();
  console.log('clicked');
}
button.addEventListener('click', handleClick);

// And don't forget:
button.removeEventListener('click', handleClick);
```

You're responsible for the listener lifecycle. If you replace the button or remove it from the DOM, you have to clean up too.

## React

```jsx
function SubmitButton() {
  function handleClick(e) {
    e.preventDefault();
    console.log('clicked');
  }
  return <button onClick={handleClick}>Submit</button>;
}
```

The `onClick` prop is a synthetic event handler. React adds and removes the underlying listener for you, scoped to the component lifecycle.

## What's the same

- The event object has the familiar API: `e.preventDefault()`, `e.stopPropagation()`, `e.target`, `e.currentTarget`.
- Bubbling and capturing still work (`onClickCapture` is the capture-phase variant in React).
- The native event is available as `e.nativeEvent` if you really need it.

## What's different

- **Camel-cased names**: `onclick` → `onClick`, `onmouseover` → `onMouseOver`.
- **Functions, not strings**: `onClick={handleClick}`, never `onClick="handleClick()"`.
- **No string-based handlers in the DOM**: React passes the function directly.
