# render

Now we walk that virtual DOM tree and produce real DOM nodes.

## The implementation

```js
function render(element, container) {
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  // Set non-children props as attributes / properties.
  for (const [name, value] of Object.entries(element.props)) {
    if (name === 'children') continue;
    if (name.startsWith('on')) {
      dom.addEventListener(name.toLowerCase().slice(2), value);
    } else {
      dom[name] = value;
    }
  }

  // Recurse into children.
  for (const child of element.props.children) {
    render(child, dom);
  }

  container.appendChild(dom);
}
```

## What it handles

- **Text nodes** (`TEXT_ELEMENT`) become `document.createTextNode`.
- **Element nodes** become `document.createElement`.
- **Props starting with `on`** (`onClick`, `onChange`) become event listeners.
- **All other props** are set as DOM properties (`element.className = ...`, etc.).

## What it doesn't handle yet

This `render` is recursive and synchronous. Every call rebuilds the entire subtree from scratch. That's fine for the first render, but every state update will throw away and recreate every node.

Real React fixes this with **reconciliation** — diffing the previous tree against the new tree and only touching DOM nodes that actually changed. We'll get to it shortly. For now, this is enough to render a static tree.

## Try it

```js
const element = createElement('h1', { className: 'title' }, 'Hello, world');
render(element, document.getElementById('root'));
```

If a styled `<h1>` shows up in your `#root`, the pipeline works.
