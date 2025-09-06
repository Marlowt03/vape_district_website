// ===== Vape District — Navigation + Reviews (desktop unchanged) =====
(function () {
  const header  = document.querySelector('nav');
  const drawer  = document.querySelector('nav .nav-links');
  const toggle  = document.querySelector('.menu-toggle');

  // ---------- Overlay (one-time) ----------
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    // inline styles ensure no old CSS can hide it
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.45)',
      zIndex: '2000', display: 'none'
    });
    document.body.appendChild(overlay);
  }

  const mqMobile = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mqMobile.matches;

  // ---------- Drawer open/close ----------
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    drawer.style.zIndex = '2001';   // above overlay
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }

  function closeSubmenus() {
    document.querySelectorAll('nav .has-submenu.submenu-open, nav .dropdown.open')
      .forEach(li => li.classList.remove('submenu-open', 'open'));
    document.querySelectorAll('nav .shop-label[aria-expanded="true"], nav .shop-toggle[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded','false');
    closeSubmenus();
  }

  // Toggle button
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      drawer.classList.contains('show') ? closeDrawer() : openDrawer();
    });
  }

  // Overlay closes
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // IMPORTANT: click-outside in *bubbling* phase (not capture)
  const outsideClose = (e) => {
    if (!isMobile()) return;
    if (!drawer || !drawer.classList.contains('show')) return;

    const insideDrawer = drawer.contains(e.target);
    const onToggle     = !!(toggle && toggle.contains(e.target));
    const insideHeader = !!(header && header.contains(e.target));

    // We only close if the tap/click is truly outside the nav + drawer + toggle
    if (!insideDrawer && !onToggle && !insideHeader) closeDrawer();
  };
  document.addEventListener('click', outsideClose, false);
  document.addEventListener('touchstart', outsideClose, { passive: true });

  // Keep taps inside drawer from bubbling up to document (extra safety)
  drawer?.addEventListener('click', (e) => e.stopPropagation());
  drawer?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

  // ESC to close
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Close after clicking any real link
  drawer?.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', closeDrawer));

  // ---------- Mobile “Shop” toggle (desktop still uses hover CSS) ----------
  const shopLi = document.querySelector('nav li.has-submenu, nav li.dropdown');
  const shopTrigger = shopLi?.querySelector(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > span');

  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role', 'button');
    shopTrigger.setAttribute('tabindex', '0');
    shopTrigger.setAttribute('aria-expanded', 'false');

    const toggleShop = (e) => {
      if (!isMobile()) return;        // desktop uses CSS hover
      e.preventDefault();
      e.stopPropagation();

      const willOpen = !shopLi.classList.contains('submenu-open') && !shopLi.classList.contains('open');

      // close any other open dropdowns
      document.querySelectorAll('nav li.has-submenu, nav li.dropdown').forEach(li => {
        if (li !== shopLi) li.classList.remove('submenu-open','open');
      });

      shopLi.classList.toggle('submenu-open', willOpen);
      shopLi.classList.toggle('open', willOpen);
      shopTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    };

    shopTrigger.addEventListener('click', toggleShop);
    shopTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleShop(e); }
    });
  }

  // If viewport changes (e.g., rotate), tidy up
  mqMobile.addEventListener?.('change', () => { if (!isMobile()) closeDrawer(); });
})();

// ===== Reviews slider (Home page) =====
(function () {
  const root = document.querySelector('.reviews-slider');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.review-slide'));
  const prev   = root.querySelector('.prev');
  const next   = root.querySelector('.next');

  if (!slides.length || !prev || !next) return;

  let index = slides.findIndex(s => s.classList.contains('active'));
  if (index < 0) index = 0;

  function show(i) {
    slides.forEach((s, n) => s.classList.toggle('active', n === i));
  }

  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  });

  next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    show(index);
  });

  // optional: keyboard support when slider is focused
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev.click();
    if (e.key === 'ArrowRight') next.click();
  });
})();
