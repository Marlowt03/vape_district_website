// ===== CLEAN, ROBUST NAV =====
(function () {
  const header  = document.querySelector('nav');
  const drawer  = document.querySelector('nav .nav-links');
  const toggle  = document.querySelector('.menu-toggle');

  // Create overlay once
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    // Inline styles beat old rules that were setting display:none etc.
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0,0,0,.45)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);
  }

  const mqMobile = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mqMobile.matches;

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    // keep drawer above overlay on all pages
    drawer.style.zIndex = '2001';
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }

  function closeSubmenus() {
    document.querySelectorAll('nav .has-submenu.submenu-open, nav .dropdown.open')
      .forEach(li => li.classList.remove('submenu-open','open'));
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

  // Overlay click closes
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Click outside closes (capture so nothing eats the event first)
  const outsideClose = (e) => {
    if (!isMobile()) return;                     // desktop has no drawer overlay
    if (!drawer || !drawer.classList.contains('show')) return;
    const insideDrawer = drawer.contains(e.target);
    const onToggle     = toggle?.contains(e.target);
    const insideHeader = header?.contains(e.target);
    if (!insideDrawer && !onToggle && !insideHeader) closeDrawer();
  };
  document.addEventListener('click', outsideClose, true);
  document.addEventListener('touchstart', outsideClose, true);

  // Stop clicks inside drawer from bubbling to the outsideClose handler
  drawer?.addEventListener('click', (e) => e.stopPropagation());
  drawer?.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

  // ESC to close
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // Close after clicking any real link
  drawer?.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', closeDrawer));

  // Mobile “Shop” toggle (desktop still uses hover)
  const shopLi = document.querySelector('nav li.has-submenu, nav li.dropdown');
  const shopTrigger = shopLi?.querySelector(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > span');
  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role', 'button');
    shopTrigger.setAttribute('tabindex', '0');
    shopTrigger.setAttribute('aria-expanded', 'false');

    const toggleShop = (e) => {
      if (!isMobile()) return;  // desktop handled by :hover CSS
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !shopLi.classList.contains('submenu-open') && !shopLi.classList.contains('open');
      // close any siblings
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

  // If viewport changes (rotation), clean up drawer
  mqMobile.addEventListener?.('change', () => { if (!isMobile()) closeDrawer(); });
})();
