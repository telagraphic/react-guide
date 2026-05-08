# Feature: TodoList Componet Code Walk Through

I want to learn how to use useState with a parent TodoList component that has a TodoCreate and Todo child components. The point of this code walkthrough is to learn how state and event handlers are implemented in the parent and then passed to the child components.

Create a sub-folder in `src/content/01-course-notes/todo-list-challenge` that progresses step by in the same pattern for the below pages. Here is a sample:


- 1-todolist-challenge.md
- 2-todolist-setup.md
- 3-todolist-parent-component.md
- etc....

## Requirements & Key Steps




- explain react components and how they translate to a react element then to vanilla html
- what are are some conventions for writing react components
- what are some patterns for props.children
- detail some common modern es6 syntax with react (destructuring, functional methods)
- i need to create a basic todo list app in react that follows a code challenge pattern
	- we'll need to create a todo-list, todo-input, todo with update and delete functionality
	- create a step by step progression for creating, updating, deleting todos that implements best practices in react
	- we'll need to handle an array of objects each representing a todo
	- the goal is learn how to use useState. how does react parent and child component share state and logic between them selves?
	- use object merge syntax with `...todo` for updating the state
	- each step should implement one feature for the todo component, with hints and a suggestion on how to implement or what react concept should be used
	- instead of just giving the answers, create a set of markdown files that focus on each feature
	- each file should have a prompt, some hints on what to implement and explain react concepts for what the missing code should be
	- this todo list code challenge should force me to write the code and test it out so that I can learn how to write react code from scratch
	- this should be in a folder called todo-list-app
	- there should be one folder for the todo-react-app where an actual react app boilerplate is created
	- there should be another sibling folder where the markdown code challenge features exist that I use to progress through building the app
	- 


## Final Code

Use this code to base the above requirements for teaching.


```jsx
import * as React from "react"
import Todo from "./Todo"
import TodoComposer from "./TodoComposer"

export default function TodoList() {
  const [todos, setTodos] = React.useState([
    { id: 1, label: "Learn React", completed: false },
    { id: 2, label: "Learn Next.js", completed: false },
    { id: 3, label: "Learn React Query", completed: false }
  ])

  const handleUpdateTodo = (updatedTodo) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTodo.id ? updatedTodo : todo
    )
    setTodos(newTodos)
  }

  const handleDeleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id)
    setTodos(newTodos)
  }

  const handleAddTodo = (newTodo) => {
    const newTodos = [...todos, newTodo]
    setTodos(newTodos)
  }

  return (
    <ul>
      <TodoComposer handleAddTodo={handleAddTodo} />
      {todos.map((todo) => (
        <Todo
          key={todo.id}
          todo={todo}
          handleUpdateTodo={handleUpdateTodo}
          handleDeleteTodo={handleDeleteTodo}
        />
      ))}
    </ul>
  )
}
```



```jsx

import * as React from "react"

function createTodo (label) {
  return {
    id: Math.floor(Math.random() * 10000),
    label,
    completed: false,
  }
}

export default function TodoComposer({ handleAddTodo }) {
  const [label, setLabel] = React.useState("")

  const handleUpdateLabel = (e) => setLabel(e.target.value)

  const handleAddTodoClick = () => {
    const todo = createTodo(label)
    handleAddTodo(todo)
    setLabel("")
  }

  return (
    <li>
      <input
        placeholder="Add a new todo"
        type="text"
        value={label}
        onChange={handleUpdateLabel}
      />
      <button
        disabled={label.length === 0}
        onClick={handleAddTodoClick}
      >
        Add Todo
      </button>
    </li>
  )
}
```



```jsx
import * as React from "react"

export default function Todo ({ todo, handleUpdateTodo, handleDeleteTodo }) {
  const [completed, setCompleted] = React.useState(false)
  const [editing, setEditing] = React.useState(false)

  const handleCheckboxClick = () => handleUpdateTodo({
    ...todo,
    completed: !todo.completed
  })

  const handleEditClick = () => setEditing(!editing)

  const handleEditTodo = (e) => handleUpdateTodo({
    ...todo,
    label: e.target.value
  })

  const handleDeleteClick = () => handleDeleteTodo(todo.id)

  return (
    <li>
      <label htmlFor={todo.id}>
        <div>
          <input
            type="checkbox"
            id={todo.id}
            checked={todo.completed}
            onChange={handleCheckboxClick}
          />
          <span />
        </div>
        {editing === true ? (
          <input
            type="text"
            value={todo.label}
            onChange={handleEditTodo}
          />
        ) : (
          <span>{todo.label}</span>
        )}
      </label>
      <div>
        <button onClick={handleEditClick}>
          {editing ? "Save" : "Edit"}
        </button>
        {!editing && (
          <button onClick={handleDeleteClick}>
            Delete
          </button>
        )}
      </div>
    </li>
  )
}
```

