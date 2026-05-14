import { createBrowserRouter } from 'react-router';

import { AppShell } from '@/components/AppShell';
import { ErrorView } from '@/components/ErrorView';
import { HomePage } from '@/app/routes/HomePage';
import { SectionIndex, sectionLoader } from '@/app/routes/SectionIndex';
import { MarkdownRoute, pageLoader } from '@/app/routes/MarkdownRoute';
import { NotFound } from '@/app/routes/NotFound';
import { VanillaReactLesson01 } from '@/app/routes/VanillaReactLesson01';
import { VanillaReactLesson02 } from '@/app/routes/VanillaReactLesson02';
import { VanillaReactLesson03 } from '@/app/routes/VanillaReactLesson03';
import { VanillaReactLesson04 } from '@/app/routes/VanillaReactLesson04';
import { VanillaReactLesson05 } from '@/app/routes/VanillaReactLesson05';
import { VanillaReactLesson06 } from '@/app/routes/VanillaReactLesson06';
import { VanillaReactLesson07 } from '@/app/routes/VanillaReactLesson07';
import { VanillaReactLesson08 } from '@/app/routes/VanillaReactLesson08';
import { VanillaReactLesson09 } from '@/app/routes/VanillaReactLesson09';
import { VanillaReactLesson10 } from '@/app/routes/VanillaReactLesson10';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <ErrorView />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'labs/vanilla-react/lesson-01',
        element: <VanillaReactLesson01 />,
      },
      {
        path: 'labs/vanilla-react/lesson-02',
        element: <VanillaReactLesson02 />,
      },
      {
        path: 'labs/vanilla-react/lesson-03',
        element: <VanillaReactLesson03 />,
      },
      {
        path: 'labs/vanilla-react/lesson-04',
        element: <VanillaReactLesson04 />,
      },
      {
        path: 'labs/vanilla-react/lesson-05',
        element: <VanillaReactLesson05 />,
      },
      {
        path: 'labs/vanilla-react/lesson-06',
        element: <VanillaReactLesson06 />,
      },
      {
        path: 'labs/vanilla-react/lesson-07',
        element: <VanillaReactLesson07 />,
      },
      {
        path: 'labs/vanilla-react/lesson-08',
        element: <VanillaReactLesson08 />,
      },
      {
        path: 'labs/vanilla-react/lesson-09',
        element: <VanillaReactLesson09 />,
      },
      {
        path: 'labs/vanilla-react/lesson-10',
        element: <VanillaReactLesson10 />,
      },
      {
        path: ':section',
        loader: sectionLoader,
        element: <SectionIndex />,
      },
      {
        path: ':section/*',
        loader: pageLoader,
        element: <MarkdownRoute />,
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
