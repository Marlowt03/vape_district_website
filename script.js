// Mobile menu open/close
(function(){
  const toggle = document.querySelector('.menu-toggle');      // your existing hamburger
  if (!toggle) return;

  // Inject overlay/panel once (safe on every page)
  if (!document.getElementById('navOverlay')){
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay'; overlay.id = 'navOverlay';
    const panel = document.createElement('nav');
    panel.className = 'mobile-menu'; panel.id = 'mobileMenu';
    panel.innerHTML = `
      <div class="menu-head">
        <div class="menu-title">Menu</div>
        <button class="menu-close" aria-label="Close" title="Close">×</button>
      </div>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>

        <li>
          <a href="#" id="shopToggle" aria-expanded="false">Shop</a>
          <ul id="shopSub">
            <li><a href="420.html">420</a></li>
            <li><a href="vapes.html">Vapes</a></li>
            <li><a href="detox.html">Pass A Dr*g Test / Detox</a></li>
            <li><a href="mystery-boxes.html">Mystery Boxes</a></li>
          </ul>
        </li>

        <li><a href="contact.html">Contact</a></li>
      </ul>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
  }

  const overlay = document.getElementById('navOverlay');
  const panel   = document.getElementById('mobileMenu');
  const closeBtn = panel.querySelector('.menu-close');
  const shopToggle = panel.querySelector('#shopToggle');
  const shopSub = panel.querySelector('#shopSub');

  const open = () => {
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded','true');
  };
  const close = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded','false');
    shopSub.setAttribute('data-open','false');
    shopToggle.setAttribute('data-open','false');
    shopToggle.setAttribute('aria-expanded','false');
  };

  toggle.addEventListener('click', () => {
    if (document.body.classList.contains('menu-open')) close();
    else open();
  });
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  // tap-to-toggle “Shop”
  shopToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = shopSub.getAttribute('data-open') === 'true';
    shopSub.setAttribute('data-open', String(!isOpen));
    shopToggle.setAttribute('data-open', String(!isOpen));
    shopToggle.setAttribute('aria-expanded', String(!isOpen));
  });

  // close menu after navigating
  panel.querySelectorAll('a[href]').forEach(a=>{
    a.addEventListener('click', () => setTimeout(close, 0));
  });
})();
