# Destructuring and Spread

Modern JS syntax you'll see on every page of React code. Knowing it cold makes JSX legible.

## Object destructuring

Pull named properties out of an object into local variables:

```js
const user = { name: 'Ada', age: 36, role: 'engineer' };
const { name, age } = user;
// name → 'Ada', age → 36
```

In React, this is how component props are read:

```jsx
function Greeting({ name, age }) {
  return <p>{name} is {age}</p>;
}
```

`{ name, age }` in the parameter list is destructuring the props object that React passes in.

### Renaming

```js
const { name: userName } = user;  // userName → 'Ada'
```

Useful when a prop name would shadow something already in scope.

### Defaults

```js
const { role = 'user' } = user;  // 'engineer' (would be 'user' if missing)
```

In components, this is how you give props default values:

```jsx
function Button({ label, variant = 'primary' }) { ... }
```

## Array destructuring

Order-based, bracket syntax:

```js
const [first, second] = [1, 2, 3];
// first → 1, second → 2
```

In React, this is how `useState` is consumed:

```jsx
const [count, setCount] = useState(0);
```

The position matters: `useState` *always* returns `[value, setter]`. The names you use are up to you.

## Spread (`...`)

The `...` operator copies the contents of an iterable or object into another. It's the modern replacement for `Object.assign`, `Array.prototype.concat`, and `slice`.

### Spread an array

```js
const xs = [1, 2, 3];
const ys = [...xs, 4, 5];   // [1, 2, 3, 4, 5]
const copy = [...xs];        // shallow copy
```

In React this is how you immutably append to a list in state:

```jsx
setTodos([...todos, newTodo]);
```

### Spread an object

```js
const a = { x: 1, y: 2 };
const b = { ...a, z: 3 };           // { x: 1, y: 2, z: 3 }
const c = { ...a, x: 99 };          // { x: 99, y: 2 }   ← later keys win
```

In React this is how you immutably update one field of an object:

```jsx
const updated = { ...todo, completed: true };
```

That pattern — "make a new object that's the old one plus one changed field" — is the heartbeat of immutable state updates.

## Rest (`...`)

`...` on the *left* of an `=` collects what's left over:

```js
const { id, ...rest } = todo;
// id → todo.id
// rest → everything else
```

```js
const [head, ...tail] = [1, 2, 3];
// head → 1, tail → [2, 3]
```

In components, rest is how you "forward unknown props":

```jsx
function Button({ label, ...rest }) {
  return <button {...rest}>{label}</button>;
}
```

`{...rest}` in JSX spreads the leftover props onto the underlying element.

## `.map`, `.filter`, `.reduce`

Functional array methods. Each returns a new array (or value) — they don't mutate the original. That immutability is exactly what React expects.

```js
const labels = todos.map((t) => t.label);
const incomplete = todos.filter((t) => !t.completed);
const total = nums.reduce((sum, n) => sum + n, 0);
```

In JSX, `.map` is how you turn an array into an array of elements:

```jsx
<ul>
  {todos.map((t) => <li key={t.id}>{t.label}</li>)}
</ul>
```

## Common immutable update recipes

| Goal                              | Pattern                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| Append to array                   | `[...arr, item]`                                               |
| Prepend to array                  | `[item, ...arr]`                                               |
| Remove by id                      | `arr.filter((x) => x.id !== id)`                               |
| Replace by id                     | `arr.map((x) => x.id === id ? newX : x)`                       |
| Update one field of one item      | `arr.map((x) => x.id === id ? { ...x, field: v } : x)`         |
| Toggle one field                  | `{ ...obj, field: !obj.field }`                                |

Memorize these. Every Todo-list-shaped feature in React uses some subset of them.
