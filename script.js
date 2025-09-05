// === Mobile hamburger toggle (kept as-is if you already have similar) ===
const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('show');
    menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('show') ? 'true' : 'false');
  });
}

// === Shop dropdown: open/close on click without closing the whole menu ===
(function () {
  const dropdownTriggers = document.querySelectorAll('nav .dropdown > a');

  dropdownTriggers.forEach(a => {
    a.addEventListener('click', (e) => {
      // Prevent page jump / closing the overlay
      e.preventDefault();
      e.stopPropagation();

      const li = a.parentElement; // the .dropdown <li>
      const isOpen = li.classList.toggle('open');

      // Close any other open dropdowns
      document.querySelectorAll('nav .dropdown.open').forEach(other => {
        if (other !== li) other.classList.remove('open');
      });
    });
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    document.querySelectorAll('nav .dropdown.open').forEach(li => {
      if (!li.contains(e.target)) li.classList.remove('open');
    });
  });

  // When a real link inside dropdown is clicked, let it navigate and
  // (optionally) close the mobile menu if it's open.
  document.querySelectorAll('nav .dropdown .dropdown-content a[href]').forEach(link => {
    link.addEventListener('click', () => {
      // Close the dropdown state
      const li = link.closest('.dropdown');
      if (li) li.classList.remove('open');

      // Close the mobile menu overlay if visible
      if (navLinks && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // IMPORTANT: Don’t auto-close the mobile menu when clicking the Shop trigger
  // If you have a "close on any link click" handler elsewhere, make sure it ignores:
  //   link.closest('.dropdown')
  // so the Shop button doesn’t immediately close the menu.
})();
