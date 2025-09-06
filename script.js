// ===== Vape District — unified, one-handler nav (mobile + desktop) + reviews =====
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Elements
  const drawer  = nav.querySelector('.nav-links') || document.querySelector('.nav-links');
  let   toggle  = nav.querySelector('.menu-toggle') || document.querySelector('.menu-toggle');
  let   overlay = document.querySelector('.nav-overlay');

  // Ensure overlay exists
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  // Ensure a reliable hamburger button exists
  if (toggle) {
    toggle.setAttribute('type', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggle.hasAttribute('href')) toggle.removeAttribute('href');
    toggle.setAttribute('role', 'button');
  } else {
    toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    nav.prepend(toggle);
  }

  // Neutralize "#" anchors to avoid page jump
  nav.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  // Helpers
  const mq = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  const hasPanel = (li) =>
    !!li?.querySelector(':scope > .dropdown-content, :scope > .submenu, :scope > .sub-dropdown');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    overlay?.classList.add('show');
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay?.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded', 'false');

    // Collapse any open menus
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
      .forEach(li => li.classList.remove('open','submenu-open'));
    nav.querySelectorAll('[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }
  function drawerIsOpen(){ return !!drawer && drawer.classList.contains('show'); }

  // Hamburger toggle
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawerIsOpen() ? closeDrawer() : openDrawer();
  });

  // Overlay + outside click close
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Keep clicks inside drawer from bubbling to document and closing it
  drawer?.addEventListener('click', e => e.stopPropagation(), true);
  drawer?.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawerIsOpen()) return;
    const inside = drawer.contains(e.target);
    const onTgl  = !!(toggle && toggle.contains(e.target));
    if (!inside && !onTgl) closeDrawer();
  }, false);

  // Reset state when crossing breakpoint to desktop
  mq.addEventListener?.('change', () => {
    if (!isMobile()) closeDrawer();
  });

  // ============================
  // ONE delegated click handler
  // ============================
  nav.addEventListener('click', (e) => {
    if (!isMobile()) return;               // desktop uses hover CSS for dropdowns

    // 1) TOP-LEVEL (e.g., "Shop") — direct child trigger of li.dropdown / li.has-submenu
    const topTrigger = e.target.closest(
      'li.dropdown > a, li.dropdown > .shop-label, li.dropdown > button, li.dropdown > span,' +
      'li.has-submenu > a, li.has-submenu > .shop-label, li.has-submenu > button, li.has-submenu > span'
    );
    if (topTrigger) {
      const li = topTrigger.parentElement;
      if (!li) return;

      // If this li actually has a panel, treat as toggler; otherwise allow navigation
      if (hasPanel(li)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!drawerIsOpen()) openDrawer();

        const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));

        // Close other top-level menus
        nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
          if (other !== li) {
            other.classList.remove('open','submenu-open');
            const ot = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
            ot?.setAttribute('aria-expanded','false');
          }
        });

        li.classList.toggle('open', opening);
        li.classList.toggle('submenu-open', opening);
        topTrigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
      }
      return; // handled (or allowed to navigate by default if no panel)
    }

    // 2) NESTED items inside the open dropdown (e.g., "Detox", "Mystery Boxes", "420", "Vapes")
    const nestedTrigger = e.target.closest('li.submenu > a, li.submenu > .has-sub, li.submenu > button, li.submenu > span');
    if (nestedTrigger) {
      const li   = nestedTrigger.parentElement;
      const href = nestedTrigger.getAttribute?.('href');

      // If it's a real link (has href and not '#'), navigate immediately on first tap
      if (href && href !== '#') {
        // Close drawer, then allow the browser to navigate (do not preventDefault)
        closeDrawer();
        return;
      }

      // Otherwise, only toggle if this nested li actually has a panel
      if (hasPanel(li)) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (!drawerIsOpen()) openDrawer();

        const opening = !li.classList.contains('submenu-open');

        // Close siblings within the same parent
        const parent = li.parentElement;
        if (parent) {
          Array.from(parent.children).forEach(sib => {
            if (sib !== li && sib.classList?.contains('submenu')) {
              sib.classList.remove('submenu-open');
              const t = sib.querySelector(':scope > a, :scope > .has-sub, :scope > button, :scope > span');
              t?.setAttribute('aria-expanded','false');
            }
          });
        }

        li.classList.toggle('submenu-open', opening);
        nestedTrigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
      }
      return; // handled
    }

    // 3) Any other link inside drawer: close drawer after click, let it navigate
    if (drawerIsOpen()) {
      const a = e.target.closest('a[href]:not([href="#"])');
      if (a && drawer.contains(a)) {
        closeDrawer();
      }
    }
  }, true); // capture so no other handlers can double-handle

  // ---------- Reviews slider ----------
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

      prev.addEventListener('click', (e) => { e.preventDefault(); i = (i - 1 + slides.length) % slides.length; show(i); });
      next.addEventListener('click', (e) => { e.preventDefault(); i = (i + 1) % slides.length; show(i); });
    }
  }
})();
