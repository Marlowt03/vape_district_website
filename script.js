// ==========================
// Create (once) a backdrop overlay we can click to close
// ==========================
let overlay = document.getElementById('navOverlay');
if (!overlay) {
  overlay = document.createElement('div');
  overlay.id = 'navOverlay';
  overlay.className = 'nav-overlay'; // uses your existing CSS class
  document.body.appendChild(overlay);
}

// ==========================
// Mobile hamburger
// ==========================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

function openMenu() {
  if (!navLinks) return;
  navLinks.classList.add('show');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  if (!navLinks) return;
  navLinks.classList.remove('show');
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll');
  menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('show');
    isOpen ? closeMenu() : openMenu();
  });
}

// Close via overlay click
overlay.addEventListener('click', closeMenu);

// Close when clicking anywhere outside the popup and the toggle
document.addEventListener('click', (e) => {
  if (!navLinks) return;
  const isOpen = navLinks.classList.contains('show');
  if (!isOpen) return;

  const clickedInsideMenu   = navLinks.contains(e.target);
  const clickedToggleButton = menuToggle && menuToggle.contains(e.target);

  if (!clickedInsideMenu && !clickedToggleButton) {
    closeMenu();
  }
}, true);

// Close on Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ==========================
// Shop dropdown (supports BOTH nav variants)
// - Variant A: <li class="dropdown"><a>Shop</a><div class="dropdown-content">…</div></li>
// - Variant B: <li class="has-submenu"><span class="shop-label">Shop</span><ul class="submenu">…</ul></li>
// ==========================
(function () {
  // Try to find either variant
  const ddLi   = document.querySelector('nav li.dropdown');
  const ddTrig = ddLi ? ddLi.querySelector(':scope > .shop-toggle, :scope > a, :scope > button, :scope > span') : null;
  const ddPane = ddLi ? ddLi.querySelector(':scope > .dropdown-content') : null;

  const hsLi   = document.querySelector('nav li.has-submenu');
  const hsTrig = hsLi ? hsLi.querySelector(':scope > .shop-label, :scope > a, :scope > button, :scope > span') : null;
  const hsPane = hsLi ? hsLi.querySelector(':scope > .submenu') : null;

  // If neither exists, bail
  if (!ddTrig && !hsTrig) return;

  function isOpen() {
    return (ddLi && ddLi.classList.contains('open')) ||
           (hsLi && hsLi.classList.contains('submenu-open'));
  }
  function setOpen(open) {
    if (ddLi) ddLi.classList.toggle('open', open);
    if (hsLi) hsLi.classList.toggle('submenu-open', open);
    if (ddTrig) ddTrig.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (hsTrig) hsTrig.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // Prepare triggers
  [ddTrig, hsTrig].filter(Boolean).forEach(t => {
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-expanded', 'false');

    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
      // ensure overlay is visible when the drawer is open
      if (navLinks && navLinks.classList.contains('show')) {
        overlay.classList.add('show');
      }
    };

    t.addEventListener('click', toggle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  });

  // Clicking a real link inside closes dropdown and (if open) the drawer
  [ddPane, hsPane].filter(Boolean).forEach(panel => {
    panel.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        setOpen(false);
        if (navLinks && navLinks.classList.contains('show')) closeMenu();
      });
    });
  });

  // Clicking *outside* the dropdown closes it (and does not touch the drawer state)
  document.addEventListener('click', (e) => {
    const clickedInside =
      (ddLi && ddLi.contains(e.target)) ||
      (hsLi && hsLi.contains(e.target));
    if (!clickedInside) setOpen(false);
  }, true);
})();

// ==========================
// Make "420" and "Vapes" act as plain links on touch (no sub-dropdown)
// ==========================
(function(){
  const isTouch = matchMedia('(hover: none)').matches;
  if (!isTouch) return;
  document.querySelectorAll('nav .submenu .has-sub').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = (a.getAttribute('href') || '').trim();
      // allow real navigation; just stop bubbling so it doesn't toggle Shop
      if (href === '' || href === '#') e.preventDefault();
      e.stopPropagation();
    }, true);
  });
})();
