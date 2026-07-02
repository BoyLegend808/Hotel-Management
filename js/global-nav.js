/**
 * Global Navigation JavaScript — Lumina Hospitality
 *
 * Two modes:
 *  1. INJECTION — injects a standardized nav into <div id="global-nav"></div>
 *     and footer into <div id="global-footer"></div> (used by most pages).
 *  2. ENHANCE — if a <nav class="global-nav"> already exists in the DOM
 *     (e.g. home page keeps its inline nav), only attaches behaviour.
 *
 * Handles: scroll-to-solid, mobile menu (with focus trap), dropdowns,
 * active-page highlighting, dark mode, newsletter + chat FAB.
 * No inline handlers required.
 */

(function () {
  'use strict';

  const HOME = '/pages/hotel/home-lumina/home-lumina.html';
  const ROOMS = '/pages/hotel/rooms-lumina/rooms-lumina.html';
  const OFFERS = '/pages/hotel/special-offers/special-offers.html';
  const DINING = '/pages/hotel/dining-lumina/dining-lumina.html';
  const SPA = '/pages/hotel/spa-wellness/spa-wellness.html';
  const GALLERY = '/pages/hotel/gallery-lumina/gallery-lumina.html';
  const LOCAL = '/pages/hotel/local-area/local-area.html';
  const EVENTS = '/pages/hotel/meetings-events/meetings-events.html';
  const REVIEWS = '/pages/hotel/reviews-lumina/reviews-lumina.html';
  const ABOUT = '/pages/hotel/about-lumina/about-lumina.html';
  const CONTACT = '/pages/hotel/contact-lumina/contact-lumina.html';
  const BOOK = '/pages/hotel/booking-your-stay/booking-your-stay.html';
  const PRIVACY = '/pages/hotel/privacy/privacy.html';
  const POLICIES = '/pages/hotel/policies/policies.html';

  /* ── Active page detection ── */
  function getActivePage() {
    const p = window.location.pathname;
    if (p.includes('home-lumina')) return 'home';
    if (p.includes('room-detail')) return 'rooms';
    if (p.includes('rooms-lumina')) return 'rooms';
    if (p.includes('special-offers')) return 'offers';
    if (p.includes('dining-lumina')) return 'dining';
    if (p.includes('spa-wellness')) return 'spa';
    if (p.includes('gallery-lumina')) return 'gallery';
    if (p.includes('local-area')) return 'local';
    if (p.includes('meetings-events')) return 'events';
    if (p.includes('reviews-lumina')) return 'reviews';
    if (p.includes('about-lumina')) return 'about';
    if (p.includes('contact-lumina')) return 'contact';
    return 'home';
  }
  const activePage = getActivePage();
  const activeClass = (p) => (p === activePage ? 'nav-link active' : 'nav-link');
  const mobileActiveClass = (p) =>
    'mobile-menu-link' + (p === activePage ? ' active' : '');

  /* ═══════════════════════════════════════════
     HEADER / NAV HTML
     ═══════════════════════════════════════════ */
  const navHTML = `
<nav class="global-nav">
  <div class="nav-container">
    <a href="${HOME}" class="nav-logo">Lumina Hospitality</a>
    <div class="nav-links">
      <a href="${HOME}" class="${activeClass('home')}">Home</a>
      <a href="${ROOMS}" class="${activeClass('rooms')}">Rooms &amp; Suites</a>
      <a href="${OFFERS}" class="${activeClass('offers')}">Offers</a>
      <a href="${DINING}" class="${activeClass('dining')}">Dining</a>
      <a href="${SPA}" class="${activeClass('spa')}">Spa</a>
      <a href="${GALLERY}" class="${activeClass('gallery')}">Gallery</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-toggle nav-link" aria-haspopup="true" aria-expanded="false">
          More <span class="material-symbols-outlined">expand_more</span>
        </button>
        <div class="nav-dropdown-menu" role="menu">
          <a href="${LOCAL}" class="nav-dropdown-item"><span class="material-symbols-outlined">place</span> Local Area Guide</a>
          <a href="${EVENTS}" class="nav-dropdown-item"><span class="material-symbols-outlined">event</span> Meetings &amp; Events</a>
          <a href="${REVIEWS}" class="nav-dropdown-item"><span class="material-symbols-outlined">star</span> Guest Reviews</a>
          <a href="${ABOUT}" class="nav-dropdown-item"><span class="material-symbols-outlined">info</span> About Us</a>
          <a href="${CONTACT}" class="nav-dropdown-item"><span class="material-symbols-outlined">contact_phone</span> Contact Us</a>
        </div>
      </div>
    </div>
    <div class="nav-actions">
      <a href="${BOOK}" class="nav-cta">Book Your Stay</a>
      <button class="mobile-menu-btn" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<div class="mobile-menu-overlay"></div>
<div class="mobile-menu">
  <div class="mobile-menu-header">
    <a href="${HOME}" class="nav-logo">Lumina Hospitality</a>
    <button class="mobile-menu-close" aria-label="Close menu">
      <span class="material-symbols-outlined">close</span>
    </button>
  </div>
  <nav class="mobile-menu-links">
    <a href="${HOME}" class="${mobileActiveClass('home')}"><span class="material-symbols-outlined">home</span> Home</a>
    <a href="${ROOMS}" class="${mobileActiveClass('rooms')}"><span class="material-symbols-outlined">bed</span> Rooms &amp; Suites</a>
    <a href="${OFFERS}" class="${mobileActiveClass('offers')}"><span class="material-symbols-outlined">local_offer</span> Special Offers</a>
    <a href="${DINING}" class="${mobileActiveClass('dining')}"><span class="material-symbols-outlined">restaurant</span> Dining</a>
    <a href="${SPA}" class="${mobileActiveClass('spa')}"><span class="material-symbols-outlined">spa</span> Spa &amp; Wellness</a>
    <a href="${GALLERY}" class="${mobileActiveClass('gallery')}"><span class="material-symbols-outlined">photo_library</span> Gallery</a>
    <a href="${LOCAL}" class="${mobileActiveClass('local')}"><span class="material-symbols-outlined">place</span> Local Area Guide</a>
    <a href="${EVENTS}" class="${mobileActiveClass('events')}"><span class="material-symbols-outlined">event</span> Meetings &amp; Events</a>
    <a href="${REVIEWS}" class="${mobileActiveClass('reviews')}"><span class="material-symbols-outlined">star</span> Guest Reviews</a>
    <a href="${ABOUT}" class="${mobileActiveClass('about')}"><span class="material-symbols-outlined">info</span> About Us</a>
    <a href="${CONTACT}" class="${mobileActiveClass('contact')}"><span class="material-symbols-outlined">contact_phone</span> Contact Us</a>
  </nav>
</div>`;

  /* ═══════════════════════════════════════════
     FOOTER HTML
     ═══════════════════════════════════════════ */
  const footerHTML = `
<footer class="global-footer">
  <div class="footer-container">
    <div class="footer-grid">
      <div class="footer-column">
        <a href="${HOME}" class="footer-logo">Lumina Hospitality</a>
        <p class="footer-description">Experience world-class hospitality in the heart of Lagos. From stunning ocean views to our award-winning spa, every moment is crafted for perfection.</p>
        <div class="footer-social">
          <a href="#" class="footer-social-link" aria-label="Facebook"><span class="material-symbols-outlined">facebook</span></a>
          <a href="#" class="footer-social-link" aria-label="Instagram"><span class="material-symbols-outlined">photo_camera</span></a>
          <a href="#" class="footer-social-link" aria-label="Twitter"><span class="material-symbols-outlined">alternate_email</span></a>
          <a href="#" class="footer-social-link" aria-label="LinkedIn"><span class="material-symbols-outlined">work</span></a>
        </div>
      </div>
      <div class="footer-column">
        <h4 class="footer-heading">Quick Links</h4>
        <div class="footer-links">
          <a href="${ROOMS}" class="footer-link">Rooms &amp; Suites</a>
          <a href="${OFFERS}" class="footer-link">Special Offers</a>
          <a href="${DINING}" class="footer-link">Dining</a>
          <a href="${SPA}" class="footer-link">Spa &amp; Wellness</a>
          <a href="${GALLERY}" class="footer-link">Gallery</a>
        </div>
      </div>
      <div class="footer-column">
        <h4 class="footer-heading">Explore</h4>
        <div class="footer-links">
          <a href="${LOCAL}" class="footer-link">Local Area Guide</a>
          <a href="${EVENTS}" class="footer-link">Meetings &amp; Events</a>
          <a href="${REVIEWS}" class="footer-link">Guest Reviews</a>
          <a href="${ABOUT}" class="footer-link">About Us</a>
          <a href="${CONTACT}" class="footer-link">Contact Us</a>
        </div>
      </div>
      <div class="footer-column">
        <h4 class="footer-heading">Stay Updated</h4>
        <div class="footer-contact-item">
          <span class="material-symbols-outlined">location_on</span>
          <span class="footer-contact-text">Plot 14, Ahmadu Bello Way, Victoria Island, Lagos</span>
        </div>
        <div class="footer-contact-item">
          <span class="material-symbols-outlined">call</span>
          <span class="footer-contact-text">+234 1 277 2700</span>
        </div>
        <div class="footer-newsletter">
          <form class="footer-newsletter-form" data-newsletter>
            <input type="email" class="footer-newsletter-input" placeholder="Your email address" aria-label="Email for newsletter" required />
            <button type="submit" class="footer-newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copyright">&copy; <span data-year></span> Lumina Hospitality. All rights reserved.</p>
      <div class="footer-bottom-links">
        <a href="${PRIVACY}" class="footer-bottom-link">Privacy Policy</a>
        <a href="${POLICIES}" class="footer-bottom-link">Terms of Service</a>
      </div>
    </div>
  </div>
</footer>
<button class="chat-fab" aria-label="Chat with us" data-chat-fab>
  <span class="material-symbols-outlined">chat_bubble</span>
  <span>Chat</span>
</button>`;

/* ═══════════════════════════════════════════
      BOOT
      ═══════════════════════════════════════════ */
  function boot() {
    // Inject into placeholders if present
    const navSlot = document.getElementById('global-nav');
    if (navSlot) {
      navSlot.innerHTML = navHTML;
    }

    const footerSlot = document.getElementById('global-footer');
    if (footerSlot) {
      footerSlot.innerHTML = footerHTML;
      footerSlot.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = new Date().getFullYear();
      });
    }

    // Handle header-based nav (home-lumina pattern) - add scroll behavior
    const header = document.querySelector('header[role="banner"]');
    if (header && !navSlot) {
      initHeaderScroll(header);
      initHeaderMobileMenu(header);
    }

    // Add solid class only on pages WITHOUT a hero (transparent on home/hero pages)
    const nav = document.querySelector('.global-nav');
    const hasHero = document.querySelector('.hero-wrap, .page-hero, .hero-slider-wrap');
    if (nav && !hasHero && !nav.classList.contains('solid')) {
      nav.classList.add('solid');
    }

    // Add solid class to header if no hero behind it (header-based nav pattern)
    if (header && !hasHero && !header.classList.contains('solid')) {
      header.classList.add('solid');
    }

    initScroll();
    initMobileMenu();
    initDropdowns();
    initNewsletter();
    initChat();
  }

  /* ── Scroll for header-based nav ── */
  function initHeaderScroll(header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  /* ── Mobile menu for header-based nav ── */
  function initHeaderMobileMenu(header) {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('closeMobileMenu');

    if (!btn || !menu) return;

    let focusable = [];
    let first = null;
    let last = null;
    let opener = null;

    const open = () => {
      btn.setAttribute('aria-expanded', 'true');
      menu.classList.remove('hidden');
      menu.classList.remove('-translate-x-full');
      document.body.style.overflow = 'hidden';

      focusable = menu.querySelectorAll('a[href], button:not([disabled])');
      first = focusable[0];
      last = focusable[focusable.length - 1];
      if (first) setTimeout(() => first.focus(), 50);
    };

    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.add('-translate-x-full');
      setTimeout(() => menu.classList.add('hidden'), 300);
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };

    btn.addEventListener('click', () => {
      opener = document.activeElement;
      open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);

    // Close on Escape + focus trap
    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('hidden')) {
        if (e.key === 'Escape') close();
        else if (e.key === 'Tab' && focusable.length) {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── Scroll: add `.scrolled` for solid background ── */
  function initScroll() {
    const nav = document.querySelector('.global-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    nav.classList.toggle('scrolled', window.scrollY > 50);
  }

  /* ── Mobile menu with focus trap ── */
  function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close');
    if (!btn || !menu) return;

    let focusable = [];
    let first = null;
    let last = null;
    let opener = null;

    const open = () => {
      btn.classList.add('open');
      menu.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      btn.setAttribute('aria-expanded', 'true');

      focusable = menu.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      first = focusable[0];
      last = focusable[focusable.length - 1];
      if (first) setTimeout(() => first.focus(), 50);
    };

    const close = () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
      if (opener) opener.focus();
    };

    btn.addEventListener('click', () => {
      opener = document.activeElement;
      menu.classList.contains('open') ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);

    menu.querySelectorAll('.mobile-menu-link').forEach((link) =>
      link.addEventListener('click', close)
    );

    document.addEventListener('keydown', (e) => {
      if (!menu.classList.contains('open')) return;
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'Tab' && focusable.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ── More dropdown ── */
  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach((dd) => {
      const toggle = dd.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      toggle.setAttribute('tabindex', '0');

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dd.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        }
      });
      // Hover open on desktop
      dd.addEventListener('mouseenter', () => {
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      });
      dd.addEventListener('mouseleave', () => {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click / Escape
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-dropdown.open').forEach((dd) => {
        if (!dd.contains(e.target)) {
          dd.classList.remove('open');
          const t = dd.querySelector('.nav-dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.nav-dropdown.open').forEach((dd) => {
          dd.classList.remove('open');
          const t = dd.querySelector('.nav-dropdown-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* ── Newsletter form → toast ── */
  function initNewsletter() {
    document.querySelectorAll('[data-newsletter]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast('Thank you for subscribing!');
          input.value = '';
        }
      });
    });
  }

  /* ── Chat FAB → toast placeholder ── */
  function initChat() {
    const fab = document.querySelector('[data-chat-fab]');
    if (!fab) return;
    fab.addEventListener('click', () => {
      showToast('Live chat coming soon — call +234 1 277 2700');
    });
  }

  /* ── Toast helper ── */
  function showToast(message) {
    let toast = document.querySelector('.nav-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'nav-toast';
      toast.innerHTML =
        '<span class="material-symbols-outlined">check_circle</span><span class="toast-msg"></span>';
      document.body.appendChild(toast);
    }
    toast.querySelector('.toast-msg').textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
  }
})();
