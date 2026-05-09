---
name: tutorial-editorial
description: Editorial standards for multi-page step-by-step code-walkthrough tutorials in this wiki. Defines page-list shape (Overview → Setup → N feature steps → Recap), the per-step section template, what each section can and cannot contain, content placement, source-code policy, and tone. Use when authoring or refactoring a coding-challenge walkthrough under src/content/01-course-notes/, or when the user invokes /tutorial-editorial or mentions step-by-step challenges or code walkthroughs.
disable-model-invocation: true
---

# Tutorial Editorial

Standards for authoring multi-page step-by-step coding-challenge walkthroughs in this wiki. A "walkthrough" builds one feature in one folder; each step adds one observable behavior.

The reference implementation is `src/content/01-course-notes/todo-list-challenge/`. When in doubt, look there.

## Page-list shape

Walkthrough lives under `src/content/01-course-notes/<feature-slug>/`. Numeric filename prefixes are sort order and are stripped from the URL.

| #  | Filename          | Role                                                          |
| -- | ----------------- | ------------------------------------------------------------- |
| 1  | `1-overview.md`   | What you'll build, prerequisites, links to concept reads, step list |
| 2  | `2-setup.md`      | Action-oriented file scaffolding; no real logic yet           |
| 3+ | `N-<feature>.md`  | One observable feature per step                               |
| L  | `<L>-recap.md`    | Full final code + patterns to internalize + common pitfalls   |

**Step granularity rule**: each step corresponds to one commit-sized change in the reader's scratch project. If a step can't be described in one sentence without using "and," split it.

## Per-step page template

Use these seven section headings in this order on every step page (3 through L-1):

1. `## Goal` — single sentence, observable outcome. ≤ 30 words.
2. `## React concepts you'll use` — bare pointers (see rule below).
3. `## Implementation` — task-list checklist of *what* to build (see rule below).
4. `## Try it` — one or two sentences directing the reader to do the thing in their scratch project.
5. `## Solution` — full code for this step. **Cumulative**: show every file the reader needs after this step. Mark unchanged files with a one-line note like `TodoList.jsx is unchanged from step 8.`
6. `## Why this works` — concise prose (see rule below).
7. `## What you should see now` — observable state in the running app. Two or three sentences.

The `Setup` page (`2-setup.md`) is slightly different: no "React concepts you'll use," and an extra `## What you'll do` block before `## Implementation` describing the file structure and ownership. See the existing `2-setup.md` for the exact shape.

The `Overview` and `Recap` pages do **not** follow this template; see the existing examples for their shapes.

## The three tricky sections

These three sections each carry a strong editorial rule. Get them wrong and the page either spoils the answer or dilutes it.

### "React concepts you'll use" — bare pointers

This section is a *menu*, not a tutorial. Each bullet is at most a noun phrase, optionally with a "see X" link to the concept page.

Good:

```markdown
- Controlled inputs
- Lifting state up — see [Component conventions](/concepts/components/conventions)
- Handlers passed as props
- Immutable append — see [Destructuring and spread](/concepts/modern-js/destructuring-and-spread)
```

Bad (explains the concept; that's the linked page's job):

```markdown
- **Controlled inputs** — `value={label} onChange={…}`. The component owns the input's value via state.
- **Lifting state up** — the *list* is in `TodoList`, but the *draft input text* is in `TodoComposer`. Each piece of state lives where it's needed.
```

If you find yourself explaining a concept here, write a concept page in `02-concepts/` and link to it instead.

### "Implementation" — task-list of *what*, not *how*

Each item is a behavior or structural requirement the reader can check off, written in plain English. Use markdown task-list syntax (`- [ ]`) — `remark-gfm` renders these as real disabled checkboxes in the page.

After reading this section the reader should know **what behaviors must exist** when they're done, but not yet know **how to write the code**.

Good:

```markdown
- [ ] TodoComposer holds the current input draft in its own state
- [ ] The input is controlled (its value comes from state, typing updates state)
- [ ] The Add button is disabled while the input is empty
- [ ] Clicking Add creates a new todo with a unique id and the current draft as its label
- [ ] After adding, the input clears
```

Bad (specifies code shape; basically dictates the answer):

