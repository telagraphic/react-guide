/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 * Used by the Vite lab route and index.html in this folder.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson04(host) {
  /** Like `createContext('lavender')`. */
  const ThemeContext = { defaultValue: 'lavender' };

  /** @type {string[]} */
  const themeStack = [];

  function readTheme() {
    return themeStack.length ? /** @type {string} */ (themeStack.at(-1)) : ThemeContext.defaultValue;
  }

  let provided = 'light';

  function paint() {
    host.replaceChildren();

    const outside = document.createElement('p');
    outside.textContent = `Outside any provider (default): ${readTheme()}`;
    host.append(outside);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = `toggle provider value (now: ${provided})`;
    toggle.addEventListener('click', () => {
      provided = provided === 'light' ? 'dark' : 'light';
      paint();
    });
    host.append(toggle);

    themeStack.push(provided);
    try {
      const inside = document.createElement('p');
      inside.textContent = `Inside provider: ${readTheme()}`;
      host.append(inside);

      themeStack.push('accent');
      try {
        const nested = document.createElement('p');
        nested.textContent = `Inside nested provider: ${readTheme()}`;
        host.append(nested);
      } finally {
        themeStack.pop();
      }
    } finally {
      themeStack.pop();
    }
  }

  paint();
  return () => host.replaceChildren();
}
