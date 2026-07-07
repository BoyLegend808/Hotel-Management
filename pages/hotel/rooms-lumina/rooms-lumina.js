/**
 * Rooms & Suites Page — Lumina Hospitality
 * Handles: card rendering, filtering, sorting, search, mobile sidebar toggle.
 * Fetches room data from the /api/rooms endpoint (unified with db.json).
 * No inline handlers — all listeners attached here.
 */

(function () {
    'use strict';

    /* ── XSS helper ── */
    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* ── State ── */
    let roomsData = [];
    let currentRooms = [];

    /* ── DOM Refs ── */
    const grid = document.getElementById('roomCardGrid');
    const resultCount = document.getElementById('roomResultCount');
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('roomSearch');
    const priceRange = document.getElementById('priceRange');
    const priceMax = document.getElementById('priceMax');
    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const filterSidebar = document.getElementById('filterSidebar');

    /* ── Map DB room type to filter category ── */
    function mapRoomType(typeStr) {
        const t = (typeStr || '').toLowerCase();
        if (t.includes('suite') || t.includes('villa') || t.includes('vip') || t.includes('sanctuary')) return 'suite';
        if (t.includes('deluxe') || t.includes('king') || t.includes('heritage')) return 'deluxe';
        if (t.includes('presidential') || t.includes('penthouse')) return 'presidential';
        if (t.includes('family')) return 'family';
        if (t.includes('studio') || t.includes('urban') || t.includes('loft') || t.includes('industrial')) return 'studio';
        if (t.includes('alpine') || t.includes('cabin') || t.includes('escape') || t.includes('retreat')) return 'deluxe';
        return 'deluxe'; // default
    }

    /* ── Map DB room type to badge style ── */
    function badgeStyle(typeStr) {
        const t = (typeStr || '').toLowerCase();
        if (t.includes('vip') || t.includes('presidential') || t.includes('penthouse') || t.includes('urban') || t.includes('studio')) return 'accent';
        return 'primary';
    }

    /* ── Map DB room to amenity tags ── */
    function roomTags(room) {
        if (room.amenityLabels && room.amenityLabels.length > 0) {
            return room.amenityLabels.slice(0, 3);
        }
        const tags = ['Free WiFi'];
        if (room.price >= 500) tags.push('Breakfast');
        if (room.price >= 800) tags.push('VIP Service');
        else tags.push('Pool Access');
        return tags;
    }

    /* ── Fetch rooms from API ── */
    async function fetchRooms() {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            if (data.success && Array.isArray(data.rooms)) {
                return data.rooms.map(room => ({
                    id: room.id,
                    name: room.name,
                    type: mapRoomType(room.type),
                    typeLabel: room.type,
                    price: room.price,
                    rating: room.rating || 4.5,
                    capacity: room.capacity || 2,
                    available: room.status === 'available',
                    details: room.description || `${room.totalArea ? room.totalArea + ' sqft' : ''} · ${room.bedding || 'Luxury Bedding'} · ${room.type}`,
                    tags: roomTags(room),
                    badge: badgeStyle(room.type),
                    image: room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
                }));
            }
            return [];
        } catch (err) {
            console.error('Failed to fetch rooms:', err);
            return [];
        }
    }

    /* ── Render Cards ── */
    function renderRooms(rooms) {
        if (!grid) return;

        if (!rooms.length) {
            grid.innerHTML = `
                <div class="no-results">
                    <span class="material-symbols-outlined">search_off</span>
                    <h3>No rooms match your filters</h3>
                    <p>Try adjusting your search criteria or reset the filters.</p>
                </div>`;
            if (resultCount) resultCount.textContent = '0';
            return;
        }

        if (resultCount) resultCount.textContent = rooms.length;

        // Skeleton loading effect
        grid.innerHTML = Array(Math.min(rooms.length, 6)).fill(0).map(() => `
            <article class="room-card skeleton-loading" style="min-height: 400px; background: rgba(0,0,0,0.05); border-radius: var(--radius-xl); animation: pulse 1.5s infinite;"></article>
        `).join('');

        setTimeout(() => {
            grid.innerHTML = rooms.map(room => `
            <article class="room-card scroll-reveal hover-lift" role="listitem">
                <div class="room-card-media">
                    <img src="${esc(room.image)}" alt="${esc(room.name)}" loading="lazy"/>
                    <div class="room-card-media-overlay"></div>
                    <span class="room-card-badge ${esc(room.badge)}">${esc(room.typeLabel)}</span>
                    <div class="room-card-rating">
                        <span class="material-symbols-outlined filled">star</span>
                        ${esc(String(room.rating.toFixed(1)))}
                    </div>
                    <div class="room-card-price">
                        $${esc(String(room.price.toLocaleString()))} <span>/ night</span>
                    </div>
                </div>
                <div class="room-card-body">
                    <h3 class="room-card-name">${esc(room.name)}</h3>
                    <p class="room-card-details">${esc(room.details)}</p>
                    <div class="room-card-tags">
                        ${room.tags.map(t => `<span class="room-tag">${esc(t)}</span>`).join('')}
                    </div>
                    <div class="room-card-actions">
                        <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${esc(String(room.id))}" class="btn btn-primary">View Details</a>
                        <a href="/pages/hotel/booking-your-stay/booking-your-stay.html?roomId=${esc(String(room.id))}" class="btn btn-outline-primary">Book Now</a>
                    </div>
                </div>
            </article>
        `).join('');
            
            if (typeof window.initScrollReveals === 'function') {
                window.initScrollReveals();
            }
        }, 400); // 400ms skeleton display
    }

    /* ── Render loading state ── */
    function renderLoading() {
        if (!grid) return;
        grid.innerHTML = Array(4).fill(0).map(() => `
            <article class="room-card skeleton-loading" style="min-height: 400px; background: rgba(0,0,0,0.05); border-radius: var(--radius-xl); animation: pulse 1.5s infinite;"></article>
        `).join('');
        if (resultCount) resultCount.textContent = '...';
    }

    /* ── Get Filters ── */
    function getFilters() {
        const typeCheckboxes = document.querySelectorAll('[data-filter-type]:checked');
        const types = Array.from(typeCheckboxes).map(cb => cb.value);
        const maxPrice = priceRange ? parseInt(priceRange.value, 10) : 2500;
        const availableOnly = document.getElementById('availableOnly');
        const onlyAvailable = availableOnly ? availableOnly.checked : false;
        const minGuests = document.getElementById('guestFilter');
        const guestMin = minGuests ? parseInt(minGuests.value, 10) : 1;
        const search = searchInput ? searchInput.value.trim().toLowerCase() : '';

        return { types, maxPrice, onlyAvailable, guestMin, search };
    }

    /* ── Apply Filters + Sort ── */
    function applyFilters() {
        const { types, maxPrice, onlyAvailable, guestMin, search } = getFilters();
        const sortVal = sortSelect ? sortSelect.value : 'recommended';

        let filtered = roomsData.filter(room => {
            if (types.length && !types.some(t => room.type.includes(t))) return false;
            if (room.price > maxPrice) return false;
            if (onlyAvailable && !room.available) return false;
            if (room.capacity < guestMin) return false;
            if (search && !room.name.toLowerCase().includes(search) && !room.typeLabel.toLowerCase().includes(search)) return false;
            return true;
        });

        // Sort
        if (sortVal === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortVal === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortVal === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        currentRooms = filtered;
        renderRooms(filtered);
    }

    /* ── Reset Filters ── */
    function resetFilters() {
        document.querySelectorAll('[data-filter-type]').forEach(cb => { cb.checked = false; });
        const availableOnly = document.getElementById('availableOnly');
        if (availableOnly) availableOnly.checked = false;
        if (priceRange) {
            priceRange.value = 2500;
            if (priceMax) priceMax.textContent = '$2,500';
        }
        if (searchInput) searchInput.value = '';
        const guestFilter = document.getElementById('guestFilter');
        if (guestFilter) guestFilter.value = '1';
        if (sortSelect) sortSelect.value = 'recommended';
        currentRooms = [...roomsData];
        renderRooms(currentRooms);
    }

    /* ── URL Params → pre-fill filters ── */
    function initURLParams() {
        const params = new URLSearchParams(window.location.search);
        const guests = params.get('guests');

        if (guests) {
            const guestFilter = document.getElementById('guestFilter');
            if (guestFilter) guestFilter.value = guests;
        }

        if (guests) {
            applyFilters();
        }
    }

    /* ── Mobile Sidebar Toggle ── */
    function initMobileFilter() {
        if (!mobileFilterBtn || !filterSidebar) return;

        mobileFilterBtn.addEventListener('click', () => {
            const isOpen = filterSidebar.classList.toggle('mobile-open');
            mobileFilterBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            mobileFilterBtn.querySelector('.material-symbols-outlined').textContent = isOpen ? 'close' : 'tune';
        });
    }

    /* ── Price range live update ── */
    function initPriceRange() {
        if (!priceRange || !priceMax) return;
        priceRange.addEventListener('input', () => {
            priceMax.textContent = '$' + parseInt(priceRange.value, 10).toLocaleString();
        });
    }

    /* ── Event Listeners ── */
    function initListeners() {
        if (applyBtn) applyBtn.addEventListener('click', applyFilters);
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);

        // Live search
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchInput._debounce);
                searchInput._debounce = setTimeout(applyFilters, 300);
            });
        }
    }

    /* ── Init ── */
    document.addEventListener('DOMContentLoaded', async () => {
        renderLoading();
        initMobileFilter();
        initPriceRange();
        initListeners();

        // Fetch rooms from API
        roomsData = await fetchRooms();
        currentRooms = [...roomsData];

        renderRooms(roomsData);
        initURLParams();
    });

})();
