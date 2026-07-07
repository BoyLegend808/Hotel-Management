/**
 * Lumina Hospitality — Homepage JavaScript
 *
 * Handles: hero carousel, scroll-reveal, slide-to-book, animated stat
 * counters, 3D tilt, room grid rendering, booking-bar search, and the
 * newsletter form. No inline handlers — all listeners attached here.
 *
 * NOTE: Global nav (scroll-to-solid, mobile menu, dropdowns) is handled
 * separately by /js/global-nav.js. Do not duplicate that logic here.
 */

(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    /* ────────────────────────────────────────────
       Hero Carousel
       ──────────────────────────────────────────── */
    function initHeroCarousel() {
        const slider = document.getElementById('hero-slider');
        if (!slider) return;

        const slides = slider.children;
        const dots = document.querySelectorAll('.hero-dot');
        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        let index = 0;
        const total = slides.length;
        let autoTimer = null;

        if (!total) return;

        function go(n) {
            index = (n + total) % total;
            slider.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        const next = () => go(index + 1);
        const prev = () => go(index - 1);

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(next, 6000);
        }
        function stopAuto() {
            if (autoTimer) clearInterval(autoTimer);
        }

        if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
        dots.forEach((d) =>
            d.addEventListener('click', () => {
                go(parseInt(d.dataset.slide, 10));
                startAuto();
            })
        );

        const wrap = slider.parentElement;
        if (wrap) {
            wrap.addEventListener('mouseenter', stopAuto);
            wrap.addEventListener('mouseleave', startAuto);
        }

        startAuto();
    }

    /* ────────────────────────────────────────────
       Scroll Reveal (uses .visible — matches design system)
       ──────────────────────────────────────────── */
    function initScrollReveal() {
        const revealEls = document.querySelectorAll(
            '.reveal, .reveal-left, .reveal-right, .reveal-scale'
        );
        if (!revealEls.length) return;

        if (!('IntersectionObserver' in window)) {
            revealEls.forEach((el) => el.classList.add('visible'));
            return;
        }
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        revealEls.forEach((el) => obs.observe(el));
    }

    /* ────────────────────────────────────────────
       Room Showcase Grid
       ──────────────────────────────────────────── */
    const roomsData = [
        {
            id: 1,
            name: 'The Horizon Loft',
            type: 'EXECUTIVE SUITE',
            price: 450,
            rating: 4.9,
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            description: 'Expansive 80sqm space with panoramic views and designer furnishings.'
        },
        {
            id: 2,
            name: 'Royal Heritage Room',
            type: 'DELUXE KING',
            price: 320,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
            description: 'Classic elegance meets modern amenities in our heritage wing.'
        },
        {
            id: 3,
            name: 'Azure Pool Villa',
            type: 'VIP SANCTUARY',
            price: 890,
            rating: 5.0,
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
            description: 'Private heated infinity pool and 24-hour butler service.'
        }
    ];

    function renderLuxuryRooms() {
        const grid = document.getElementById('roomGrid');
        if (!grid) return;

        if (roomsData.length >= 3) {
            const mainRoom = roomsData[0];
            const sideRooms = roomsData.slice(1, 3);

            grid.className = "room-showcase";
            grid.innerHTML = `
                <!-- Main Room -->
                <div class="room-showcase-main reveal group cursor-pointer">
                    <div class="room-img-wrap">
                        <img src="${mainRoom.image}" alt="${mainRoom.name}" loading="lazy" />
                        <div class="room-type-badge">
                            ${mainRoom.type}
                        </div>
                        <div class="room-price-badge">
                            $${mainRoom.price} / night
                        </div>
                    </div>
                    <div class="room-card-info">
                        <h3 class="room-card-name">${mainRoom.name}</h3>
                        <p class="room-card-desc">${mainRoom.description}</p>
                        <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${mainRoom.id}" class="room-card-link">
                            View Details <span class="material-symbols-outlined">arrow_forward</span>
                        </a>
                    </div>
                </div>
                <!-- Side Rooms -->
                <div class="room-showcase-side">
                    ${sideRooms.map((room, index) => `
                        <div class="reveal group cursor-pointer" style="transition-delay: ${(index + 1) * 0.2}s">
                            <div class="room-img-wrap">
                                <img src="${room.image}" alt="${room.name}" loading="lazy" />
                                <div class="room-type-badge">
                                    ${room.type}
                                </div>
                                <div class="room-price-badge">
                                    $${room.price} / night
                                </div>
                            </div>
                            <div class="room-card-info">
                                <h3 class="room-card-name">${room.name}</h3>
                                <p class="room-card-desc">${room.description}</p>
                                <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${room.id}" class="room-card-link">
                                    View Details <span class="material-symbols-outlined">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Re-observe newly rendered reveal elements
        document.querySelectorAll('#roomGrid .reveal').forEach((el) => {
            if (!el.classList.contains('visible')) el.classList.add('visible');
        });
    }

    /* ────────────────────────────────────────────
       Booking Bar Search
       ──────────────────────────────────────────── */
    function initBookingSearch() {
        const checkin = document.getElementById('checkin-date');
        const checkout = document.getElementById('checkout-date');
        const guests = document.getElementById('guest-count');
        const searchBtn = document.getElementById('searchAvailabilityBtn');

        // Default dates: today + tomorrow
        if (checkin && checkout) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const fmt = (d) => d.toISOString().split('T')[0];
            checkin.value = fmt(today);
            checkout.value = fmt(tomorrow);
            checkin.min = fmt(today);
            checkout.min = fmt(tomorrow);
            checkin.addEventListener('change', () => {
                checkout.min = checkin.value || fmt(today);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const params = new URLSearchParams();
                if (checkin && checkin.value) params.set('checkIn', checkin.value);
                if (checkout && checkout.value) params.set('checkOut', checkout.value);
                if (guests && guests.value) params.set('guests', guests.value);
                window.location.href = `/pages/hotel/rooms-lumina/rooms-lumina.html${params.toString() ? '?' + params.toString() : ''}`;
            });
        }
    }

    /* ────────────────────────────────────────────
       Slide-to-Book Button
       ──────────────────────────────────────────── */
    function initSlideToBook() {
        const slideButton = document.getElementById('slideButton');
        const slideHandle = document.getElementById('slideHandle');
        const slideFill = slideButton ? slideButton.querySelector('.slide-button-fill') : null;
        const slideStatus = document.getElementById('slideStatus');
        const loadingIcon = document.getElementById('loadingIcon');
        const successIcon = document.getElementById('successIcon');
        const slideText = slideButton ? slideButton.querySelector('.slide-button-text') : null;

        if (!slideButton || !slideHandle || !slideFill) return;

        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        const maxDrag = 155;
        const threshold = maxDrag * 0.9;
        let completed = false;

        function startDrag(e) {
            if (completed) return;
            isDragging = true;
            startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
            slideHandle.style.transition = 'none';
            slideFill.style.transition = 'none';
        }
        function drag(e) {
            if (!isDragging || completed) return;
            e.preventDefault();
            const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const diff = clientX - startX;
            currentX = Math.max(0, Math.min(diff, maxDrag));
            slideHandle.style.transform = `translateX(${currentX}px)`;
            slideFill.style.width = `${currentX + 10}px`;
        }
        function endDrag() {
            if (!isDragging || completed) return;
            isDragging = false;
            slideHandle.style.transition = 'transform 0.3s ease';
            slideFill.style.transition = 'width 0.3s ease';

            if (currentX >= threshold) {
                completed = true;
                slideButton.classList.add('completed');
                slideHandle.style.transform = `translateX(${maxDrag}px)`;
                slideFill.style.width = '100%';
                if (slideText) slideText.style.opacity = '0';
                showLoading();
            } else {
                slideHandle.style.transform = 'translateX(0)';
                slideFill.style.width = '0';
                currentX = 0;
            }
        }
        function showLoading() {
            if (slideStatus) slideStatus.classList.add('visible');
            if (loadingIcon) loadingIcon.style.display = 'block';
            if (successIcon) successIcon.style.display = 'none';
            setTimeout(() => {
                if (loadingIcon) loadingIcon.style.display = 'none';
                if (successIcon) successIcon.style.display = 'block';
                setTimeout(() => {
                    window.location.href = '/pages/hotel/booking-your-stay/booking-your-stay.html';
                }, 1000);
            }, 2000);
        }

        slideHandle.addEventListener('mousedown', startDrag);
        slideHandle.addEventListener('touchstart', startDrag, { passive: true });
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    /* ────────────────────────────────────────────
       Animated Stat Counters
       ──────────────────────────────────────────── */
    function initCounters() {
        const counters = document.querySelectorAll('.stat-counter');
        if (!counters.length) return;

        if (!('IntersectionObserver' in window)) {
            counters.forEach((c) => (c.innerText = c.getAttribute('data-target')));
            return;
        }

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000;
                        const start = performance.now();

                        function update(now) {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const easeOut = progress * (2 - progress);
                            counter.innerText = Math.floor(easeOut * target);
                            if (progress < 1) {
                                requestAnimationFrame(update);
                            } else {
                                counter.innerText = target;
                            }
                        }
                        requestAnimationFrame(update);
                        obs.unobserve(counter);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach((c) => obs.observe(c));
    }

    /* ────────────────────────────────────────────
       3D Tilt Effect
       ──────────────────────────────────────────── */
    function init3DTilt() {
        const tourContainer = document.getElementById('tourContainer');
        const tiltText = document.querySelector('.tilt-text');
        if (!tourContainer || !tiltText) return;

        tourContainer.style.transformStyle = 'preserve-3d';

        tourContainer.addEventListener('mousemove', (e) => {
            const rect = tourContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            tiltText.style.transform = `translateZ(50px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        tourContainer.addEventListener('mouseleave', () => {
            tiltText.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
        });
    }

    /* ────────────────────────────────────────────
       Testimonial Carousel
       ──────────────────────────────────────────── */
    function initTestimonialCarousel() {
        const track = document.getElementById('testimonialTrack');
        if (!track) return;

        const cards = track.querySelectorAll('.testimonial-card');
        const prevBtn = document.getElementById('testimonialPrev');
        const nextBtn = document.getElementById('testimonialNext');
        const dotsContainer = document.getElementById('testimonialDots');
        
        if (!cards.length) return;

        let currentIndex = 0;
        let cardsPerView = 1;

        // Calculate cards per view based on screen size
        function updateCardsPerView() {
            if (window.innerWidth >= 1024) {
                cardsPerView = 3;
            } else if (window.innerWidth >= 768) {
                cardsPerView = 2;
            } else {
                cardsPerView = 1;
            }
        }

        // Create dots
        function createDots() {
            dotsContainer.innerHTML = '';
            const totalDots = Math.ceil(cards.length / cardsPerView);
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('div');
                dot.className = 'testimonial-dot';
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goToSlide(index) {
            const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            const cardWidth = cards[0].offsetWidth + 32; // Including gap
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Update dots
            const dots = dotsContainer.querySelectorAll('.testimonial-dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        function next() {
            const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
            goToSlide(currentIndex + 1);
        }

        function prev() {
            goToSlide(currentIndex - 1);
        }

        // Initialize
        updateCardsPerView();
        createDots();

        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prev);
        if (nextBtn) nextBtn.addEventListener('click', next);

        // Update on resize
        window.addEventListener('resize', () => {
            updateCardsPerView();
            createDots();
            goToSlide(0);
        });
    }

    /* ────────────────────────────────────────────
       Parallax Effect
       ──────────────────────────────────────────── */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    parallaxElements.forEach(el => {
                        const speed = parseFloat(el.dataset.parallax) || 0.5;
                        const rect = el.getBoundingClientRect();
                        const scrolled = window.pageYOffset;
                        
                        if (rect.top < window.innerHeight && rect.bottom > 0) {
                            const yPos = -(scrolled * speed);
                            const img = el.querySelector('img');
                            if (img) {
                                img.style.transform = `translateY(${yPos}px) scale(1.1)`;
                            }
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

/* ────────────────────────────────────────────
        Instagram Lightbox
        ──────────────────────────────────────────── */
    function initLightbox() {
        const lightboxLinks = document.querySelectorAll('[data-lightbox]');
        if (!lightboxLinks.length) return;

        // Create lightbox element
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Close lightbox">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="lightbox-content">
                <img src="" alt="" id="lightboxImg" />
            </div>
        `;
        document.body.appendChild(lightbox);

        const lightboxImg = lightbox.querySelector('#lightboxImg');
        const closeBtn = lightbox.querySelector('.lightbox-close');

        lightboxLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const imgSrc = link.getAttribute('href');
                const imgAlt = link.querySelector('img').alt;
                lightboxImg.src = imgSrc;
                lightboxImg.alt = imgAlt;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) {
                closeLightbox();
            }
        });
    }

    /* ────────────────────────────────────────────
        Newsletter Form
        ──────────────────────────────────────────── */
    function initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="email"]');
            if (input && input.value) {
                showToast('Thank you for subscribing! Welcome to the Lumina Club.');
                form.reset();
            }
        });
    }

    /* ────────────────────────────────────────────
        Toast helper (shared with global-nav.js toast)
        ──────────────────────────────────────────── */
    function showToast(message) {
        if (window.UI && typeof UI.showToast === 'function') {
            UI.showToast(message, 'success');
            return;
        }
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

/* ────────────────────────────────────────────
        Init
        ──────────────────────────────────────────── */
    ready(() => {
        renderLuxuryRooms();
        initHeroCarousel();
        initScrollReveal();
        initBookingSearch();
        initSlideToBook();
        initCounters();
        init3DTilt();
        initTestimonialCarousel();
        initParallax();
        initLightbox();
        initNewsletter();
    });
})();
