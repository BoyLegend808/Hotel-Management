/**
 * Lumina Hospitality — Responsive Navbar Controller
 * Handles scroll detection, mobile menu toggle, and animated hamburger.
 */
(function () {
  'use strict';

  function initNavbar() {
    const navbar = document.querySelector('.eg-navbar');
    if (!navbar) return;

    const hamburger = navbar.querySelector('.eg-navbar__hamburger');
    const mobileMenu = document.querySelector('.eg-navbar__mobile');
    const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
    const ctaButton = document.querySelector('.eg-navbar__cta');

    // Update navbar based on login status
    function updateNavbarAuth() {
      const user = getStoredUser?.() || null;
      if (user && ctaButton) {
        ctaButton.innerHTML = '<span class="material-symbols-outlined">logout</span> Logout';
        ctaButton.onclick = handleLogout;
        ctaButton.href = '#';
      }
    }

    function handleLogout() {
      // Call logout endpoint
      fetch('/api/logout', { method: 'POST' })
        .then(() => {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('sessionStart');
          window.location.href = '/pages/public/home/';
        })
        .catch((err) => {
          console.error('Logout error:', err);
          window.location.href = '/pages/public/home/';
        });
    }

    // ── Scroll-aware styling ──────────────────────────
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // ── Mobile menu toggle ────────────────────────────
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent immediate click-outside trigger
        const isOpen = mobileMenu.classList.contains('is-open');
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      // Close on link click
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
          closeMenu();
        }
      });

      // Close when clicking outside of the navbar and mobile menu
      document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('is-open')) {
          const isClickInsideNavbar = navbar.contains(e.target);
          const isClickInsideMenu = mobileMenu.contains(e.target);
          if (!isClickInsideNavbar && !isClickInsideMenu) {
            closeMenu();
          }
        }
      });
    }

    function openMenu() {
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
    }

    function closeMenu() {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
    }

    // Initialize auth on load
    updateNavbarAuth();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
