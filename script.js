// === Mobile hamburger ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const now = navLinks.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', now ? 'true' : 'false');
  });
}

// === Only the TOP-LEVEL "Shop" toggles a dropdown ===
(function () {
  const shopTrigger = document.querySelector('nav .dropdown > .shop-toggle');
  if (!shopTrigger) return;

  shopTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();                // don’t let other handlers close it
    const li = shopTrigger.parentElement;
    const nowOpen = li.classList.toggle('open');
    shopTrigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');

    // close other open dropdowns if you ever add more
    document.querySelectorAll('nav .dropdown.open').forEach(other => {
      if (other !== li) other.classList.remove('open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const li = shopTrigger.parentElement;
    if (li.classList.contains('open') && !li.contains(e.target)) {
      li.classList.remove('open');
      shopTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close everything after clicking a REAL link in the dropdown
  document.querySelectorAll('nav .dropdown .dropdown-content a[href]').forEach(link => {
    link.addEventListener('click', () => {
      // close dropdown
      const li = link.closest('.dropdown');
      if (li) li.classList.remove('open');
      shopTrigger.setAttribute('aria-expanded', 'false');
      // close mobile menu if it’s open
      if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        menuToggle?.setAttribute('aria-expanded','false');
      }
    });
  });
})();
/* === UNIFY SHOP DROPDOWN (works with both nav variants) === */
(function () {
  // 1) Find the top-level "Shop" item regardless of markup style
  const shopItems = Array.from(
    document.querySelectorAll('nav li.dropdown, nav li.has-submenu')
  ).filter(li => {
    const trigger = li.querySelector(':scope > a, :scope > span, :scope > button');
    if (!trigger) return false;
    const label = (trigger.textContent || '').trim().toLowerCase();
    return label === 'shop';
  });

  if (!shopItems.length) return;

  // If your hamburger uses these, we’ll close the panel safely when needed.
  const navLinks = document.querySelector('.nav-links');
  const menuToggle = document.querySelector('.menu-toggle');

  shopItems.forEach(li => {
    // Pattern A: <li class="dropdown"><a>Shop</a><div class="dropdown-content">…</div></li>
    const triggerA = li.matches('.dropdown')
      ? li.querySelector(':scope > a, :scope > span, :scope > button')
      : null;
    const panelA = li.matches('.dropdown')
      ? li.querySelector(':scope > .dropdown-content')
      : null;

    // Pattern B: <li class="has-submenu"><span class="shop-label">Shop</span><ul class="submenu">…</ul></li>
    const triggerB = li.matches('.has-submenu')
      ? li.querySelector(':scope > .shop-label, :scope > a, :scope > span, :scope > button')
      : null;
    const panelB = li.matches('.has-submenu')
      ? li.querySelector(':scope > .submenu')
      : null;

    const trigger = triggerA || triggerB;
    const panel   = panelA || panelB;

    if (!trigger || !panel) return;

    // Make it accessible
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-expanded', 'false');

    // Helper: open/close for each pattern
    function setOpen(open) {
      if (li.classList.contains('dropdown')) {
        li.classList.toggle('open', open);
      } else if (li.classList.contains('has-submenu')) {
        li.classList.toggle('submenu-open', open);
      }
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function isOpen() {
      return li.classList.contains('dropdown')
        ? li.classList.contains('open')
        : li.classList.contains('submenu-open');
    }

    // Click / keyboard to toggle
    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation(); // don’t let global click handlers immediately close it
      const next = !isOpen();
      // Close any other open "Shop" instances (if multiple headers exist)
      shopItems.forEach(other => {
        if (other !== li) {
          other.classList.remove('open', 'submenu-open');
          const t = other.querySelector(':scope > a, :scope > span, :scope > button');
          t && t.setAttribute('aria-expanded', 'false');
        }
      });
      setOpen(next);
    };
    trigger.addEventListener('click', toggle);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (isOpen() && !li.contains(e.target)) setOpen(false);
    });

    // Close dropdown + (optionally) mobile menu after clicking a REAL link inside the panel
    panel.querySelectorAll('a[href]').forEach(link => {
      link.addEventListener('click', () => {
        setOpen(false);
        // If your hamburger menu is open (ul.nav-links has .show), close it
        if (navLinks && navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  // 2) Ensure 420/Vapes behave like normal links on touch devices (no nested dropdowns)
  //    (We’ll neutralize any accidental click toggles on those labels.)
  document.querySelectorAll('nav .submenu .has-sub').forEach(a => {
    a.addEventListener('click', (e) => {
      // If this is a real link to a page, let it navigate. If it’s "#" do nothing special.
      const href = a.getAttribute('href') || '';
      // On touch (no hover), do NOT behave like a submenu trigger.
      if (matchMedia('(hover: none)').matches) {
        // If someone left `href="#"`, just prevent jump and do nothing else.
        if (href.replace(/\s/g,'') === '#') {
          e.preventDefault();
        }
        // Otherwise, it’s a real link—allow navigation (no toggle).
      }
      // Stop any bubbling that might toggle parents
      e.stopPropagation();
    }, true);
  });
})();
