import { mountLesson07 } from '@/content/05-vanilla-react/07-use-sync-external-store/sync-external-store-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson07() {
  return (
    <VanillaReactLabShell
      mount={mountLesson07}
      lessonMarkdownPath="05-vanilla-react/07-use-sync-external-store/LESSON.md"
      blurb={<>External store subscribe + snapshot —</>}
      testId="vanilla-react-lesson-07-host"
    />
  );
}
