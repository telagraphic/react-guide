# useEffectEvent

> Define a **stable function** you can pass to effects or subscriptions whose **body always sees the latest** props and state — without putting those values in the effect dependency array and re-subscribing every render.

**`useEffectEvent(fn)`** (React 19+) returns a function with a **fixed identity** for the lifetime of the component. When something calls it (an effect, interval, or child), React runs the **latest** version of `fn` you wrote — similar to the **“ref + stable wrapper”** pattern in [useRef](/course-notes/useRef), but with explicit semantics and lint rules.

---

## What problem it solves

Long-lived setups — **`setInterval`**, **`addEventListener`**, WebSocket **`onmessage`**, analytics beacons — create a tension:

| Approach | Subscription | Fresh props/state |
|----------|----------------|-------------------|
| Put handler in effect deps | Re-subscribes every change | **Fresh** |
| Subscribe once with `[]` deps | **Stable** | **Stale** closure |
| Ref updated each render + stable wrapper | **Stable** | **Fresh** (manual) |
| **`useEffectEvent`** | **Stable** | **Fresh** (built-in) |

You want **one** listener attached, but when it fires it should read **today’s** `count`, `theme`, or `onSave` callback — not the values from the render when the effect first ran.

---

## Synchronization deps vs “effect events”

Your phrasing is the right mental model:

> Use a **reactive value** inside `useEffect`, but that value has **nothing to do with synchronizing** the component with the outside system — so it should **not** be in the dependency array.

**`useEffect`’s dependency array answers:** “When should I **tear down and re-run** this sync?” (new WebSocket when `roomId` changes, new fetch when `userId` changes, remove old listener and attach a new one.)

**`useEffectEvent` answers:** “When this sync **fires**, run logic that may read **latest** props/state/callbacks, without that read counting as a reason to **re-sync**.”

| Kind of value | Role in the effect | Belongs in `deps`? | Typical tool |
|---------------|-------------------|--------------------|----------------|
| **Sync input** — changing it means the external attachment is **wrong** | Defines *which* connection exists | **Yes** | `useEffect` deps only |
| **Reactive read** — only affects *what you do* when the connection fires | Observed inside the handler | **No** (use effect event) | `useEffectEvent` |
| **User gesture** — one-off action | Not an ongoing sync | — | Event handler (`onClick`) |
| **External store** — subscribe + snapshot | Store drives re-renders | — | `useSyncExternalStore` |

**Rule of thumb:** If changing the value should **disconnect and reconnect** (or abort and restart) the effect’s setup → **dependency**. If changing the value should only change **behavior on the next callback** while setup stays the same → **`useEffectEvent`**.

---

## Contrasting use cases (same hooks, different jobs)

### 1. Fetch when `userId` changes — **`useEffect` deps only** (not `useEffectEvent`)

`userId` **is** the sync contract: a fetch for user `1` must be **cancelled** when the user becomes `2`.

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser);
  return () => controller.abort();
}, [userId]); // ✅ userId belongs here
```

Putting `userId` inside `useEffectEvent` and leaving `[]` deps would **hide** a real sync boundary — stale requests, wrong user on screen. **Do not** use `useEffectEvent` to avoid deps that define **which** external resource you’re tied to.

---

### 2. Interval analytics — **`useEffectEvent`** (deps stay `[]`)

You attach **one** `setInterval` on mount. Each tick should log the **current** `theme` and `count`, but changing theme **should not** clear and recreate the interval — that’s not “re-syncing,” it’s just reading fresher data when the timer fires.

```jsx
// ❌ theme in deps — interval resets every theme change (unnecessary re-sync)
useEffect(() => {
  const id = setInterval(() => {
    analytics.track("heartbeat", { theme, count });
  }, 5000);
  return () => clearInterval(id);
}, [theme, count]);

// ✅ stable interval; reactive reads via effect event
const onHeartbeat = useEffectEvent(() => {
  analytics.track("heartbeat", { theme, count });
});

