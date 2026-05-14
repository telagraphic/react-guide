/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson07(host) {
  /** @type {Set<() => void>} */
  const listeners = new Set();
  let n = 0;

  function getSnapshot() {
    return n;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function tick() {
    n += 1;
    for (const l of [...listeners]) l();
  }

  function paint() {
    const snap = getSnapshot();
    host.replaceChildren();

    const p = document.createElement('p');
    p.textContent = `snapshot from store: ${snap}`;

    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'mutate store (notifies subscribers)';
    b.addEventListener('click', () => tick());

    host.append(p, b);
  }

  const unsubscribe = subscribe(() => {
    paint();
  });

  paint();

  return () => {
    unsubscribe();
    host.replaceChildren();
  };
}