```markdown
1. `TodoComposer` needs its own `useState` for the input value. Call it `label`.
2. Wire the input as controlled: `value={label}` and `onChange={(e) => setLabel(e.target.value)}`.
3. Disable the Add button when `label` is empty.
4. When the user clicks Add, build a todo object: `{ id: crypto.randomUUID(), label, completed: false }`.
```

The bad version names the variable, dictates the JSX, and specifies the helper. The good version describes the same target without prescribing the path. The reader can check the box for "the input is controlled" once they've made it controlled — *however* they choose to do it.

### "Why this works" — concise

One or two short paragraphs (80–150 words). Optionally one small table where it earns its keep. Focus on **how the code works**, not philosophical asides or principles already covered in earlier steps.

If a step has a genuinely high-leverage cautionary tale (e.g. a common bug the reader is about to make), use an `H3` subsection inside "Why this works":

```markdown
### Cautionary aside: <name of the bug>

<one short paragraph>
```

Use cautionary asides sparingly — at most one or two per walkthrough.

## Content placement

| Content kind                                  | Lives in                                                |
| --------------------------------------------- | ------------------------------------------------------- |
| Step walkthroughs (multi-page)                | `src/content/01-course-notes/<feature-slug>/`           |
| General reusable concepts                     | `src/content/02-concepts/<topic>/`                      |
| Single-page code challenges (prompt+solution) | `src/content/02-concepts/03-challenges/`                |
| Notes from a course or book                   | `src/content/01-course-notes/` (top level)              |

A concept that exists *only* to support one walkthrough is still a concept page, not an inline section. If you want to explain `useState` or destructuring inside a walkthrough step, link to the concept page instead. If the concept page doesn't exist yet, **write it first** — it'll be reused by future walkthroughs.

## Source-code policy

When a walkthrough is based on existing source code (a course exercise, a colleague's snippet), apply this policy:

| Issue in source                                                              | Default action                                                                              |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Real bugs (dead `useState`, off-by-one, etc.)                                | Fix silently. Mention as cautionary aside only if it's a high-leverage teaching moment.     |
| Outdated patterns (deprecated APIs, `import * as React`)                     | Modernize silently to match the rest of the wiki.                                           |
| Anti-patterns with broad pedagogical value (random IDs, mixed import styles) | Fix silently and mention briefly in the relevant step's "Why this works."                   |
| Cosmetic style differences (`=== true` vs truthy, etc.)                      | Skip. Not worth churning the source.                                                        |

Document the policy that was applied in the feature's `docs/FEATURE-N.md` under a "Resolved Requirements" → "Source-code policy" section, so future readers know what was changed and why.

## Tone & voice

- Terse and technical. Avoid "Awesome!", "Now you've learned…", "Let's dive in!", emoji.
- Second-person when addressing the reader; first-person plural ("we") only when second-person would feel awkward.
- No hedging adverbs (`simply`, `just`, `obviously`). They patronize and add no signal.
- Backticks for symbols (`useState`, `todo.completed`). Wiki-internal links via `[label](/concepts/...)`.
- For register, match `02-concepts/02-hooks/1-useState.md` and the existing `01-course-notes/todo-list-challenge/` pages.

## Quick-start checklist for a new walkthrough

- [ ] Author a `docs/FEATURE-N.md` describing the feature in plain English. Pairs well with the `grill-me` skill to lock down ambiguity before writing.
- [ ] Identify any new concept pages the walkthrough will link to. Write those first in `02-concepts/`.
- [ ] Create the walkthrough folder: `src/content/01-course-notes/<feature-slug>/`.
- [ ] Write `1-overview.md` — prerequisites (with links to concept pages), what the reader will build, the step list.
- [ ] Write `2-setup.md` — action-oriented file scaffolding.
- [ ] Write each step page (3 through L-1) using the seven-section template.
- [ ] Write `<L>-recap.md` — full final code + patterns to internalize + common pitfalls table.
- [ ] Append a "Resolved Requirements" section to `docs/FEATURE-N.md` recording decisions made along the way.
- [ ] Verify with `pnpm build` (clean) and a browser smoke check that the new pages appear in the section nav and the cmd+K palette.
