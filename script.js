// navigation & reviews
(function() {
  // Basic elements
  const header  = document.querySelector('nav');
  const drawer  = document.querySelector('nav .nav-links');
  const toggle  = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.nav-overlay') || (() => {
    const div = document.createElement('div');
    div.className = 'nav-overlay';
    document.body.appendChild(div);
    return div;
  })();

  // Helpers
  const isMobile = () =>
    window.matchMedia('(max-width:1024px),(hover:none)').matches;

  const closeSubmenus = () => {
    document.querySelectorAll('nav .submenu-open, nav .open').forEach(li => {
      li.classList.remove('submenu-open', 'open');
      const trigger = li.querySelector(':scope > .shop-label, :scope > a');
      if (trigger) trigger.setAttribute('aria-expanded','false');
    });
  };

  const openDrawer = () => {
    drawer.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    drawer.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggle.setAttribute('aria-expanded', 'false');
    closeSubmenus();
  };

  // Toggle drawer
  if (toggle) {
    toggle.addEventListener('click', e => {
      e.stopPropagation();
      if (drawer.classList.contains('show')) closeDrawer();
      else openDrawer();
    });
  }

  // Close drawer when clicking outside (mobile)
  document.addEventListener('click', e => {
    if (!isMobile()) return;
    if (!drawer.classList.contains('show')) return;
    if (
      !drawer.contains(e.target) &&
      !toggle.contains(e.target) &&
      !(header && header.contains(e.target))
    ) {
      closeDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);

  // Top-level Shop toggle (mobile)
  const shopLi      = document.querySelector('nav li.dropdown, nav li.has-submenu');
  const shopTrigger = shopLi?.querySelector(':scope > .shop-label, :scope > a');
  if (shopLi && shopTrigger) {
    shopTrigger.setAttribute('role','button');
    shopTrigger.setAttribute('tabindex','0');
    shopTrigger.setAttribute('aria-expanded','false');
    shopTrigger.addEventListener('click', e => {
      if (!isMobile()) return; // desktop uses hover
      e.preventDefault();
      e.stopPropagation();
      const open = !shopLi.classList.contains('submenu-open');
      closeSubmenus();
      shopLi.classList.toggle('submenu-open', open);
      shopLi.classList.toggle('open', open);
      shopTrigger.setAttribute('aria-expanded', open ? 'true':'false');
      // If the drawer closed due to outside‑click earlier, reopen it
      if (open && !drawer.classList.contains('show')) openDrawer();
    });
    shopTrigger.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && isMobile()) {
        e.preventDefault(); shopTrigger.click();
      }
    });
  }

  // Reviews slider
  (function() {
    const slider = document.querySelector('.reviews-slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.review-slide'));
    const prev   = slider.querySelector('.prev');
    const next   = slider.querySelector('.next');
    let index = slides.findIndex(s => s.classList.contains('active'));
    if (index < 0) index = 0;

    const show = i => {
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
    };
    prev.addEventListener('click', () => {
      index = (index - 1 + slides.length) % slides.length;
      show(index);
    });
    next.addEventListener('click', () => {
      index = (index + 1) % slides.length;
      show(index);
    });
  })();
})();
