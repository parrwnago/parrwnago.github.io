/* Appearance preferences are independent from reduced-motion preferences. */
(() => {
  const buttons = [...document.querySelectorAll('[data-theme-toggle]')];
  function apply(theme) {
    theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = theme === 'dark' ? '#12181e' : '#fafaf7';
    buttons.forEach(button => {
      button.hidden = false;
      const action = theme === 'dark' ? 'light' : 'dark';
      button.querySelector('[data-theme-label]').textContent = action === 'light' ? 'Light' : 'Dark';
      button.setAttribute('aria-label', `Switch to ${action} theme`);
      button.title = `Switch to ${action} theme`;
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('portfolio-theme', theme); } catch (_) {}
    apply(theme);
  }));
  window.addEventListener('storage', event => {
    if (event.key === 'portfolio-theme') apply(event.newValue);
  });
  apply(document.documentElement.dataset.theme);
})();

/* Progressive enhancements. All project pages and core text work without JavaScript. */
'use strict';
(() => {
  const dialog = document.querySelector('#image-viewer');
  if (dialog && typeof dialog.showModal === 'function') {
    const viewerImage = dialog.querySelector('img');
    const viewerCaption = dialog.querySelector('.lightbox-caption');
    let opener;
    document.querySelectorAll('a[data-lightbox]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        opener = link;
        const image = link.querySelector('img');
        viewerImage.src = link.href;
        viewerImage.alt = image?.alt || 'Project image';
        viewerCaption.textContent = link.dataset.caption || image?.alt || '';
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      viewerImage.removeAttribute('src');
      opener?.focus({ preventScroll: true });
    });
  }
  // No third-party requests are made until the visitor chooses to load a video.
  document.querySelectorAll('button[data-youtube]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.youtube;
      if (!/^[\w-]{11}$/.test(id || '')) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = button.dataset.title || 'Project demonstration video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      button.replaceWith(iframe);
    });
  });
  document.querySelectorAll('[data-print]').forEach(button => button.addEventListener('click', () => window.print()));
  // Pause other local videos when one starts; never autoplay experiment footage.
  document.querySelectorAll('video').forEach(video => video.addEventListener('play', () => {
    document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
  }));
})();

/* Small, optional chapter entrances. Motion never encodes experimental timing. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = [...document.querySelectorAll('[data-motion-toggle]')];
  let saved;
  try { saved = localStorage.getItem('portfolio-motion'); } catch (_) { /* local preview may block storage */ }
  let wanted = (saved || window.PORTFOLIO_INITIAL_MOTION || 'on') !== 'off';
  const running = new Set();
  let observer;
  let active = false;
  const elements = [...document.querySelectorAll('.hero-copy, .hero-media, .section-top, .work-image, .project-row, .research-update, .about-grid > div, .case-head, .case-section > h2, .trial-title')];
  elements.filter(el => el.matches('.case-section > h2')).forEach(el => el.classList.add('motion-rule'));
  function stop() { running.forEach(a => a.cancel()); running.clear(); }
  function enable() {
    active = wanted && !preference.matches;
    document.documentElement.dataset.motion = active ? 'on' : 'off';
    controls.forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('[data-motion-label]').textContent = active ? 'on' : 'off';
      button.title = preference.matches ? 'Your device requests reduced motion; decorative animations are disabled.' : (active ? 'Turn off decorative page animations' : 'Turn on decorative page animations');
    });
    stop(); observer?.disconnect();
    if (!active || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        if (el.dataset.revealed || !active) return;
        el.dataset.revealed = 'true';
        el.classList.add('is-revealed');
        // Content is never hidden in CSS: a JS error cannot make a section disappear.
        const visual = el.matches('.work-image, .hero-media');
        const animation = el.animate([
          { opacity: .25, transform: visual ? 'translateY(16px)' : 'translateY(9px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: visual ? 500 : 380, easing: 'cubic-bezier(.22,.75,.18,1)' });
        running.add(animation);
        animation.onfinish = () => running.delete(animation);
        animation.oncancel = () => running.delete(animation);
      });
    }, { threshold: .08 });
    elements.filter(el => !el.dataset.revealed).forEach(el => observer.observe(el));
  }
  controls.forEach(button => button.addEventListener('click', () => {
    if (preference.matches) return; // Never override an OS reduced-motion request.
    wanted = !wanted;
    try { localStorage.setItem('portfolio-motion', wanted ? 'on' : 'off'); } catch (_) {}
    enable();
  }));
  preference.addEventListener('change', enable);
  // Native details work without JS. This also provides exclusive opening in older browsers.
  const records = [...document.querySelectorAll('.trajectory-record')];
  records.forEach(record => record.addEventListener('toggle', () => {
    if (record.open) records.forEach(other => { if (other !== record) other.open = false; });
  }));
  window.addEventListener('beforeprint', stop);
  enable();
})();
