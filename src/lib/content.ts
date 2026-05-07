/**
 * The content layer.
 *
 * Vite scans `src/content/**` at build time and hands us a map of
 * `{ filePath: () => Promise<string> }`. From that map we derive:
 *   - the nav tree (sections → folders → pages)
 *   - the search index (titles + headings)
 *   - the per-page loader used by React Router
 *
 * Filename convention: `1-some-title.md`. The numeric prefix is the sort
 * key. The display title comes from the first `# heading` in the body.
 */

// All markdown is bundled eagerly. We need the bodies at boot anyway to
// extract titles and headings for the nav tree and search index, so a
// second lazy pipeline would just duplicate work and inflate the bundle.
// If content ever grows large enough to matter, the right move is a
// build-time plugin that extracts metadata and lazy-loads bodies — not
// a second `import.meta.glob` call.
const eagerModules = import.meta.glob('/src/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// --------------------------------------------------------------------------
// Path → URL slug
// --------------------------------------------------------------------------

/**
 * Each on-disk path segment can carry a numeric prefix (e.g. `01-concepts`)
 * to control sort order. The prefix is stripped from the URL slug.
 */
function stripNumericPrefix(segment: string): string {
  return segment.replace(/^\d+[-_]/, '');
}

function sortKeyFor(segment: string): number {
  const m = segment.match(/^(\d+)[-_]/);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

// --------------------------------------------------------------------------
// Title + heading extraction
// --------------------------------------------------------------------------

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

const FENCE_RE = /^```/;

/** Extract the first H1 (anywhere in the file, ignoring fenced code). */
export function extractTitle(markdown: string, fallback: string): string {
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^#\s+(.+?)\s*$/);
    if (m) return m[1].trim();
  }
  return fallback;
}

/** Extract every heading (#, ##, ###, …), skipping anything inside code fences. */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!m) continue;
    const text = m[2].trim();
    headings.push({ depth: m[1].length, text, id: slugifyHeading(text) });
  }
  return headings;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// --------------------------------------------------------------------------
// Nav tree
// --------------------------------------------------------------------------

export interface NavLeaf {
  kind: 'page';
  slug: string;          // e.g. "concepts/jsx/intro"
  href: string;          // e.g. "/concepts/jsx/intro"
  title: string;
  segments: string[];
}

export interface NavBranch {
  kind: 'folder';
  slug: string;
  title: string;
  segments: string[];
  children: NavNode[];
}

export type NavNode = NavLeaf | NavBranch;

interface RawPage {
  filePath: string;
  body: string;
  segments: string[]; // path segments WITH numeric prefixes preserved
  slugSegments: string[]; // numeric prefixes stripped
}

const rawPages: RawPage[] = Object.entries(eagerModules)
  .map(([filePath, body]) => {
    const trimmed = filePath.replace(/^\/src\/content\//, '').replace(/\.md$/, '');
    const segments = trimmed.split('/');
    return {
      filePath,
      body,
      segments,
      slugSegments: segments.map(stripNumericPrefix),
    };
  })
  .sort((a, b) => compareSegments(a.segments, b.segments));

function compareSegments(a: string[], b: string[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i];
    const bv = b[i];
    if (av === undefined) return -1;
    if (bv === undefined) return 1;
    const ak = sortKeyFor(av);
    const bk = sortKeyFor(bv);
    if (ak !== bk) return ak - bk;
    if (av !== bv) return av.localeCompare(bv);
  }
  return 0;
}

function titleizeFolderSegment(segment: string): string {
  const stripped = stripNumericPrefix(segment);
  return stripped
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function buildNavTree(): NavNode[] {
  const root: NavBranch = {
    kind: 'folder',
    slug: '',
    title: '',
    segments: [],
    children: [],
  };

  for (const page of rawPages) {
    let cursor: NavBranch = root;
    const folderSegments = page.segments.slice(0, -1);
    const folderSlugs = page.slugSegments.slice(0, -1);

    folderSegments.forEach((seg, i) => {
      const slugSoFar = folderSlugs.slice(0, i + 1).join('/');
      let next = cursor.children.find(
        (n): n is NavBranch => n.kind === 'folder' && n.slug === slugSoFar,
      );
      if (!next) {
        next = {
          kind: 'folder',
          slug: slugSoFar,
          title: titleizeFolderSegment(seg),
          segments: folderSlugs.slice(0, i + 1),
          children: [],
        };
        cursor.children.push(next);
      }
      cursor = next;
    });

    const slug = page.slugSegments.join('/');
    const fileSegment = page.segments.at(-1)!;
    const title = extractTitle(page.body, titleizeFolderSegment(fileSegment));
    cursor.children.push({
      kind: 'page',
      slug,
      href: '/' + slug,
      title,
      segments: page.slugSegments,
    });
  }

  return root.children;
}

export const navTree: NavNode[] = buildNavTree();

// --------------------------------------------------------------------------
// Flat lookups
// --------------------------------------------------------------------------

export interface PageMeta {
  slug: string;
  href: string;
  title: string;
  sectionSlug: string;     // top-level section, e.g. "concepts"
  sectionTitle: string;
  headings: Heading[];
  filePath: string;
}

const sectionTitleBySlug = new Map<string, string>();
for (const node of navTree) {
  sectionTitleBySlug.set(node.slug, node.title);
}

export const allPages: PageMeta[] = rawPages.map((p) => {
  const slug = p.slugSegments.join('/');
  const sectionSlug = p.slugSegments[0] ?? '';
  const fileSegment = p.segments.at(-1)!;
  return {
    slug,
    href: '/' + slug,
    title: extractTitle(p.body, titleizeFolderSegment(fileSegment)),
    sectionSlug,
    sectionTitle: sectionTitleBySlug.get(sectionSlug) ?? titleizeFolderSegment(sectionSlug),
    headings: extractHeadings(p.body),
    filePath: p.filePath,
  };
});

const pageBySlug = new Map(allPages.map((p) => [p.slug, p]));
const bodyBySlug = new Map(rawPages.map((p) => [p.slugSegments.join('/'), p.body]));

export function findPageBySlug(slug: string): PageMeta | undefined {
  return pageBySlug.get(slug);
}

/** Synchronous lookup of the markdown body for a page. */
export function loadPageBody(slug: string): string | null {
  return bodyBySlug.get(slug) ?? null;
}

/** Find the top-level section node, e.g. for the left-nav sidebar. */
export function findSection(sectionSlug: string): NavBranch | undefined {
  const node = navTree.find(
    (n): n is NavBranch => n.kind === 'folder' && n.slug === sectionSlug,
  );
  return node;
}

// --------------------------------------------------------------------------
// Command-palette index
// --------------------------------------------------------------------------

export type SearchEntry =
  | { kind: 'section'; id: string; title: string; href: string }
  | { kind: 'page'; id: string; title: string; href: string; sectionTitle: string }
  | {
      kind: 'heading';
      id: string;
      title: string;
      href: string;
      pageTitle: string;
      sectionTitle: string;
      depth: number;
    };

function buildSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const node of navTree) {
    if (node.kind === 'folder') {
      entries.push({
        kind: 'section',
        id: `section:${node.slug}`,
        title: node.title,
        href: '/' + node.slug,
      });
    }
  }

  for (const page of allPages) {
    entries.push({
      kind: 'page',
      id: `page:${page.slug}`,
      title: page.title,
      href: page.href,
      sectionTitle: page.sectionTitle,
    });
    for (const h of page.headings) {
      // Skip H1 (it's the page title we already indexed above).
      if (h.depth <= 1) continue;
      entries.push({
        kind: 'heading',
        id: `heading:${page.slug}#${h.id}`,
        title: h.text,
        href: `${page.href}#${h.id}`,
        pageTitle: page.title,
        sectionTitle: page.sectionTitle,
        depth: h.depth,
      });
    }
  }

  return entries;
}

export const searchIndex: SearchEntry[] = buildSearchIndex();
