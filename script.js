// ========== NAV CONTROLS (works across every page) ==========
(function () {
  const menuBtn  = document.querySelector('.menu-toggle');
  const drawer   = document.querySelector('nav .nav-links');
  const header   = document.querySelector('nav');

  // Create a fullscreen overlay (no HTML changes needed)
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  // Helpers
  const mqTouch = window.matchMedia('(hover: none), (max-width: 1024px)');
  const isMobile = () => mqTouch.matches;

  function closeAllSubmenus() {
    document
      .querySelectorAll('nav .has-submenu.submenu-open, nav .dropdown.open')
      .forEach(el => el.classList.remove('submenu-open', 'open'));
    // ARIA
    document
      .querySelectorAll('nav .shop-label[aria-expanded="true"], nav .shop-toggle[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }

  function openMenu() {
    if (!drawer) return;
    drawer.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    menuBtn?.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    menuBtn?.setAttribute('aria-expanded', 'false');
    closeAllSubmenus();
  }

  // Toggle button
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const nowOpen = !drawer.classList.contains('show');
      nowOpen ? openMenu() : closeMenu();
    });
  }

  // === MOBILE: toggle the Shop submenu on tap (desktop stays hover) ===
  const shopLi = document.querySelector('nav li.has-submenu, nav li.dropdown');
  const shopLabel =
    shopLi?.querySelector(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > span');

  if (shopLi && shopLabel) {
    // Make it accessible and non-navigating on mobile
    shopLabel.setAttribute('role', 'button');
    shopLabel.setAttribute('tabindex', '0');
    shopLabel.setAttribute('aria-expanded', 'false');

    const toggleShop = (e) => {
      if (!isMobile()) return; // desktop handled by CSS :hover
      e.preventDefault();
      e.stopPropagation();
      const opening = !shopLi.classList.contains('submenu-open') && !shopLi.classList.contains('open');

      // close other shop instances if any
      document.querySelectorAll('nav li.has-submenu, nav li.dropdown').forEach(li => {
        if (li !== shopLi) li.classList.remove('submenu-open', 'open');
      });

      shopLi.classList.toggle('submenu-open', opening);
      shopLi.classList.toggle('open', opening);
      shopLabel.setAttribute('aria-expanded', opening ? 'true' : 'false');
    };

    shopLabel.addEventListener('click', toggleShop);
    shopLabel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleShop(e);
      }
    });
  }

  // === Close interactions ===

  // 1) Tap/click on overlay closes
  overlay.addEventListener('click', closeMenu);
  overlay.addEventListener('touchstart', closeMenu, { passive: true });

  // 2) Click/tap anywhere outside the drawer & header closes (capture so nothing swallows it)
  const outsideClose = (e) => {
    // only care when drawer is open and on mobile (desktop has no overlay drawer)
    if (!drawer || !drawer.classList.contains('show')) return;

    const insideDrawer = drawer.contains(e.target);
    const onMenuBtn = menuBtn?.contains(e.target);
    const insideHeader = header?.contains(e.target);

    // If you clicked not on the drawer and not on the menu button,
    // also allow taps on header background to close (since overlay sits under it)
    if (!insideDrawer && !onMenuBtn && !insideHeader) {
      closeMenu();
    }
  };
  document.addEventListener('click', outsideClose, true);
  document.addEventListener('touchstart', outsideClose, true);

  // 3) ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // 4) Clicking a real link inside the drawer should close everything
  drawer?.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', () => {
      closeMenu();
    });
  });

  // 5) Keep CSS responsive to viewport changes (e.g., rotate phone)
  mqTouch.addEventListener?.('change', () => {
    // If leaving mobile context while drawer is open, just clean up.
    if (!isMobile()) closeMenu();
  });
})();
