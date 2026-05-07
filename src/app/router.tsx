import { createBrowserRouter } from 'react-router';

import { AppShell } from '@/components/AppShell';
import { ErrorView } from '@/components/ErrorView';
import { HomePage } from '@/app/routes/HomePage';
import { SectionIndex, sectionLoader } from '@/app/routes/SectionIndex';
import { MarkdownRoute, pageLoader } from '@/app/routes/MarkdownRoute';
import { NotFound } from '@/app/routes/NotFound';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <ErrorView />,
    children: [
      { index: true, element: <HomePage /> },
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
