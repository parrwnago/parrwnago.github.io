/* In-page zoom for exact PDF page renderings. Reading does not require JavaScript. */
(() => {
  'use strict';
  const viewport = document.querySelector('.resume-viewport');
  const sheets = document.querySelector('.resume-sheets');
  const controls = document.querySelector('.resume-zoom');
  if (!viewport || !sheets || !controls) return;
  const levels = [1, 1.25, 1.5, 1.75, 2];
  let index = 0;
  function apply() {
    const style = getComputedStyle(viewport);
    const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    sheets.style.width = `${width * levels[index]}px`;
    controls.querySelector('output').textContent = `${Math.round(levels[index] * 100)}%`;
    controls.querySelector('[data-resume-zoom="out"]').disabled = index === 0;
    controls.querySelector('[data-resume-zoom="in"]').disabled = index === levels.length - 1;
  }
  controls.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const direction = button.dataset.resumeZoom;
    index = direction === 'fit' ? 0 : Math.min(levels.length - 1, Math.max(0, index + (direction === 'in' ? 1 : -1)));
    apply();
    if (index === 0) viewport.scrollLeft = 0;
  }));
  controls.hidden = false;
  if ('ResizeObserver' in window) new ResizeObserver(apply).observe(viewport);
  else window.addEventListener('resize', apply);
  // Ensure both original pages are ready before printing, including the lazy second page.
  window.addEventListener('beforeprint', () => document.querySelectorAll('.resume-sheet img').forEach(img => { img.loading = 'eager'; }));
  apply();
})();
