# JSX Components

JSX is syntax sugar for `React.createElement` calls. Once you internalize that, a lot of "weird JSX rules" stop being weird.

What is a react element? is an object version of the element for going from jsx to converting from react element to the dom element in the browser
react components return a react element, then to html elements in the browser

## What JSX compiles to

This:

```jsx
const el = <button onClick={handleClick}>Click me</button>;
```

…compiles to roughly this:

```js
const el = React.createElement('button', { onClick: handleClick }, 'Click me');
```

That's why **JSX expressions can only have one root element** — a function call returns one value.



```javascript
// definition
function add (x, y) {
  return * + y
} 


// invocation
add (1, 2) n


// component definition
function Icon () {
  return ‹svg />
} 

// an element, not a component or component element, jsx function turns the component into html element
<Icon /> 
```


## Handling events


```javascript
// Do: will be executed when the click event occurs
<button onClick={handleClick}>
Passing a Reference
</button>

// Don't: will continually call the function
<button onClick={handleClick()}>
Passing an Invocation
</button>
```


## Expressions vs. statements

Inside `{ ... }` in JSX you can put any **expression**, but not a statement.

```jsx
function Greeting({ user }) {
  return (
    <p>
      Hello, {user ? user.name : 'stranger'}.
    </p>
  );
}
```

`if`, `for`, and `switch` are statements — they can't go inside `{ }`. Use ternaries, `&&`, or extract a helper.

## Lists

```jsx
<ul>
  {items.map((item) => (
    <li key={item.id}>{item.label}</li>
  ))}
</ul>
```

The `key` prop is React's identity hint for reconciliation. Use a stable id, not the array index.


## Props

Props is how we pass data into a child component, typically.

```jsx
function Hello (props) {
  return <h1>Hello, {props.name}</h1>
}

export default function App () {
  return <Hello name='Tyler' />
}
```


> One thing to note is that if you pass a prop without a value, that value will be set to true. These are equivalent.

Use destructuring:

```jsx
function Hello ({ first, last }) {
  return (
    <h1>
      Hello, {first} {last}
    </h1>
  )
}
```


```jsx
<Profile
  username="tylermcginnis"
  authed={true}
  logout={handleLogout}
  header={<h1>👋</h1>}
/>
```


An object:

```jsx
<DatePicker settings={{
  format: "yy-mm-dd",
  animate: false,
  days: "abbreviate"
}} />
```






### Children


```jsx
<Header>You can have text between tags.</Header>

<Layout>
  <h1>You can also have</h1>
  <p>elements between tags</p>
</Layout>
```



```jsx
function Header (props) {
  return <h1 className="header">{props.children}</h1>
}

function Layout (props) {
  return (
    <div className="layout">
      <Sidebar />
      {props.children}
      <Footer />
    </div>
  )
}
```


```jsx
export default function App () {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)
  
  return (
    <main>
      <button onClick={handleOpen}>Open Modal</button>
      {isOpen && (
        <Modal onClose={handleClose}>
          <h1>Modal is Customizable</h1>
          <p><i>children</i> can be whatever we want.</p>
          <p>(and it can be different each time we use Modal)</p>
        </Modal>
      )}
    </main>
  )
}
```