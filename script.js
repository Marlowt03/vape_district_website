// ==========================
// Mobile hamburger
// ==========================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('no-scroll', open);
  });
}

// ==========================
// Shop dropdown (supports BOTH nav variants)
// - Variant A (most pages):
//   <li class="dropdown">
//     <a href="#">Shop</a>
//     <div class="dropdown-content">…</div>
//   </li>
// - Variant B (contact page):
//   <li class="has-submenu">
//     <span class="shop-label">Shop</span>
//     <ul class="submenu">…</ul>
//   </li>
// ==========================
(function () {
  // Grab possible variants
  const ddLi   = document.querySelector('nav li.dropdown');
  const ddTrig = ddLi ? ddLi.querySelector(':scope > .shop-toggle, :scope > a, :scope > button, :scope > span') : null;
  const ddPane = ddLi ? ddLi.querySelector(':scope > .dropdown-content') : null;

  const hsLi   = document.querySelector('nav li.has-submenu');
  const hsTrig = hsLi ? hsLi.querySelector(':scope > .shop-label, :scope > a, :scope > button, :scope > span') : null;
  const hsPane = hsLi ? hsLi.querySelector(':scope > .submenu') : null;

  // nothing to do if neither exists
  if (!ddTrig && !hsTrig) return;

  // helpers
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
  function closeAll() { setOpen(false); }

  // Make triggers accessible
  [ddTrig, hsTrig].filter(Boolean).forEach(t => {
    t.setAttribute('role', 'button');
    t.setAttribute('tabindex', '0');
    t.setAttribute('aria-expanded', 'false');

    const doToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!isOpen());
    };

    t.addEventListener('click', doToggle);
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') doToggle(e);
    });
  });

  // Click outside closes (use capture to win against bubbling)
  document.addEventListener('click', (e) => {
    const inside =
      (ddLi && ddLi.contains(e.target)) ||
      (hsLi && hsLi.contains(e.target));
    if (!inside) closeAll();
  }, true);

  // Esc key closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Clicking a real link inside the panel closes dropdown + mobile menu
  [ddPane, hsPane].filter(Boolean).forEach(panel => {
    panel.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        closeAll();
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        }
      });
    });
  });

  // On touch devices, ensure "420" & "Vapes" act as plain links (no nested dropdown behavior)
  document.querySelectorAll('nav .submenu .has-sub').forEach(a => {
    a.addEventListener('click', (e) => {
      // allow navigation for real hrefs, but don't let the click toggle/propagate
      const href = (a.getAttribute('href') || '').trim();
      if (href === '' || href === '#') e.preventDefault();
      e.stopPropagation();
    }, true);
  });
})();
