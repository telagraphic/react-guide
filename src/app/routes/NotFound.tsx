import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="space-y-4 max-w-md">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">404</p>
      <h1 className="text-3xl font-bold">Not found.</h1>
      <p className="text-muted">
        That page doesn't exist (yet). Try the search palette with{' '}
        <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-surface">
          ⌘K
        </kbd>
        .
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 rounded-md border border-border bg-surface hover:border-accent/50 hover:text-accent text-fg transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
