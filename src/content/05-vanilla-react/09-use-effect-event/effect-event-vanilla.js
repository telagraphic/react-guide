/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson09(host) {
  let count = 0;

  const latest = { current: () => 0 };

  function paint() {
    host.replaceChildren();

    latest.current = () => count;

    const label = document.createElement('p');
    label.textContent = `count: ${count}`;

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = 'increment';
    inc.addEventListener('click', () => {
      count += 1;
      paint();
    });

    const read = document.createElement('button');
    read.type = 'button';
    read.textContent = 'subscriber reads latest() via ref';
    read.addEventListener('click', () => {
      const out = document.createElement('p');
      out.textContent = `latest(): ${latest.current()}`;
      host.append(out);
    });

    host.append(label, inc, read);
  }

  paint();
  return () => host.replaceChildren();
}