---

## Resolved Requirements

Resolved through a `grill-me` session on 2026-05-07. Append-only history; everything above is the original prompt.

### Scope

| Concern         | Decision                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| Deliverable     | **Markdown only.** No scaffolding, no Sandpack, no sibling React app.               |
| Walkthrough     | `src/content/01-course-notes/todo-list-challenge/` — 10 progressive pages           |
| Concept pages   | `src/content/02-concepts/` — 4 new general-React concept pages                      |
| Existing files  | `02-concepts/03-challenges/2-todo-list.md` left untouched                           |
| Code language   | JSX (`.jsx`), not TSX. Pedagogically lighter; TS-flavored React is its own feature  |

### Walkthrough pages (course-notes/todo-list-challenge/)

| #  | File                                | Title                       | Introduces                                        |
| -- | ----------------------------------- | --------------------------- | ------------------------------------------------- |
| 1  | `1-overview.md`                     | Overview & goals            | What you'll build, links to concept reads         |
| 2  | `2-setup.md`                        | Setup                       | Three component files; what each one owns         |
| 3  | `3-static-list.md`                  | Rendering a static list     | `.map()`, `key`, hardcoded array                  |
| 4  | `4-state-with-useState.md`          | Holding the list in state   | `useState`, "data → UI" reframe                   |
| 5  | `5-extracting-todo-component.md`    | Extracting `<Todo />`       | Props, single-responsibility components           |
| 6  | `6-adding-todos.md`                 | Adding todos                | Controlled input, lifting state up                |
| 7  | `7-toggling-completed.md`           | Toggling "completed"        | Object spread `{ ...todo }`, immutable update     |
| 8  | `8-deleting-todos.md`               | Deleting a todo             | `.filter()` pattern                               |
| 9  | `9-editing-todos.md`                | Editing a todo              | Per-item local state, conditional rendering       |
| 10 | `10-recap.md`                       | Recap                       | Full final code + lessons learned                 |

### New concept pages (02-concepts/)

| File                                                       | Title                              |
| ---------------------------------------------------------- | ---------------------------------- |
| `01-jsx/3-component-to-html.md`                            | From component to React element to DOM |
| `04-components/1-conventions.md`                           | Component conventions              |
| `04-components/2-children-patterns.md`                     | `props.children` patterns          |
| `05-modern-js/1-destructuring-and-spread.md`               | Destructuring and spread           |

### Per-step page structure

Every walkthrough step page (3 through 9) follows this shape:

1. **Goal** — single sentence, observable outcome.
2. **React concepts you'll use** — links to `/concepts/...` pages plus 1-line summaries.
3. **Hints** — 3–5 progressively more specific.
4. **Try it** — the prompt. What to do in the scratch project.
5. **Solution** — full code for this step. Diff comments show what changed since the previous step.
6. **Why this works** — the *idea* behind the change, 2–3 paragraphs.
7. **What you should see now** — observable state to verify before moving on.

`1-overview.md`, `2-setup.md`, and `10-recap.md` use a custom shape per their purpose.

### Source-code policy

| Original                                      | Action                                                                |
| --------------------------------------------- | --------------------------------------------------------------------- |
| Dead `useState` in `Todo.jsx` (line 138)      | **Fix silently.** Mention as cautionary aside in step 9.              |
| `Math.floor(Math.random() * 10000)` for IDs   | **Fix silently** → `crypto.randomUUID()`. Mention dup-key risk in step 6. |
| `import * as React` + `React.useState`        | **Fix silently** → `import { useState } from 'react'`. Matches wiki.  |
| `editing === true ?`                          | Skip (cosmetic).                                                      |
| Handler/component conventions                 | Address in `04-components/1-conventions.md`.                          |

### Out of scope for this feature

- Class components (function components only)
- TypeScript variant of the walkthrough
- Sandpack-embedded interactive editor (deferred to v2)
- Styling / CSS (todos render as a plain `<ul>`)
- Persistence (no `localStorage`, no backend)
