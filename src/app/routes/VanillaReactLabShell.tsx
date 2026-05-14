import { useEffect, useRef, type ReactNode } from 'react';

export type VanillaMount = (host: Element) => void | (() => void);

export function VanillaReactLabShell(props: {
  mount: VanillaMount;
  lessonMarkdownPath: string;
  blurb: ReactNode;
  testId: string;
}) {
  const { mount, lessonMarkdownPath, blurb, testId } = props;
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return mount(host);
  }, [mount]);

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        Vanilla React (learning track)
      </p>
      <p className="text-muted text-sm">
        {blurb}{' '}
        <code className="font-mono text-xs">{lessonMarkdownPath}</code>.
      </p>
      <div
        ref={hostRef}
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
        data-testid={testId}
      />
    </div>
  );
}
