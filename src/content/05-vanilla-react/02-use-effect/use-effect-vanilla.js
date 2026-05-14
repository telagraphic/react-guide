/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 * Used by the Vite lab route and index.html in this folder.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson02(host) {
  let count = 0;
  let alive = true;

  /** Value of `count` the passive effect last ran for (React: last committed deps). */
  let lastEffectCount = /** @type {number | null} */ (null);

  /** Cleanup from the previous effect run (React: function returned from the effect). */
  /** @type {null | (() => void)} */
  let passiveCleanup = null;

  function flushPassiveEffects() {
    if (lastEffectCount === count) return;

    if (passiveCleanup) {
      passiveCleanup();
      passiveCleanup = null;
    }

    lastEffectCount = count;
    document.title = `Vanilla lab | count=${count}`;
    passiveCleanup = () => {
      document.title = '';
    };
  }

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

    // useEffect runs after the browser could paint this frame; a microtask is a small stand-in.
    queueMicrotask(() => {
      if (!alive) return;
      flushPassiveEffects();
    });
  }

  paint();

  return () => {
    alive = false;
    if (passiveCleanup) {
      passiveCleanup();
      passiveCleanup = null;
    }
    host.replaceChildren();
  };
}
