# useOptimistic

> Show **optimistic UI** immediately while an async mutation runs — then **reconcile** to the server’s result when the action finishes (or roll back on error).

**`useOptimistic(state, updateFn?)`** returns **`[optimisticState, addOptimistic]`**:

- **`state`** — the **real** data from props or from state updated after the server responds.
- **`optimisticState`** — what you **render** during pending work (often `state` plus temporary patches).
- **`addOptimistic(partial)`** — apply a **temporary** update for the duration of an async action (React 19+).

The hook is built for **mutations** (like, follow, send message, move kanban card) where waiting for the network feels sluggish, but the UI should still **match reality** once the server answers.

---

## What problem it solves

```text
WITHOUT optimistic UI
─────────────────────
click Like ──► await POST ──► setState(server) ──► heart fills   (200–500ms gap)

WITH useOptimistic
──────────────────
click Like ──► addOptimistic(liked) ──► heart fills NOW
            └──► await POST ──► success: state catches up
                              └── error: revert to state (no optimistic patch)
```

You separate **what the user should see right now** from **what the database ultimately says**.

---

## Timeline: optimistic → confirmed

```text
TIME ──►

t0   state = { liked: false }
     optimistic = { liked: false }

t1   user clicks Like
     addOptimistic({ liked: true })
     optimistic = { liked: true }     ← render immediately

t2   await saveLike() in flight…
     UI still shows liked

t3a  success: setState from server OR parent refetch
     state = { liked: true }
     optimistic merges back → { liked: true }

t3b  failure: catch, toast error
     state still { liked: false }
     optimistic drops patch → { liked: false }   ← rollback
```

---

## `useOptimistic` vs alternatives

| Approach | Pros | Cons |
|----------|------|------|
| **`setState` only after `await`** | Always correct | Feels slow |
| **Manual `setState` + “pending” flag** | Full control | Easy to drift from server truth |
| **`useOptimistic`** | Built-in merge/revert with actions | Learn reducer/update shape |
| **`useTransition` + `isPending`** | Good for loading shells | Does not model “show fake success” |
| **SWR/React Query optimistic** | Cache-centric apps | Library-specific |

Use **`useOptimistic`** when the **rendered list/object** should temporarily differ from **`state`** during a mutation.

---

## Pattern: like / bookmark (social, content app)

```jsx
import { useOptimistic, useTransition } from "react";

async function toggleLike(postId, liked) {
  const res = await fetch(`/api/posts/${postId}/like`, {
    method: liked ? "POST" : "DELETE",
  });
  if (!res.ok) throw new Error("Like failed");
  return liked;
}

function LikeButton({ postId, liked: serverLiked, likeCount }) {
  const [optimistic, addOptimistic] = useOptimistic(
    { liked: serverLiked, count: likeCount },
    (current, nextLiked) => ({
      liked: nextLiked,
      count: current.count + (nextLiked ? 1 : -1),
    })
  );
  const [isPending, startTransition] = useTransition();

  function onClick() {
    const next = !optimistic.liked;
    startTransition(async () => {
      addOptimistic(next);
      try {
        await toggleLike(postId, next);
      } catch {
        // optimistic state reverts when transition ends and state unchanged
        alert("Could not update like");
      }
    });
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={optimistic.liked} disabled={isPending}>
      {optimistic.liked ? "♥" : "♡"} {optimistic.count}
    </button>
  );
}
```

**`updateFn`** (second argument) defines how to merge **`addOptimistic`** input into the current optimistic snapshot — here toggling **`liked`** and adjusting **`count`**.

---

## Pattern: send message in chat (messaging)

```jsx
function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMsg) => [...state, { ...newMsg, pending: true }]
  );
  const [isPending, startTransition] = useTransition();

  function onSubmit(text) {
    const temp = { id: crypto.randomUUID(), text, pending: true };
    startTransition(async () => {
      addOptimistic(temp);
      await sendMessage(text);
    });
  }

  return (
    <>
      <MessageList items={optimisticMessages} />
      <Composer onSubmit={onSubmit} disabled={isPending} />
    </>
  );
}
```

When **`messages`** updates from the server, **`optimisticMessages`** reconciles — pending row replaced by real id.

---

## Pattern: reorder kanban card (project tools)

```jsx
function Board({ columns, moveCard }) {
  const [optimisticColumns, updateColumns] = useOptimistic(columns);

  function onDrop(cardId, toColumnId, index) {
    startTransition(async () => {
      updateColumns(applyMove(optimisticColumns, cardId, toColumnId, index));
      try {
        await moveCard(cardId, toColumnId, index);
      } catch {
        // revert via state unchanged + optimistic clear
      }
    });
  }

  return <KanbanView columns={optimisticColumns} onDrop={onDrop} />;
}
```

Drag-and-drop feels instant; failed API restores the last committed **`columns`** prop.

---

## Pattern: with React 19 **Actions** / `useActionState`

Forms often combine **`useActionState`** (server return value) with **`useOptimistic`** for list rows:

```jsx
async function createTodo(prev, formData) {
  const title = formData.get("title");
  await saveTodo(title);
  return [...prev, { id: crypto.randomUUID(), title, done: false }];
}

function TodoApp({ todos }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(todos);
  const [state, formAction, isPending] = useActionState(createTodo, todos);

  return (
    <form
      action={async (fd) => {
        const title = fd.get("title");
        addOptimistic([...optimisticTodos, { id: "temp", title, done: false }]);
        await formAction(fd);
      }}
    >
      <ul>
        {(isPending ? optimisticTodos : state).map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
      <input name="title" />
      <button type="submit" disabled={isPending}>Add</button>
    </form>
  );
}
```

Exact wiring depends on your framework; the invariant is **optimistic layer for instant feedback**, **committed state** after the action resolves.

---

## `useOptimistic` + `useTransition`

| Hook | Role in mutation |
|------|------------------|
| **`useOptimistic`** | **What** to show while pending |
| **`useTransition`** | **`isPending`**, keep UI interactive, scope async work |

Almost always used together for buttons and forms.

---

## When to reach for `useOptimistic` (decision tree)

```text
User mutation should feel instant?
│
├─ Read-only fetch / navigation?
│     └─► useTransition or useDeferredValue — not optimistic
│
├─ Show temporary UI until server matches?
│     └─► useOptimistic
│
├─ Server always source of truth; spinner is enough?
│     └─► isPending + await (no optimistic patch)
│
└─ Complex cache (many queries)?
      └─► consider data-library optimistic APIs
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Optimistic UI **never** reconciled with server | Duplicate rows, wrong counts — update parent `state` on success |
| No **error** handling | User thinks action succeeded |
| Optimistic patch **too bold** (delete row before confirm) | Prefer reversible actions (pending flag vs remove) |
| Using for **read** paths | Optimistic is for **writes** |

---

## Where to go next

- **Non-urgent updates while mutating**: [useTransition](/course-notes/useTransition)
- **Defer expensive reads**: [useDeferredValue](/course-notes/useDeferredValue)
- **Server vs client state**: [React data flow patterns](/course-notes/react-data-flow-patterns)
- **Immutable updates**: [useState](/course-notes/useState)

Official docs: **useOptimistic** and **useActionState** in the React documentation (React 19+).
