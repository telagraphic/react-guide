# `props.children` Patterns

Every React component automatically receives a special prop called `children`: the JSX nested inside its tags. `children` is what makes components composable.

## The basic case

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>Title</h2>
  <p>Body</p>
</Card>
```

The `<h2>` and `<p>` are passed as `children` and rendered inside the div. The `Card` component doesn't know or care what's inside.

## Why this is powerful

Without `children`, you'd have to keep adding props every time someone wanted a slightly different `Card`:

```jsx
<Card title="..." body="..." footer="..." />  // ad infinitum
```

With `children`, the component owns the *shell* (the styled wrapper) and the caller owns the *contents*. That separation is one of the most reused patterns in React.

## Pattern 1: Layout component

The most common use. A component that imposes a visual or structural shell:

```jsx
function PageShell({ children }) {
  return (
    <div className="page">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

## Pattern 2: Multiple slots via named props

Sometimes you want *more than one* "children-like" hole. Don't try to type-tag children — just use named props:

```jsx
function Modal({ header, children, footer }) {
  return (
    <div className="modal">
      <header>{header}</header>
      <div className="body">{children}</div>
      <footer>{footer}</footer>
    </div>
  );
}

<Modal
  header={<h2>Confirm</h2>}
  footer={<button>OK</button>}
>
  Are you sure?
</Modal>
```

## Pattern 3: Render-prop / function-as-children

When the parent needs to pass *data* down to whatever it renders, `children` can be a function instead of JSX:

```jsx
function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn(!on) });
}

<Toggle>
  {({ on, toggle }) => (
    <button onClick={toggle}>{on ? 'On' : 'Off'}</button>
  )}
</Toggle>
```

Hooks have largely replaced this pattern (`useToggle()` is simpler), but you'll still see it in older codebases or in cases where the rendered tree depends on the parent's state.

## Pattern 4: Compound components

Components that only make sense together, exposed as namespaced parts:

```jsx
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="a">A</Tabs.Trigger>
    <Tabs.Trigger value="b">B</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="a">…</Tabs.Panel>
</Tabs>
```

Internally, `Tabs` shares state with its parts via context. Common in component libraries (Radix, Headless UI). Probably overkill for your own components until you've felt the pain that motivates them.

## When *not* to use `children`

If the component renders a fixed structure with no slots, just use ordinary props:

```jsx
function Avatar({ src, alt }) {
  return <img className="avatar" src={src} alt={alt} />;
}
```

Reaching for `children` here would create a hole that doesn't need to exist.
