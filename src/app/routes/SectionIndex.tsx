import { Link, useLoaderData, useParams } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';

import { findSection, type NavBranch, type NavNode } from '@/lib/content';

interface SectionLoaderData {
  sectionSlug: string;
}

export async function sectionLoader({ params }: LoaderFunctionArgs): Promise<SectionLoaderData> {
  const sectionSlug = params.section;
  if (!sectionSlug) throw new Response('Missing section', { status: 400 });
  const section = findSection(sectionSlug);
  if (!section) throw new Response(`Section "${sectionSlug}" not found`, { status: 404 });
  return { sectionSlug };
}

export function SectionIndex() {
  const { section: sectionSlug } = useParams();
  useLoaderData() as SectionLoaderData;

  const section = findSection(sectionSlug ?? '');
  if (!section) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-accent">Section</p>
        <h1 className="text-3xl font-bold mt-2">{section.title}</h1>
      </header>

      <div className="space-y-6">
        <NodeList nodes={section.children} />
      </div>
    </div>
  );
}

function NodeList({ nodes }: { nodes: NavNode[] }) {
  const folders = nodes.filter((n): n is NavBranch => n.kind === 'folder');
  const pages = nodes.filter((n) => n.kind === 'page');

  return (
    <>
      {pages.length > 0 && (
        <ul className="space-y-1.5">
          {pages.map((p) => p.kind === 'page' && (
            <li key={p.slug}>
              <Link
                to={p.href}
                className="block rounded-md border border-border bg-surface px-4 py-2.5 hover:border-accent/50 hover:text-accent text-fg transition-colors"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {folders.map((folder) => (
        <section key={folder.slug} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {folder.title}
          </h2>
          <NodeList nodes={folder.children} />
        </section>
      ))}
    </>
  );
}
