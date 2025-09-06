// ===== Vape District — stable nav + reviews (fixed mobile Shop) =====
(() => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const drawer = nav.querySelector('.nav-links');     // the <ul>
  const toggle = nav.querySelector('.menu-toggle');   // ☰

  // ---------- overlay (single instance) ----------
  let overlay = document.getElementById('navOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'navOverlay';
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  const mq = matchMedia('(max-width:1024px), (hover: none)');
  const isMobile = () => mq.matches;

  // ---------- drawer controls ----------
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

    // also close any open Shop menu + reset aria
    nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
       .forEach(li => li.classList.remove('open', 'submenu-open'));

    nav.querySelectorAll('li.dropdown > a[aria-expanded], li.has-submenu > .shop-label[aria-expanded]')
       .forEach(t => t.setAttribute('aria-expanded', 'false'));
  }

  // hamburger
  toggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    drawer?.classList.contains('show') ? closeDrawer() : openDrawer();
  });

  // overlay closes
  overlay.addEventListener('click', closeDrawer, { passive: true });
  overlay.addEventListener('touchstart', closeDrawer, { passive: true });

  // keep taps inside the drawer from bubbling to outside-closers
  drawer?.addEventListener('click',      e => e.stopPropagation(), true);
  drawer?.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });

  // outside click (mobile only)
  document.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (!drawer?.classList.contains('show')) return;
    // If the tap wasn't inside <nav> (drawer + toggle live there), close it
    if (!nav.contains(e.target)) closeDrawer();
  }, false);

  // ---------- “Shop” mobile toggle (no :scope; Safari-safe) ----------
  const shopLi =
    nav.querySelector('li.dropdown') || nav.querySelector('li.has-submenu');

  // Find a top-level clickable child of that <li>
  function findTopTrigger(li) {
    if (!li) return null;
    const kids = Array.from(li.children);
    return kids.find(el => el.matches('a, .shop-label, button, span')) || null;
  }
  const shopTrigger = findTopTrigger(shopLi);

  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role', 'button');
    shopTrigger.setAttribute('tabindex', '0');
    shopTrigger.setAttribute('aria-expanded', 'false');

    const mobileToggleShop = (e) => {
      if (!isMobile()) return;            // desktop stays hover-only via CSS
      e.preventDefault();
      e.stopPropagation();

      // Ensure the drawer is open first (prevents the “flash/close”)
      if (!drawer.classList.contains('show')) openDrawer();

      // Close any other open dropdowns
      nav.querySelectorAll('li.dropdown.open, li.has-submenu.submenu-open')
         .forEach(li => { if (li !== shopLi) li.classList.remove('open','submenu-open'); });

      const willOpen = !(shopLi.classList.contains('open') || shopLi.classList.contains('submenu-open'));

      shopLi.classList.toggle('open', willOpen);
      shopLi.classList.toggle('submenu-open', willOpen);
      shopTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    };

    shopTrigger.addEventListener('click', mobileToggleShop);
    shopTrigger.addEventListener('keydown', (e) => {
      if (!isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mobileToggleShop(e); }
    });
  }

  // close the drawer after tapping any REAL link inside it
  drawer?.querySelectorAll('a[href]:not([href="#"])').forEach(a => {
    a.addEventListener('click', () => { if (isMobile()) closeDrawer(); });
  });

  // tidy on orientation / breakpoint changes
  mq.addEventListener?.('change', () => { if (!isMobile()) closeDrawer(); });

  // ---------- Reviews slider (if present) ----------
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
