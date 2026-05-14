# useReducer

## What `useReducer` is in React

`useReducer(reducer, initialState)` gives you **`[state, dispatch]`** instead of **`[state, setState]`**. You describe updates as **actions** (plain objects or values); **`reducer(state, action)`** returns the **next** state. React still stores that state on the instance and re-renders when **`dispatch`** is called with an action that actually changes something (same bail-out rules as `setState` for identical references).

Useful when many event paths touch the same shape, or when the next state is easier to express as a fold over actions than as many separate `setState` calls.

### Try it

1. **Dev app:** **`/labs/vanilla-react/lesson-05`**
2. **Static:** `npx --yes serve src/content/05-vanilla-react/05-use-reducer` → [`index.html`](./index.html)

### Supporting files

- [`use-reducer-vanilla.js`](./use-reducer-vanilla.js) · [`index.html`](./index.html)

---

## React (reference)

```jsx
function reducer(state, action) {
  if (action.type === 'inc') return { count: state.count + 1 };
  if (action.type === 'dec') return { count: state.count - 1 };
  return state;
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <p>count: {state.count}</p>
      <button type="button" onClick={() => dispatch({ type: 'inc' })}>+</button>
      <button type="button" onClick={() => dispatch({ type: 'dec' })}>-</button>
    </>
  );
}
```

---

## Vanilla implementation

One **`reducer`** function, one **`state`** object, and **`dispatch`** that assigns **`state = reducer(state, action)`** then **`paint()`**. No hook runtime — just the same data flow React wires up for you.

```javascript
export function mountLesson05(host) {
  function reducer(state, action) {
    if (action.type === 'inc') return { count: state.count + 1 };
    if (action.type === 'dec') return { count: state.count - 1 };
    return state;
  }

  let state = { count: 0 };

  function dispatch(action) {
    state = reducer(state, action);
    paint();
  }

  function paint() {
    host.replaceChildren();
    const label = document.createElement('p');
    label.textContent = `count: ${state.count}`;
    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = 'dispatch inc';
    inc.addEventListener('click', () => dispatch({ type: 'inc' }));
    const dec = document.createElement('button');
    dec.type = 'button';
    dec.textContent = 'dispatch dec';
    dec.addEventListener('click', () => dispatch({ type: 'dec' }));
    host.append(label, inc, dec);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## What this code is doing

- **`dispatch`** is the vanilla name for what React’s `dispatch` does: run the pure reducer, replace `state`, refresh the UI.
- **`reducer` must be pure** — same as React: no DOM side effects inside it; only compute the next object.

---

## Mapping

| React | Vanilla |
|--------|---------|
| `useReducer(reducer, init)` | `let state = init` + same `reducer` |
| `dispatch(action)` | `dispatch` above |

---

## Not in this lesson

Lazy initializer `useReducer(reducer, arg, initFn)`, middleware. See [../REQUIREMENTS.md](../REQUIREMENTS.md).
