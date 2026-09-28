/* First paint: dark by default, with an optional saved light preference. */
(() => {
  let theme = window.PORTFOLIO_INITIAL_THEME === 'light' ? 'light' : 'dark';
  try {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (_) { /* Storage may be unavailable in a local-file preview. */ }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const color = document.querySelector('meta[name="theme-color"]');
  if (color) color.content = theme === 'dark' ? '#12181e' : '#fafaf7';
})();