useEffect(() => {
  const id = setInterval(() => onHeartbeat(), 5000);
  return () => clearInterval(id);
}, []);
```

`theme` and `count` are **reactive** but **not sync inputs** for the interval resource.

---

### 3. Chat room — **split**: `roomId` in deps, `onMessage` as effect event

```jsx
function ChatRoom({ roomId, onMessage }) {
  const onMessageEvent = useEffectEvent(onMessage);

  useEffect(() => {
    const socket = connect(roomId);           // sync: which room
    socket.on("message", onMessageEvent);    // observe: latest handler
    return () => socket.disconnect();
  }, [roomId]); // only what redefines the connection
}
```

| Value | Sync or observe? | Why |
|-------|------------------|-----|
| `roomId` | **Sync** | Different room → must **disconnect** old socket |
| `onMessage` | **Observe** | Parent re-render may pass new callback; socket to **same** room can stay open |

```jsx
// ❌ onMessage in deps — reconnects WebSocket on every parent render
useEffect(() => {
  const socket = connect(roomId);
  socket.on("message", onMessage);
  return () => socket.disconnect();
}, [roomId, onMessage]);
```

---

### 4. Visibility listener — **`useEffect` + functional `setState`** vs **`useEffectEvent`**

When you only need the **latest state** to compute the **next** state, functional updaters avoid extra deps:

```jsx
// ✅ no useEffectEvent needed — setState accepts updater
useEffect(() => {
  const handleChange = () => {
    if (document.visibilityState !== "visible") {
      setTabAwayCount((c) => c + 1);
    }
  };
  document.addEventListener("visibilitychange", handleChange);
  return () => document.removeEventListener("visibilitychange", handleChange);
}, []);
```

If the listener must read **props** (e.g. `onTabAway(count)` from parent) or **multiple** reactive values without going through state, **`useEffectEvent`** is the better fit:

```jsx
const onTabAway = useEffectEvent(() => {
  onTabAwayProp(tabAwayCount);
});

useEffect(() => {
  const handleChange = () => {
    if (document.visibilityState !== "visible") onTabAway();
  };
  document.addEventListener("visibilitychange", handleChange);
  return () => document.removeEventListener("visibilitychange", handleChange);
}, []);
```

---

### 5. Button click — **neither** `useEffect` nor `useEffectEvent`

```jsx
// ✅ user caused this; Rule #1 — event handler
<button onClick={() => saveDraft(title)}>Save</button>
```

`useEffectEvent` is **not** for JSX event handlers. Effects (and effect events) are for **ongoing synchronization** after render, not direct user actions.

---

### 6. Global store — **`useSyncExternalStore`**, not `useEffectEvent`

If the outside system **is** a store with `subscribe` + `getSnapshot`, use [useSyncExternalStore](/course-notes/useExternalStoreSync). `useEffectEvent` is for values you read **inside** an effect’s callback, not for replacing store subscription.

---

## Quick pick (effect vs effect event vs other)

| Scenario | Use |
|----------|-----|
| Fetch / subscribe when `id` / `roomId` / `filter` changes | `useEffect` with that value in **deps** |
| Long-lived listener; only **behavior on fire** should see latest props/state | `useEffect` + **`useEffectEvent`** |
| Listener only bumps state from previous state | `useEffect` + **functional `setState`** |
| User clicked Save | **`onClick`** handler |
| Many components read same external store | **`useSyncExternalStore`** |
| Stable wrapper without React 19 API | **`useRef`** + `saved.current = fn` (see [useRef](/course-notes/useRef)) |

---

## `useEffectEvent` vs alternatives (quick comparison)

| Question | Prefer **functional `setState`** | Prefer **ref + wrapper** | Prefer **`useEffectEvent`** |
|----------|-----------------------------------|---------------------------|----------------------------|
| Only need latest **state** inside a stable listener? | **`setN(n => n + 1)`** | Works | Works |
| Need latest **props** or callbacks in a subscription? | Awkward | **Yes** | **Yes** |
| Effect should **not** re-run when `onSave` changes? | — | Manual ref sync | **Yes** |
| Calling “event” logic from **render**? | — | — | **Not allowed** — effects/events only |

**`useCallback`** in the dependency array still **re-runs the effect** when the callback identity changes — it does not give you a stable subscription by itself.

---

## Pattern: interval that logs latest count

```jsx
import { useEffect, useEffectEvent, useState } from "react";

