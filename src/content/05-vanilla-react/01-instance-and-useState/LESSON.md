# useState

## What `useState` is in React

`useState` is a **hook**: a function you call during render so React can associate a piece of memory with **this component instance**. Calling `useState(initialValue)` returns a pair: the **current value** for that slot, and a **setter** function. The initial value is only used on the first mount (unless you pass a function, in which case React runs it once to get the initial state).

When you call the setter, you are asking React to **schedule an update**. On the next render pass for that instance, `useState` returns the **updated** value. React then runs your component function again, evaluates your JSX with that value, and **reconciles** the result with what is already in the DOM so the screen matches the new state. You do not mutate the previous render’s variables yourself; React keeps the canonical value and drives the UI from it.

The snippet below is a single `useState` in a counter: one number, one setter, one button that bumps the number.

### Try it

1. **Dev app:** open **`/labs/vanilla-react/lesson-01`** — the guide app imports [`use-state-vanilla.js`](./use-state-vanilla.js) so the vanilla counter runs in a panel (keep that file aligned with the **Vanilla implementation** code block below).
2. **Static only:** from the repo root, `npx --yes serve src/content/05-vanilla-react/01-instance-and-useState`, then open [`index.html`](./index.html) in the browser.

### Supporting files in this folder

- **[`use-state-vanilla.js`](./use-state-vanilla.js)** — the same logic as the fenced **Vanilla implementation** block, as an ES module. The Vite lab route imports it so the demo runs without pasting this code into React. Edit the lesson or this file first, then mirror the change in the other so they stay in sync.
- **[`index.html`](./index.html)** — a tiny page with a `#root` div and a `<script type="module">` that imports `mountLesson01` and mounts it. Use this when you want to run the vanilla demo **outside** the main guide app (for example after `npx serve` on this directory). It is not part of the narrative; it is only a runner.

---

## React (reference)

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <p>count: {count}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        increment
      </button>
    </>
  );
}
```

In this snippet, `count` is the value from `useState`, and `setCount` is the setter. The JSX reads `count` for the label and closes over `setCount` for the click handler — same data flow as the vanilla version below, with React owning the storage and the DOM updates.

---

## Vanilla implementation

One variable holds the number. One function rebuilds the paragraph and button whenever that number changes. That is the whole idea `useState` is packaging.

```javascript
export function mountLesson01(host) {
  let count = 0;

  function paint() {
    host.replaceChildren();

    const label = document.createElement('p');
    label.textContent = `count: ${count}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'increment';
    btn.addEventListener('click', () => {
      count += 1;
      paint();
    });

    host.append(label, btn);
  }

  paint();
  return () => host.replaceChildren();
}
```

---

## What this vanilla code is doing (step by step)

### `mountLesson01(host)`

You pass in the DOM node React would call the “root” (here: the element the lab page gives you). Everything below **closes over** that `host` and over `count`: that closure is the rough equivalent of “one component instance” — private state plus functions that know which DOM subtree to update.

### `let count = 0`

This is the direct stand-in for **`useState(0)`**. There is no hidden API: the current count is exactly that binding. React stores the same integer in an internal slot you do not see; you store it in a variable you do see.

### `function paint() { ... }`

Think of **`paint`** as “make the UI match `count` right now.” React’s version is: run `Counter` again, diff the new virtual tree against the old one, patch the DOM. Your version is more literal:

1. **`host.replaceChildren()`** — remove everything inside `host` so you are not leaving old nodes behind. React usually does finer-grained updates; wiping and rebuilding is the blunt teaching version of “the view is derived from state.”

2. **Build the label** — `document.createElement('p')`, then set `textContent` to a string that includes `count`. That is the same information `{count}` encodes in JSX.

3. **Build the button** — new button, label “increment”, then **`addEventListener('click', ...)`**. In React you pass `onClick`; in the DOM you attach a listener yourself. The function you pass closes over **`count`** and **`paint`**: when it runs later, it still sees the same `count` variable (mutated in place), not a stale copy.

4. **`count += 1` then `paint()`** — that pair is the stand-in for **`setCount(c => c + 1)`**. You mutate the one source of truth, then call the same “sync UI to state” function again. React batches and may defer work; here everything runs immediately, which is fine for learning the dependency: **state change → run something that refreshes the UI.**

5. **`host.append(label, btn)`** — attach the fresh nodes under `host`. After a click, the next `paint()` destroys these nodes when `replaceChildren()` runs, then creates brand-new nodes. So each click means new DOM elements; React would often reuse the same DOM nodes when possible.

### First call: `paint()`

`mountLesson01` ends by calling **`paint()` once**. So on load you get count `0`, one paragraph, one button, one listener. Nothing magic: it is just the initial draw.

### The return value: `() => host.replaceChildren()`

That function is a tiny **teardown** (for example when the React wrapper unmounts the lab). Clearing `host` drops the nodes and the listeners attached to them, so you do not leak old buttons into the page.

---

## Mapping in one glance

| React | This vanilla |
|--------|----------------|
| `useState(0)` | `let count = 0` |
| `setCount(c => c + 1)` | `count += 1` (then redraw) |
| Re-render `Counter` | `paint()` runs again |
| JSX → DOM | `createElement` + `textContent` + `append` |
| “Instance” memory | The closure: `count`, `paint`, `host` |

---

## How React goes further (so you know what we skipped)

- **Many hooks** — React keeps an ordered list of values (one slot per `useState` call). In vanilla you would add `let name = ''`, or fields on an object, or an array you manage yourself; the *idea* is still “one binding per piece of state the UI reads.”
- **Functional updates** — `setCount(c => c + 1)` matters when updates queue; here we only do `count += 1` synchronously inside the click handler.
- **Reconciliation** — React tries to update the smallest part of the DOM; we replace the whole subtree every time for clarity.

---

## Checklist

- [ ] Point to the **single place** the number lives (`count`).
- [ ] Explain why **`paint`** runs after the click (state changed, view must catch up).
- [ ] Say what **`replaceChildren`** is doing in one sentence (reset subtree before redraw).

---

## Not in this lesson

`createRoot`, virtual trees, batching, `useEffect`. See [../../REQUIREMENTS.md](../../REQUIREMENTS.md) for the wider track.
