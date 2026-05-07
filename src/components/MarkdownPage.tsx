import { useEffect, useMemo } from 'react';
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
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
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
