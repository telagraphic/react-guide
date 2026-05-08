# From Component to React Element to DOM

Three layers, each a transformation of the layer before:

```
Component (function)  →  React element (object)  →  DOM node (browser)
```

Understanding the boundary between each layer is the difference between fighting React and using it.

## Layer 1: Component

A component is a JavaScript function. It takes props in, returns JSX.

```jsx
function Greeting({ name }) {
  return <p>Hello, {name}!</p>;
}
```

That's it. There is no class, no lifecycle (function components), no special framework binding. It's a function whose return value happens to look like HTML.

## Layer 2: React element

When you write `<Greeting name="Ada" />`, the JSX compiler turns it into:

```js
React.createElement(Greeting, { name: 'Ada' });
```

The return value is a plain JS object — a **React element**. Roughly:

```js
{
  type: Greeting,
  props: { name: 'Ada' },
}
```

Notice what this is *not*: it's not HTML, it's not a DOM node, and the `Greeting` function hasn't been called yet. The element is just a description.

If `Greeting` itself returns `<p>Hello, Ada!</p>`, that compiles to *another* React element:

```js
{
  type: 'p',
  props: { children: ['Hello, ', 'Ada', '!'] },
}
```

When `type` is a **string** (like `'p'`), React knows it maps to a real HTML tag. When `type` is a **function** (like `Greeting`), React calls it to get more elements out — recursively, until everything is strings.

## Layer 3: DOM

Once React has the fully-resolved tree of elements (only string `type`s left), it walks it and creates real DOM nodes via `document.createElement`, `createTextNode`, and `appendChild`. From the example above:

```html
<p>Hello, Ada!</p>
```

This last step is what `react-dom` does. The reason React separates "element tree" from "DOM tree" is so it can do this last step *intelligently* — only creating new nodes for parts of the tree that actually changed.

## Why the indirection exists

If components returned DOM nodes directly, two things would break:

1. **You couldn't render to non-DOM targets.** React Native renders the same element tree to mobile views. The element tree is portable; DOM is not.
2. **Diffing would be impossible.** React compares the *previous* element tree with the *new* one to figure out the smallest set of DOM changes. That comparison happens at the element layer, before anything touches the DOM.

## The mental model

Whenever something feels weird about React, ask: which layer am I at?

- "Why can't I `console.log` my component and see HTML?" — You're at layer 1 (a function); layer 3 doesn't exist yet.
- "Why is my `onClick` a function and not a string?" — Layer 2 is JS, not HTML. JS holds functions.
- "Why is `key` important?" — It's a hint for the diff between two layer-2 trees, not a DOM attribute.
