/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson05(host) {
  /**
   * @param {{ count: number }} state
   * @param {{ type: string }} action
   */
  function reducer(state, action) {
    if (action.type === 'inc') return { count: state.count + 1 };
    if (action.type === 'dec') return { count: state.count - 1 };
    return state;
  }

  let state = { count: 0 };

  function dispatch(action) {
    state = reducer(state, action);
    paint();
  }

  function paint() {
    host.replaceChildren();

    const label = document.createElement('p');
    label.textContent = `count: ${state.count}`;

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = 'dispatch inc';
    inc.addEventListener('click', () => dispatch({ type: 'inc' }));

    const dec = document.createElement('button');
    dec.type = 'button';
    dec.textContent = 'dispatch dec';
    dec.addEventListener('click', () => dispatch({ type: 'dec' }));

    host.append(label, inc, dec);
  }

  paint();
  return () => host.replaceChildren();
}
