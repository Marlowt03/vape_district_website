// ===== Vape District — Final mobile drawer + multi-submenu handling + reviews =====
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Elements
  const drawer = nav.querySelector('.nav-links') || document.querySelector('.nav-links');
  let   toggle = nav.querySelector('.menu-toggle') || document.querySelector('.menu-toggle');

  // Ensure a reliable hamburger button
  if (toggle) {
    toggle.setAttribute('type', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggle.hasAttribute('href')) toggle.removeAttribute('href'); // avoid anchor jumps
    toggle.setAttribute('role', 'button');
  } else {
    // Fallback: inject a toggle
    toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    nav.prepend(toggle);
  }

  // Kill “#” links inside nav (prevents page jumping)
  nav.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  // Single overlay
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  // Breakpoint
  const mq = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mq.matches;

  // Drawer controls
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    // Collapse any open submenus
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
      .forEach(li => li.classList.remove('open','submenu-open'));
    nav.querySelectorAll('[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }

  // Toggle drawer
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (drawer && drawer.classList.contains('show')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Overlay closes
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Keep clicks inside drawer from closing it
  if (drawer) {
    drawer.addEventListener('click', e => e.stopPropagation(), true);
    drawer.addEventListener('touchstart', e => e.stopPropagation(), { passive:true });
  }

  // Click outside to close (mobile only)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer || !drawer.classList.contains('show')) return;
    const insideDrawer = drawer.contains(e.target);
    const onToggle     = toggle && toggle.contains(e.target);
    if (!insideDrawer && !onToggle) closeDrawer();
  }, false);

  // Reset state when crossing breakpoint to desktop
  mq.addEventListener?.('change', () => {
    if (!isMobile()) closeDrawer();
  });

  // ---------- Mobile dropdowns inside drawer ----------
  const dropdownParents = nav.querySelectorAll('li.dropdown, li.has-submenu');

  function toggleOneDropdown(li, trigger) {
    if (!isMobile()) return; // desktop uses CSS hover
    if (!drawer || !drawer.classList.contains('show')) openDrawer();

    const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));

    // Close others
    dropdownParents.forEach(other => {
      if (other !== li) {
        other.classList.remove('open','submenu-open');
        const otherTrig = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
        if (otherTrig) otherTrig.setAttribute('aria-expanded', 'false');
      }
    });

    li.classList.toggle('open', opening);
    li.classList.toggle('submenu-open', opening);
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  }

  dropdownParents.forEach(li => {
    const trigger = li.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
    if (!trigger) return;

    // Semantics & a11y
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');

    // Click / tap
    const onClick = (e) => {
      if (!isMobile()) return;      // allow normal navigation on desktop
      e.preventDefault();           // don't navigate away on mobile
      e.stopPropagation();
      toggleOneDropdown(li, trigger);
    };
    trigger.addEventListener('click', onClick);
    trigger.addEventListener('touchend', onClick, { passive: false });

    // Keyboard on mobile
    trigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleOneDropdown(li, trigger);
      }
    });
  });

  // Close drawer after tapping any real link
  if (drawer) {
    drawer.querySelectorAll('a[href]:not([href="#"])').forEach(a => {
      a.addEventListener('click', () => { if (isMobile()) closeDrawer(); });
    });
  }

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
// --- Mobile submenu fail-safe (append at end of file) ---
(() => {
  const nav = document.querySelector('nav');
  const drawer = nav?.querySelector('.nav-links');
  if (!nav || !drawer) return;

  const mq = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  nav.addEventListener('click', (e) => {
    if (!isMobile()) return;

    // Find a trigger that is a *direct* child of its <li>
    const trigger = e.target.closest(
      'li.dropdown > a, li.has-submenu > a,' +
      'li.dropdown > .shop-label, li.has-submenu > .shop-label,' +
      'li.dropdown > button, li.has-submenu > button,' +
      'li.dropdown > span, li.has-submenu > span'
    );
    if (!trigger) return;

    const li = trigger.parentElement;
    if (!li || !(li.classList.contains('dropdown') || li.classList.contains('has-submenu'))) return;

    // We’re inside the drawer; don’t navigate away
    e.preventDefault();
    e.stopPropagation();

    // Close other open submenus
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
      if (other !== li) {
        other.classList.remove('open', 'submenu-open');
        const t = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
        t?.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle this one
    const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));
    li.classList.toggle('open', opening);
    li.classList.toggle('submenu-open', opening);
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  }, true);
})();
// --- One-tap mobile submenu hotfix (capture-phase; ignore plain links) ---
(() => {
  const nav = document.querySelector('nav');
  const drawer = nav?.querySelector('.nav-links');
  if (!nav || !drawer) return;

  const mq = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  // helper to open drawer if shut
  const openDrawer = () => {
    if (!drawer.classList.contains('show')) {
      drawer.classList.add('show');
      document.body.classList.add('no-scroll');
      document.querySelector('.nav-overlay')?.classList.add('show');
      nav.querySelector('.menu-toggle')?.setAttribute('aria-expanded','true');
    }
  };

  // run BEFORE other listeners so we can stop duplicates
  nav.addEventListener('click', (e) => {
    if (!isMobile()) return;

    // Find a *top-level trigger* (direct child of the LI)
    const trigger = e.target.closest(
      'li.dropdown > a, li.has-submenu > a,' +
      'li.dropdown > .shop-label, li.has-submenu > .shop-label,' +
      'li.dropdown > button, li.has-submenu > button,' +
      'li.dropdown > span, li.has-submenu > span'
    );
    if (!trigger) return;

    const li = trigger.parentElement;
    if (!li) return;

    // Only intercept if this LI actually HAS a submenu element
    const submenu = li.querySelector(':scope > .dropdown-content, :scope > .submenu');
    if (!submenu) return;              // plain links: let them navigate normally

    // From here: treat as dropdown, handle ONCE
    e.preventDefault();
    e.stopImmediatePropagation();      // stop any other handlers from re-toggling
    e.stopPropagation();

    openDrawer();

    // Close siblings
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
      if (other !== li) {
        other.classList.remove('open','submenu-open');
        const t = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
        t?.setAttribute('aria-expanded','false');
      }
    });

    // Toggle this one
    const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));
    li.classList.toggle('open', opening);
    li.classList.toggle('submenu-open', opening);
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
  }, true); // <-- capture-phase
})();
