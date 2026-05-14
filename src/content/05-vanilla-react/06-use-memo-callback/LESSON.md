# useMemo / useCallback

## What they are in React

- **`useMemo(factory, deps)`** — run `factory()` when **`deps`** changed since last commit; **cache** the return value so expensive work and stable object identities can skip repeats.
- **`useCallback(fn, deps)`** — cache **the function reference** itself when `deps` are unchanged, so children that take a `memo` comparison or lists with `key` do not see a “new” handler every render.

Neither hook is for “hiding” side effects — only for **derivations** and **referential stability**.

### Try it

1. **`/labs/vanilla-react/lesson-06`**
2. `npx --yes serve src/content/05-vanilla-react/06-use-memo-callback`

### Supporting files

- [`memo-callback-vanilla.js`](./memo-callback-vanilla.js) · [`index.html`](./index.html)

---

## React (reference)

```jsx
const doubled = useMemo(() => count * 2, [count]);
const onInc = useCallback(() => setCount((c) => c + 1), [count]);
```

(Exact bodies vary; the invariant is **deps → invalidate cache**.)

---

## Vanilla implementation

Two tiny caches: **`memoDep` / `memoDoubled`** for the doubled value, **`cbDep` / `cachedIncrement`** for the increment function. When **`count`** matches the last deps, reuse; otherwise recompute / recreate.

```javascript
export function mountLesson06(host) {
  let count = 0;
  let memoDep = NaN;
  let memoDoubled = 0;

  function readMemoDoubled() {
    if (memoDep === count) return memoDoubled;
    memoDep = count;
    memoDoubled = count * 2;
    return memoDoubled;
  }

  let cbDep = NaN;
  let cachedIncrement = null;

  function getIncrementCallback() {
    if (cbDep === count && cachedIncrement) return cachedIncrement;
    cbDep = count;
    cachedIncrement = () => {
      count += 1;
      paint();
    };
    return cachedIncrement;
  }

  function paint() {
    host.replaceChildren();
    const doubled = readMemoDoubled();
    const p = document.createElement('p');
    p.textContent = `count: ${count} — memo doubled: ${doubled}`;
    const q = document.createElement('p');
    const cb = getIncrementCallback();
    q.textContent = `same cb reference when count unchanged? ${cb === getIncrementCallback()}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'increment';
    btn.addEventListener('click', cb);
    host.append(p, q, btn);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## What this code is doing

- **`readMemoDoubled`** — if `count` has not changed, return the stored **`memoDoubled`**; otherwise recompute. That is **`useMemo`** without React’s slot machinery.
- **`getIncrementCallback`** — when **`count`** changes, the increment closure must close over the new count path; here we **recreate** the function. When **`count`** is unchanged between two calls in the same `paint`, the **same** function object is returned — **`useCallback`** with `[count]` deps.

---

## Not in this lesson

Deep dependency compares, `useCallback` with `[]` stable forever. See [../REQUIREMENTS.md](../REQUIREMENTS.md).
