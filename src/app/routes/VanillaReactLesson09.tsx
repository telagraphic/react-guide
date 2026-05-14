import { mountLesson09 } from '@/content/05-vanilla-react/09-use-effect-event/effect-event-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson09() {
  return (
    <VanillaReactLabShell
      mount={mountLesson09}
      lessonMarkdownPath="05-vanilla-react/09-use-effect-event/LESSON.md"
      blurb={<>Stable ref to latest closure —</>}
      testId="vanilla-react-lesson-09-host"
    />
  );
}
