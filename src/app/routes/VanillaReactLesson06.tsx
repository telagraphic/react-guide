import { mountLesson06 } from '@/content/05-vanilla-react/06-use-memo-callback/memo-callback-vanilla.js';

import { VanillaReactLabShell } from './VanillaReactLabShell';

export function VanillaReactLesson06() {
  return (
    <VanillaReactLabShell
      mount={mountLesson06}
      lessonMarkdownPath="05-vanilla-react/06-use-memo-callback/LESSON.md"
      blurb={
        <>
          Memo cache + stable callback cache —
        </>
      }
      testId="vanilla-react-lesson-06-host"
    />
  );
}
