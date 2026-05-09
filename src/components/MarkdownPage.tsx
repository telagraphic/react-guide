import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { highlight } from '@/lib/highlighter';
import { slugifyHeading } from '@/lib/content';
import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  body: string;
}

export function MarkdownPage({ body }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { hash } = useLocation();

  // After the page renders (and re-renders on theme switch), scroll to
  // the requested anchor if any.
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, body]);

  const components = useMemo<Components>(
    () => ({
      h1: (props) => <Heading level={1} {...props} />,
      h2: (props) => <Heading level={2} {...props} />,
      h3: (props) => <Heading level={3} {...props} />,
      h4: (props) => <Heading level={4} {...props} />,
      h5: (props) => <Heading level={5} {...props} />,
      h6: (props) => <Heading level={6} {...props} />,
      code({ className, children, ...rest }) {
        const match = /language-(\w+)/.exec(className ?? '');
        const code = String(children).replace(/\n$/, '');
        if (!match) {
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        }
        const html = highlight(code, match[1], isDark);
        return <CodeBlock code={code} html={html} />;
      },
    }),
    [isDark],
  );

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </article>
  );
}

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

function Heading({ level, children }: HeadingProps) {
  const text = childrenToText(children);
  const id = slugifyHeading(text);
  const Tag = (`h${level}` as unknown) as 'h1';
  return (
    <Tag id={id} className="group scroll-mt-20">
      {children}
      {level > 1 && (
        <a
          href={`#${id}`}
          aria-label={`Link to "${text}"`}
          className="ml-2 opacity-0 group-hover:opacity-100 text-accent no-underline"
        >
          #
        </a>
      )}
    </Tag>
  );
}

function childrenToText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(childrenToText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return childrenToText((node as { props: { children?: React.ReactNode } }).props.children);
  }
  return '';
}

interface CodeBlockProps {
  code: string;
  html: string;
}

function CodeBlock({ code, html }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable (e.g. non-secure context); silently no-op */
    }
  }

  const visibility = copied
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100';

  return (
    <span className="relative block group">
      <span className="block" dangerouslySetInnerHTML={{ __html: html }} />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        title={copied ? 'Copied' : 'Copy'}
        className={`absolute top-2 right-2 inline-flex items-center justify-center gap-1.5 min-w-[4.75rem] px-2 py-1 text-[11px] font-medium rounded-md border border-border bg-bg/80 backdrop-blur-sm text-muted hover:text-fg hover:border-accent/50 focus-visible:text-fg focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-opacity duration-150 ${visibility}`}
      >
        {copied ? (
          <>
            <CheckIcon />
            <span>Copied</span>
          </>
        ) : (
          <>
            <CopyIcon />
            <span>Copy</span>
          </>
        )}
      </button>
    </span>
  );
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
