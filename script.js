/* =========================================================
   Vape District — Single, clean JS for Nav + Reviews
   Desktop behavior (hover) is untouched.
   Mobile uses a centered drawer; Shop toggles inline.
   ========================================================= */

(function () {
  const nav    = document.querySelector('nav');
  const drawer = nav?.querySelector('.nav-links');
  const toggle = nav?.querySelector('.menu-toggle');
  if (!nav || !drawer || !toggle) return;

  // ---------- Overlay ----------
  let overlay = document.querySelector('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,.45)',
      zIndex: '2000',
      display: 'none'
    });
    document.body.appendChild(overlay);
  }

  const isTouch = () => matchMedia('(hover: none), (pointer: coarse), (max-width:1024px)').matches;

  // ---------- Drawer open/close ----------
  function closeAllSubmenus() {
    drawer.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(li => {
      li.classList.remove('open', 'submenu-open');
      const panel = li.querySelector(':scope > .dropdown-content, :scope > .submenu');
      if (panel) panel.style.display = '';
      const t = li.querySelector(':scope > a, :scope > .shop-label, :scope > .shop-toggle, :scope > button, :scope > span');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  function openDrawer() {
    drawer.classList.add('show');
    drawer.style.zIndex = '2001';
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('show');
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
    closeAllSubmenus();
  }

  toggle.addEventListener('click', () => {
    drawer.classList.contains('show') ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // Keep taps inside the drawer from closing it
  drawer.addEventListener('click', (e) => { if (isTouch()) e.stopPropagation(); }, true);
  drawer.addEventListener('touchstart', (e) => { if (isTouch()) e.stopPropagation(); }, { passive: true, capture: true });

  // Close after clicking any real link
  drawer.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', () => {
      // let navigation happen; then tidy
      setTimeout(closeDrawer, 0);
    });
  });

  // ---------- Mobile Shop toggle (drawer only) ----------
  // Works with either <li class="dropdown"> or <li class="has-submenu">
  const shopLis = Array.from(nav.querySelectorAll('li.dropdown, li.has-submenu'));
  shopLis.forEach(li => {
    const trigger = li.querySelector(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > button, :scope > span');
    const panel   = li.querySelector(':scope > .dropdown-content, :scope > .submenu');
    if (!trigger || !panel) return;

    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');

    function openShop() {
      // close others first
      shopLis.forEach(other => {
        if (other !== li) {
          other.classList.remove('open', 'submenu-open');
          const p = other.querySelector(':scope > .dropdown-content, :scope > .submenu');
          if (p) p.style.display = '';
          const t = other.querySelector(':scope > a, :scope > .shop-label, :scope > .shop-toggle, :scope > button, :scope > span');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });

      li.classList.add('open', 'submenu-open');
      panel.style.display = 'block';
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeShop() {
      li.classList.remove('open', 'submenu-open');
      panel.style.display = '';
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleShop(e) {
      // Only intercept when the drawer is open (mobile)
      if (!drawer.classList.contains('show')) return;
      e.preventDefault();
      e.stopPropagation();

      const isOpen = li.classList.contains('open') || li.classList.contains('submenu-open');
      isOpen ? closeShop() : openShop();
    }

    trigger.addEventListener('click', toggleShop);
    trigger.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && drawer.classList.contains('show')) {
        e.preventDefault();
        toggleShop(e);
      }
    });
  });

  // If the viewport changes (rotate etc.), close the drawer cleanly on leaving mobile
  matchMedia('(max-width:1024px)').addEventListener?.('change', (mq) => {
    if (!mq.matches) closeDrawer();
  });
})();

/* =======================
   Reviews slider (Home)
   ======================= */
(function () {
  const root = document.querySelector('.reviews-slider');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.review-slide'));
  const prev   = root.querySelector('.prev');
  const next   = root.querySelector('.next');
  if (!slides.length || !prev || !next) return;

  let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));

  function show(i) {
    slides.forEach((s, n) => s.classList.toggle('active', n === i));
  }
  function go(delta) {
    index = (index + delta + slides.length) % slides.length;
    show(index);
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  // Optional keyboard navigation
  root.tabIndex = 0;
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
})();
/* Mobile: tapping "Shop" toggles the submenu inside the drawer */
(function () {
  const nav    = document.querySelector('nav');
  const drawer = nav?.querySelector('.nav-links');
  if (!nav || !drawer) return;

  const trigger = nav.querySelector('li.dropdown > a, li.has-submenu > .shop-label, li.has-submenu > a');
  const li      = trigger?.closest('li.dropdown, li.has-submenu');
  if (!trigger || !li) return;

  function inDrawer() { return drawer.classList.contains('show'); }

  trigger.addEventListener('click', (e) => {
    if (!inDrawer()) return;          // desktop stays hover-only
    e.preventDefault();
    e.stopPropagation();

    const open = li.classList.toggle('open') || li.classList.toggle('submenu-open');
    if (open) {
      // close any siblings
      nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open').forEach(other => {
        if (other !== li) other.classList.remove('open', 'submenu-open');
      });
    }
  });
})();
