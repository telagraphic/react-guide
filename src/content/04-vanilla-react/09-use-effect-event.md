# useEffectEvent / stable “latest” callback

## What React is solving

Long-running subscribers (intervals, analytics, data channels) should not **re-subscribe** every time unrelated state changes, but their handler still needs to read **fresh** props/state. React 19’s **`useEffectEvent`** formalizes a **stable** function identity whose **body** always sees latest values.

The same **idea** in vanilla: keep a **mutable ref object** whose **`.current`** field you replace on every “render” (`paint`) with the latest function; the subscriber only holds a **stable wrapper** that calls **`latest.current()`**.


## React (reference)

```jsx
const onTick = useEffectEvent(() => {
  console.log(count);
});
```

(Exact API evolves; the invariant is **stable subscriber surface + latest closure**.)

---

## Vanilla implementation

**`latest.current`** is reassigned every **`paint`** so it always closes over the current **`count`**. A button simulates “something that subscribed once” by invoking **`latest.current()`** — no stale closure.

```javascript
export function mountLesson09(host) {
  let count = 0;
  const latest = { current: () => 0 };

  function paint() {
    host.replaceChildren();
    latest.current = () => count;

    const label = document.createElement('p');
    label.textContent = `count: ${count}`;

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = 'increment';
    inc.addEventListener('click', () => {
      count += 1;
      paint();
    });

    const read = document.createElement('button');
    read.type = 'button';
    read.textContent = 'subscriber reads latest() via ref';
    read.addEventListener('click', () => {
      const out = document.createElement('p');
      out.textContent = `latest(): ${latest.current()}`;
      host.append(out);
    });

    host.append(label, inc, read);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## Mapping

| Idea | Vanilla |
|------|---------|
| Latest logic | `latest.current = () => count` each paint |
| Stable subscriber | any code that only calls `latest.current()` |

---

## Not in this lesson

Exact `useEffectEvent` runtime integration. See [../REQUIREMENTS.md](../REQUIREMENTS.md).
