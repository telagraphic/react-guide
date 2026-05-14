import { useEffect, useRef } from 'react';

import { mountLesson02 } from '@/content/05-vanilla-react/02-use-effect/use-effect-vanilla.js';

export function VanillaReactLesson02() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return mountLesson02(host);
  }, []);

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        Vanilla React (learning track)
      </p>
      <p className="text-muted text-sm">
        Same pattern as lesson 01: explicit <code className="font-mono">paint()</code> plus a deferred
        “effect” pass — see{' '}
        <code className="font-mono text-xs">05-vanilla-react/02-use-effect/LESSON.md</code>.
      </p>
      <div
        ref={hostRef}
        className="rounded-lg border border-border bg-card p-4"
        data-testid="vanilla-react-lesson-02-host"
      />
    </div>
  );
}
