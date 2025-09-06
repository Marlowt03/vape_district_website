/* ============================
   Vape District — script.js
   ============================ */
(() => {
  // ---------- helpers ----------
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const nav    = qs('nav');
  const drawer = qs('nav .nav-links');
  const toggle = qs('.menu-toggle');

  if (!nav || !drawer) return;

  // ---------- overlay (created once; inline styles prevent CSS conflicts) ----------
  let overlay = qs('.nav-overlay');
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

  // ---------- drawer open/close ----------
  function closeAllSubmenus() {
    qsa('li.dropdown.open, li.has-submenu.submenu-open', nav).forEach(li => {
      li.classList.remove('open', 'submenu-open');
      const panel = qs(':scope > .dropdown-content, :scope > .submenu', li);
      if (panel) panel.style.display = ''; // back to CSS default
      const t = qs(':scope > a, :scope > .shop-label, :scope > button, :scope > span', li);
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  function openDrawer() {
    drawer.classList.add('show');
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
    toggle?.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('show');
    overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    toggle?.setAttribute('aria-expanded', 'false');
    closeAllSubmenus();
  }

  // hamburger
  toggle?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    drawer.classList.contains('show') ? closeDrawer() : openDrawer();
  });

  // tap outside = close
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // keep clicks inside drawer from bubbling to overlay
  drawer.addEventListener('click', e => e.stopPropagation(), true);
  drawer.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

  // close drawer after clicking any REAL link (not the Shop trigger)
  qsa('.nav-links a[href]', nav).forEach(a => {
    a.addEventListener('click', () => {
      const href = (a.getAttribute('href') || '').trim();
      const isTrigger =
        a.closest('li.dropdown, li.has-submenu') &&
        (href === '' || href === '#');
      if (!isTrigger) closeDrawer();
    });
  });

  // ---------- MOBILE "Shop" toggle (desktop still uses pure CSS hover) ----------
  const shopLis = qsa('li.dropdown, li.has-submenu', nav).filter(li => {
    const t = qs(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > span, :scope > button', li);
    return t && (t.textContent || '').trim().toLowerCase() === 'shop';
  });

  shopLis.forEach(li => {
    const trigger = qs(':scope > .shop-label, :scope > .shop-toggle, :scope > a, :scope > span, :scope > button', li);
    const panel   = qs(':scope > .dropdown-content, :scope > .submenu', li);
    if (!trigger || !panel) return;

    // accessibility
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-expanded', 'false');

    const inDrawer = () => drawer.classList.contains('show'); // treat “drawer open” as mobile

    function openShop() {
      // close other open dropdowns
      shopLis.forEach(other => {
        if (other !== li) {
          other.classList.remove('open', 'submenu-open');
          const p = qs(':scope > .dropdown-content, :scope > .submenu', other);
          if (p) p.style.display = '';
          const ot = qs(':scope > a, :scope > .shop-label, :scope > button, :scope > span', other);
          if (ot) ot.setAttribute('aria-expanded', 'false');
        }
      });

      li.classList.add('open', 'submenu-open');
      panel.style.display = 'block';                 // defeat any CSS display:none on mobile
      trigger.setAttribute('aria-expanded', 'true');
      try { panel.scrollIntoView({ block: 'nearest' }); } catch {}
    }

    function closeShop() {
      li.classList.remove('open', 'submenu-open');
      panel.style.display = '';
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', e => {
      // Only intercept when drawer is open (mobile). Desktop = hover only.
      if (!inDrawer()) return;
      e.preventDefault();
      e.stopPropagation();

      const isOpen = li.classList.contains('open') || li.classList.contains('submenu-open');
      isOpen ? closeShop() : openShop();
    });

    // keyboard inside drawer
    trigger.addEventListener('keydown', e => {
      if (!inDrawer()) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger.click(); }
    });
  });

  // ---------- Reviews slider ----------
  const slider = qs('.reviews-slider');
  if (slider) {
    const slides = qsa('.review-slide', slider);
    const prev   = qs('.prev', slider);
    const next   = qs('.next', slider);
    if (slides.length && prev && next) {
      let i = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
      const show = n => slides.forEach((s, k) => s.classList.toggle('active', k === n));
      prev.addEventListener('click', e => { e.preventDefault(); i = (i - 1 + slides.length) % slides.length; show(i); });
      next.addEventListener('click', e => { e.preventDefault(); i = (i + 1) % slides.length; show(i); });

      // simple swipe on touch
      let sx = null;
      slider.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend',   e => {
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) (dx > 0 ? prev : next).click();
        sx = null;
      });
    }
  }
})();
