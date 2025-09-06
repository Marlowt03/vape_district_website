// Updated navigation script with robust mobile drawer and submenu handling
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Drawer element (the collapsible nav-links container)
  const drawer = nav.querySelector('.nav-links');
  // Hamburger toggle button
  let toggle = nav.querySelector('.menu-toggle');

  // Ensure the toggle is a button and exists
  if (toggle) {
    toggle.setAttribute('type', 'button');
    toggle.setAttribute('aria-expanded', 'false');
    if (toggle.hasAttribute('href')) toggle.removeAttribute('href');
    toggle.setAttribute('role', 'button');
  } else {
    // If no toggle exists, create one for reliability
    toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = '☰';
    nav.prepend(toggle);
  }

  // Prevent default behaviour for any "#" links to avoid jumping
  nav.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });

  // Create or retrieve the overlay used when the drawer is open
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  // Media query to determine mobile/tablet behaviour
  const mq = matchMedia('(max-width:1024px),(hover: none)');
  const isMobile = () => mq.matches;

  // Open the drawer
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }
  // Close the drawer
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded', 'false');
    // Close any open submenus when closing drawer
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(li => {
      li.classList.remove('open','submenu-open');
    });
    nav.querySelectorAll('a[aria-expanded="true"], .shop-label[aria-expanded="true"]').forEach(t => {
      t.setAttribute('aria-expanded','false');
    });
  }

  // Toggle drawer on hamburger click
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (drawer?.classList.contains('show')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Clicking on overlay closes drawer
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Prevent click inside drawer from bubbling to document and closing it
  drawer?.addEventListener('click', e => e.stopPropagation(), true);
  drawer?.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

  // Click outside drawer closes it (mobile only)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer?.classList.contains('show')) return;
    const insideDrawer = drawer.contains(e.target);
    const onToggle = !!(toggle && toggle.contains(e.target));
    if (!insideDrawer && !onToggle) closeDrawer();
  }, false);

  // Close drawer if we cross breakpoint from mobile to desktop
  mq.addEventListener?.('change', () => {
    if (!isMobile()) closeDrawer();
  });

  // Attach handlers to each dropdown or submenu trigger for mobile behaviour
  nav.querySelectorAll('li.dropdown, li.has-submenu').forEach(li => {
    const trigger = li.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
    if (!trigger) return;
    trigger.setAttribute('role','button');
    trigger.setAttribute('tabindex','0');
    trigger.setAttribute('aria-expanded','false');

    const toggleSubmenu = (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      e.stopPropagation();
      // Ensure the drawer is open before toggling submenu
      if (!drawer?.classList.contains('show')) openDrawer();
      const opening = !(li.classList.contains('open') || li.classList.contains('submenu-open'));
      // Close any other open submenus
      nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
        if (other !== li) {
          other.classList.remove('open','submenu-open');
          const t = other.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
          t?.setAttribute('aria-expanded','false');
        }
      });
      li.classList.toggle('open', opening);
      li.classList.toggle('submenu-open', opening);
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    };

    trigger.addEventListener('click', toggleSubmenu);
    trigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSubmenu(e);
      }
    });
  });

  // Close drawer after clicking any real link (i.e. links with non-# href)
  drawer?.querySelectorAll('a[href]:not([href="#"])').forEach(a => {
    a.addEventListener('click', () => { if (isMobile()) closeDrawer(); });
  });

  // Reviews slider functionality
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
