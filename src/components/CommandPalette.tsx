import { Command } from 'cmdk';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { searchIndex } from '@/lib/content';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  // Group entries for nicer rendering. cmdk's built-in fuzzy filter
  // handles match scoring; we just give it sections to organise.
  const grouped = useMemo(() => {
    const sections = searchIndex.filter((e) => e.kind === 'section');
    const pages = searchIndex.filter((e) => e.kind === 'page');
    const headings = searchIndex.filter((e) => e.kind === 'heading');
    return { sections, pages, headings };
  }, []);

  // Close on Escape (cmdk handles it internally, but we also need to
  // re-focus body so the Cmd+K shortcut keeps working).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  function handleSelect(href: string) {
    onOpenChange(false);
    navigate(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close palette"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
      />
      <Command
        loop
        label="Global command palette"
        className="relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <SearchIcon />
          <Command.Input
            autoFocus
            placeholder="Jump to a page or heading…"
            className="flex-1 bg-transparent text-fg placeholder:text-muted outline-none text-sm"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border text-muted">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
            No matches.
          </Command.Empty>

          {grouped.sections.length > 0 && (
            <Command.Group
              heading="Sections"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
            >
              {grouped.sections.map((entry) => (
                <Command.Item
                  key={entry.id}
                  value={`${entry.title} ${entry.href}`}
                  onSelect={() => handleSelect(entry.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-fg cursor-pointer aria-selected:bg-surface-2"
                >
                  <SectionIcon />
                  <span>{entry.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {grouped.pages.length > 0 && (
            <Command.Group
              heading="Pages"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
            >
              {grouped.pages.map((entry) => {
                if (entry.kind !== 'page') return null;
                return (
                  <Command.Item
                    key={entry.id}
                    value={`${entry.title} ${entry.sectionTitle} ${entry.href}`}
                    onSelect={() => handleSelect(entry.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-fg cursor-pointer aria-selected:bg-surface-2"
                  >
                    <PageIcon />
                    <span className="flex-1">{entry.title}</span>
                    <span className="text-xs text-muted">{entry.sectionTitle}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {grouped.headings.length > 0 && (
            <Command.Group
              heading="Headings"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted"
            >
              {grouped.headings.map((entry) => {
                if (entry.kind !== 'heading') return null;
                return (
                  <Command.Item
                    key={entry.id}
                    value={`${entry.title} ${entry.pageTitle} ${entry.sectionTitle}`}
                    onSelect={() => handleSelect(entry.href)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-fg cursor-pointer aria-selected:bg-surface-2"
                  >
                    <HeadingIcon />
                    <span className="flex-1 truncate">
                      {entry.title}
                      <span className="ml-2 text-xs text-muted">
                        in {entry.pageTitle}
                      </span>
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}
        </Command.List>

        <div className="flex items-center gap-3 border-t border-border bg-bg px-4 py-2 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-surface">↑</kbd>
            <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-surface">↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-surface">↵</kbd>
            select
          </span>
        </div>
      </Command>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function SectionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden="true">
      <path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan" aria-hidden="true">
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
    </svg>
  );
}

function HeadingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink" aria-hidden="true">
      <path d="M6 4v16" /><path d="M18 4v16" /><path d="M6 12h12" />
    </svg>
  );
}
