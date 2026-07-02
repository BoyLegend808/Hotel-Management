/**
 * Rooms & Suites Page — Lumina Hospitality
 * Handles: card rendering, filtering, sorting, search, mobile sidebar toggle.
 * No inline handlers — all listeners attached here.
 */

(function () {
    'use strict';

    /* ── Room Data ── */
    const roomsData = [
        {
            id: 1,
            name: 'Oceanview Executive Suite',
            type: 'suite',
            typeLabel: 'Premium Suite',
            price: 850,
            rating: 4.9,
            capacity: 2,
            available: true,
            details: '85 sqm · King Bed · Ocean Front · Private Balcony · Butler Service',
            tags: ['Free WiFi', 'Breakfast', 'Spa Access'],
            badge: 'primary',
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'
        },
        {
            id: 2,
            name: 'Urban Deluxe Suite',
            type: 'deluxe',
            typeLabel: 'Executive',
            price: 650,
            rating: 4.8,
            capacity: 2,
            available: true,
            details: '65 sqm · King Bed · City View · Workspace · Mini Bar',
            tags: ['Free WiFi', 'Breakfast', 'Gym Access'],
            badge: 'accent',
            image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'
        },
        {
            id: 3,
            name: 'Panoramic Family Suite',
            type: 'family',
            typeLabel: 'Family Suite',
            price: 1200,
            rating: 4.9,
            capacity: 4,
            available: true,
            details: '120 sqm · 2 Bedrooms · Kitchenette · Balcony · Connecting Rooms',
            tags: ['Free WiFi', 'Breakfast', 'Kitchen'],
            badge: 'primary',
            image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80'
        },
        {
            id: 4,
            name: 'Presidential Ocean Suite',
            type: 'presidential',
            typeLabel: 'Presidential',
            price: 2500,
            rating: 5.0,
            capacity: 2,
            available: true,
            details: '200 sqm · Private Terrace · Butler Service · Jacuzzi · Premium Amenities',
            tags: ['All Inclusive', 'VIP Service', 'Airport Transfer'],
            badge: 'accent',
            image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
        },
        {
            id: 5,
            name: 'Garden Retreat Room',
            type: 'deluxe',
            typeLabel: 'Garden View',
            price: 450,
            rating: 4.7,
            capacity: 2,
            available: true,
            details: '45 sqm · Queen Bed · Garden Access · Pool View · Terrace',
            tags: ['Free WiFi', 'Breakfast', 'Pool Access'],
            badge: 'primary',
            image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'
        },
        {
            id: 6,
            name: 'Executive Studio',
            type: 'studio',
            typeLabel: 'Studio',
            price: 380,
            rating: 4.6,
            capacity: 2,
            available: true,
            details: '40 sqm · King Bed · Kitchenette · Work Area · Extended Stay',
            tags: ['Free WiFi', 'Kitchen', 'Weekly Rates'],
            badge: 'accent',
            image: 'https://images.unsplash.com/photo-1522708323590-d24dbb1b0267?w=800&q=80'
        }
    ];

    /* ── State ── */
    let currentRooms = [...roomsData];

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

        grid.innerHTML = rooms.map(room => `
            <article class="room-card reveal" role="listitem">
                <div class="room-card-media">
                    <img src="${room.image}" alt="${room.name}" loading="lazy"/>
                    <div class="room-card-media-overlay"></div>
                    <span class="room-card-badge ${room.badge}">${room.typeLabel}</span>
                    <div class="room-card-rating">
                        <span class="material-symbols-outlined filled">star</span>
                        ${room.rating.toFixed(1)}
                    </div>
                    <div class="room-card-price">
                        $${room.price.toLocaleString()} <span>/ night</span>
                    </div>
                </div>
                <div class="room-card-body">
                    <h3 class="room-card-name">${room.name}</h3>
                    <p class="room-card-details">${room.details}</p>
                    <div class="room-card-tags">
                        ${room.tags.map(t => `<span class="room-tag">${t}</span>`).join('')}
                    </div>
                    <div class="room-card-actions">
                        <a href="/pages/hotel/room-detail-lumina/room-detail-lumina.html?id=${room.id}" class="btn btn-primary">View Details</a>
                        <a href="/pages/hotel/booking-your-stay/booking-your-stay.html?roomId=${room.id}" class="btn btn-outline-primary">Book Now</a>
                    </div>
                </div>
            </article>
        `).join('');

        // Trigger scroll reveal on newly rendered cards
        requestAnimationFrame(() => {
            document.querySelectorAll('#roomCardGrid .reveal').forEach(el => {
                el.classList.add('visible');
            });
        });
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
        const checkIn = params.get('checkIn');
        const checkOut = params.get('checkOut');
        const guests = params.get('guests');

        if (guests) {
            const guestFilter = document.getElementById('guestFilter');
            if (guestFilter) guestFilter.value = guests;
        }

        if (checkIn || checkOut || guests) {
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
    document.addEventListener('DOMContentLoaded', () => {
        renderRooms(roomsData);
        initURLParams();
        initMobileFilter();
        initPriceRange();
        initListeners();
    });

})();
