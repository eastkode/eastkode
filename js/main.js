/**
 * EastKode Landing Page — main.js
 *
 * PLACEHOLDERS TO UPDATE BEFORE GO-LIVE:
 * 1. COUNTRYCODE + PHONENUMBER — Replace with real WhatsApp number (e.g. '91' + '9876543210')
 * 2. contactFormEndpoint — Replace with Formspree URL or backend endpoint
 * 3. analyticsId — Add GA4 / Plausible tracking ID when ready
 * 4. Social profile hrefs in index.html footer — replace placeholder "#" links
 * 5. Privacy Policy / Terms hrefs — replace when pages exist
 */

const COUNTRYCODE = '[COUNTRYCODE]';
const PHONENUMBER = '[PHONENUMBER]';

const CONFIG = {
  whatsappNumber: `${COUNTRYCODE}${PHONENUMBER}`,
  whatsappMessage: "Hi EastKode, I'd like to know more about automating my business",
  contactFormEndpoint: '[FORM_ENDPOINT]',
  analyticsId: '[ANALYTICS_ID]',
  siteUrl: 'https://eastkode.in',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildWhatsAppUrl() {
  const text = encodeURIComponent(CONFIG.whatsappMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function initWhatsAppLinks() {
  const url = buildWhatsAppUrl();
  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    el.href = url;
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  const inner = document.getElementById('mobile-nav-inner');
  if (!toggle || !nav || !inner) return;

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.style.maxHeight = '0';
  }

  function openNav() {
    nav.classList.add('is-open');
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    nav.style.maxHeight = inner.scrollHeight + 'px';
  }

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeNav();
      nav.style.maxHeight = '';
    }
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });
    });
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      items.forEach((other) => {
        const otherQ = other.querySelector('.faq-question');
        const otherA = other.querySelector('.faq-answer');
        if (otherQ && otherA) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.classList.remove('is-open');
          otherA.style.maxHeight = '0';
        }
      });

      if (!isOpen) {
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

function parseCounterValue(value) {
  if (value.includes('-')) {
    const [min, max] = value.split('-').map(Number);
    return { type: 'range', min, max };
  }
  if (value.includes('/')) {
    return { type: 'static', display: value };
  }
  return { type: 'number', target: Number(value) };
}

function animateCounter(el, duration = 1500) {
  const raw = el.dataset.counter;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const parsed = parseCounterValue(raw);

  if (el.dataset.static === 'true' || parsed.type === 'static') {
    el.textContent = prefix + raw + suffix;
    return;
  }

  if (parsed.type === 'range') {
    const start = performance.now();
    const { min: rangeMin, max: rangeMax } = parsed;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentMin = Math.round(rangeMin * eased);
      const currentMax = Math.round(rangeMax * eased);
      el.textContent = `${currentMin}-${currentMax}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    return;
  }

  const target = parsed.target;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initMetricsCounters() {
  const metricsSection = document.getElementById('metrics');
  if (!metricsSection) return;

  const counters = metricsSection.querySelectorAll('[data-counter]');
  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach((el) => animateCounter(el));
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(metricsSection);
}

function initScrollReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const grids = document.querySelectorAll('[data-reveal-grid]');
  grids.forEach((grid) => {
    const cards = grid.querySelectorAll('.reveal');
    cards.forEach((card, index) => {
      card.style.setProperty('--reveal-delay', `${index * 80}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((el) => observer.observe(el));
}

function initWhatsAppFloat() {
  const tooltip = document.getElementById('whatsapp-tooltip');
  if (!tooltip) return;

  const isMobile = window.innerWidth < 640;
  if (isMobile || prefersReducedMotion) return;

  let dismissed = false;

  function dismissTooltip() {
    if (dismissed) return;
    dismissed = true;
    tooltip.classList.remove('is-visible');
  }

  const showTimer = setTimeout(() => {
    if (!dismissed) tooltip.classList.add('is-visible');
  }, 2000);

  const hideTimer = setTimeout(dismissTooltip, 7000);

  document.getElementById('whatsapp-float')?.addEventListener('click', () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    dismissTooltip();
  });

  window.addEventListener('scroll', () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    dismissTooltip();
  }, { once: true, passive: true });
}

function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  if (CONFIG.contactFormEndpoint && CONFIG.contactFormEndpoint !== '[FORM_ENDPOINT]') {
    form.action = CONFIG.contactFormEndpoint;
    form.method = 'POST';
    form.removeAttribute('enctype');
  }
}

function initAnalytics() {
  if (!CONFIG.analyticsId || CONFIG.analyticsId === '[ANALYTICS_ID]') return;
  // PLACEHOLDER: Add GA4 or Plausible snippet here when analyticsId is set
}

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initHeaderScroll();
  initMobileNav();
  initSmoothScroll();
  initFaqAccordion();
  initMetricsCounters();
  initScrollReveal();
  initWhatsAppFloat();
  initFooterYear();
  initContactForm();
  initAnalytics();
});
