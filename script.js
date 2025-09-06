/* ===============================================
   Vape District — NAV + REVIEWS (Final stable)
   - Works with both dropdown markups (li.dropdown or li.has-submenu)
   - Mobile drawer is centered, overlay closes on outside tap
   - Shop opens on tap (no flash-close), desktop stays hover
   - Reviews slider works
   - CSS cache-bust without editing each page
   =============================================== */

/* ---- 0) CSS cache-bust on every page ---- */
(() => {
  const VERSION = 'navfix4'; // bump when you change style.css again
  const run = () => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!/style\.css(\?|$)/i.test(href)) return;
      try {
        const u = new URL(href, location.href);
        u.searchParams.set('v', VERSION);
        link.href = u.pathname + '?' + u.searchParams.toString();
      } catch {}
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else { run(); }
})();

/* ---- 1) NAV ---- */
(() => {
  const nav    = document.querySelector('nav');
  if (!nav) return;

  const drawer = nav.querySelector('.nav-links');
  const toggle = nav.querySelector('.menu-toggle');

  // Single overlay for all pages
  let overlay = document.getElementById('navOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'navOverlay';
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const mq       = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mq.matches;

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
    // also close Shop panel
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
      .forEach(li => li.classList.remove('open','submenu-open'));
    nav.querySelectorAll(':scope > a[aria-expanded="true"], :scope > .shop-label[aria-expanded="true"]')
      .forEach(t => t.setAttribute('aria-expanded','false'));
  }

  // Hamburger
  toggle?.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    drawer?.classList.contains('show') ? closeDrawer() : openDrawer();
  });

  // Overlay closes
  overlay.addEventListener('click', closeDrawer);
  overlay.addEventListener('touchstart', closeDrawer, { passive:true });

  // Avoid outside-close when tapping inside the drawer
  drawer?.addEventListener('click',      e => e.stopPropagation(), true);
  drawer?.addEventListener('touchstart', e => e.stopPropagation(), { passive:true });

  // Click outside on mobile
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer?.classList.contains('show')) return;
    const insideNav = nav.contains(e.target);
    if (!insideNav) closeDrawer();
  }, false);

  // Mobile Shop toggle (desktop uses CSS hover)
  const shopLi = nav.querySelector('li.dropdown, li.has-submenu');
  const shopTrigger = shopLi?.querySelector(':scope > a, :scope > .shop-label, :scope > button, :scope > span');
  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role','button');
    shopTrigger.setAttribute('tabindex','0');
    shopTrigger.setAttribute('aria-expanded','false');

    const toggleShop = (e) => {
      if (!isMobile()) return;     // desktop hover-only
      e.preventDefault();
      e.stopPropagation();

      // make sure drawer is open first
      if (!drawer.classList.contains('show')) openDrawer();

      // close other dropdowns
      nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
        .forEach(li => { if (li !== shopLi) li.classList.remove('open','submenu-open'); });

      const open = !(shopLi.classList.contains('open') || shopLi.classList.contains('submenu-open'));
      shopLi.classList.toggle('open', open);
      shopLi.classList.toggle('submenu-open', open);
      shopTrigger.setAttribute('aria-expanded', open ? 'true':'false');
    };

    shopTrigger.addEventListener('click', toggleShop);
    shopTrigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleShop(e); }
    });
  }

  // Close drawer after clicking any real link
  drawer?.querySelectorAll('a[href]:not([href="#"])')
    .forEach(a => a.addEventListener('click', () => { if (isMobile()) closeDrawer(); }));

  // Tidy up on orientation change
  mq.addEventListener?.('change', () => { if (!isMobile()) closeDrawer(); });
})();

/* ---- 2) Reviews slider ---- */
(() => {
  const slider = document.querySelector('.reviews-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.review-slide'));
  const prev   = slider.querySelector('.prev');
  const next   = slider.querySelector('.next');
  if (!slides.length || !prev || !next) return;

  let i = slides.findIndex(s => s.classList.contains('active'));
  if (i < 0) i = 0;
  const show = (n) => slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
  show(i);

  prev.addEventListener('click', (e)=>{ e.preventDefault(); i=(i-1+slides.length)%slides.length; show(i); });
  next.addEventListener('click', (e)=>{ e.preventDefault(); i=(i+1)%slides.length; show(i); });
})();
