// PORTFOLIO CORE INTERACTIVE ENGINE

document.addEventListener('DOMContentLoaded', () => {
  // Check if mobile device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Initialize all interactive modules
  initCustomCursor();
  initMagneticButtons(isTouchDevice);
  initStudioControls();
  initPortfolioFilters();
  initProjectDrawer();
  initScrollAnimations();
});

/* ==========================================================================
   CUSTOM CURSOR (SMOOTH LERP & MODES)
   ========================================================================== */
function initCustomCursor() {
  const ring = document.querySelector('.cursor-ring');
  const dot = document.querySelector('.cursor-dot');
  if (!ring || !dot) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let firstMove = true;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (firstMove) {
      ring.style.opacity = '1';
      dot.style.opacity = '1';
      firstMove = false;
    }
    
    // Immediately position the inner dot
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  });

  // Lerp calculation for smooth follow ring cursor
  function updateRing() {
    const dx = mouseX - ringX;
    const dy = mouseY - ringY;
    ringX += dx * 0.15;
    ringY += dy * 0.15;
    
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Set hover classes based on hovered elements
  document.body.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    // Hover state for general links/buttons
    if (target.closest('a, button, select, input, .swatch-btn, .btn-toggle')) {
      ring.classList.add('hover');
    }

    // "VIEW" Text mode when hovering project cards
    if (target.closest('.editorial-card')) {
      ring.classList.add('text-mode');
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (!target) return;

    if (target.closest('a, button, select, input, .swatch-btn, .btn-toggle')) {
      ring.classList.remove('hover');
    }

    if (target.closest('.editorial-card')) {
      ring.classList.remove('text-mode');
    }
  });
}

/* ==========================================================================
   MAGNETIC BUTTON EFFECT
   ========================================================================== */
function initMagneticButtons(isTouch) {
  if (isTouch) return; // Disable physics-based pull on touch screens

  const wraps = document.querySelectorAll('.magnetic-btn-wrap');
  
  wraps.forEach((wrap) => {
    const btn = wrap.querySelector('.btn-luxury');
    if (!btn) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      
      // Calculate mouse offset coordinates from wrap center
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      // Translate button towards cursor (max pull distance 28px)
      const pullX = x * 0.4;
      const pullY = y * 0.4;
      
      btn.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
    });

    wrap.addEventListener('mouseleave', () => {
      // Snap back smoothly
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      btn.style.transform = 'translate3d(0, 0, 0)';
      
      // Reset transition after animation completion
      setTimeout(() => {
        btn.style.transition = '';
      }, 500);
    });
  });
}

/* ==========================================================================
   STUDIO CONTROLS DECK
   ========================================================================== */
function initStudioControls() {
  const html = document.documentElement;

  // Grid Lines Toggle
  const gridToggle = document.querySelectorAll('[data-grid]');
  gridToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      gridToggle.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-grid');
      html.style.setProperty('--grid-line-opacity', val === 'on' ? '1' : '0');
    });
  });

  // Custom Cursor Toggle
  const cursorToggle = document.querySelectorAll('[data-cursor-vibe]');
  cursorToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      cursorToggle.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-cursor-vibe');
      html.setAttribute('data-cursor', val);
    });
  });

  // UI Theme Modes (Obsidian vs Alabaster)
  const themeToggle = document.querySelectorAll('[data-theme-vibe]');
  themeToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      themeToggle.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-theme-vibe');
      html.setAttribute('data-theme', val);
    });
  });

  // Accent Color Picker
  const swatches = document.querySelectorAll('.swatch-btn');
  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      swatches.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-color');
      html.setAttribute('data-accent', val);
    });
  });
}

/* ==========================================================================
   PORTFOLIO FILTERING (ASYNC FEEL)
   ========================================================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.deck-filter-btn');
  const cards = document.querySelectorAll('.editorial-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px) scale(0.97)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 400); // sync with css transitions
        }
      });
    });
  });
}

/* ==========================================================================
   EDITORIAL PROJECT DRAWER SYSTEM
   ========================================================================== */
function initProjectDrawer() {
  const drawer = document.getElementById('details-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');
  const cards = document.querySelectorAll('.editorial-card');

  // Drawer Content DOM Fields
  const dTitle = document.getElementById('drawer-title');
  const dCategory = document.getElementById('drawer-category');
  const dMeta = document.getElementById('drawer-meta');
  const dImage = document.getElementById('drawer-image');
  const dHeading = document.getElementById('drawer-heading');
  const dTech = document.getElementById('drawer-tech-summary');
  const dDate = document.getElementById('drawer-date-summary');
  const dBody = document.getElementById('drawer-body');
  const dLink = document.getElementById('drawer-link');

  if (!drawer || !overlay || !closeBtn) return;

  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Stop drawer trigger if user clicked absolute links inside card (e.g. metadata links)
      if (e.target.closest('.card-action')) return;

      const title = card.getAttribute('data-title');
      const category = card.getAttribute('data-category-label') || card.querySelector('.card-category').textContent;
      const index = card.querySelector('.card-index').textContent;
      const img = card.querySelector('img').getAttribute('src');
      const tech = card.getAttribute('data-tags') || '';
      const date = card.getAttribute('data-date') || '2026';
      const desc = card.getAttribute('data-desc') || '';
      const link = card.getAttribute('data-link');

      // Populate Drawer DOM elements
      dTitle.textContent = `${index} Project Details`;
      dCategory.textContent = category;
      dImage.setAttribute('src', img);
      dHeading.textContent = title;
      dTech.textContent = tech;
      dDate.textContent = date;
      dBody.textContent = desc;

      if (link && link !== '#') {
        dLink.setAttribute('href', link);
        dLink.style.display = 'inline-flex';
      } else {
        dLink.style.display = 'none';
      }

      // Slide in drawer
      drawer.classList.add('open');
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden'; // Lock main scroll
    });
  });

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = ''; // Unlock main scroll
  };

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  
  // Close drawer on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   SCROLL REVEAL TRIGGERS
   ========================================================================== */
function initScrollAnimations() {
  const cards = document.querySelectorAll('.card-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target); // Reveal once
      }
    });
  }, {
    root: null,
    threshold: 0.15
  });

  cards.forEach(card => revealObserver.observe(card));
}
