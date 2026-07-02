/**
 * Room Detail Page — Lumina Hospitality
 * Targets the rebuilt room-detail-lumina.html structure.
 * No inline handlers — all via addEventListener.
 */

(function () {
    'use strict';

    /* ── XSS helper ── */
    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ── Room Data (mirrors rooms-lumina.js) ── */
    const roomsData = [
        {
            id: 1,
            name: 'Oceanview Executive Suite',
            type: 'suite',
            typeLabel: 'Premium Suite',
            price: 850,
            rating: 4.9,
            reviewCount: 128,
            capacity: 2,
            available: true,
            location: 'Floor 18, Ocean Wing',
            size: '85 sqm',
            bed: 'King Bed',
            description: 'Perched on the 18th floor with unobstructed Atlantic views, this suite blends bespoke Italian furnishings with cutting-edge smart-home technology. A private balcony, butler service, and dedicated workspace make it ideal for both romantic escapes and executive retreats. Every detail — from the hand-stitched linens to the curated minibar — reflects Lumina\'s commitment to understated luxury.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'balcony', name: 'Private Balcony', desc: 'Ocean panorama' },
                { icon: 'coffee_maker', name: 'Nespresso Bar', desc: 'Premium capsule selection' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'room_service', name: '24/7 Butler', desc: 'Dedicated concierge' },
                { icon: 'spa', name: 'Spa Access', desc: 'Full facility pass' }
            ],
            images: [
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=800&q=80'
            ],
            tags: ['Free WiFi', 'Breakfast', 'Spa Access']
        },
        {
            id: 2,
            name: 'Urban Deluxe Suite',
            type: 'deluxe',
            typeLabel: 'Executive',
            price: 650,
            rating: 4.8,
            reviewCount: 94,
            capacity: 2,
            available: true,
            location: 'Floor 12, City Wing',
            size: '65 sqm',
            bed: 'King Bed',
            description: 'A sophisticated urban retreat with sweeping city skyline views. The suite features a dedicated workspace with ergonomic seating, a curated minibar, and floor-to-ceiling windows that flood the space with natural light. Perfect for the modern executive who demands both comfort and connectivity.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'desk', name: 'Work Station', desc: 'Ergonomic setup' },
                { icon: 'coffee_maker', name: 'Nespresso Bar', desc: 'Premium capsule selection' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'fitness_center', name: 'Gym Access', desc: 'Full facility pass' },
                { icon: 'local_bar', name: 'Mini Bar', desc: 'Curated selection' }
            ],
            images: [
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
            ],
            tags: ['Free WiFi', 'Breakfast', 'Gym Access']
        },
        {
            id: 3,
            name: 'Panoramic Family Suite',
            type: 'family',
            typeLabel: 'Family Suite',
            price: 1200,
            rating: 4.9,
            reviewCount: 76,
            capacity: 4,
            available: true,
            location: 'Floor 8, Garden Wing',
            size: '120 sqm',
            bed: '2 Bedrooms',
            description: 'Designed for families who refuse to compromise on luxury, this expansive suite features two fully appointed bedrooms, a kitchenette, and a wraparound balcony overlooking the manicured gardens. Connecting rooms and child-friendly amenities ensure every family member feels at home.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'kitchen', name: 'Kitchenette', desc: 'Full appliances' },
                { icon: 'balcony', name: 'Garden Balcony', desc: 'Wraparound terrace' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'child_friendly', name: 'Family Amenities', desc: 'Child-safe setup' },
                { icon: 'pool', name: 'Pool Access', desc: 'Family pool included' }
            ],
            images: [
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=800&q=80'
            ],
            tags: ['Free WiFi', 'Breakfast', 'Kitchen']
        },
        {
            id: 4,
            name: 'Presidential Ocean Suite',
            type: 'presidential',
            typeLabel: 'Presidential',
            price: 2500,
            rating: 5.0,
            reviewCount: 42,
            capacity: 2,
            available: true,
            location: 'Floor 24, Penthouse',
            size: '200 sqm',
            bed: 'King Bed + Jacuzzi',
            description: 'The pinnacle of Lumina hospitality. This 200 sqm penthouse suite commands the entire top floor, offering a private terrace, plunge pool, and dedicated butler team. Bespoke furnishings, a private dining room, and exclusive VIP services make this the ultimate expression of luxury living.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'pool', name: 'Private Plunge Pool', desc: 'Rooftop terrace' },
                { icon: 'room_service', name: 'Dedicated Butler', desc: 'Round-the-clock' },
                { icon: 'local_airport', name: 'Airport Transfer', desc: 'Private vehicle' },
                { icon: 'spa', name: 'Full Spa Access', desc: 'Priority booking' },
                { icon: 'restaurant', name: 'Private Dining', desc: 'In-suite chef available' }
            ],
            images: [
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
            ],
            tags: ['All Inclusive', 'VIP Service', 'Airport Transfer']
        },
        {
            id: 5,
            name: 'Garden Retreat Room',
            type: 'deluxe',
            typeLabel: 'Garden View',
            price: 450,
            rating: 4.7,
            reviewCount: 113,
            capacity: 2,
            available: true,
            location: 'Floor 3, Garden Wing',
            size: '45 sqm',
            bed: 'Queen Bed',
            description: 'A serene escape surrounded by lush tropical gardens. This room opens directly onto a private terrace with pool views, offering a tranquil retreat from the city. Warm earthy tones, natural materials, and curated botanical accents create a calming sanctuary.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'pool', name: 'Pool Access', desc: 'Garden pool' },
                { icon: 'balcony', name: 'Private Terrace', desc: 'Garden views' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'coffee_maker', name: 'Coffee Station', desc: 'Complimentary' },
                { icon: 'spa', name: 'Spa Discount', desc: '20% off treatments' }
            ],
            images: [
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
            ],
            tags: ['Free WiFi', 'Breakfast', 'Pool Access']
        },
        {
            id: 6,
            name: 'Executive Studio',
            type: 'studio',
            typeLabel: 'Studio',
            price: 380,
            rating: 4.6,
            reviewCount: 87,
            capacity: 2,
            available: true,
            location: 'Floor 6, East Wing',
            size: '40 sqm',
            bed: 'King Bed',
            description: 'Thoughtfully designed for extended stays, the Executive Studio combines a fully equipped kitchenette with a dedicated work area and premium bedding. Weekly rates and flexible checkout make it the smart choice for business travellers and long-stay guests.',
            amenities: [
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'kitchen', name: 'Kitchenette', desc: 'Full appliances' },
                { icon: 'desk', name: 'Work Station', desc: 'Ergonomic setup' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'local_laundry_service', name: 'Laundry', desc: 'In-room washer' },
                { icon: 'fitness_center', name: 'Gym Access', desc: 'Full facility pass' }
            ],
            images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=1200&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
            ],
            tags: ['Free WiFi', 'Kitchen', 'Weekly Rates']
        }
    ];

    /* ── Sample reviews per room ── */
    const sampleReviews = [
        { author: 'James O.', date: 'March 2025', stars: 5, text: 'Absolutely flawless experience. The butler service was attentive without being intrusive, and the view from the balcony at sunrise is something I will never forget.' },
        { author: 'Amara N.', date: 'February 2025', stars: 5, text: 'We celebrated our anniversary here and Lumina exceeded every expectation. The room was immaculate, the champagne was chilled on arrival, and the staff remembered our names throughout.' },
        { author: 'David K.', date: 'January 2025', stars: 4, text: 'Outstanding comfort and design. The bed is the most comfortable I have slept in at any hotel. Minor note: the in-room dining took slightly longer than expected, but the quality made up for it.' }
    ];

    /* ── State ── */
    let currentRoom = null;
    let lightboxIndex = 0;

    /* ── Helpers ── */
    function toDateString(date) {
        return date.toISOString().split('T')[0];
    }

    function nightsBetween(checkIn, checkOut) {
        const ms = new Date(checkOut) - new Date(checkIn);
        return Math.max(1, Math.round(ms / 86400000));
    }

    function starHTML(count) {
        return Array.from({ length: 5 }, (_, i) =>
            `<span class="material-symbols-outlined${i < count ? ' filled' : ''}">star</span>`
        ).join('');
    }

    /* ── Populate static text fields ── */
    function populateHeader(room) {
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('roomName', room.name);
        setText('roomLocation', room.location);
        setText('roomRating', room.rating.toFixed(1));
        setText('roomReviewCount', `· ${room.reviewCount} reviews`);
        setText('widgetPrice', `$${room.price.toLocaleString()}`);
        setText('widgetRating', room.rating.toFixed(1));
        setText('widgetReviewCount', `(${room.reviewCount} reviews)`);
        setText('breadcrumbRoom', room.name);
        document.title = `${room.name} | Lumina Hospitality`;
    }

    /* ── Specs row ── */
    function renderSpecs(room) {
        const el = document.getElementById('roomSpecs');
        if (!el) return;
        const specs = [
            { icon: 'straighten', label: room.size },
            { icon: 'bed', label: room.bed },
            { icon: 'group', label: `Up to ${room.capacity} guests` },
            { icon: 'layers', label: room.location }
        ];
        el.innerHTML = specs.map(s => `
            <div class="room-spec-item">
                <span class="material-symbols-outlined">${esc(s.icon)}</span>
                ${esc(s.label)}
            </div>
        `).join('');
    }

    /* ── Description ── */
    function renderDescription(room) {
        const el = document.getElementById('roomDescription');
        if (!el) return;
        el.innerHTML = `<p>${esc(room.description)}</p>`;
    }

    /* ── Amenities bento ── */
    function renderAmenities(room) {
        const el = document.getElementById('amenitiesGrid');
        if (!el) return;
        el.innerHTML = room.amenities.map(a => `
            <div class="amenity-item">
                <span class="material-symbols-outlined">${esc(a.icon)}</span>
                <span class="amenity-item-name">${esc(a.name)}</span>
                <span class="amenity-item-desc">${esc(a.desc)}</span>
            </div>
        `).join('');
    }

    /* ── Gallery ── */
    function renderGallery(room) {
        const el = document.getElementById('galleryGrid');
        if (!el) return;
        el.innerHTML = room.images.map((src, i) => `
            <div class="gallery-item${i === 0 ? ' main' : ''}" data-index="${i}">
                <img src="${esc(src)}" alt="${esc(room.name)} photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}"/>
                <div class="gallery-overlay">
                    <span class="material-symbols-outlined">zoom_in</span>
                </div>
                ${i === room.images.length - 1 && room.images.length > 1 ? `
                <button class="gallery-view-all" id="viewAllBtn" aria-label="View all photos">
                    <span class="material-symbols-outlined">photo_library</span>
                    View all ${room.images.length} photos
                </button>` : ''}
            </div>
        `).join('');

        el.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index, 10)));
        });

        const viewAllBtn = document.getElementById('viewAllBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', e => {
                e.stopPropagation();
                openLightbox(0);
            });
        }
    }

    /* ── Lightbox ── */
    function openLightbox(index) {
        lightboxIndex = index;
        showLightboxImage();
        const lb = document.getElementById('galleryLightbox');
        if (lb) lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('lightboxClose').focus();
    }

    function closeLightbox() {
        const lb = document.getElementById('galleryLightbox');
        if (lb) lb.classList.remove('open');
        document.body.style.overflow = '';
    }

    function showLightboxImage() {
        const img = document.getElementById('lightboxImg');
        if (!img || !currentRoom) return;
        img.src = currentRoom.images[lightboxIndex];
        img.alt = `${currentRoom.name} photo ${lightboxIndex + 1}`;
    }

    function initLightbox() {
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

        document.getElementById('lightboxPrev').addEventListener('click', () => {
            lightboxIndex = (lightboxIndex - 1 + currentRoom.images.length) % currentRoom.images.length;
            showLightboxImage();
        });

        document.getElementById('lightboxNext').addEventListener('click', () => {
            lightboxIndex = (lightboxIndex + 1) % currentRoom.images.length;
            showLightboxImage();
        });

        document.getElementById('galleryLightbox').addEventListener('click', e => {
            if (e.target === e.currentTarget) closeLightbox();
        });

        document.addEventListener('keydown', e => {
            const lb = document.getElementById('galleryLightbox');
            if (!lb || !lb.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
            if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
        });
    }

    /* ── Reviews ── */
    function renderReviews(room) {
        const el = document.getElementById('reviewsList');
        if (!el) return;
        el.innerHTML = sampleReviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <div>
                        <span class="review-author">${esc(r.author)}</span>
                        <span class="review-date">${esc(r.date)}</span>
                    </div>
                    <div class="review-stars" aria-label="${r.stars} out of 5 stars">
                        ${starHTML(r.stars)}
                    </div>
                </div>
                <p class="review-text">"${esc(r.text)}"</p>
            </div>
        `).join('');
    }

    /* ── Similar rooms ── */
    function renderSimilarRooms(room) {
        const el = document.getElementById('similarRoomsGrid');
        if (!el) return;
        const similar = roomsData.filter(r => r.id !== room.id).slice(0, 2);
        el.innerHTML = similar.map(r => `
            <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${r.id}" class="similar-room-card">
                <div class="similar-room-img">
                    <img src="${esc(r.images[0])}" alt="${esc(r.name)}" loading="lazy"/>
                </div>
                <div class="similar-room-info">
                    <p class="similar-room-name">${esc(r.name)}</p>
                    <p class="similar-room-price">$${r.price.toLocaleString()} / night</p>
                </div>
            </a>
        `).join('');
    }

    /* ── Booking widget ── */
    function initBookingWidget(room) {
        const checkinEl = document.getElementById('widgetCheckin');
        const checkoutEl = document.getElementById('widgetCheckout');
        const guestsEl = document.getElementById('widgetGuests');
        const reserveBtn = document.getElementById('reserveBtn');

        /* Default dates: today + tomorrow */
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        checkinEl.min = toDateString(today);
        checkinEl.value = toDateString(today);
        checkoutEl.min = toDateString(tomorrow);
        checkoutEl.value = toDateString(tomorrow);

        function updateBreakdown() {
            const nights = nightsBetween(checkinEl.value, checkoutEl.value);
            const roomTotal = room.price * nights;
            const taxes = Math.round(roomTotal * 0.075);
            const total = roomTotal + taxes;

            const el = document.getElementById('priceBreakdown');
            if (el) {
                el.innerHTML = `
                    <div class="price-row">
                        <span>$${room.price.toLocaleString()} × ${nights} night${nights !== 1 ? 's' : ''}</span>
                        <span>$${roomTotal.toLocaleString()}</span>
                    </div>
                    <div class="price-row">
                        <span>Taxes &amp; fees (7.5%)</span>
                        <span>$${taxes.toLocaleString()}</span>
                    </div>
                    <div class="price-row total">
                        <strong>Total</strong>
                        <strong>$${total.toLocaleString()}</strong>
                    </div>
                `;
            }

            /* Update reserve button href */
            if (reserveBtn) {
                const params = new URLSearchParams({
                    roomId: room.id,
                    checkIn: checkinEl.value,
                    checkOut: checkoutEl.value,
                    guests: guestsEl ? guestsEl.value : '2'
                });
                reserveBtn.href = `/pages/hotel/booking-your-stay/booking-your-stay.html?${params.toString()}`;
            }
        }

        checkinEl.addEventListener('change', () => {
            /* Ensure checkout is always after checkin */
            const nextDay = new Date(checkinEl.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutEl.min = toDateString(nextDay);
            if (checkoutEl.value <= checkinEl.value) {
                checkoutEl.value = toDateString(nextDay);
            }
            updateBreakdown();
        });

        checkoutEl.addEventListener('change', updateBreakdown);
        if (guestsEl) guestsEl.addEventListener('change', updateBreakdown);

        updateBreakdown();
    }

    /* ── Share button ── */
    function initShare() {
        const btn = document.getElementById('shareBtn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const url = window.location.href;
            if (navigator.share) {
                try {
                    await navigator.share({ title: currentRoom.name, url });
                } catch (_) { /* user cancelled */ }
            } else {
                try {
                    await navigator.clipboard.writeText(url);
                    if (window.UI) window.UI.showToast('Link copied to clipboard', 'success');
                } catch (_) {
                    if (window.UI) window.UI.showToast('Could not copy link', 'error');
                }
            }
        });
    }

    /* ── Favourite button ── */
    function initFavourite(room) {
        const btn = document.getElementById('favouriteBtn');
        if (!btn) return;

        const key = `lumina_fav_${room.id}`;
        const isFav = localStorage.getItem(key) === '1';
        if (isFav) btn.classList.add('active');
        btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');

        btn.addEventListener('click', () => {
            const active = btn.classList.toggle('active');
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            localStorage.setItem(key, active ? '1' : '0');
            if (window.UI) window.UI.showToast(active ? 'Saved to favourites' : 'Removed from favourites', active ? 'success' : 'info');
        });
    }

    /* ── Init ── */
    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);

        currentRoom = roomsData.find(r => r.id === id) || roomsData[0];

        populateHeader(currentRoom);
        renderSpecs(currentRoom);
        renderDescription(currentRoom);
        renderAmenities(currentRoom);
        renderGallery(currentRoom);
        renderReviews(currentRoom);
        renderSimilarRooms(currentRoom);
        initLightbox();
        initBookingWidget(currentRoom);
        initShare();
        initFavourite(currentRoom);
    });

})();
