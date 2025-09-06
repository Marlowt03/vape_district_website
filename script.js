// ===== Vape District — Unified mobile drawer and submenu handling (final) =====
(function() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Elements
  const drawer = nav.querySelector('.nav-links') || document.querySelector('.nav-links');
  let toggle = nav.querySelector('.menu-toggle') || document.querySelector('.menu-toggle');

  // Ensure the hamburger toggle exists and behaves like a button
  if (toggle) {
    toggle.setAttribute('type', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggle.hasAttribute('href')) toggle.removeAttribute('href');
    toggle.setAttribute('role', 'button');
  } else {
    // Fallback: create a toggle if it doesn't exist in markup
    toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    nav.prepend(toggle);
  }

  // Prevent default on "#" links inside nav to stop jumping
  nav.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  // Ensure a single overlay exists
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  // Media query to detect mobile/tablet or touch-only environments
  const mq = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  // Drawer controls
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
    // Close all open submenus when drawer closes
    nav.querySelectorAll('li.open, li.submenu-open').forEach(li => {
      li.classList.remove('open', 'submenu-open');
    });
    nav.querySelectorAll('[aria-expanded="true"]').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  // Toggle the drawer when hamburger is clicked
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (drawer && drawer.classList.contains('show')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Overlay click closes drawer
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Stop clicks/touches inside drawer from bubbling up to document
  if (drawer) {
    drawer.addEventListener('click', e => e.stopPropagation(), true);
    drawer.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
  }

  // Click outside drawer (mobile only) closes it
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer || !drawer.classList.contains('show')) return;
    const insideDrawer = drawer.contains(e.target);
    const onToggle = toggle && toggle.contains(e.target);
    if (!insideDrawer && !onToggle) closeDrawer();
  });

  // On breakpoint change: close drawer when moving from mobile to desktop
  mq.addEventListener?.('change', () => {
    if (!isMobile()) closeDrawer();
  });

  /**
   * Handles click on nav triggers (dropdowns and nested submenus) on mobile.
   * - Only toggles if there is a nested panel (dropdown-content, submenu, or sub-dropdown).
   * - Otherwise treats the trigger as a normal link and closes the drawer.
   */
  function onTriggerClick(li, trigger, e) {
    if (!isMobile()) return;
    // Determine if this li has a nested panel
    const panel = li.querySelector(':scope > .dropdown-content, :scope > .submenu, :scope > .sub-dropdown');
    if (!panel) {
      // No nested content: close the drawer and allow normal navigation
      closeDrawer();
      return;
    }
    // There is nested content: toggle it
    e.preventDefault();
    e.stopPropagation();
    if (!drawer.classList.contains('show')) openDrawer();
    const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));
    // Close all other submenus
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.open, li.submenu.submenu-open').forEach(other => {
      if (other !== li) {
        other.classList.remove('open','submenu-open');
        const t = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
        if (t) t.setAttribute('aria-expanded','false');
      }
    });
    li.classList.toggle('open', opening);
    li.classList.toggle('submenu-open', opening);
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  }

  // Attach click handlers to all dropdown and submenu triggers on mobile
  nav.querySelectorAll('li.dropdown, li.has-submenu, li.submenu').forEach(li => {
    const trigger = li.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
    if (!trigger) return;
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function(e) {
      onTriggerClick(li, trigger, e);
    });
    // Handle Enter and Space keys for accessibility
    trigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTriggerClick(li, trigger, e);
      }
    });
  });

  // Close the drawer after clicking any real link (non-#) inside the drawer on mobile
  if (drawer) {
    drawer.querySelectorAll('a[href]:not([href="#"])').forEach(a => {
      a.addEventListener('click', () => {
        if (isMobile()) closeDrawer();
      });
    });
  }

  // Review slider functionality
  const slider = document.querySelector('.reviews-slider');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.review-slide'));
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    if (slides.length && prev && next) {
      let i = slides.findIndex(s => s.classList.contains('active'));
      if (i < 0) i = 0;
      const show = (n) => slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      show(i);
      prev.addEventListener('click', (e) => {
        e.preventDefault();
        i = (i - 1 + slides.length) % slides.length;
        show(i);
      });
      next.addEventListener('click', (e) => {
        e.preventDefault();
        i = (i + 1) % slides.length;
        show(i);
      });
    }
  }
})();
// --- FINAL one-tap mobile menu handler (append-only, capture-phase) ---
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const drawer  = nav.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');
  const toggle  = nav.querySelector('.menu-toggle');
  const mq      = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  const hasPanel = (li) => !!li?.querySelector(':scope > .dropdown-content, :scope > .submenu, :scope > .sub-dropdown');

  function ensureDrawerOpen() {
    if (!drawer) return;
    if (!drawer.classList.contains('show')) {
      drawer.classList.add('show');
      overlay?.classList.add('show');
      document.body.classList.add('no-scroll');
      toggle?.setAttribute('aria-expanded','true');
    }
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay?.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded','false');
  }

  nav.addEventListener('click', (e) => {
    if (!isMobile()) return;

    // 1) TOP-LEVEL trigger (Shop). Must be a direct child of li.dropdown / li.has-submenu
    const topTrigger = e.target.closest(
      'li.dropdown > a, li.dropdown > .shop-label, li.dropdown > button, li.dropdown > span,' +
      'li.has-submenu > a, li.has-submenu > .shop-label, li.has-submenu > button, li.has-submenu > span'
    );
    if (topTrigger) {
      const li = topTrigger.parentElement;
      // If this LI actually owns a panel, treat as toggler. Otherwise let it navigate as a normal link
      if (hasPanel(li)) {
        e.preventDefault();
        e.stopImmediatePropagation(); // prevent any other handlers from re-toggling
        ensureDrawerOpen();

        const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));

        // Close any other top-level open menus
        nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
          if (other !== li) {
            other.classList.remove('open','submenu-open');
            const ot = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
            ot?.setAttribute('aria-expanded', 'false');
          }
        });

        li.classList.toggle('open', opening);
        li.classList.toggle('submenu-open', opening);
        topTrigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
      } else {
        // No panel = a real link. Close the drawer and let the browser navigate on first tap.
        e.stopImmediatePropagation();
        closeDrawer();
        // do NOT call preventDefault(); navigation proceeds
      }
      return; // handled
    }

    // 2) NESTED items inside the Shop dropdown (e.g., Detox, Mystery Boxes, 420, Vapes)
    const nestedTrigger = e.target.closest(
      'li.submenu > a, li.submenu > .has-sub, li.submenu > button, li.submenu > span'
    );
    if (nestedTrigger) {
      const li = nestedTrigger.parentElement;
      const href = nestedTrigger.getAttribute?.('href');

      // If it's a real link (href and not '#'), we navigate immediately (no toggle, no double-tap)
      if (href && href !== '#') {
        e.stopImmediatePropagation();
        closeDrawer(); // tidy close, then allow default nav
        return;
      }

      // Otherwise, only toggle if there is actually a nested panel
      if (hasPanel(li)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        ensureDrawerOpen();

        const opening = !li.classList.contains('submenu-open');

        // Close only sibling nested submenus under the same parent
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
  }, true); // capture so we win before any other listeners
})();
