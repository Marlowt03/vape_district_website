/* ===== Mobile/desktop nav behavior (surgical; works with your HTML) ===== */
(function () {
  const nav       = document.querySelector('nav');
  const toggleBtn = document.querySelector('.menu-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (!nav || !toggleBtn || !navLinks) return;

  // Create backdrop overlay for the drawer
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const mqMobile = window.matchMedia('(max-width: 768px)');

  function openNav(){
    navLinks.classList.add('show');
    overlay.classList.add('show');
    document.body.classList.add('no-scroll');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.textContent = '✕';
  }
  function closeNav(){
    navLinks.classList.remove('show');
    overlay.classList.remove('show');
    document.body.classList.remove('no-scroll');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.textContent = '☰';
    // collapse any open mobile dropdowns/submenus
    nav.querySelectorAll('.dropdown[data-open="true"], .submenu[data-open="true"]')
       .forEach(el => el.setAttribute('data-open', 'false'));
  }
  function toggleNav(){
    navLinks.classList.contains('show') ? closeNav() : openNav();
  }

  toggleBtn.addEventListener('click', toggleNav);
  overlay.addEventListener('click', closeNav);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeNav(); });

  // Close drawer when any real link is tapped
  navLinks.addEventListener('click', (e)=>{
    const link = e.target.closest('a[href]');
    if (!link) return;
    if (mqMobile.matches) closeNav();
  });

  // MOBILE: make “Shop” and nested headings toggle on tap
  function wireMobileDropdowns(){
    // Top-level dropdown: .dropdown > a
    nav.querySelectorAll('.dropdown > a').forEach(a=>{
      a.addEventListener('click', (e)=>{
        if (!mqMobile.matches) return; // desktop still uses hover
        e.preventDefault();
        const li = a.parentElement;
        const open = li.getAttribute('data-open') === 'true';
        li.setAttribute('data-open', String(!open));
      });
    });
    // 2nd level: .submenu > .has-sub
    nav.querySelectorAll('.submenu > .has-sub').forEach(a=>{
      a.addEventListener('click', (e)=>{
        if (!mqMobile.matches) return;
        e.preventDefault();
        const sub = a.closest('.submenu');
        const open = sub.getAttribute('data-open') === 'true';
        sub.setAttribute('data-open', String(!open));
      });
    });
  }
  wireMobileDropdowns();

  // If resizing from mobile back to desktop, make sure everything is reset
  mqMobile.addEventListener('change', closeNav);
})();
