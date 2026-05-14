import { mountLesson08 } from '@/content/05-vanilla-react/08-use-layout-effect/layout-effect-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson08() {
  return (
    <VanillaReactLabShell
      mount={mountLesson08}
      lessonMarkdownPath="05-vanilla-react/08-use-layout-effect/LESSON.md"
      blurb={<>Sync layout read vs microtask —</>}
      testId="vanilla-react-lesson-08-host"
    />
  );
}
