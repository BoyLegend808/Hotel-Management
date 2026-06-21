// Lumina Hospitality - Rooms Page JavaScript

// Sample room data (will be replaced with API calls)
const roomsData = [
    {
        id: 1,
        name: "The Horizon Loft",
        type: "EXECUTIVE SUITE",
        price: 450,
        rating: 4.9,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxi0wjU6aLr44vsc3N063QAcEDEQM9Cv_MImZtSci66HzHWmuEI1UYwKsCF6sUkq7G7qaH5JuacNzh_a81nzUGG9tWMl1uHBWxh-tPU8Uspt_ZTciCarVyGerQz9D-BYgOpSZd3Bxb_Dbe82m11YHPJ3AAJy2UaIbgLrxaSbgdEwnisnNrfgsNIar8UbY0-W34S7O9PUWpMETQPAWpwtWwog5Jle5uvR_PYQTpIkch7nhIkiIKeFbPTwihSWHciu0v75ouoFScCXQ",
        description: "Expansive 80sqm space with panoramic views, smart automation, and designer furnishings.",
        capacity: 2,
        amenities: ["wifi", "group"],
        amenityLabels: ["Ultra Fast", "2 Guests"]
    },
    {
        id: 2,
        name: "Royal Heritage Room",
        type: "DELUXE KING",
        price: 320,
        rating: 4.8,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC19eUlmgJWbWeAf0lnzVzsqE5UlsJ7Nqr5b0gy5DSaxM-PHFp3X3lGJ-Cg_DI4RK5YfJAkZcWkRUyRnpMwo41TKGXCxQF2yE827K3OP07qsBfTUB-c9yFRfg8QYFKv6xa-BT7p3QmtSKH5RbdxoLZw8cf4AR-PuqZo3oN7XV22ETDR312PkUsk8mf3gIaZ6wXO0MZjEfxOygHvOeRKY6-wFN0Byvz9XIYOcq9y7EfTlohzCWKQRm_prBdoux9YheMj3IwqrZcLE4Q",
        description: "Classic elegance meets modern amenities in our most requested heritage wing chamber.",
        capacity: 2,
        amenities: ["group", "coffee"],
        amenityLabels: ["2 Guests", "Nespresso"]
    },
    {
        id: 3,
        name: "Azure Pool Villa",
        type: "VIP SANCTUARY",
        price: 890,
        rating: 5.0,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm7EtnzitMANt2-UME2fY9aLJLCkLdpGi8ka-IvidgCJCvI2U_rFfVpGyPj16jGngYysv4mEBbfQs2WZrVtNK8RIly3Nl2fS5ZiR6plduwT-gc-N_o__ARr4HWaV7Xo3oDemGtCQEuPHX40_8QIfqtn4ga7MgAcgUkcA35dWHsB6vjnNcYujTzTyZWZQyZuNjmpwgfQ6Ur-_qA7H-dS5gnPJcRVISF7LgiTJKzSqj6P_roE7l3B6w5hQrCxM5Xtn0Q_6jX11QJrkw",
        description: "The ultimate in privacy featuring a private heated infinity pool and 24-hour butler service.",
        capacity: 2,
        amenities: ["pool", "person_celebrate"],
        amenityLabels: ["Private Pool", "Butler"]
    },
    {
        id: 4,
        name: "The Industrial Loft",
        type: "URBAN STUDIO",
        price: 210,
        rating: 4.7,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfxHE8EtEkaf7zGr0INy2_PIa2VHS32zPM2WmHK5Igl1nmnAEof5EPz_EtaFkzrV4Ghx_yXK0dZOGne1Gul8SHRguyJDDcs4edywvKMfzwiAyfaFCu5dG3DfXjnJ53aaOZJ7Lv8wqPaJMV0rJtm27SylpshsxyJAVwm3H1g1CW-atuzh6EIWzjhJskxb0NVCANxiyvKFlZm3PtVuiLfyg26UC6Sv_5tk1Z7c31xe3i5bB7jujhRPaRVwhX3YpSEhgYfYe7Qrlictg",
        description: "Modern industrial design for the business traveler who appreciates raw aesthetics and function.",
        capacity: 2,
        amenities: ["desk", "fitness_center"],
        amenityLabels: ["Work Station", "Gym Access"]
    },
    {
        id: 5,
        name: "Peak View Cabin",
        type: "ALPINE ESCAPE",
        price: 560,
        rating: 4.9,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFxkqrMt1GmGKYJfSCYgn2H9WMZPlWKbl9yci7Od6p9ffT5HLYaa-PVV0axf5LuGH0llQ-KVbi9U1ykms8W1XA3FxCW1xohYWvWj60itCEftceR-oWaNVplq5F_N0XiJv6rtew0vEhBUNNiDe5tc7tRVgLNiUTyzLQw0U35mixv6iYWwVnfmHiddZ_xqrOp5N1lbICmjaqaJzVY8xph-SquNuOhPboIApwyUqu5NcTkPuq1acgjdLjqvGXdqlOPvuiadiJcynNnzI",
        description: "Experience mountain luxury with a real wood fireplace and private terrace overlooking the peaks.",
        capacity: 2,
        amenities: ["fireplace", "spa"],
        amenityLabels: ["Fireplace", "Private Spa"]
    }
];

