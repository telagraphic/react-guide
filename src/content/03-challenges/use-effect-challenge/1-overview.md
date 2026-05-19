# Use Effect

A multi-step code challenge to learn how `useState` works, how parent and child components share data, and how event handlers flow up while data flows down.

You'll build a small Todo app from scratch. Each step adds one feature. Each step page has a prompt, hints, the React concepts in play, and a solution at the bottom you can scroll to if stuck.

## What you'll build

A `TodoList` with three components:

- `TodoList` — owns the array of todos and the handlers that mutate it.
- `TodoComposer` — a controlled `<input>` + button for adding new todos.
- `Todo` — renders a single todo with checkbox, edit/save toggle, and delete.

By the end, you'll be able to add, toggle, edit, and delete todos.

## What you'll learn

- How `useState` actually behaves across renders.
- The "data down, handlers up" pattern — children never reach into the parent's state.
- Immutable updates with `{ ...todo }` and `arr.map` / `arr.filter`.
- How to decide whether state belongs in the parent or the child.
- How conditional rendering (`{cond ? A : B}`, `{cond && A}`) interacts with state.

## Prerequisites — read these first

If any of these are unfamiliar, read them before starting. Each is short.

- [What is JSX?](/concepts/jsx/what-is-jsx)
- [From component to React element to DOM](/concepts/jsx/component-to-html)
- [`useState`](/concepts/hooks/usestate)
- [Component conventions](/concepts/components/conventions)
- [`props.children` patterns](/concepts/components/children-patterns)
- [Destructuring and spread](/concepts/modern-js/destructuring-and-spread)

## How to work through this

1. Set up a scratch React project (Vite + React, your existing one, anything that runs JSX).
2. Read each step page top-to-bottom **before** looking at its **Solution** section.
3. Try to write the code yourself. Run it. See what breaks.
4. Only then scroll to **Solution** and compare.
5. Read **Why this works** even if your solution matched — it explains the *idea*, not just the answer.

## Source attribution

The "final code" this walkthrough builds toward came from a course exercise. It's been lightly cleaned up:

- Imports use `import { useState } from 'react'` (named imports, matching the rest of this wiki).
- A dead `useState` in the original `Todo` component has been removed (mentioned again in step 9).
- Random integer IDs have been replaced with `crypto.randomUUID()` (mentioned again in step 6).

The full final code is on [Recap](/course-notes/todo-list-challenge/recap).

## Steps

1. [Setup](/course-notes/todo-list-challenge/setup) — three component files, what each owns.
2. [Rendering a static list](/course-notes/todo-list-challenge/static-list) — `.map()`, `key`, no state yet.
3. [Holding the list in state](/course-notes/todo-list-challenge/state-with-useState) — convert array to `useState`.
4. [Extracting `<Todo />`](/course-notes/todo-list-challenge/extracting-todo-component) — props, single-responsibility.
5. [Adding todos](/course-notes/todo-list-challenge/adding-todos) — `<TodoComposer />`, lifting state up.
6. [Toggling completed](/course-notes/todo-list-challenge/toggling-completed) — object spread, immutable update.
7. [Deleting a todo](/course-notes/todo-list-challenge/deleting-todos) — `.filter()` pattern.
8. [Editing a todo](/course-notes/todo-list-challenge/editing-todos) — local component state, conditional rendering.
9. [Recap](/course-notes/todo-list-challenge/recap) — full final code, lessons learned.
