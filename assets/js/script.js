/* ===== Samagra Vikas Sansthan — Site script ===== */

(function () {
  'use strict';

  /* ---------- Language toggle (Hindi / English) ----------
     The actual attribute is already set by an inline <head> script before
     the body paints — this avoids the language flicker on every page load.
     Here we just wire up the toggle buttons and persist the choice. */
  const LANG_KEY = 'svs-lang';
  const initialLang = document.documentElement.getAttribute('data-lang') ||
                      localStorage.getItem(LANG_KEY) || 'hi';

  function setLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.body.setAttribute('data-lang', lang);
    localStorage.setItem(LANG_KEY, lang);
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
  }

  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
    if (btn.dataset.lang === initialLang) btn.classList.add('active');
  });
  document.documentElement.lang = initialLang === 'hi' ? 'hi' : 'en';

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    function closeMenu() {
      navLinks.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      navLinks.classList.add('open');
      document.body.classList.add('menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
    }
    menuToggle.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu(); else openMenu();
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    /* Backdrop tap closes the menu. The dim overlay is a ::before pseudo on
       body.menu-open — clicks on any non-menu area while the menu is open
       are treated as a request to close. */
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('menu-open')) return;
      if (e.target.closest('.nav-links')) return;
      if (e.target.closest('.menu-toggle')) return;
      closeMenu();
    });
    /* Esc also closes */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
    });
  }

  /* ---------- Hero slider ---------- */
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dotsWrap = document.querySelector('.slider-dots');
  if (slides.length > 0 && dotsWrap) {
    let current = 0;
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('button');

    function goTo(i) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    setInterval(() => goTo(current + 1), 5000);
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * ease).toLocaleString('en-IN') + (el.dataset.suffix || '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
  }

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  if (galleryItems.length > 0 && lightbox) {
    const lbImg = lightbox.querySelector('img');
    const images = Array.from(galleryItems).map(it => it.querySelector('img').src);
    let idx = 0;

    function open(i) {
      idx = i;
      lbImg.src = images[idx];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    function navigate(dir) {
      idx = (idx + dir + images.length) % images.length;
      lbImg.src = images[idx];
    }

    galleryItems.forEach((it, i) => it.addEventListener('click', () => open(i)));
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigate(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigate(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  /* ---------- Donate amount selector ---------- */
  const amountBtns = document.querySelectorAll('.amount-btn');
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const customField = document.getElementById('custom-amount');
      if (customField) customField.value = btn.dataset.amount;
    });
  });

  /* ---------- Form handling (static — just feedback) ---------- */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '✓ Submitted';
      setTimeout(() => {
        const msg = document.createElement('div');
        msg.className = 'donate-note';
        msg.style.marginTop = '1rem';
        const lang = document.body.getAttribute('data-lang');
        msg.textContent = lang === 'hi'
          ? 'धन्यवाद! आपका संदेश हम तक पहुँच गया है। हम जल्द ही आपसे संपर्क करेंगे।'
          : 'Thank you! Your message has been received. We will get back to you soon.';
        form.appendChild(msg);
        form.reset();
        btn.disabled = false;
        btn.textContent = originalText;
      }, 600);
    });
  });

  /* ---------- Active nav link ---------- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath) a.classList.add('active');
  });

  /* ---------- Year ---------- */
  const yr = document.getElementById('current-year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
