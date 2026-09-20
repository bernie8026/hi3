(() => {
  'use strict';

  const intro = document.getElementById('site-intro');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // The page stays usable if JavaScript or the optional intro stylesheet fails.
  if (!intro || motion.matches ||
      getComputedStyle(intro).getPropertyValue('--site-intro-ready').trim() !== '1') return;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type === 'back_forward') return;

  const skip = intro.querySelector('button');
  const status = intro.querySelector('[role="status"]');
  const started = performance.now();
  const minimumDuration = 1400;
  const maximumDuration = 4500;
  const background = Array.from(document.body.children)
    .filter(element => element !== intro && element.tagName !== 'SCRIPT');
  const previousInert = background.map(element => element.inert);
  let finished = false;
  let leaving = false;
  let readyTimer;
  let exitTimer;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(deadline);
    clearTimeout(readyTimer);
    clearTimeout(exitTimer);
    window.removeEventListener('load', ready);
    window.removeEventListener('pageshow', restore);
    document.removeEventListener('keydown', onKey);
    motion.removeEventListener('change', onMotion);
    const restoreFocus = intro.contains(document.activeElement);
    intro.hidden = true;
    document.body.classList.remove('intro-active');
    background.forEach((element, index) => { element.inert = previousInert[index]; });
    if (restoreFocus) {
      const main = document.getElementById('main');
      if (main) {
        const tabIndex = main.getAttribute('tabindex');
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        if (tabIndex === null) main.removeAttribute('tabindex');
        else main.setAttribute('tabindex', tabIndex);
      }
    }
  }

  function leave() {
    if (finished || leaving) return;
    leaving = true;
    intro.classList.add('is-leaving');
    exitTimer = window.setTimeout(finish, 450);
  }

  function ready() {
    if (finished || leaving) return;
    intro.classList.add('is-ready');
    status.textContent = '記憶連結完成，即將進入…';
    clearTimeout(readyTimer);
    readyTimer = window.setTimeout(leave, Math.max(0, minimumDuration - (performance.now() - started)));
  }

  function onKey(event) {
    if (event.key === 'Escape') { event.preventDefault(); finish(); }
    if (event.key === 'Tab') { event.preventDefault(); skip.focus(); }
  }
  function onMotion(event) { if (event.matches) finish(); }
  function restore(event) { if (event.persisted) finish(); }

  // Hard deadline also covers slow or failed requests; never wait indefinitely.
  const deadline = window.setTimeout(finish, maximumDuration);
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', onKey);
  motion.addEventListener('change', onMotion);
  window.addEventListener('pageshow', restore);
  window.addEventListener('load', ready, { once: true });
  background.forEach(element => { element.inert = true; });
  document.body.classList.add('intro-active');
  intro.hidden = false;
  skip.focus({ preventScroll: true });
  if (document.readyState === 'complete') ready();
})();
