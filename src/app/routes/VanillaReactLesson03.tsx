import { useEffect, useRef } from 'react';

import { mountLesson03 } from '@/content/05-vanilla-react/03-use-ref/use-ref-vanilla.js';

export function VanillaReactLesson03() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return mountLesson03(host);
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        Vanilla React (learning track)
      </p>
      <p className="text-muted text-sm">
        Stable <code className="font-mono">{'{ current }'}</code> boxes + DOM ref — see{' '}
        <code className="font-mono text-xs">05-vanilla-react/03-use-ref/LESSON.md</code>.
      </p>
      <div
        ref={hostRef}
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
        data-testid="vanilla-react-lesson-03-host"
      />
    </div>
  );
}
