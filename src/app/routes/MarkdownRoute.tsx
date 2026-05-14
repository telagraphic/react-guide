import { useLoaderData, useParams } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

import { MarkdownPage } from '@/components/MarkdownPage';
import { findPageBySlug, loadPageBody } from '@/lib/content';

interface PageLoaderData {
  body: string;
  slug: string;
}

export function pageLoader({ params }: LoaderFunctionArgs): PageLoaderData {
  const section = params.section;
  const rest = params['*'] ?? '';
  if (!section) throw new Response('Missing section', { status: 400 });
  const slug = rest ? `${section}/${rest}` : section;

  const page = findPageBySlug(slug);
  if (!page) throw new Response(`Page "${slug}" not found`, { status: 404 });

  const body = loadPageBody(slug);
  if (body === null) throw new Response(`Markdown for "${slug}" failed to load`, { status: 500 });

  return { body, slug };
}

export function MarkdownRoute() {
  const { body, slug } = useLoaderData() as PageLoaderData;
  useParams();
  const page = findPageBySlug(slug);

  return (
    <div className="space-y-4">
      {/* {page && (
        <p className="font-mono text-xs uppercase tracking-wider text-accent">
          {page.sectionTitle}
        </p>
      )} */}
      <MarkdownPage body={body} />
    </div>
  );
}
