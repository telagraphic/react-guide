# useLayoutEffect

## What it is in React

`useLayoutEffect` runs **after DOM mutations for this commit** but **before the browser paints** the user-visible frame (in the real browser integration). That lets you read layout (heights, scroll positions) and **synchronously** adjust DOM so users do not see a “wrong” intermediate frame.

**`useEffect`** (passive) runs later — good for subscriptions that do not need to block paint.

This lesson only contrasts **same-turn synchronous read** vs **`queueMicrotask`** read as a **teaching sketch** — not a real paint boundary.


## React (reference)

```jsx
useLayoutEffect(() => {
  const w = node.getBoundingClientRect().width;
  setMeasured(w);
}, []);
```

---

## Vanilla implementation

After **`append`**, read **`getBoundingClientRect()`** immediately — that is the **layout-effect-style** path. Schedule the same read in a **microtask** to contrast with a **later** turn of the event loop (roughly closer to where a passive effect might run).

```javascript
export function mountLesson08(host) {
  function paint() {
    host.replaceChildren();
    const box = document.createElement('div');
    box.textContent = 'Measured box';
    box.style.width = '140px';
    box.style.padding = '8px';
    box.style.border = '1px solid';
    host.append(box);

    const widthSync = box.getBoundingClientRect().width;

    const syncLine = document.createElement('p');
    syncLine.textContent = `Same-turn read (layout-ish): ${Math.round(widthSync)}px`;
    host.append(syncLine);

    queueMicrotask(() => {
      const widthLater = box.getBoundingClientRect().width;
      const asyncLine = document.createElement('p');
      asyncLine.textContent = `Microtask read (passive-effect-ish): ${Math.round(widthLater)}px`;
      host.append(asyncLine);
    });
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## Not in this lesson

Real host flush timing. See [../REQUIREMENTS.md](../REQUIREMENTS.md) §1.5.
