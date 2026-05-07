# React Guide

Personal React learning library and reference: markdown notes, concepts with code examples, and (eventually) interactive challenges. See [`PLAN.md`](./PLAN.md) for the *what* and [`REQUIREMENTS.md`](./REQUIREMENTS.md) for the *how*.

## Quickstart

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # type-check + production bundle
pnpm preview  # serve the production bundle locally
```

## Stack

- **Vite 8 + React 19 + TypeScript** — SPA build, fast HMR, no framework overhead.
- **React Router 7** with a data router and per-route loaders.
- **Tailwind v4 + `@tailwindcss/typography`** — `prose` class does the heavy lifting for long-form text.
- **`react-markdown` + `remark-gfm`** — plain `.md` files become React trees.
- **Shiki** with `dracula` (dark) and `github-light` (light) themes.
- **`cmdk`** for the ⌘K command palette.

## Authoring content

1. Drop a markdown file into `src/content/<NN-section>/...`.
2. Start it with a `# heading`. That heading becomes the page title in the nav and the search palette.
3. Numeric prefixes on filenames (`1-foo.md`, `2-bar.md`) determine sort order. The prefix is stripped from the URL.
4. Save. Vite HMR reloads, the nav tree picks the file up automatically.

Example:

```
src/content/
  01-course-notes/
    1-getting-started.md       → /course-notes/getting-started
    2-jsx-and-rendering.md     → /course-notes/jsx-and-rendering
  02-concepts/
    01-jsx/
      1-what-is-jsx.md         → /concepts/jsx/what-is-jsx
```

## Project layout

```
src/
  app/            App-level wiring: router, route components
    routes/       One file per route component
  components/     Reusable UI: AppShell, MarkdownPage, CommandPalette, …
  content/        All markdown files (the glob root)
  lib/            Pure logic: content loader, nav builder, highlighter
  theme/          Tailwind tokens, ThemeProvider
public/           Static assets (favicon, etc.)
```

## Keyboard shortcuts

- `⌘K` / `Ctrl+K` — open the command palette.
- `Esc` — close the palette.
- `↑` / `↓` — move between palette results.
- `↵` — open the selected result.
