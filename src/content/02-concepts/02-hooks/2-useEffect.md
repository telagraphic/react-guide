# useEffect

For side effects: subscriptions, timers, fetches, anything that touches the world outside React.

## Shape

```jsx
useEffect(() => {
  // setup
  return () => {
    // cleanup (optional)
  };
}, [deps]);
```

The effect runs *after* the component commits to the DOM, and re-runs whenever a dependency changes.

## A subscription

```jsx
useEffect(() => {
  const id = setInterval(() => setNow(Date.now()), 1000);
  return () => clearInterval(id);
}, []);
```

The empty dependency array means "run once on mount, clean up on unmount."

## A fetch

```jsx
useEffect(() => {
  let cancelled = false;
  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then((user) => {
      if (!cancelled) setUser(user);
    });
  return () => {
    cancelled = true;
  };
}, [userId]);
```

The `cancelled` flag prevents setting state after the component unmounts (or `userId` changes mid-flight).

## When *not* to use useEffect

- Don't use it for **derived state**. Compute during render.
- Don't use it for **event handlers**. Put the logic directly in the handler.
- Don't use it for **resetting state on prop change**. Use a `key` prop instead.
