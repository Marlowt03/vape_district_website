// === Hamburger ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// === Shop dropdown (works with <li class="has-submenu"><span>… and with .dropdown > a) ===
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // find any "Shop" top-level item, regardless of markup
  const shops = Array.from(nav.querySelectorAll('li.has-submenu, li.dropdown'))
    .filter(li => {
      const t = li.querySelector(':scope > a, :scope > span, :scope > button');
      return t && (t.textContent || '').trim().toLowerCase() === 'shop';
    });

  if (!shops.length) return;

  const closeAll = () => {
    shops.forEach(li => {
      li.classList.remove('open', 'submenu-open');
      const t = li.querySelector(':scope > a, :scope > span, :scope > button');
      t && t.setAttribute('aria-expanded', 'false');
    });
  };

  shops.forEach(li => {
    const trigger = li.querySelector(':scope > a, :scope > span, :scope > button');
    const panel = li.querySelector(':scope > .dropdown-content, :scope > .submenu');
    if (!trigger || !panel) return;

    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');

    const setOpen = (open) => {
      if (li.classList.contains('dropdown')) li.classList.toggle('open', open);
      if (li.classList.contains('has-submenu')) li.classList.toggle('submenu-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = li.classList.contains('open') || li.classList.contains('submenu-open');
      closeAll();
      setOpen(!isOpen);
    };

    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!li.contains(e.target)) setOpen(false);
    });

    // Close after selecting an item; also close the drawer on mobile
    panel.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        setOpen(false);
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          menuToggle?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  // On touch, ensure 420/Vapes act like normal links (no toggles)
  document.querySelectorAll('nav .submenu .has-sub').forEach(a => {
    a.addEventListener('click', (e) => {
      if (matchMedia('(hover: none)').matches) {
        const href = a.getAttribute('href') || '';
        if (href.trim() === '#') e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
})();
