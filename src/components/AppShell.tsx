import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router';

import { CommandPalette } from './CommandPalette';
import { ThemeToggle } from './ThemeToggle';
import { SectionNav } from './SectionNav';
import { findSection, navTree } from '@/lib/content';

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const params = useParams();
  const location = useLocation();

  // Open the palette with Cmd/Ctrl+K from anywhere.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Scroll to top on route change (but preserve hash for anchor links).
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);

  const activeSection = params.section ? findSection(params.section) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-fg">
      <Header onOpenPalette={() => setPaletteOpen(true)} />

      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)] gap-8 py-8">
        <aside className="hidden lg:block">
          {activeSection ? (
            <SectionNav section={activeSection} />
          ) : (
            <TopLevelNav />
          )}
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
        <Link to="/" className="font-mono text-sm font-bold text-accent tracking-tight">
          react-guide
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navTree.map(
            (n) =>
              n.kind === 'folder' && (
                <NavLink
                  key={n.slug}
                  to={'/' + n.slug}
                  className={({ isActive }) =>
                    [
                      'px-3 py-1.5 rounded-md transition-colors',
                      isActive
                        ? 'text-fg bg-surface-2'
                        : 'text-muted hover:text-fg hover:bg-surface',
                    ].join(' ')
                  }
                >
                  {n.title}
                </NavLink>
              ),
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface text-muted hover:text-fg hover:border-accent/50 text-sm transition-colors"
          >
            <span>Search</span>
            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-bg text-muted">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function TopLevelNav() {
  return (
    <nav className="text-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">
        Sections
      </p>
      <ul className="space-y-1">
        {navTree.map(
          (n) =>
            n.kind === 'folder' && (
              <li key={n.slug}>
                <NavLink
                  to={'/' + n.slug}
                  className={({ isActive }) =>
                    [
                      'block px-3 py-1.5 rounded-md transition-colors',
                      isActive
                        ? 'text-fg bg-surface-2'
                        : 'text-muted hover:text-fg hover:bg-surface',
                    ].join(' ')
                  }
                >
                  {n.title}
                </NavLink>
              </li>
            ),
        )}
      </ul>
    </nav>
  );
}
