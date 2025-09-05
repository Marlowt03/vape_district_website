// === Mobile hamburger ===
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

// === Shop dropdown: open/close on tap (TOP-LEVEL ONLY) ===
(function () {
  // IMPORTANT: this ONLY matches the top-level "Shop" in the main nav
  const triggers = document.querySelectorAll('nav > .nav-links > .dropdown > a');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const li = trigger.parentElement; // the .dropdown <li>
      const nowOpen = li.classList.toggle('open');

      // close any other open dropdowns
      document.querySelectorAll('nav .dropdown.open').forEach(other => {
        if (other !== li) other.classList.remove('open');
      });

      trigger.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
    });
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    document.querySelectorAll('nav .dropdown.open').forEach(li => {
      if (!li.contains(e.target)) li.classList.remove('open');
    });
  });

  // Close the mobile menu after clicking a REAL link (but not the Shop trigger)
  if (navLinks) {
    navLinks.querySelectorAll('a[href]').forEach(a => {
      a.addEventListener('click', () => {
        const isTopLevelShop = a.matches('nav > .nav-links > .dropdown > a');
        if (isTopLevelShop) return; // let the toggle above handle it
        if (navLinks.classList.contains('show')) {
          navLinks.classList.remove('show');
          if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
})();
