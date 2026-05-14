/**
 * Kept in sync with LESSON.md — section “Vanilla implementation”.
 */

/**
 * @param {number} initial
 */
function createCounter(initial) {
  let value = initial;
  return {
    get() {
      return value;
    },
    increment() {
      value += 1;
    },
    decrement() {
      value -= 1;
    },
  };
}

/**
 * @param {Element} host
 * @returns {() => void}
 */
export function mountLesson10(host) {
  const counter = createCounter(0);

  function paint() {
    host.replaceChildren();

    const p = document.createElement('p');
    p.textContent = String(counter.get());

    const inc = document.createElement('button');
    inc.type = 'button';
    inc.textContent = '+';
    inc.addEventListener('click', () => {
      counter.increment();
      paint();
    });

    const dec = document.createElement('button');
    dec.type = 'button';
    dec.textContent = '-';
    dec.addEventListener('click', () => {
      counter.decrement();
      paint();
    });

    host.append(p, inc, dec);
  }

  paint();
  return () => host.replaceChildren();
}
