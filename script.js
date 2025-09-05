// ==============================================
// Vape District: Unified Navigation & Mobile Menu
// This script provides consistent behaviour for the
// navigation menu across all pages. It supports
// both the standard "dropdown" markup used on most
// pages and the alternative "has-submenu" markup
// used on the Contact page. It also adds a
// semi‑transparent overlay behind the mobile menu
// and dropdowns so that tapping outside closes
// everything gracefully.

// Create a backdrop overlay once (if it doesn’t
// already exist). The overlay is used for closing
// the mobile drawer and dropdown when clicking
// outside of them.
let overlay = document.getElementById('navOverlay');
if (!overlay) {
  overlay = document.createElement('div');
  overlay.id = 'navOverlay';
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);
}

// Get references to the hamburger toggle and the
// menu UL for later use. When the hamburger is
// clicked, we toggle a `.show` class on the UL and
// also add/remove `.no-scroll` on the body to
// prevent scrolling while the menu is open.
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

function openMenu() {
  if (!navLinks) return;
  navLinks.classList.add('show');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  if (!navLinks) return;
  navLinks.classList.remove('show');
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
}

// Attach hamburger handler
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('show');
    isOpen ? closeMenu() : openMenu();
  });
}

// Close menu via overlay click
overlay.addEventListener('click', closeMenu);

// Close menu when clicking outside of nav items on
// mobile. This ensures a tap on the page background
// will dismiss the drawer.
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

// Close menu on Esc key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ==========================
// Shop dropdown: support for both nav patterns
// ==========================
(function () {
  // Find the two possible structures:
  // Pattern A: <li class="dropdown"><a>Shop</a><div class="dropdown-content">…</div>
  // Pattern B: <li class="has-submenu"><span class="shop-label">Shop</span><ul class="submenu">…</ul>
  const ddLi   = document.querySelector('nav li.dropdown');
  const ddTrig = ddLi ? ddLi.querySelector(':scope > .shop-toggle, :scope > a, :scope > button, :scope > span') : null;
  const ddPane = ddLi ? ddLi.querySelector(':scope > .dropdown-content') : null;

  const hsLi   = document.querySelector('nav li.has-submenu');
  const hsTrig = hsLi ? hsLi.querySelector(':scope > .shop-label, :scope > a, :scope > button, :scope > span') : null;
  const hsPane = hsLi ? hsLi.querySelector(':scope > .submenu') : null;

  // If neither pattern is found, exit quietly
  if (!ddTrig && !hsTrig) return;

  // Determine if a dropdown is open
  function isOpen() {
    return (ddLi && ddLi.classList.contains('open')) ||
           (hsLi && hsLi.classList.contains('submenu-open')) ||
           (ddLi && ddLi.getAttribute('data-open') === 'true') ||
           (hsLi && hsLi.getAttribute('data-open') === 'true');
  }

  // Toggle open state; update both class and data-* so
  // either CSS convention works
  function setOpen(open) {
    if (ddLi) {
      ddLi.classList.toggle('open', open);
      ddLi.setAttribute('data-open', String(open));
    }
    if (hsLi) {
      hsLi.classList.toggle('submenu-open', open);
      hsLi.setAttribute('data-open', String(open));
    }
    if (ddTrig) ddTrig.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (hsTrig) hsTrig.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  // Make triggers accessible and attach event handlers
  [ddTrig, hsTrig].filter(Boolean).forEach(trigger => {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');

    const doToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
      // Ensure overlay is visible when menu is open on mobile
      if (navLinks && navLinks.classList.contains('show')) {
        overlay.classList.add('show');
      }
    };

    trigger.addEventListener('click', doToggle);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') doToggle(e);
    });
  });

  // Close dropdown when clicking outside the dropdown area
  document.addEventListener('click', (e) => {
    const clickedInside =
      (ddLi && ddLi.contains(e.target)) ||
      (hsLi && hsLi.contains(e.target));
    if (!clickedInside) setOpen(false);
  }, true);

  // Close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  // Close dropdown and menu when a real link inside the panel is clicked
  [ddPane, hsPane].filter(Boolean).forEach(panel => {
    panel.querySelectorAll('a[href]').forEach(anchor => {
      anchor.addEventListener('click', () => {
        setOpen(false);
        if (navLinks && navLinks.classList.contains('show')) {
          closeMenu();
        }
      });
    });
  });

  // On touch devices, ensure second-level items
  // (e.g., "420" and "Vapes") behave like plain links
  (function(){
    const isTouch = matchMedia('(hover: none)').matches;
    if (!isTouch) return;
    document.querySelectorAll('nav .submenu .has-sub').forEach(el => {
      el.addEventListener('click', (e) => {
        // If href is empty or '#', prevent default; otherwise allow navigation
        const href = (el.getAttribute('href') || '').trim();
        if (!href || href === '#') e.preventDefault();
        e.stopPropagation();
      }, true);
    });
  })();
})();
