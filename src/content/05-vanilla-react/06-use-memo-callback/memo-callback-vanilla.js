/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson06(host) {
  let count = 0;

  let memoDep = NaN;
  let memoDoubled = 0;

  function readMemoDoubled() {
    if (memoDep === count) return memoDoubled;
    memoDep = count;
    memoDoubled = count * 2;
    return memoDoubled;
  }

  let cbDep = NaN;
  /** @type {null | (() => void)} */
  let cachedIncrement = null;

  function getIncrementCallback() {
    if (cbDep === count && cachedIncrement) return cachedIncrement;
    cbDep = count;
    cachedIncrement = () => {
      count += 1;
      paint();
    };
    return cachedIncrement;
  }

  function paint() {
    host.replaceChildren();

    const doubled = readMemoDoubled();

    const p = document.createElement('p');
    p.textContent = `count: ${count} — memo doubled: ${doubled}`;

    const q = document.createElement('p');
    const cb = getIncrementCallback();
    q.textContent = `useCallback-ish: same function object while count unchanged? ${cb === getIncrementCallback()}`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'increment';
    btn.addEventListener('click', cb);

    host.append(p, q, btn);
  }

  paint();
  return () => host.replaceChildren();
}
