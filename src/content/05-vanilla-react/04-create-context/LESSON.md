# createContext / useContext

## What `createContext` is in React

`createContext(defaultValue)` returns a **context object** React uses to thread a value through the tree **without** passing it through every component as a prop. **`defaultValue`** is what `useContext(ThatContext)` reads when a consumer renders **above** any matching `<Context.Provider>` (or when there is no provider).

A **Provider** is a special element: React records “while rendering this subtree, the value for this context is *X*.” Nested providers **shadow** outer ones — inner consumers see the inner value. **`useContext`** during render means: look up the nearest provider for this context (or use the default), return that value.

This lesson does **not** re-implement React’s tree walk. It shows the same **rules** with a **stack**: push before painting an “inside provider” region, pop after — nested regions push again so `readTheme()` returns the innermost active value.

### Try it

1. **Dev app:** **`/labs/vanilla-react/lesson-04`** — imports [`create-context-vanilla.js`](./create-context-vanilla.js) (keep aligned with the **Vanilla implementation** block below).
2. **Static only:** `npx --yes serve src/content/05-vanilla-react/04-create-context`, then open [`index.html`](./index.html).

### Supporting files in this folder

- **[`create-context-vanilla.js`](./create-context-vanilla.js)** — same logic as the fenced block, as an ES module for the lab route.
- **[`index.html`](./index.html)** — standalone runner.

---

## React (reference)

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('lavender');

function Reader() {
  const theme = useContext(ThemeContext);
  return <p>from context: {theme}</p>;
}

function App() {
  const [provided, setProvided] = useState('light');

  return (
    <>
      <Reader />
      <ThemeContext.Provider value={provided}>
        <Reader />
        <ThemeContext.Provider value="accent">
          <Reader />
        </ThemeContext.Provider>
      </ThemeContext.Provider>
      <button type="button" onClick={() => setProvided((t) => (t === 'light' ? 'dark' : 'light'))}>
        toggle outer provider
      </button>
    </>
  );
}
```

The first `<Reader />` sits **outside** both providers, so it shows **`lavender`**. The second is inside the outer provider only. The third is inside **both** — it sees **`accent`**, not `provided`, because the inner provider wins.

---

## Vanilla implementation

`ThemeContext` is just `{ defaultValue: 'lavender' }` — same information React stores on the context object. **`readTheme()`** is the vanilla shape of **`useContext`** for this one context: if the stack is empty, return the default; otherwise return **the top of the stack** (nearest / innermost provider).

```javascript
export function mountLesson04(host) {
  const ThemeContext = { defaultValue: 'lavender' };
  const themeStack = [];

  function readTheme() {
    return themeStack.length ? themeStack.at(-1) : ThemeContext.defaultValue;
  }

  let provided = 'light';

  function paint() {
    host.replaceChildren();

    const outside = document.createElement('p');
    outside.textContent = `Outside any provider (default): ${readTheme()}`;
    host.append(outside);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = `toggle provider value (now: ${provided})`;
    toggle.addEventListener('click', () => {
      provided = provided === 'light' ? 'dark' : 'light';
      paint();
    });
    host.append(toggle);

    themeStack.push(provided);
    try {
      const inside = document.createElement('p');
      inside.textContent = `Inside provider: ${readTheme()}`;
      host.append(inside);

      themeStack.push('accent');
      try {
        const nested = document.createElement('p');
        nested.textContent = `Inside nested provider: ${readTheme()}`;
        host.append(nested);
      } finally {
        themeStack.pop();
      }
    } finally {
      themeStack.pop();
    }
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## What this vanilla code is doing (step by step)

### `ThemeContext` and `readTheme()`

React’s context object carries metadata and a stable identity; for teaching, **`defaultValue`** is enough. **`readTheme()`** mirrors **`useContext(ThemeContext)`**: “what value applies **right now** for this render?” — empty stack means **no provider above this point**, so use **`defaultValue`**.

### First paragraph: outside providers

We append **`outside`** **before** any `push`. **`themeStack`** is still `[]`, so **`readTheme()`** returns **`lavender`**. That matches the first `<Reader />` in the React snippet.

### `push(provided)` … `try` … `finally` `pop()`

This pair is the vanilla version of **“render the subtree of `<ThemeContext.Provider value={provided}>`.”** While the stack holds `provided`, any code that calls **`readTheme()`** sees that value — like children of the outer Provider.

**`finally` + `pop()`** guarantees we undo the push even if something threw (nothing throws here, but it matches how a real renderer must unwind when leaving a subtree).

### Nested `push('accent')`

Inner block mirrors **`<ThemeContext.Provider value="accent">`**. While both pushes are active, **`readTheme()`** returns **`'accent'`** — the **top** of the stack — not `provided`. That is **shadowing**: inner provider overrides outer for consumers inside both.

### Toggle button

Changing **`provided`** and calling **`paint()`** again is the same idea as **`setProvided`** in React: the outer provider’s value changed, so the middle line (“Inside provider”) updates on the next paint. The nested line still shows **`accent`** because the inner provider value is fixed in this demo.

---

## Mapping in one glance

| React | This vanilla |
|--------|----------------|
| `createContext('lavender')` | `{ defaultValue: 'lavender' }` |
| `<Provider value={v}>` wrapping children | `themeStack.push(v)` … work … `pop()` |
| Nested providers | second `push` / inner `try` / `pop` |
| `useContext(ThemeContext)` | `readTheme()` |
| Default when no provider | empty stack → `defaultValue` |

---

## Checklist

- [ ] Why does the **first** line show `lavender`?
- [ ] After `push(provided)`, what does **`readTheme()`** return?
- [ ] With **two** values on the stack, which one does **`at(-1)`** pick?

---

## Not in this lesson

Multiple unrelated contexts, context selectors, `memo` bailouts based on context. See [../REQUIREMENTS.md](../REQUIREMENTS.md) for the wider track.
