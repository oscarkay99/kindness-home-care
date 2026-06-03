/* =============================================
   Kindness Home Care – Shared JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ── Header: transparent → solid on scroll ──
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu toggle ──
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.querySelector('i').className = open
        ? 'fa-solid fa-xmark text-lg'
        : 'fa-solid fa-bars text-lg';
    });

    // Close menu when a link inside it is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('i').className = 'fa-solid fa-bars text-lg';
      });
    });
  }

  // ── Newsletter form ──
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = document.getElementById('newsletter-success');
      if (success) {
        success.classList.remove('hidden');
        newsletterForm.querySelector('input[type="email"]').value = '';
      }
    });
  }

  // ── Apply page tabs ──
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach(b  => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
      });
    });

    // Support URL hash on load (e.g., apply.html#join-team)
    if (window.location.hash === '#join-team') {
      const joinBtn = document.querySelector('[data-tab="panel-join"]');
      if (joinBtn) joinBtn.click();
    }
  }

  // ── Generic form submission (request care & join team) ──
  document.querySelectorAll('[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formId   = form.dataset.form;
      const successEl = document.getElementById(`${formId}-success`);
      if (successEl) {
        form.classList.add('hidden');
        successEl.classList.add('visible');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // ── File upload area drag styles ──
  document.querySelectorAll('.file-upload-area').forEach(area => {
    const input = area.querySelector('input[type="file"]');

    ['dragenter', 'dragover'].forEach(ev => {
      area.addEventListener(ev, (e) => {
        e.preventDefault();
        area.style.borderColor = '#C4A410';
        area.style.background  = '#FDFCE8';
      });
    });

    ['dragleave', 'drop'].forEach(ev => {
      area.addEventListener(ev, () => {
        area.style.borderColor = '';
        area.style.background  = '';
      });
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      if (input && e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        const label = area.querySelector('.upload-filename');
        if (label) label.textContent = e.dataTransfer.files[0].name;
      }
    });

    if (input) {
      input.addEventListener('change', () => {
        const label = area.querySelector('.upload-filename');
        if (label && input.files.length) label.textContent = input.files[0].name;
      });
    }
  });

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-item').forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      document.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-content').style.maxHeight = '0';
        const icon = other.querySelector('.faq-icon');
        if (icon) icon.style.transform = '';
      });

      if (!isOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        const icon = trigger.querySelector('.faq-icon');
        if (icon) icon.style.transform = 'rotate(45deg)';
      }
    });
  });

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
