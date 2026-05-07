# Requirements

Architectural decisions for the React learning-guide app, resolved in a `grill-me` session on 2026-05-07. Companion to `PLAN.md` (which captures the *what*); this file captures the *how*.

## Stack

| Concern         | Decision                                                |
| --------------- | ------------------------------------------------------- |
| Framework       | Vite + React + React Router v7 (data router, loaders)   |
| Language        | TypeScript                                              |
| Styling         | Tailwind CSS + `@tailwindcss/typography`                |
| Package manager | pnpm                                                    |

## Content pipeline

| Concern  | Decision                                                                  |
| -------- | ------------------------------------------------------------------------- |
| Markdown | Plain `.md` rendered with `react-markdown` + `remark-gfm`                 |
| Loader   | `import.meta.glob('/src/content/**/*.md', { query: '?raw' })` build-time  |
| Titles   | First `# heading` in body; numeric filename prefix (`1-…`) is sort key    |
| Syntax   | Shiki — `dracula` (dark) + `github-light` (light)                         |

## UX

| Concern         | Decision                                                          |
| --------------- | ----------------------------------------------------------------- |
| Command palette | `cmdk` (headless, styled with Tailwind)                           |
| Search          | In-memory titles + headings index; graduate to MiniSearch later   |
| Themes          | Dracula (dark) + Dracula PRO Light (light), toggle from v1        |

## Scope

| Concern         | Decision                                                                  |
| --------------- | ------------------------------------------------------------------------- |
| Challenges (v1) | Static markdown (prompt + solution)                                       |
| Challenges (v2) | Dedicated `/challenges/:id` route with Sandpack                           |
| Deployment      | Decide later; Vercel / Cloudflare Pages are zero-config for a Vite SPA    |

## Source layout

```
src/
  app/         App shell, router, providers
  components/  Layout, MarkdownPage, CommandPalette, Nav
  content/     Markdown files (the glob root)
  lib/         markdown loader, nav builder, search index
  theme/       Dracula tokens, Tailwind helpers
public/        Static assets
```

## Out of scope for v1

- Sandpack-based interactive challenges
- Full-text search (titles + headings only)
- Public deployment (defer until needed)
- MDX / inline interactive components in markdown

## Decision rationales (one-liners)

- **Vite over Next.js**: app runs locally, SSG/SEO don't matter, keeps focus on learning React rather than learning a framework around React.
- **TypeScript over JavaScript**: editor feedback on prop shapes is itself a React-learning aid, and matches what real codebases use.
- **Plain MD over MDX**: explicit "fast write workflow" goal. Code challenges live in their own route, not inline.
- **`import.meta.glob` over runtime fetch**: HMR + auto-derived nav tree + lazy loading, all from one line.
- **React Router v7 data router**: the `loader` pattern matches "fetch markdown before rendering" cleanly and is a useful pattern to learn.
- **Tailwind + typography plugin**: the `prose` classes solve the hardest part of a wiki — long-form text — for free.
- **Shiki over Prism**: VSCode-faithful Dracula rendering, identical to the editor.
- **`cmdk` over DIY**: accessibility + keyboard handling done right; the API is small enough not to feel like a black box.
- **Titles + headings search**: the value cliff between "title-only" and "full text" lives at "let me jump to subheadings."
- **First-H1 titles**: zero ceremony per file; frontmatter can be added later if needed.
- **Static challenges in v1**: ship the wiki sooner, learn from using it, invest in Sandpack only if v1 isn't enough.
