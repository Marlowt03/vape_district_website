// ===== Mobile menu + submenu behavior (desktop untouched) =====
(function () {
  const nav      = document.querySelector('nav');
  const menuBtn  = document.querySelector('.menu-toggle');
  const drawer   = document.querySelector('.nav-links');

  if (!nav || !menuBtn || !drawer) return;

  // Build a click-to-close overlay once
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  // Helpers
  const isMobile = () => window.matchMedia('(max-width: 1024px)').matches;

  function openMenu() {
    drawer.classList.add('show');
    overlay.classList.add('show');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMenu() {
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    // also close any open submenus
    drawer.querySelectorAll('.submenu-open, .open').forEach(li => li.classList.remove('submenu-open','open'));
    drawer.querySelectorAll('[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded','false'));
  }
  function toggleMenu() {
    if (drawer.classList.contains('show')) closeMenu(); else openMenu();
  }

  // Toggle drawer
  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Click outside to close (overlay)
  overlay.addEventListener('click', closeMenu);

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('show')) closeMenu();
  });

  // Make SHOP toggle its submenu on mobile
  // Works for either: <li class="has-submenu"><span class="shop-label">...</span><ul class="submenu">...</ul>
  // or               : <li class="dropdown"><a class="shop-toggle">...</a><div class="dropdown-content">...</div>
  function wireShopToggle(li) {
    const trigger = li.querySelector(':scope > .shop-label, :scope > a, :scope > span, :scope > button');
    const panel   = li.querySelector(':scope > .submenu, :scope > .dropdown-content');
    if (!trigger || !panel) return;

    // Accessible state
    trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('role','button');
    trigger.setAttribute('tabindex','0');

    // Toggle handler for mobile only
    const onToggle = (e) => {
      if (!isMobile()) return; // desktop keeps hover behavior
      e.preventDefault();
      e.stopPropagation();

      const opening = !li.classList.contains('submenu-open') && !li.classList.contains('open');

      // Close any other open submenus (just in case)
      drawer.querySelectorAll('.submenu-open, .open').forEach(other => {
        if (other !== li) other.classList.remove('submenu-open','open');
      });
      drawer.querySelectorAll('[aria-expanded="true"]').forEach(t => {
        if (!li.contains(t)) t.setAttribute('aria-expanded','false');
      });

      // Toggle this one
      li.classList.toggle('submenu-open');
      li.classList.toggle('open');
      trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');

      // Ensure the newly opened panel is fully visible inside the drawer
      if (opening) {
        // little delay so panel gets its height
        requestAnimationFrame(() => {
          const panelRect  = panel.getBoundingClientRect();
          const drawerRect = drawer.getBoundingClientRect();
          const extra = 12; // breathing room
          if (panelRect.bottom > drawerRect.bottom) {
            const delta = panelRect.bottom - drawerRect.bottom + extra;
            drawer.scrollTop += delta;
          } else if (panelRect.top < drawerRect.top) {
            const delta = drawerRect.top - panelRect.top + extra;
            drawer.scrollTop -= delta;
          }
        });
      }
    };

    trigger.addEventListener('click', onToggle);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') onToggle(e);
    });
  }

  // Find any “Shop” top-level item(s)
  nav.querySelectorAll('li.has-submenu, li.dropdown').forEach(li => {
    const label = li.querySelector(':scope > .shop-label, :scope > a, :scope > span, :scope > button');
    if (!label) return;
    const text = (label.textContent || '').trim().toLowerCase();
    if (text === 'shop') wireShopToggle(li);
  });

  // Clicking any real link inside the drawer should close the drawer
  drawer.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    // Let normal navigation happen, then close the UI immediately
    closeMenu();
  });

  // On resize: if switching to desktop, just make sure overlay/body states are clean
  window.addEventListener('resize', () => {
    if (!isMobile()) {
      overlay.classList.remove('show');
      document.body.classList.remove('no-scroll');
    }
  });
})();
// Close when clicking/tapping anywhere outside the drawer/menu button
const outsideClose = (e) => {
  if (!isMobile()) return;
  if (!drawer.classList.contains('show')) return;

  const clickedInsideDrawer = drawer.contains(e.target);
  const clickedMenuBtn      = menuBtn.contains(e.target);

  if (!clickedInsideDrawer && !clickedMenuBtn) {
    closeMenu();
  }
};
document.addEventListener('click', outsideClose, true);
document.addEventListener('touchstart', outsideClose, true);
