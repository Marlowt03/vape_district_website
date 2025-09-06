// ===== Vape District — Final stable nav + reviews =====
(() => {
  const nav    = document.querySelector('nav');
  if (!nav) return;

  const drawer = nav.querySelector('.nav-links');
  const toggle = nav.querySelector('.menu-toggle');

  // --------- Single overlay ----------
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const mq = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mq.matches;

  // --------- Drawer open/close ----------
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded', 'false');
    // close any mobile submenus
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
      .forEach(li => li.classList.remove('open','submenu-open'));
    nav.querySelectorAll('a[aria-expanded="true"], .shop-label[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }

  // Hamburger
  toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawer?.classList.contains('show') ? closeDrawer() : openDrawer();
  });

  // Overlay closes
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Keep clicks inside drawer from closing it
  drawer?.addEventListener('click', e => e.stopPropagation(), true);
  drawer?.addEventListener('touchstart', e => e.stopPropagation(), { passive:true });

  // Click outside to close (mobile only)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer?.classList.contains('show')) return;
    const insideDrawer = drawer.contains(e.target);
    const onToggle     = !!(toggle && toggle.contains(e.target));
    if (!insideDrawer && !onToggle) closeDrawer();
  }, false);

  // --------- Mobile Shop toggle (desktop uses CSS hover) ----------
  const shopLi = nav.querySelector('li.dropdown, li.has-submenu');
  const shopTrigger = shopLi?.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role','button');
    shopTrigger.setAttribute('tabindex','0');
    shopTrigger.setAttribute('aria-expanded','false');

    const toggleShop = (e) => {
      if (!isMobile()) return;   // desktop untouched
      e.preventDefault();
      e.stopPropagation();

      // Ensure drawer is open so we don't get the flash/close
      if (!drawer.classList.contains('show')) openDrawer();

      const opening = !(shopLi.classList.contains('open') || shopLi.classList.contains('submenu-open'));

      // Close any other open ones
      nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
        .forEach(li => { if (li !== shopLi) li.classList.remove('open','submenu-open'); });

      shopLi.classList.toggle('open', opening);
      shopLi.classList.toggle('submenu-open', opening);
      shopTrigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    };

    shopTrigger.addEventListener('click', toggleShop);
    shopTrigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleShop(e); }
    });
  }

  // Close after tapping any real link
  drawer?.querySelectorAll('a[href]:not([href="#"])').forEach(a => {
    a.addEventListener('click', () => { if (isMobile()) closeDrawer(); });
  });

  // Keep tidy when rotating / crossing breakpoints
  mq.addEventListener?.('change', () => { if (!isMobile()) closeDrawer(); });

  // --------- Reviews slider ----------
  const slider = document.querySelector('.reviews-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.review-slide'));
    const prev   = slider.querySelector('.prev');
    const next   = slider.querySelector('.next');
    if (slides.length && prev && next) {
      let i = slides.findIndex(s => s.classList.contains('active'));
      if (i < 0) i = 0;
      const show = (n) => slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      show(i);
      prev.addEventListener('click', (e)=>{ e.preventDefault(); i=(i-1+slides.length)%slides.length; show(i); });
      next.addEventListener('click', (e)=>{ e.preventDefault(); i=(i+1)%slides.length; show(i); });
    }
  }

  // --------- Optional: force-pull the latest style.css on every page ----------
  // (So you DON'T have to add ?v=... to every HTML file.)
  // Bump the version to bust caches whenever style.css changes
  const v = 'navfix8';
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    if (!link.href) return;
    if (link.href.includes('style.css') && !link.href.includes('navfix')) {
      const url = new URL(link.href, location.href);
      url.searchParams.set('v', v);
      link.href = url.toString();
    }
  });
})();
