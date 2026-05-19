# useContext

> Read a value from the nearest matching **Context Provider** above you in the tree — without threading that value through every intermediate component as props.


**`useContext`** is the hook side of React’s **Context** API. You still define the “wire” with **`createContext`**, put a **`Provider`** higher in the tree, and call **`useContext(ThatContext)`** in any descendant that needs the value.

The important split:

- **Props**: data flows **explicitly** parent → child → grandchild (great for local, one-off data).
- **Context**: the same logical value can be **broadcast** down the tree; intermediate components don’t have to know about it (solves **prop drilling** when many levels need the same thing).

```jsx
import * as React from "react";

const ThemeContext = React.createContext("light"); // default if no Provider

function App() {
  const [theme, setTheme] = React.useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return <ThemedButton />; // no theme prop passed through Toolbar
}

function ThemedButton() {
  const theme = React.useContext(ThemeContext);
  return <button className={theme}>{theme} mode</button>;
}
```

When the **Provider’s** `value` changes, React re-renders **consumers** of that context (components that read it via `useContext`). Components in between that don’t use the context are skipped for that subscription — but the Provider’s **children** still re-render when the parent (`App`) re-renders unless you memoize; context alone doesn’t magically isolate unrelated siblings.

---

## `createContext`, `Provider`, and `useContext` (minimal recipe)

1. **`createContext(defaultValue)`** — returns a context object. The `defaultValue` is only used when **no** Provider wraps the subtree (useful for tests or optional context).
2. **`<MyContext.Provider value={...}>`** — makes `value` available to all descendants.
3. **`useContext(MyContext)`** — returns the **current** `value` from the nearest Provider for `MyContext`.

```jsx
import { createContext, useContext, useMemo, useState } from "react";

const CountContext = createContext(null);

export function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  const value = useMemo(() => ({ count, setCount }), [count]);

  return (
    <CountContext.Provider value={value}>
      {children}
    </CountContext.Provider>
  );
}

export function useCount() {
  const ctx = useContext(CountContext);
  if (ctx == null) {
    throw new Error("useCount must be used inside <CountProvider>");
  }
  return ctx;
}
```

Wrapping **`useContext` in a small hook** (`useCount`) is a common pattern: one place for the **“missing Provider”** guard and a stable name in your codebase.

---

## useContext vs passing props (quick comparison)

| Question | Prefer **props** | Prefer **context** |
|----------|------------------|---------------------|
| Does only one or two levels need this? | **Yes** | Usually overkill |
| Do many unrelated branches need the same “ambient” data? | Awkward **prop drilling** | **Often yes** |
| Is the value really **configuration** (theme, locale, current user)? | Possible via props, gets noisy | **Context** fits well |
| Should this stay **explicit** in the public API of a leaf component? | **Props** document what it needs | Context can hide dependencies |

Context is not a replacement for props — it’s a **distribution mechanism** when lifting state to an ancestor already happened and passing props through every layer hurts readability.

---

## Pattern: theme, auth, or other “app shell” data

Typical shape: state + setter live in a **provider component** near the root; leaves call **`useTheme()`** (or similar) instead of receiving seven optional props.

```jsx
import { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx == null) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}
```

**`useMemo` on the context `value`** avoids passing a **new object every render** when `theme` didn’t change — cheap and reduces unnecessary re-renders of consumers that only care about referential stability. If the value is a **single primitive** or a **stable callback** from `useCallback`, you don’t need the object memo pattern.

---

## Pattern: splitting context (state vs dispatch)

If you put a **large** object in one context `{ state, dispatch, helpers... }`, **any** field change recreates `value` and can re-render **all** consumers. A common fix is **two contexts**: one for rarely changing data, one for frequently changing slices — or separate contexts per domain (see React docs on **context optimization**).

```jsx
import { createContext, useState } from "react";

const ThemeStateContext = createContext(null);
const ThemeSetContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeSetContext.Provider value={setTheme}>
      <ThemeStateContext.Provider value={theme}>
        {children}
      </ThemeStateContext.Provider>
    </ThemeSetContext.Provider>
  );
}
```

Components that only **call** `setTheme` read **`ThemeSetContext`** and won’t re-render when `theme` changes if you structure children so only state-readers subscribe to `ThemeStateContext`.

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Forgetting **`<Provider>`** | You get the **default** from `createContext` (or `undefined`) — subtle bugs if default is `null` |
| **New object** as `value` every render | Every consumer may re-render even when “logical” data didn’t change — **memoize** the value or pass stable primitives |
| Using context for **everything** | Hard to trace data flow; prefer **props** for local, well-bounded APIs |
| Huge **global store** in one context | Performance and mental overhead; consider **composition**, **useReducer**, or a dedicated store library for complex apps |

---

## Where to go next

- **Who owns the state**: [React data flow patterns](/course-notes/react-data-flow-patterns) — lifting state, props down / callbacks up, and where context fits.
- **Stateful providers**: [useState](/course-notes/useState) — providers are normal components; they often hold state and pass it through `value`.
- **Heavier update logic**: consider **`useReducer`** in a provider when updates become event-heavy or multi-step (same course notes series).

Official docs: **Context** and **useContext** in the React documentation.
