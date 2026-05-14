import { mountLesson10 } from '@/content/05-vanilla-react/10-custom-hook/custom-hook-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson10() {
  return (
    <VanillaReactLabShell
      mount={mountLesson10}
      lessonMarkdownPath="05-vanilla-react/10-custom-hook/LESSON.md"
      blurb={<>Factory = reusable state API —</>}
      testId="vanilla-react-lesson-10-host"
    />
  );
}