function TickLogger() {
  const [count, setCount] = useState(0);

  const onTick = useEffectEvent(() => {
    console.log("latest count:", count);
  });

  useEffect(() => {
    const id = setInterval(() => onTick(), 1000);
    return () => clearInterval(id);
  }, []); // onTick is stable; body still sees fresh count

  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

Without **`useEffectEvent`**, either **`count`** lands in the dependency array (interval reset every tick) or the interval logs a **stale** `count`.

---

## Pattern: external listener with latest callback prop

```jsx
function ChatRoom({ roomId, onMessage }) {
  const onMessageEvent = useEffectEvent(onMessage);

  useEffect(() => {
    const socket = connect(roomId);
    socket.on("message", (msg) => onMessageEvent(msg));
    return () => socket.disconnect();
  }, [roomId]); // reconnect when room changes, not when onMessage identity changes
}
```

Parent can pass an **inline** `onMessage` without forcing a WebSocket teardown on every parent render.

---

## Pattern: relationship to the ref wrapper (useRef lesson)

The [useRef](/course-notes/useRef) **“stable listener, fresh closure”** pattern keeps **`saved.current = handler`** in an effect and registers **`(e) => saved.current(e)`** once. **`useEffectEvent`** is the declarative form of that idea for **non-rendering** callbacks used inside effects.

```text
useRef pattern          useEffectEvent
────────────────        ────────────────
saved.current = fn  →   useEffectEvent(fn)
wrapper calls .current   returned fn is the stable surface
```

---

## When to reach for `useEffectEvent` (decision tree)

```text
Effect or subscription needs values from render?
│
├─ Only updating React state from a timer/listener?
│     └─► functional setState (setX(x => ...)) if enough
│
├─ Subscribing once ([] deps) but need fresh props/callbacks?
│     ├─ Comfortable with ref + wrapper?
│     │     └─► useRef pattern (see useRef notes)
│     └─► useEffectEvent
│
├─ Effect should re-run when value changes (fetch when id changes)?
│     └─► put value in deps; don't use useEffectEvent to hide deps
│
└─ Need to call logic from render or JSX event directly?
      └─► normal function or useCallback — not useEffectEvent
```

**Important:** **`useEffectEvent`** is for code that **belongs in effects** (or other subscriptions), not for replacing event handlers on DOM elements.

---

## Pitfalls (short)

| Pitfall | Why it hurts |
|---------|----------------|
| Using it to **avoid listing real dependencies** the effect should react to | Hides when fetch/subscription should restart (e.g. `userId`) |
| Calling **`useEffectEvent`** result during **render** | Unsupported — stale rules differ from effects |
| Replacing **`useCallback`** on buttons | Event handlers are not effect events |
| Passing effect event to **memoized child** as a prop | Children may not update when you expect — keep events inside effects |

---

## Where to go next

- **What belongs in effect deps**: [useEffect](/course-notes/useEffect) — cleanup, `ignore` flag, functional `setState` in listeners
- **Manual ref equivalent**: [useRef](/course-notes/useRef) — stable listener, fresh closure
- **Store subscription (Rule #4)**: [useSyncExternalStore](/course-notes/useExternalStoreSync)
- **Overview rules**: [Overview](/course-notes/overview)

Official docs: **useEffectEvent** and **Separating Events from Effects** in the React documentation (React 19+).

---