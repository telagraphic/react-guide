# createElement

JSX is sugar for function calls. Every React tutorial starts here, but most skip the part where you actually write the function.

## What we're implementing

```js
React.createElement('button', { onClick: handleClick }, 'Click me')
```

The output is a plain object — a *virtual DOM node* — describing what the user will see.

## The implementation

```js
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

Two things to notice:

1. **Children are normalized.** Strings and numbers become `TEXT_ELEMENT` nodes so the rest of the system can treat *all* children uniformly.
2. **It's just data.** No DOM, no rendering, no side effects. We're producing a description of what to render.

## Wiring up JSX

To use this with JSX, configure your build to compile JSX to *your* `createElement`:

```js
/** @jsx createElement */
const element = (
  <div className="card">
    <h2>Hello</h2>
  </div>
);
```

The `/** @jsx createElement */` comment tells Babel/esbuild to call your function instead of `React.createElement`. The `element` variable now holds a tree of `{ type, props }` objects we'll consume in the next step.
