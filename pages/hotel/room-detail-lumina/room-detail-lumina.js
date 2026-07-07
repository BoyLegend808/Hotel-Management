/**
 * Room Detail Page — Lumina Hospitality
 * Fetches room data from /api/rooms/:id and enriches with local detail data.
 * No inline handlers — all via addEventListener.
 */

(function () {
    'use strict';

    /* ── XSS helper ── */
    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/<</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ── Enrichment data keyed by room ID ── */
    /* db.json has basic info; this adds gallery images, detailed amenities, location, etc. */
    const enrichmentData = {
        1: {
            location: 'Floor 18, Executive Wing',
            size: '860 sqft',
            bed: 'King Bed',
            longDescription: 'Perched on the 18th floor with panoramic city views, The Horizon Loft blends bespoke Italian furnishings with cutting-edge smart-home technology. A dedicated workspace, climate control, and high-speed connectivity make it ideal for both romantic escapes and executive retreats.',
            amenities: [
                { icon: 'wifi', name: 'Ultra Fast Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'group', name: '2 Guests', desc: 'Max occupancy' },
                { icon: 'desk', name: 'Work Station', desc: 'Ergonomic setup' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'room_service', name: 'Room Service', desc: '24/7 available' },
                { icon: 'spa', name: 'Spa Access', desc: 'Full facility pass' }
            ],
            images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAxi0wjU6aLr44vsc3N063QAcEDEQM9Cv_MImZtSci66HzHWmuEI1UYwKsCF6sUkq7G7qaH5JuacNzh_a81nzUGG9tWMl1uHBWxh-tPU8Uspt_ZTciCarVyGerQz9D-BYgOpSZd3Bxb_Dbe82m11YHPJ3AAJy2UaIbgLrxaSbgdEwnisnNrfgsNIar8UbY0-W34S7O9PUWpMETQPAWpwtWwog5Jle5uvR_PYQTpIkch7nhIkiIKeFbPTwihSWHciu0v75ouoFScCXQ',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'
            ]
        },
        2: {
            location: 'Floor 10, Heritage Wing',
            size: '540 sqft',
            bed: 'King Bed',
            longDescription: 'Classic elegance meets modern amenities in our most requested heritage wing chamber. The Royal Heritage Room features warm wood accents, a Nespresso bar, and high-speed connectivity, ideal for the discerning traveler who appreciates timeless style.',
            amenities: [
                { icon: 'group', name: '2 Guests', desc: 'Max occupancy' },
                { icon: 'coffee_maker', name: 'Nespresso Bar', desc: 'Premium capsule selection' },
                { icon: 'wifi', name: 'High-Speed Wi-Fi', desc: 'Complimentary' },
                { icon: 'room_service', name: 'Room Service', desc: '24/7 available' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'fitness_center', name: 'Gym Access', desc: 'Full facility pass' }
            ],
            images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuC19eUlmgJWbWeAf0lnzVzsqE5UlsJ7Nqr5b0gy5DSaxM-PHFp3X3lGJ-Cg_DI4RK5YfJAkZcWkRUyRnpMwo41TKGXCxQF2yE827K3OP07qsBfTUB-c9yFRfg8QYFKv6xa-BT7p3QmtSKH5RbdxoLZw8cf4AR-PuqZo3oN7XV22ETDR312PkUsk8mf3gIaZ6wXO0MZjEfxOygHvOeRKY6-wFN0Byvz9XIYOcq9y7EfTlohzCWKQRm_prBdoux9YheMj3IwqrZcLE4Q',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
            ]
        },
        3: {
            location: 'Floor 1, Private Villa',
            size: '1600 sqft',
            bed: 'King Bed + Sofa Bed',
            longDescription: 'The ultimate in privacy featuring a private heated infinity pool and 24-hour butler service. The Azure Pool Villa is a self-contained sanctuary with expansive living areas, a full kitchen, and direct pool access — the crown jewel of Lumina Hospitality.',
            amenities: [
                { icon: 'pool', name: 'Private Pool', desc: 'Heated infinity pool' },
                { icon: 'room_service', name: 'Butler Service', desc: '24/7 dedicated' },
                { icon: 'wifi', name: 'Gigabit Wi-Fi', desc: 'Complimentary' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'kitchen', name: 'Full Kitchen', desc: 'Complete appliances' },
                { icon: 'spa', name: 'Spa Access', desc: 'Priority booking' }
            ],
            images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAm7EtnzitMANt2-UME2fY9aLJLCkLdpGi8ka-IvidgCJCvI2U_rFfVpGyPj16jGngYysv4mEBbfQs2WZrVtNK8RIly3Nl2fS5ZiR6plduwT-gc-N_o__ARr4HWaV7Xo3oDemGtCQEuPHX40_8QIfqtn4ga7MgAcgUkcA35dWHsB6vjnNcYujTzTyZWZQyZuNjmpwgfQ6Ur-_qA7H-dS5gnPJcRVISF7LgiTJKzSqj6P_roE7l3B6w5hQrCxM5Xtn0Q_6jX11QJrkw',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
            ]
        },
        4: {
            location: 'Floor 6, East Wing',
            size: '380 sqft',
            bed: 'Queen Bed',
            longDescription: 'Modern industrial design for the business traveler who appreciates raw aesthetics and function. The Industrial Loft combines exposed-brick charm with a full ergonomic work station, gym access, and premium coffee — perfect for productive extended stays.',
            amenities: [
                { icon: 'desk', name: 'Work Station', desc: 'Ergonomic setup' },
                { icon: 'fitness_center', name: 'Gym Access', desc: 'Full facility pass' },
                { icon: 'wifi', name: 'High-Speed Wi-Fi', desc: 'Complimentary' },
                { icon: 'coffee_maker', name: 'Coffee Maker', desc: 'Premium selection' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'local_laundry_service', name: 'Laundry', desc: 'In-room washer' }
            ],
            images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCfxHE8EtEkaf7zGr0INy2_PIa2VHS32zPM2WmHK5Igl1nmnAEof5EPz_EtaFkzrV4Ghx_yXK0dZOGne1Gul8SHRguyJDDcs4edywvKMfzwiAyfaFCu5dG3DfXjnJ53aaOZJ7Lv8wqPaJMV0rJtm27SylpshsxyJAVwm3H1g1CW-atuzh6EIWzjhJskxb0NVCANxiyvKFlZm3PtVuiLfyg26UC6Sv_5tk1Z7c31xe3i5bB7jujhRPaRVwhX3YpSEhgYfYe7Qrlictg',
                'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=800&q=80',
                'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
            ]
        },
        5: {
            location: 'Floor 15, Alpine Wing',
            size: '720 sqft',
            bed: 'King Bed',
            longDescription: 'Experience mountain luxury with a real wood fireplace and private terrace overlooking the peaks. Peak View Cabin brings the warmth of alpine living with premium spa access, climate control, and Wi-Fi — a serene retreat for those who seek nature without sacrificing comfort.',
            amenities: [
                { icon: 'fireplace', name: 'Fireplace', desc: 'Real wood burning' },
                { icon: 'spa', name: 'Private Spa', desc: 'In-room treatments' },
                { icon: 'wifi', name: 'Wi-Fi', desc: 'Complimentary high-speed' },
                { icon: 'ac_unit', name: 'Climate Control', desc: 'Individual zone control' },
                { icon: 'balcony', name: 'Private Terrace', desc: 'Mountain views' },
                { icon: 'coffee_maker', name: 'Coffee Station', desc: 'Complimentary' }
            ],
            images: [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAFxkqrMt1GmGKYJfSCYgn2H9WMZPlWKbl9yci7Od6p9ffT5HLYaa-PVV0axf5LuGH0llQ-KVbi9U1ykms8W1XA3FxCW1xohYWvWj60itCEftceR-oWaNVplq5F_N0XiJv6rtew0vEhBUNNiDe5tc7tRVgLNiUTyzLQw0U35mixv6iYWwVnfmHiddZ_xqrOp5N1lbICmjaqaJzVY8xph-SquNuOhPboIApwyUqu5NcTkPuq1acgjdLjqvGXdqlOPvuiadiJcynNnzI',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
            ]
        }
    };

    /* ── Default enrichment for rooms not in the map ── */
    function getEnrichment(room) {
        if (enrichmentData[room.id]) return enrichmentData[room.id];
        // Build fallback enrichment from db.json fields
        return {
            location: 'Lumina Hospitality',
            size: room.totalArea ? `${room.totalArea} sqft` : '450 sqft',
            bed: room.bedding || 'King Bed',
            longDescription: room.description || 'Experience luxury accommodation at Lumina Hospitality.',
            amenities: (room.amenities || []).map((icon, i) => ({
                icon: icon,
                name: (room.amenityLabels && room.amenityLabels[i]) || icon,
                desc: 'Premium feature'
            })),
            images: [
                room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
                'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
            ]
        };
    }

    /* ── State ── */
    let currentRoom = null;
    let allRooms = [];
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

    /* ── Fetch room from API ── */
    async function fetchRoom(id) {
        try {
            const res = await fetch(`/api/rooms/${id}`);
            const data = await res.json();
            if (data.success && data.room) return data.room;
            return null;
        } catch (err) {
            console.error('Failed to fetch room:', err);
            return null;
        }
    }

    /* ── Fetch all rooms from API ── */
    async function fetchAllRooms() {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (data.success && Array.isArray(data.rooms)) return data.rooms;
            return [];
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            return [];
        }
    }

    /* ── Fetch reviews from API ── */
    async function fetchReviews(roomId) {
        try {
            const res = await fetch(`/api/reviews?roomId=${roomId}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.reviews)) return data.reviews;
            return [];
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            return [];
        }
    }

    /* ── Populate static text fields ── */
    function populateHeader(room, enrichment, reviewCount) {
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('roomName', room.name);
        setText('roomLocation', enrichment.location);
        setText('roomRating', (room.rating || 4.5).toFixed(1));
        setText('roomReviewCount', `· ${reviewCount} reviews`);
        setText('widgetPrice', `$${room.price.toLocaleString()}`);
        setText('widgetRating', (room.rating || 4.5).toFixed(1));
        setText('widgetReviewCount', `(${reviewCount} reviews)`);
        setText('breadcrumbRoom', room.name);
        document.title = `${room.name} | Lumina Hospitality`;
    }

    /* ── Specs row ── */
    function renderSpecs(room, enrichment) {
        const el = document.getElementById('roomSpecs');
        if (!el) return;
        const specs = [
            { icon: 'straighten', label: enrichment.size },
            { icon: 'bed', label: enrichment.bed },
            { icon: 'group', label: `Up to ${room.capacity || 2} guests` },
            { icon: 'layers', label: enrichment.location }
        ];
        el.innerHTML = specs.map(s => `
            <div class="room-spec-item">
                <span class="material-symbols-outlined">${esc(s.icon)}</span>
                ${esc(s.label)}
            </div>
        `).join('');
    }

    /* ── Description ── */
    function renderDescription(enrichment) {
        const el = document.getElementById('roomDescription');
        if (!el) return;
        el.innerHTML = `<p>${esc(enrichment.longDescription)}</p>`;
    }

    /* ── Amenities bento ── */
    function renderAmenities(enrichment) {
        const el = document.getElementById('amenitiesGrid');
        if (!el) return;
        el.innerHTML = enrichment.amenities.map(a => `
            <div class="amenity-item">
                <span class="material-symbols-outlined">${esc(a.icon)}</span>
                <span class="amenity-item-name">${esc(a.name)}</span>
                <span class="amenity-item-desc">${esc(a.desc)}</span>
            </div>
        `).join('');
    }

    /* ── Gallery ── */
    function renderGallery(enrichment, roomName) {
        const el = document.getElementById('galleryGrid');
        if (!el) return;
        const images = enrichment.images;
        el.innerHTML = images.map((src, i) => `
            <div class="gallery-item${i === 0 ? ' main' : ''}" data-index="${i}">
                <img src="${esc(src)}" alt="${esc(roomName)} photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}"/>
                <div class="gallery-overlay">
                    <span class="material-symbols-outlined">zoom_in</span>
                </div>
                ${i === images.length - 1 && images.length > 1 ? `
                <button class="gallery-view-all" id="viewAllBtn" aria-label="View all photos">
                    <span class="material-symbols-outlined">photo_library</span>
                    View all ${images.length} photos
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
        const enrichment = currentRoom ? getEnrichment(currentRoom) : null;
        if (!img || !enrichment) return;
        img.src = enrichment.images[lightboxIndex];
        img.alt = `${currentRoom.name} photo ${lightboxIndex + 1}`;
    }

    function initLightbox() {
        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

        document.getElementById('lightboxPrev').addEventListener('click', () => {
            const enrichment = getEnrichment(currentRoom);
            lightboxIndex = (lightboxIndex - 1 + enrichment.images.length) % enrichment.images.length;
            showLightboxImage();
        });

        document.getElementById('lightboxNext').addEventListener('click', () => {
            const enrichment = getEnrichment(currentRoom);
            lightboxIndex = (lightboxIndex + 1) % enrichment.images.length;
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
    function renderReviews(reviews, room) {
        const el = document.getElementById('reviewsList');
        if (!el) return;

        if (reviews.length === 0) {
            el.innerHTML = `
                <div style="text-align:center; padding:2rem; color: var(--text-muted);">
                    <span class="material-symbols-outlined" style="font-size:2.5rem; display:block; margin-bottom:0.5rem;">rate_review</span>
                    <p>No reviews yet for this room. Be the first to review!</p>
                </div>`;
            return;
        }

        el.innerHTML = reviews.map(r => {
            const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
            return `
            <div class="review-item">
                <div class="review-header">
                    <div>
                        <span class="review-author">${esc(r.guestName || 'Guest')}</span>
                        <span class="review-date">${esc(date)}</span>
                    </div>
                    <div class="review-stars" aria-label="${r.rating} out of 5 stars">
                        ${starHTML(r.rating)}
                    </div>
                </div>
                <p class="review-text">"${esc(r.comment)}"</p>
            </div>
        `}).join('');
    }

    /* ── Similar rooms ── */
    function renderSimilarRooms(currentId) {
        const el = document.getElementById('similarRoomsGrid');
        if (!el) return;
        const similar = allRooms.filter(r => r.id !== currentId).slice(0, 2);
        el.innerHTML = similar.map(r => {
            const enrichment = getEnrichment(r);
            return `
            <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${r.id}" class="similar-room-card">
                <div class="similar-room-img">
                    <img src="${esc(enrichment.images[0])}" alt="${esc(r.name)}" loading="lazy"/>
                </div>
                <div class="similar-room-info">
                    <p class="similar-room-name">${esc(r.name)}</p>
                    <p class="similar-room-price">$${r.price.toLocaleString()} / night</p>
                </div>
            </a>
        `}).join('');
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
    document.addEventListener('DOMContentLoaded', async () => {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('id'), 10);

        // Fetch room and all rooms in parallel
        const [room, rooms] = await Promise.all([
            fetchRoom(id || 1),
            fetchAllRooms()
        ]);

        allRooms = rooms;

        if (!room) {
            // Fallback: use the first room from the list
            currentRoom = rooms[0] || null;
            if (!currentRoom) {
                document.getElementById('roomName').textContent = 'Room Not Found';
                return;
            }
        } else {
            currentRoom = room;
        }

        const enrichment = getEnrichment(currentRoom);

        // Fetch reviews for this room
        const reviews = await fetchReviews(currentRoom.id);

        populateHeader(currentRoom, enrichment, reviews.length);
        renderSpecs(currentRoom, enrichment);
        renderDescription(enrichment);
        renderAmenities(enrichment);
        renderGallery(enrichment, currentRoom.name);
        renderReviews(reviews, currentRoom);
        renderSimilarRooms(currentRoom.id);
        initLightbox();
        initBookingWidget(currentRoom);
        initShare();
        initFavourite(currentRoom);
    });

})();
