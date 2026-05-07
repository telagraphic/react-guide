# JSX and Rendering

JSX is syntax sugar for `React.createElement` calls. Once you internalize that, a lot of "weird JSX rules" stop being weird.

## What JSX compiles to

This:

```jsx
const el = <button onClick={handleClick}>Click me</button>;
```

…compiles to roughly this:

```js
const el = React.createElement('button', { onClick: handleClick }, 'Click me');
```

That's why **JSX expressions can only have one root element** — a function call returns one value.

## Expressions vs. statements

Inside `{ ... }` in JSX you can put any **expression**, but not a statement.

```jsx
function Greeting({ user }) {
  return (
    <p>
      Hello, {user ? user.name : 'stranger'}.
    </p>
  );
}
```

`if`, `for`, and `switch` are statements — they can't go inside `{ }`. Use ternaries, `&&`, or extract a helper.

## Lists

```jsx
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.label}</li>
  ))}
</ul>
```

The `key` prop is React's identity hint for reconciliation. Use a stable id, not the array index.
