/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 * Used by the Vite lab route and index.html in this folder.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson01(host) {
  let count = 0;

  function paint() {
    host.replaceChildren();

    const label = document.createElement('p');
    label.textContent = `count: ${count}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'increment';
    btn.addEventListener('click', () => {
      count += 1;
      paint();
    });

    host.append(label, btn);
  }

  paint();
  return () => host.replaceChildren();
}
