# Custom hook

## What it is in React

A **custom hook** is a **function whose name starts with `use`** that calls other hooks. It is just **extracted logic** with shared structure — React does not treat it specially at runtime; it still relies on **call order** at each render.

In vanilla, the same idea is a **factory function** (or module) that returns **state + operations** hiding private variables — **composition** without a framework.


## React (reference)

```jsx
function useCounter(initial) {
  const [n, setN] = useState(initial);
  const inc = () => setN((x) => x + 1);
  const dec = () => setN((x) => x - 1);
  return { n, inc, dec };
}

function Counter() {
  const { n, inc, dec } = useCounter(0);
  return (
    <>
      <p>{n}</p>
      <button type="button" onClick={inc}>+</button>
      <button type="button" onClick={dec}>-</button>
    </>
  );
}
```

---

## Vanilla implementation

**`createCounter(initial)`** returns **`{ get, increment, decrement }`** with a **closed-over** `value` — the vanilla version of “hook private state + API surface.”

```javascript
function createCounter(initial) {
  let value = initial;
  return {
    get() {
      return value;
    },
    increment() {
      value += 1;
    },
    decrement() {
      value -= 1;
    },
  };
}

export function mountLesson10(host) {
  const counter = createCounter(0);

  function paint() {
    host.replaceChildren();
    const p = document.createElement('p');
    p.textContent = String(counter.get());
    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = '+';
    inc.addEventListener('click', () => {
      counter.increment();
      paint();
    });
    const dec = document.createElement('button');
    dec.type = 'button';
    dec.textContent = '-';
    dec.addEventListener('click', () => {
      counter.decrement();
      paint();
    });
    host.append(p, inc, dec);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## Mapping

| React | Vanilla |
|--------|---------|
| `useCounter` | `createCounter` factory |
| Hidden state | `let value` inside factory |

---

## Not in this lesson

Rules-of-hooks enforcement — vanilla has no dispatcher. See [../REQUIREMENTS.md](../REQUIREMENTS.md).
