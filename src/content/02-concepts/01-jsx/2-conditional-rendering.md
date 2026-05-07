# Conditional Rendering

JSX has no `if` directive. Conditional rendering is just JavaScript expressions.

## Ternary

The workhorse for "show A or B":

```jsx
<button disabled={loading}>
  {loading ? 'Saving…' : 'Save'}
</button>
```

## Logical AND

For "show A or nothing":

```jsx
{error && <p className="error">{error}</p>}
```

**Watch out:** if the left side can be `0`, it'll render the `0`. Coerce to boolean:

```jsx
{Boolean(items.length) && <p>{items.length} items</p>}
```

…or use a ternary returning `null`:

```jsx
{items.length > 0 ? <p>{items.length} items</p> : null}
```

## Early return

When the branches are large, an early return is more readable than a ternary:

```jsx
function Profile({ user }) {
  if (!user) return <Loading />;
  return <UserCard user={user} />;
}
```
