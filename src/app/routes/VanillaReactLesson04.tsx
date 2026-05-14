import { useEffect, useRef } from 'react';

import { mountLesson04 } from '@/content/05-vanilla-react/04-create-context/create-context-vanilla.js';

export function VanillaReactLesson04() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return mountLesson04(host);
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        Vanilla React (learning track)
      </p>
      <p className="text-muted text-sm">
        Default + provider stack — see{' '}
        <code className="font-mono text-xs">05-vanilla-react/04-create-context/LESSON.md</code>.
      </p>
      <div
        ref={hostRef}
        className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
        data-testid="vanilla-react-lesson-04-host"
      />
    </div>
  );
}
