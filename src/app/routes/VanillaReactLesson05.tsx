import { mountLesson05 } from '@/content/05-vanilla-react/05-use-reducer/use-reducer-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson05() {
  return (
    <VanillaReactLabShell
      mount={mountLesson05}
      lessonMarkdownPath="05-vanilla-react/05-use-reducer/LESSON.md"
      blurb={
        <>
          <code className="font-mono">reducer</code> + <code className="font-mono">dispatch</code> —
        </>
      }
      testId="vanilla-react-lesson-05-host"
    />
  );
}
