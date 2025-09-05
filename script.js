// === 1) Mobile hamburger ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    menuToggle.setAttribute(
      'aria-expanded',
      navLinks.classList.contains('show') ? 'true' : 'false'
    );
  });
}

// === 2) Guard the "close on link click" so it IGNORES the Shop trigger ===
if (navLinks) {
  navLinks.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', (e) => {
      // If this is the Shop trigger (nav .dropdown > a), DON'T close the menu here
      const isShopTrigger =
        a.closest('.dropdown') &&
        a.parentElement.classList.contains('dropdown') &&
        a.nextElementSibling &&
        a.nextElementSibling.classList.contains('dropdown-content');

      if (isShopTrigger) {
        // Let the Shop toggle handler deal with it
        return;
      }

      // Real link: close the mobile menu after navigating
      if (navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

// === 3) Shop dropdown: open/close on tap, and close other open dropdowns ===
(function () {
  const triggers = document.querySelectorAll('nav .dropdown > a');

  triggers.forEach(trigger => {
    // ensure it doesn’t navigate or bubble
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const li = trigger.parentElement; // the .dropdown <li>
      const nowOpen = li.classList.toggle('open');

      // close any other dropdowns
      document.querySelectorAll('nav .dropdown.open').forEach(other => {
        if (other !== li) other.classList.remove('open');
      });

      // keep aria in sync (optional)
      trigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
    });
  });

  // Click outside to close any open dropdown
  document.addEventListener('click', (e) => {
    document.querySelectorAll('nav .dropdown.open').forEach(li => {
      if (!li.contains(e.target)) li.classList.remove('open');
    });
  });
})();
