import { NavLink, useLocation } from 'react-router';

import {
  challengeFolderId,
  challengeIdFromPathname,
  findChallengeFolder,
  firstPageInFolder,
  getChallengeFolders,
  type NavBranch,
  type NavLeaf,
} from '@/lib/content';

export function ChallengesNav({ section }: { section: NavBranch }) {
  const { pathname } = useLocation();
  const activeChallengeId = challengeIdFromPathname(pathname);
  const folders = getChallengeFolders(section);

  if (!activeChallengeId) {
    return <ChallengeListNav section={section} folders={folders} />;
  }

  const activeFolder = findChallengeFolder(section, activeChallengeId);
  if (!activeFolder) {
    return <ChallengeListNav section={section} folders={folders} />;
  }

  return (
    <ChallengePagesNav
      section={section}
      folder={activeFolder}
      pages={activeFolder.children.filter((n): n is NavLeaf => n.kind === 'page')}
    />
  );
}

function ChallengeListNav({
  section,
  folders,
}: {
  section: NavBranch;
  folders: NavBranch[];
}) {
  return (
    <nav className="text-sm sticky top-20">
      <NavLink
        to={'/' + section.slug}
        end
        className={({ isActive }) =>
          [
            'block px-3 py-1.5 rounded-md text-sm font-semibold mb-3 transition-colors',
            isActive
              ? 'text-fg bg-surface-2'
              : 'text-fg hover:bg-surface',
          ].join(' ')
        }
      >
        {section.title}
      </NavLink>
      <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted mb-2">
        Challenges
      </p>
      <ul className="space-y-0.5">
        {folders.map((folder) => {
          const first = firstPageInFolder(folder);
          const id = challengeFolderId(folder);
          if (!first) return null;
          return (
            <li key={folder.slug}>
              <NavLink
                to={first.href}
                className={({ isActive }) =>
                  [
                    'block px-3 py-1.5 rounded-md font-mono text-sm transition-colors',
                    isActive
                      ? 'text-fg bg-surface font-medium'
                      : 'text-muted hover:text-fg hover:bg-surface',
                  ].join(' ')
                }
              >
                {id}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ChallengePagesNav({
  section,
  folder,
  pages,
}: {
  section: NavBranch;
  folder: NavBranch;
  pages: NavLeaf[];
}) {
  const folderId = challengeFolderId(folder);

  return (
    <nav className="text-sm sticky top-20">
      <NavLink
        to={'/' + section.slug}
        className="block px-3 py-1.5 mb-3 rounded-md text-sm text-muted hover:text-fg hover:bg-surface transition-colors"
      >
        ← All challenges
      </NavLink>
      <p className="px-3 font-mono text-sm font-semibold text-fg mb-2">{folderId}</p>
      <ul className="space-y-0.5 border-l border-border ml-3 pl-3">
        {pages.map((page) => (
          <li key={page.slug}>
            <NavLink
              to={page.href}
              end
              className={({ isActive }) =>
                [
                  'block px-3 py-1 rounded-md text-sm transition-colors',
                  isActive
                    ? 'text-fg bg-surface font-medium'
                    : 'text-muted hover:text-fg hover:bg-surface',
                ].join(' ')
              }
            >
              {page.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
