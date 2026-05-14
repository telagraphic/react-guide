import { useEffect, useRef } from 'react';

import { mountLesson01 } from '@/content/05-vanilla-react/01-instance-and-useState/use-state-vanilla.js';

export function VanillaReactLesson01() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return mountLesson01(host);
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        Vanilla React (learning track)
      </p>
      <p className="text-muted text-sm">
        Minimal <code className="font-mono">let count</code> + <code className="font-mono">paint()</code> — walkthrough in{' '}
        <code className="font-mono text-xs">05-vanilla-react/01-instance-and-useState/LESSON.md</code>{' '}
        (same logic as <code className="font-mono text-xs">use-state-vanilla.js</code>).
      </p>
      <div
        ref={hostRef}
        className="rounded-lg border border-border bg-card p-4"
        data-testid="vanilla-react-lesson-01-host"
      />
    </div>
  );
}