// Render room cards
function renderRooms(rooms) {
    const roomGrid = document.getElementById('roomGrid');
    if (!roomGrid) return;
    
    roomGrid.innerHTML = rooms.map(room => `
        <div class="room-card-overlay">
            <div class="card-img">
                <img src="${room.image}" alt="${room.name}" loading="lazy"/>
                <div class="img-overlay"></div>
                <div class="rating-badge">
                    <span class="material-symbols-outlined" style="font-size:14px; font-variation-settings:'FILL' 1;">star</span>
                    ${room.rating}
                </div>
                <div class="type-badge">${room.type}</div>
                <div class="price-float">$${room.price}<span style="font-size:0.65rem;font-weight:400;opacity:0.8"> / night</span></div>
            </div>
            <div class="card-body">
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="flex items-center gap-md mb-[0.75rem]">
                    ${room.amenities.map((amenity, index) => `
                        <div class="flex items-center gap-xs text-on-surface-variant" style="font-size:0.75rem">
                            <span class="material-symbols-outlined" style="font-size:16px">${amenity}</span>
                            <span>${room.amenityLabels[index]}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="card-actions">
                    <a class="btn-details" href="/pages/hotel/room-detail-lumina/?id=${room.id}">View Details</a>
                    <a class="btn-book-card" href="/pages/hotel/booking-your-stay/?roomId=${room.id}">Book Now</a>
                </div>
            </div>
        </div>
    `).join('');
}

// View room details
function viewRoomDetails(roomId) {
    window.location.href = `/pages/hotel/room-detail-lumina/?id=${roomId}`;
}

// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.getElementById('closeSidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });
}

if (closeSidebar && sidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
    });
}

// Filter functionality
const filterButtons = document.querySelectorAll('.glass-card button');
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (button.classList.contains('p-sm')) {
            // Occupancy filter
            const buttons = button.parentElement.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
            });
            button.classList.add('bg-primary', 'text-white');
        }
    });
});

// Sort dropdown toggle
const sortButton = document.getElementById('sortButton');
const sortDropdown = document.getElementById('sortDropdown');
if (sortButton && sortDropdown) {
    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => sortDropdown.classList.add('hidden'));
    document.querySelectorAll('.sort-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const sortBy = opt.dataset.sort;
            sortButton.innerHTML = `<span class="material-symbols-outlined text-[18px]">sort</span> Sort by: ${opt.textContent}`;
            sortDropdown.classList.add('hidden');
            let sorted = [...roomsData];
            if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
            else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
            else if (sortBy === 'rating') sorted.sort((a, b) => b.rating - a.rating);
            else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
            renderRooms(sorted);
        });
    });
}

// Apply Filters button
const applyFilters = document.querySelector('.glass-card .bg-primary.text-white');
if (applyFilters) {
    applyFilters.addEventListener('click', () => {
        const selectedOccupancy = document.querySelector('.grid-cols-4 .bg-primary');
        const amenityChecks = document.querySelectorAll('.space-y-sm input[type="checkbox"]:checked');
        const selectedAmenities = Array.from(amenityChecks).map(cb => cb.nextElementSibling.textContent.trim());

        let filtered = [...roomsData];

        if (selectedOccupancy) {
            const cap = parseInt(selectedOccupancy.textContent.replace('+', ''), 10);
            filtered = filtered.filter(r => r.capacity >= cap);
        }

        if (selectedAmenities.length > 0) {
            filtered = filtered.filter(r =>
                selectedAmenities.some(a =>
                    r.amenityLabels.some(l => l.toLowerCase().includes(a.toLowerCase()))
                )
            );
        }

        renderRooms(filtered);
        showToast(`Showing ${filtered.length} room(s)`, 'info');
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Try to load rooms from API, fall back to static data
    try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
            const data = await res.json();
            if (data.rooms && data.rooms.length > 0) {
                renderRooms(data.rooms);
            } else {
                renderRooms(roomsData);
            }
        } else {
            renderRooms(roomsData);
        }
    } catch (err) {
        renderRooms(roomsData);
    }
    
    // Get search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const checkIn = urlParams.get('checkIn');
    const checkOut = urlParams.get('checkOut');
    
    if (checkIn && checkOut) {
        showToast(`Searching rooms: ${checkIn} → ${checkOut}`, 'info');
    }
});

