import { Link } from 'react-router';

import { allPages, navTree } from '@/lib/content';

export function HomePage() {
  const totalPages = allPages.length;

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        {/* <p className="font-mono text-xs uppercase tracking-wider text-accent">React Guide</p> */}
        <h1 className="font-editorial text-4xl font-extrabold tracking-tight">
          Personal learning library.
        </h1>
        <p className="text-muted max-w-2xl">
          Notes, concepts, and code challenges for learning React. Press{' '}
          <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-surface">
            ⌘K
          </kbd>{' '}
          to jump to anything. {totalPages} {totalPages === 1 ? 'page' : 'pages'} indexed.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
          Sections
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {navTree.map((node) => {
            if (node.kind !== 'folder') return null;
            const pageCount = countPages(node);
            return (
              <li key={node.slug}>
                <Link
                  to={'/' + node.slug}
                  className="block rounded-lg border border-border bg-surface p-4 hover:border-accent/50 transition-colors group"
                >
                  <p className="font-semibold text-fg group-hover:text-accent transition-colors">
                    {node.title}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function countPages(node: { children: { kind: 'folder' | 'page'; children?: unknown }[] }): number {
  let count = 0;
  for (const child of node.children) {
    if (child.kind === 'page') count += 1;
    else count += countPages(child as never);
  }
  return count;
}
