# useSyncExternalStore

## What it is in React

`useSyncExternalStore(subscribe, getSnapshot)` lets a component **read some value that lives outside React** (browser API, global store, module singleton) and **subscribe** so that when the external source changes, React can schedule an update. React also uses this pattern to reduce **tearing** when reading external mutable state in concurrent mode (details in React docs).

Vanilla shape: **`getSnapshot()`** reads the current value; **`subscribe(onStoreChange)`** registers a listener the store calls when the value changes; your UI calls **`getSnapshot()`** whenever it repaints.


## React (reference)

```jsx
const snap = useSyncExternalStore(store.subscribe, store.getSnapshot);
```

---

## Vanilla implementation

A tiny **`listeners` set**, **`n`**, **`subscribe`**, **`getSnapshot`**, **`tick`**. After mount, **`subscribe(() => paint())`** so any external **`tick()`** triggers a reread of **`getSnapshot()`** and a redraw.

```javascript
export function mountLesson07(host) {
  const listeners = new Set();
  let n = 0;

  function getSnapshot() {
    return n;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function tick() {
    n += 1;
    for (const l of [...listeners]) l();
  }

  function paint() {
    const snap = getSnapshot();
    host.replaceChildren();
    const p = document.createElement('p');
    p.textContent = `snapshot from store: ${snap}`;
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'mutate store (notifies subscribers)';
    b.addEventListener('click', () => tick());
    host.append(p, b);
  }

  const unsubscribe = subscribe(() => {
    paint();
  });

  paint();
  return () => {
    unsubscribe();
    host.replaceChildren();
  };
}
```

---

## What this code is doing

- **`getSnapshot`** is the read path the UI trusts during **`paint`**.
- **`tick`** mutates external state and **notifies** — same responsibility as your store layer outside React.

---

## Not in this lesson

Tearing, concurrent rendering, server snapshot. See [../REQUIREMENTS.md](../REQUIREMENTS.md) §6.
