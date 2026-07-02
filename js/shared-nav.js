/**
 * Lumina Hospitality — Shared Navigation & Footer
 * Single source of truth for header, mobile menu, and footer.
 * Injects into #site-header and #site-footer placeholders.
 *
 * Usage: Add to every page:
 *   <div id="site-header"></div>
 *   <div id="site-footer"></div>
 *   <script src="/js/shared-nav.js"></script>
 */

(function () {
    'use strict';

    /* ── Determine active page for nav highlighting ── */
    function getActivePage() {
        const path = window.location.pathname;
        if (path.includes('home-lumina')) return 'home';
        if (path.includes('rooms-lumina') && !path.includes('room-detail')) return 'rooms';
        if (path.includes('room-detail')) return 'rooms';
        if (path.includes('special-offers')) return 'offers';
        if (path.includes('dining-lumina')) return 'dining';
        if (path.includes('spa-wellness')) return 'spa';
        if (path.includes('gallery-lumina')) return 'gallery';
        if (path.includes('about-lumina')) return 'about';
        if (path.includes('contact-lumina')) return 'contact';
        return 'home';
    }

    const activePage = getActivePage();

    function navLinkClass(page) {
        return page === activePage
            ? 'nav-link active'
            : 'nav-link';
    }

    /* ═══════════════════════════════════════════
       HEADER
       ═══════════════════════════════════════════ */
    const headerHTML = `
<header role="banner" id="mainHeader" class="site-header">
    <div class="header-inner">
        <!-- Mobile menu button -->
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open menu" aria-expanded="false">
            <span class="material-symbols-outlined">menu</span>
        </button>

        <!-- Logo -->
        <a href="/pages/hotel/home-lumina/home-lumina.html" class="logo">
            <span class="logo-text">Lumina</span>
            <span class="logo-sub">Hospitality</span>
        </a>

        <!-- Desktop Navigation -->
        <nav role="navigation" class="desktop-nav" aria-label="Main navigation">
            <a href="/pages/hotel/home-lumina/home-lumina.html" class="${navLinkClass('home')}">Home</a>
            <a href="/pages/hotel/rooms-lumina/rooms-lumina.html" class="${navLinkClass('rooms')}">Rooms & Suites</a>
            <a href="/pages/hotel/special-offers/special-offers.html" class="${navLinkClass('offers')}">Special Offers</a>
            <a href="/pages/hotel/dining-lumina/dining-lumina.html" class="${navLinkClass('dining')}">Dining</a>
            <a href="/pages/hotel/spa-wellness/spa-wellness.html" class="${navLinkClass('spa')}">Spa & Wellness</a>
            <a href="/pages/hotel/gallery-lumina/gallery-lumina.html" class="${navLinkClass('gallery')}">Gallery</a>

            <!-- More dropdown -->
            <div class="nav-dropdown" id="moreDropdown">
                <button class="nav-link dropdown-trigger" aria-haspopup="true" aria-expanded="false" id="moreDropdownBtn">
                    More <span class="material-symbols-outlined text-xs">expand_more</span>
                </button>
                <div class="dropdown-panel" role="menu" aria-labelledby="moreDropdownBtn">
                    <a href="/pages/hotel/home-lumina/home-lumina.html#local-area" role="menuitem">
                        <span class="material-symbols-outlined">explore</span> Local Area
                    </a>
                    <a href="/pages/hotel/meetings-events/meetings-events.html" role="menuitem">
                        <span class="material-symbols-outlined">event</span> Events
                    </a>
                    <a href="/pages/hotel/reviews-lumina/reviews-lumina.html" role="menuitem">
                        <span class="material-symbols-outlined">star</span> Reviews
                    </a>
                    <a href="/pages/hotel/about-lumina/about-lumina.html" role="menuitem">
                        <span class="material-symbols-outlined">info</span> About Us
                    </a>
                    <a href="/pages/hotel/contact-lumina/contact-lumina.html" role="menuitem">
                        <span class="material-symbols-outlined">contact_phone</span> Contact
                    </a>
                </div>
            </div>
        </nav>

        <!-- Right actions -->
        <div class="header-actions">
            <a href="/pages/hotel/booking-your-stay/booking-your-stay.html" class="btn btn-primary btn-sm book-stay-btn">
                <span class="material-symbols-outlined text-sm">calendar_today</span>
                Book Stay
            </a>

            <button class="icon-btn" id="darkModeToggle" aria-label="Toggle dark mode">
                <span class="material-symbols-outlined">dark_mode</span>
            </button>

            <div class="user-menu" id="userMenuContainer">
                <div class="avatar" id="userAvatar" role="button" tabindex="0" aria-haspopup="true" aria-expanded="false">U</div>
                <div class="user-dropdown" id="userDropdown" role="menu">
                    <a href="/pages/hotel/guest-dashboard-lumina/guest-dashboard-lumina.html" role="menuitem">My Dashboard</a>
                    <a href="/pages/hotel/login-lumina/login-lumina.html" role="menuitem" class="logout-link">Sign Out</a>
                </div>
            </div>
        </div>
    </div>
</header>

<!-- Mobile Menu Overlay -->
<div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <div class="mobile-menu-backdrop" id="mobileMenuOverlay"></div>
    <div class="mobile-menu-panel" id="mobileMenuContent">
        <div class="mobile-menu-header">
            <span class="logo-text">Menu</span>
            <button class="icon-btn" id="closeMobileMenu" aria-label="Close menu">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <nav class="mobile-nav" aria-label="Mobile navigation">
            <a href="/pages/hotel/home-lumina/home-lumina.html" class="mobile-nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="/pages/hotel/rooms-lumina/rooms-lumina.html" class="mobile-nav-link ${activePage === 'rooms' ? 'active' : ''}">Rooms & Suites</a>
            <a href="/pages/hotel/special-offers/special-offers.html" class="mobile-nav-link ${activePage === 'offers' ? 'active' : ''}">Special Offers</a>
            <a href="/pages/hotel/dining-lumina/dining-lumina.html" class="mobile-nav-link ${activePage === 'dining' ? 'active' : ''}">Dining</a>
            <a href="/pages/hotel/spa-wellness/spa-wellness.html" class="mobile-nav-link ${activePage === 'spa' ? 'active' : ''}">Spa & Wellness</a>
            <a href="/pages/hotel/gallery-lumina/gallery-lumina.html" class="mobile-nav-link ${activePage === 'gallery' ? 'active' : ''}">Gallery</a>

            <div class="mobile-nav-divider"></div>

            <a href="/pages/hotel/home-lumina/home-lumina.html#local-area" class="mobile-nav-link sub">Local Area</a>
            <a href="/pages/hotel/meetings-events/meetings-events.html" class="mobile-nav-link sub">Events</a>
            <a href="/pages/hotel/reviews-lumina/reviews-lumina.html" class="mobile-nav-link sub">Reviews</a>
            <a href="/pages/hotel/about-lumina/about-lumina.html" class="mobile-nav-link sub">About Us</a>
            <a href="/pages/hotel/contact-lumina/contact-lumina.html" class="mobile-nav-link sub">Contact</a>

            <div class="mobile-nav-cta">
                <a href="/pages/hotel/booking-your-stay/booking-your-stay.html" class="btn btn-primary btn-lg full-width">
                    Book Your Stay
                </a>
            </div>
        </nav>
    </div>
</div>
`;

    /* ═══════════════════════════════════════════
       FOOTER
       ═══════════════════════════════════════════ */
    const footerHTML = `
<footer role="contentinfo" class="site-footer">
    <div class="footer-inner">
        <!-- Top row -->
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">
                    <span class="logo-text light">Lumina</span>
                    <span class="logo-sub light">Hospitality</span>
                </div>
                <p class="footer-tagline">Redefining luxury hospitality through design precision and heartfelt service.</p>
                <div class="footer-social">
                    <span class="social-icon" aria-label="Website">
                        <span class="material-symbols-outlined">public</span>
                    </span>
                    <span class="social-icon" aria-label="Email">
                        <span class="material-symbols-outlined">mail</span>
                    </span>
                    <span class="social-icon" aria-label="Phone">
                        <span class="material-symbols-outlined">call</span>
                    </span>
                </div>
            </div>

            <div class="footer-col">
                <h5 class="footer-heading">Explore</h5>
                <ul class="footer-links">
                    <li><a href="/pages/hotel/rooms-lumina/rooms-lumina.html">Rooms & Suites</a></li>
                    <li><a href="/pages/hotel/special-offers/special-offers.html">Special Offers</a></li>
                    <li><a href="/pages/hotel/dining-lumina/dining-lumina.html">Dining</a></li>
                    <li><a href="/pages/hotel/spa-wellness/spa-wellness.html">Spa & Wellness</a></li>
                    <li><a href="/pages/hotel/gallery-lumina/gallery-lumina.html">Gallery</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h5 class="footer-heading">Discover</h5>
                <ul class="footer-links">
                    <li><a href="/pages/hotel/about-lumina/about-lumina.html">About Us</a></li>
                    <li><a href="/pages/hotel/local-area/local-area.html">Local Area</a></li>
                    <li><a href="/pages/hotel/meetings-events/meetings-events.html">Events</a></li>
                    <li><a href="/pages/hotel/reviews-lumina/reviews-lumina.html">Guest Reviews</a></li>
                    <li><a href="/pages/hotel/contact-lumina/contact-lumina.html">Contact</a></li>
                </ul>
            </div>

            <div class="footer-col">
                <h5 class="footer-heading">Stay Updated</h5>
                <p class="footer-newsletter-text">Exclusive offers and hospitality insights, delivered weekly.</p>
                <form class="footer-newsletter" onsubmit="event.preventDefault();">
                    <input type="email" placeholder="Your email" aria-label="Email for newsletter" />
                    <button type="submit" class="newsletter-btn" aria-label="Subscribe">
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                </form>
            </div>
        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
            <p>&copy; 2026 Lumina Hospitality. All rights reserved.</p>
            <div class="footer-legal">
                <a href="/pages/hotel/privacy/privacy.html">Privacy Policy</a>
                <a href="/pages/hotel/policies/policies.html">Terms of Service</a>
            </div>
        </div>
    </div>
</footer>

<!-- Floating Chat Button -->
<button class="chat-fab" aria-label="Chat with us">
    <span class="material-symbols-outlined filled">chat_bubble</span>
    <span class="chat-fab-text">Chat</span>
</button>
`;

    /* ═══════════════════════════════════════════
       INJECT
       ═══════════════════════════════════════════ */
    document.addEventListener('DOMContentLoaded', function () {
        // Inject header
        const headerEl = document.getElementById('site-header');
        if (headerEl) {
            headerEl.innerHTML = headerHTML;
        }

        // Inject footer
        const footerEl = document.getElementById('site-footer');
        if (footerEl) {
            footerEl.innerHTML = footerHTML;
        }

        // Initialize interactions
        initScrollShrink();
        initMobileMenu();
        initDarkMode();
        initUserDropdown();
        initMoreDropdown();
    });

    /* ═══════════════════════════════════════════
       INTERACTIONS
       ═══════════════════════════════════════════ */

    /* ── Scroll: Header shrinks + gains shadow ── */
    function initScrollShrink() {
        const header = document.getElementById('mainHeader');
        if (!header) return;

        let ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.scrollY > 40) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ── Mobile Menu ── */
    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        const content = document.getElementById('mobileMenuContent');
        const closeBtn = document.getElementById('closeMobileMenu');

        if (!btn || !menu || !content) return;

        let focusableElements = [];
        let firstFocusable = null;
        let lastFocusable = null;

        function open() {
            menu.classList.add('open');
            menu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            btn.setAttribute('aria-expanded', 'true');

            focusableElements = content.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusable = focusableElements[0];
            lastFocusable = focusableElements[focusableElements.length - 1];

            if (firstFocusable) firstFocusable.focus();
        }

        function close() {
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            btn.setAttribute('aria-expanded', 'false');

            setTimeout(function () {
                if (firstFocusable) btn.focus();
            }, 100);
        }

        function trapFocus(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            } else if (e.key === 'Escape') {
                close();
            }
        }

        btn.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (overlay) overlay.addEventListener('click', close);

        // Close on mobile nav link click
        content.querySelectorAll('.mobile-nav-link').forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (menu.classList.contains('open')) {
                trapFocus(e);
            }
        });
    }

    /* ── Dark Mode ── */
    function initDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        const html = document.documentElement;

        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        function apply(isDark) {
            if (isDark) {
                html.classList.add('dark');
                if (toggle) toggle.querySelector('.material-symbols-outlined').textContent = 'light_mode';
            } else {
                html.classList.remove('dark');
                if (toggle) toggle.querySelector('.material-symbols-outlined').textContent = 'dark_mode';
            }
        }

        if (saved === 'dark' || (!saved && prefersDark)) {
            apply(true);
        } else {
            apply(false);
        }

        if (toggle) {
            toggle.addEventListener('click', function () {
                const isDark = html.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                apply(isDark);
            });
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem('theme')) {
                apply(e.matches);
            }
        });
    }

    /* ── User Dropdown ── */
    function initUserDropdown() {
        const avatar = document.getElementById('userAvatar');
        const dropdown = document.getElementById('userDropdown');

        if (!avatar || !dropdown) return;

        avatar.addEventListener('click', function (e) {
            e.stopPropagation();
            const hidden = dropdown.classList.contains('open');
            dropdown.classList.toggle('open');
            avatar.setAttribute('aria-expanded', hidden ? 'true' : 'false');
        });

        avatar.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('open');
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('open');
            }
        });

        document.addEventListener('click', function (e) {
            if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') dropdown.classList.remove('open');
        });
    }

    /* ── More Dropdown ── */
    function initMoreDropdown() {
        const trigger = document.getElementById('moreDropdownBtn');
        const panel = trigger ? trigger.nextElementSibling : null;

        if (!trigger || !panel) return;

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const hidden = panel.classList.contains('open');
            panel.classList.toggle('open');
            trigger.setAttribute('aria-expanded', hidden ? 'true' : 'false');
        });

        trigger.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                panel.classList.toggle('open');
            }
        });

        document.addEventListener('click', function (e) {
            if (!trigger.contains(e.target) && !panel.contains(e.target)) {
                panel.classList.remove('open');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') panel.classList.remove('open');
        });
    }

})();
