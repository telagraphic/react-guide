/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson08(host) {
  function paint() {
    host.replaceChildren();

    const box = document.createElement('div');
    box.textContent = 'Measured box';
    box.style.width = '140px';
    box.style.padding = '8px';
    box.style.border = '1px solid';
    host.append(box);

    const widthSync = box.getBoundingClientRect().width;

    const syncLine = document.createElement('p');
    syncLine.textContent = `Same-turn layout read (useLayoutEffect-ish): ${Math.round(widthSync)}px`;
    host.append(syncLine);

    queueMicrotask(() => {
      const widthLater = box.getBoundingClientRect().width;
      const asyncLine = document.createElement('p');
      asyncLine.textContent = `Microtask layout read (closer to passive useEffect-ish): ${Math.round(widthLater)}px`;
      host.append(asyncLine);
    });
  }

  paint();
  return () => host.replaceChildren();
}
