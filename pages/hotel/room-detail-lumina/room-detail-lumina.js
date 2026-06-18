// Lumina Hospitality - Room Detail Page JavaScript

// Sample room data (will be replaced with API calls)
const roomData = {
    id: 1,
    name: "Azure Ocean Suite",
    rating: 4.9,
    reviewCount: 124,
    price: 450,
    description: "Experience unparalleled luxury in our Azure Ocean Suite. Designed for discerning guests who appreciate the finer things, this suite offers a breathtaking 180-degree view of the coastline. The interior features bespoke furnishings from Italian artisans, integrated smart-home technology, and a private terrace for evening cocktails. Whether you're here for a romantic getaway or executive retreat, the Lumina experience ensures every detail is mastered.",
    maxOccupancy: 4,
    totalArea: 1200,
    bedding: "1 King, 1 Sofa",
    images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzzZYHtqR003gLo_fXte54QqlQlBOqnL294c2nBSU1aGKXjYPDQLHXQ3jm4CP3t_y1DF3CBBGORVAggDzPGDQI_VfXK8kRugK1syJ2gC8g1RTIo4nPhNho0E9gTq0Y_FFMymQzFvysIqnURv67laPRxj_PNIUx-OA07komn3cC7LlPMnfEThCTpsD2FTbadifji6VWd3OlX3zRN2x11MbAc_gCZvgkntr1zSUjofFdomWtfRv5wjTSPHM3NK1qcI3UPm19w27u80",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBWxY5ZPRO7TeOXaoemVBAA4izE0emvE3963Km0aT5oUVqCr_0JufqE3FMGnFvYNmpC9uRJTvr1dgc19vPU_NQBJA7gE8hklTdYvUS6lXsB7VF84DV3SJR4GAXyFFk0_nwj_ZODR2HBlADLGOzFzGB3sVEC8eE9nOd35dtTLStmhz1z2yECDGKdkYV10S9w_jV7U2vJV4_S6_UAYq-fk_sndCj-ybLBLR24FjefY2W-78hv3zp43GEBZig5x6Cft4gvOzVQNUUdlhE",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAPjLKPRMMmdtyQedv1d3GKRg8KXW2e2vwTLZw6F3YFndLmv-wWt_d6xGJlam5rr6SSrAiHNoYXfxXHEzpbVN--RGanF368jmVldvx-CIs-CUZDDCN5aLd_vEtI6iwGiaYGc-FymQlOuo9uRspyVttrbt8noZrBDoHqygWK5Inh6ZS7QX2hkju2wE5PcGMsfrw8LxGpuiRU0H5JQJv1PGXUJosfS0G5VGNeOcPZ4FUIi6dCuDmr-7DrmlskysX-zCKhehpzKhsjo1g"
    ],
    amenities: [
        { icon: "wifi", label: "Gigabit Wi-Fi" },
        { icon: "pool", label: "Private Pool" },
        { icon: "coffee_maker", label: "Nespresso Bar" },
        { icon: "ac_unit", label: "Climate Control" },
        { icon: "room_service", label: "24/7 Concierge" },
        { icon: "workspace_premium", label: "Work Station" }
    ]
};

// Render gallery
function renderGallery(images) {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = `
        <div class="relative group cursor-pointer overflow-hidden row-span-2">
            <img alt="Main Suite View" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${images[0]}"/>
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        ${images.slice(1).map(img => `
            <div class="relative group cursor-pointer overflow-hidden">
                <img alt="Room detail" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${img}"/>
            </div>
        `).join('')}
    `;
}

// Render amenities
function renderAmenities(amenities) {
    const amenitiesGrid = document.getElementById('amenitiesGrid');
    if (!amenitiesGrid) return;
    
    amenitiesGrid.innerHTML = amenities.map(amenity => `
        <div class="glass-card p-md rounded-xl flex items-center gap-md animate-hover">
            <span class="material-symbols-outlined text-primary text-[28px]">${amenity.icon}</span>
            <span class="font-button text-button">${amenity.label}</span>
        </div>
    `).join('');
}

// Update room details
function updateRoomDetails(room) {
    document.getElementById('roomName').textContent = room.name;
    document.getElementById('roomRating').textContent = `${room.rating} (${room.reviewCount} Reviews)`;
    document.getElementById('roomPrice').textContent = `$${room.price}`;
    document.getElementById('mobilePrice').textContent = `$${room.price}`;
    document.getElementById('roomDescription').textContent = room.description;
    document.getElementById('maxOccupancy').textContent = `${room.maxOccupancy} Guests`;
    document.getElementById('totalArea').textContent = `${room.totalArea} sq. ft`;
    document.getElementById('bedding').textContent = room.bedding;
}

// Book now function
function bookNow() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id') || roomData.id;
    window.location.href = `/pages/hotel/booking/?roomId=${roomId}`;
}

// Go back function
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/pages/hotel/rooms/';
    }
}

// Micro-interaction for gallery images
document.querySelectorAll('.gallery-grid > div').forEach(card => {
    card.addEventListener('mousedown', () => {
        card.style.transform = 'scale(0.98)';
    });
    card.addEventListener('mouseup', () => {
        card.style.transform = 'scale(1)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
    });
});

// Simple scroll effect for Top Bar
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        if (window.scrollY > 20) {
            header.classList.add('shadow-md');
        } else {
            header.classList.remove('shadow-md');
        }
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    // In a real app, you would fetch room data from API
    // For now, use sample data
    updateRoomDetails(roomData);
    renderGallery(roomData.images);
    renderAmenities(roomData.amenities);
    
    if (roomId) {
        console.log(`Loading room details for ID: ${roomId}`);
    }
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
