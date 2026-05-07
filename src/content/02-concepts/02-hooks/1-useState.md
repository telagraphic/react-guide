# useState

The most fundamental hook. Use it whenever a component needs to remember a value across re-renders.

## Signature

```ts
const [value, setValue] = useState(initial);
```

## Initial value

Two forms:

```jsx
const [user, setUser] = useState(null);
const [user, setUser] = useState(() => loadFromCache());
```

The function form is a **lazy initializer** — it runs only on the first render. Use it when the initial value is expensive to compute.

## Updates are queued

Calling the setter does **not** change the variable in this render. It schedules a re-render with a new value.

```jsx
function Counter() {
  const [n, setN] = useState(0);

  function handleClick() {
    setN(n + 1);
    console.log(n); // Still the old value here.
  }

  return <button onClick={handleClick}>{n}</button>;
}
```

## State should be minimal

Don't store derived values:

```jsx
const [items, setItems] = useState([]);
const [count, setCount] = useState(0); // Bad: count is just items.length
```

Compute derived values during render:

```jsx
const [items, setItems] = useState([]);
const count = items.length;
```
