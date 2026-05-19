# Server Components

> Run some components **on the server**, send **HTML (or a compact payload)** to the browser, and keep **interactive** parts as small **Client Components** — so users see content faster and download less JavaScript.

**React Server Components (RSC)** are not a replacement for everything you know. They are an **extra kind** of component that:

- Can **read databases and files** directly on the server.
- **Do not** ship their logic to the browser (no `useState` / `useEffect` in a Server Component).
- Compose with normal **Client Components** for buttons, inputs, and browser APIs.

You meet them most often in **Next.js App Router**, but the ideas apply wherever RSC is enabled.

---

## Beginner-friendly overview

### Two places components can run

```text
SERVER                          BROWSER (client)
────────                        ────────────────
Read DB / filesystem            useState, useEffect
Run on each request (or cache)  onClick, localStorage
Send UI description or HTML     Hydrate interactive islands
Secrets stay on server          User sees and interacts
```

**Client Components** (what you have been writing) run in the browser after JavaScript loads. They **re-render** when state or props change.

**Server Components** run **once per request** (or from a cache) on the server. Their output is merged into the page sent to the client. They are **not** “hydrated” like a client tree — there is no `useState` on the server component itself.

### The mental model in one sentence

**Server Components fetch and layout; Client Components listen and react.**

---

## What problem they solve

### The “waterfall” on the client

Classic SPA pattern:

```text
1. Browser downloads JS bundle
2. React mounts
3. useEffect fires → fetch user
4. useEffect fires → fetch posts for user
5. Finally render feed
```

Each step waits on the previous one. The user stares at spinners **after** JavaScript already loaded.

### Server Components can collapse steps

```text
1. Request hits server
2. Server Component reads user + posts from DB
3. HTML/stream sent with content already in place
4. Small client bundle hydrates only interactive widgets
```

| Pain | How RSC helps |
|------|----------------|
| Large JS bundle | Server logic **not** in client bundle |
| Sequential client fetches | **Parallel** server data access in one round trip |
| Secrets in client env hacks | API keys / DB only on server |
| SEO / first paint | Meaningful HTML earlier |

---

## Server vs Client — quick comparison

| | **Server Component** | **Client Component** |
|---|----------------------|----------------------|
| Runs where | Server | Browser (after download) |
| `useState`, `useEffect` | No | Yes |
| `onClick`, browser APIs | No | Yes |
| `async function Component()` | Yes (common pattern) | No (not as SC) |
| Ships JS to user | No (component code) | Yes |
| Marked with | Default in RSC frameworks | **`"use client"`** at top of file |

---

## Pattern: `"use client"` boundary (Next.js App Router)

Files **without** `"use client"` are Server Components by default. Add the directive when you need interactivity:

```jsx
// app/Counter.jsx — CLIENT
"use client";

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button type="button" onClick={() => setN(n + 1)}>{n}</button>;
}
```

```jsx
// app/ProductPage.jsx — SERVER (no directive)
import { Counter } from "./Counter";

async function getProduct(id) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);

  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <Counter />
    </article>
  );
}
```

```text
Composition
───────────
ProductPage (server) ──renders──► static title + description
              └──imports────────► Counter (client island)
```

**Rule:** Server Components can **import** Client Components. Client Components **cannot** import Server Components — pass **serializable props** (JSON-like data) instead.

---

## Pattern: async Server Component (direct data)

```jsx
// app/posts/page.jsx
async function getPosts() {
  // runs only on server — can use DB driver, fs, private env
  return db.query("SELECT * FROM posts ORDER BY created_at DESC LIMIT 20");
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
```

No `useEffect`, no `loading` state in the client for the initial list — the first paint can include posts.

Pair with **Suspense** when some regions are slower:

```jsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<PostsSkeleton />}>
      <Posts />
    </Suspense>
  );
}

async function Posts() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

See [React.Suspense](/react/react-suspense).

---

## Pattern: pass data from Server → Client

Client children receive **plain data** (strings, numbers, arrays, plain objects) — not functions from the server (except special “server actions” in frameworks).

```jsx
// CommentForm.jsx
"use client";

export function CommentForm({ postId, currentUserName }) {
  // useState, submit handler, etc.
}
```

```jsx
// post/page.jsx — server
import { CommentForm } from "./CommentForm";

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  const user = await getSessionUser();

  return (
    <>
      <h1>{post.title}</h1>
      <CommentForm postId={post.id} currentUserName={user.name} />
    </>
  );
}
```

```text
Props cross the server/client fence as serialized data
────────────────────────────────────────────────────
Server: user.name, post.id  ──JSON──►  Client: props
```

---

## Pattern: static shell + interactive islands (modern app layout)

Typical marketing / dashboard app:

| Region | Component type | Why |
|--------|----------------|-----|
| Nav links, footer, article body | Server | SEO, fast HTML, no JS needed |
| Search typeahead, cart drawer, theme toggle | Client | Events, state |
| Comments, like button | Client | Mutations + optimistic UI |
| Product list from CMS | Server | Fetch on server, stream in |

```text
┌─────────────────────────────────────────┐
│  Layout (server) — header, nav          │
├─────────────────────────────────────────┤
│  Page content (server) — fetch + HTML   │
│    ┌─────────────────────────────────┐  │
│    │ Client island — "Add to cart"   │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

Start **server by default**; add **`"use client"`** only to files that need hooks or events.

---

## Server Components vs things you already know

| You know… | Server Component angle |
|-----------|-------------------------|
| **`useEffect` fetch** | Often replaced by **async server fetch** for initial data |
| **`useState`** | Still client-only; server uses request data + DB |
| **API route + client fetch** | Can inline read on server if no public API needed |
| **`useOptimistic`** | Client — after server action or mutation |
| **Context** | Server and client contexts differ; share via props |

---

## Getting started checklist

1. **Use a framework** with RSC support (e.g. Next.js App Router) — wiring by hand is not beginner-friendly.
2. **Default to Server Components** for pages and layouts that mostly display data.
3. **Extract a Client Component** when you need `useState`, `useEffect`, or event handlers.
4. **Keep client islands small** — less JS, faster pages.
5. **Wrap slow server regions in `<Suspense>`** with skeleton fallbacks.
6. **Never put secrets** in Client Components or `NEXT_PUBLIC_*` env vars meant for the browser.

---

## When to reach for Server Components (decision tree)

```text
Building a new route or page?
│
├─ Mostly read-only content from DB/API?
│     └─► Server Component (async fetch on server)
│
├─ Needs clicks, inputs, animation, browser APIs?
│     └─► Client Component ("use client")
│
├─ Vite SPA only, no RSC bundler?
│     └─► stick with client + useEffect for now
│
└─ Mix?
      └─► Server parent + small client children
```

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| **`"use client"` on everything** | Defeats the purpose; large bundles |
| Importing server-only code into client | Build error or leaked secrets |
| Passing **non-serializable** props (functions, class instances) | Runtime errors across boundary |
| Using hooks in Server Components | Not allowed — split component |
| Expecting Server Components to **re-run in browser** on every interaction | They don’t — client state updates happen in Client Components |

---

## Where to go next

- **Loading boundaries**: [React.Suspense](/react/react-suspense)
- **Client-side urgency / transitions**: [useTransition](/react/useTransition)
- **Render pipeline**: [React rendering flow](/concepts/react-rendering-flow)
- **Data flow patterns**: [React data flow patterns](/concepts/react-data-flow-patterns)
- **Effects for browser-only sync**: [useEffect](/react/useEffect)

Official docs: **Server Components** and **use client** in the React and Next.js documentation.
