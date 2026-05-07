# Components vs. Templates

In vanilla JS, the unit of reuse is usually a **template** plus some **glue code**. In React, the unit of reuse is a **component**: a function that returns markup.

## Vanilla

```html
<button id="counter">0</button>

<script>
  const btn = document.getElementById('counter');
  let count = 0;
  btn.addEventListener('click', () => {
    count += 1;
    btn.textContent = count;
  });
</script>
```

What's happening:

- The DOM and the state are two separate things.
- You manually keep them in sync with imperative code (`btn.textContent = count`).
- Every interaction is a "find element, mutate property" sequence.

## React

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {count}
    </button>
  );
}
```

What's happening:

- The DOM is a *function of state*.
- You change state. React re-renders. The DOM updates.
- You never call `textContent`, `appendChild`, or `removeChild` yourself.

## The trade

You give up direct DOM control. You get a unidirectional data flow: state changes → UI changes. No more "did I forget to update the DOM in this code path?"
