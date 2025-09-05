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
