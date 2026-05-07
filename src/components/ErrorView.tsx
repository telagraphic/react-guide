import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function ErrorView() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let detail = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    detail = typeof error.data === 'string' ? error.data : detail;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-fg p-8">
      <div className="max-w-md text-center space-y-4">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Error</p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted">{detail}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-md border border-border bg-surface hover:border-accent/50 hover:text-fg text-muted transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
