# What is JSX?

JSX is a small extension to JavaScript that lets you write HTML-like markup inside JS. It is not HTML, and it is not a template language. It is a syntax for *describing trees of objects*.

## The mental model

Every JSX expression is, after compilation, a function call:

```jsx
<div className="card">
  <h2>Title</h2>
  <p>Body</p>
</div>
```

…becomes:

```js
React.createElement(
  'div',
  { className: 'card' },
  React.createElement('h2', null, 'Title'),
  React.createElement('p', null, 'Body'),
);
```

The return value is a plain JS object describing what to render. React turns that object tree into real DOM nodes later.

## Why this matters

Once you see JSX as "just function calls returning objects," several things click:

- **JSX expressions are values.** You can store them, return them, pass them as props.
- **You can compose them with normal JS.** `.map()`, ternaries, helper functions.
- **There's nothing magical happening at runtime.** It's just JavaScript.
