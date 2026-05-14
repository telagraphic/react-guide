/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 * Used by the Vite lab route and index.html in this folder.
 */

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson03(host) {
  let count = 0;

  /** Same object identity every time — like the object `useRef` returns. */
  const tickRef = { current: 0 };

  /** Points at the current input element after each paint (like a DOM ref). */
  const inputRef = { current: null };

  function paint() {
    host.replaceChildren();

    const pState = document.createElement('p');
    pState.textContent = `state count: ${count}`;

    const pRef = document.createElement('p');
    pRef.dataset.refLine = '1';
    pRef.textContent = `ref ticks: ${tickRef.current}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'DOM ref focuses here';
    inputRef.current = input;

    const btnState = document.createElement('button');
    btnState.type = 'button';
    btnState.textContent = 'increment state (full paint)';
    btnState.addEventListener('click', () => {
      count += 1;
      paint();
    });

    const btnRef = document.createElement('button');
    btnRef.type = 'button';
    btnRef.textContent = 'increment ref only (no paint)';
    btnRef.addEventListener('click', () => {
      tickRef.current += 1;
      const line = host.querySelector('[data-ref-line="1"]');
      if (line) line.textContent = `ref ticks: ${tickRef.current}`;
    });

    const btnFocus = document.createElement('button');
    btnFocus.type = 'button';
    btnFocus.textContent = 'focus input (ref.current.focus)';
    btnFocus.addEventListener('click', () => {
      inputRef.current?.focus();
    });

    host.append(pState, pRef, input, btnState, btnRef, btnFocus);
  }

  paint();
  return () => host.replaceChildren();
}
