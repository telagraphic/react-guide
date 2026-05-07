import { NavLink } from 'react-router';

import type { NavBranch, NavNode } from '@/lib/content';

export function SectionNav({ section }: { section: NavBranch }) {
  return (
    <nav className="text-sm sticky top-20">
      <NavLink
        to={'/' + section.slug}
        end
        className={({ isActive }) =>
          [
            'block px-3 py-1.5 rounded-md text-sm font-semibold mb-2 transition-colors',
            isActive
              ? 'text-fg bg-surface-2'
              : 'text-fg hover:bg-surface',
          ].join(' ')
        }
      >
        {section.title}
      </NavLink>
      <NavTree nodes={section.children} depth={0} />
    </nav>
  );
}

function NavTree({ nodes, depth }: { nodes: NavNode[]; depth: number }) {
  return (
    <ul className={depth === 0 ? 'space-y-0.5' : 'mt-1 ml-3 border-l border-border pl-3 space-y-0.5'}>
      {nodes.map((node) => (
        <li key={node.slug}>
          {node.kind === 'page' ? (
            <NavLink
              to={node.href}
              end
              className={({ isActive }) =>
                [
                  'block px-3 py-1 rounded-md text-sm transition-colors',
                  isActive
                    ? 'text-fg bg-surface font-medium'
                    : 'text-muted hover:text-fg hover:bg-surface',
                ].join(' ')
              }
            >
              {node.title}
            </NavLink>
          ) : (
            <>
              <p className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
                {node.title}
              </p>
              <NavTree nodes={node.children} depth={depth + 1} />
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
