// Lumina Ultra - Homepage Luxury JS

// --- Header Transition Logic ---
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.remove('header-transparent');
    } else {
        header.classList.add('header-transparent');
    }
});

// --- Reveal on Scroll Animation ---
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// --- Hero Carousel Logic ---
let currentSlide = 0;
const track = document.getElementById('hero-slider');
const slides = track ? track.children : [];
const totalSlides = slides.length;

function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update indicators
    document.querySelectorAll('[data-slide]').forEach((btn, i) => {
        btn.classList.toggle('bg-white', i === currentSlide);
        btn.classList.toggle('bg-white/50', i !== currentSlide);
    });
}

function moveCarousel(direction) { 
    goToSlide(currentSlide + direction); 
}

let autoPlayTimer = null;
if (totalSlides > 0) {
    // Setup navigation buttons
    const prevBtn = document.querySelector('[class*="chevron_left"]')?.parentElement;
    const nextBtn = document.querySelector('[class*="chevron_right"]')?.parentElement;
    
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    
    // Setup indicators
    document.querySelectorAll('[data-slide]').forEach((btn, i) => {
        btn.addEventListener('click', () => goToSlide(i));
    });
    
    // Auto-play
    autoPlayTimer = setInterval(() => moveCarousel(1), 6000);
    
    // Initialize first slide indicator
    goToSlide(0);
}

// --- Asymmetric Room Grid ---
const roomsData = [
    { id: 1, name: "The Horizon Loft", type: "EXECUTIVE SUITE", price: 450, rating: 4.9, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80", description: "Expansive 80sqm space with panoramic views and designer furnishings." },
    { id: 2, name: "Royal Heritage Room", type: "DELUXE KING", price: 320, rating: 4.8, image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80", description: "Classic elegance meets modern amenities in our heritage wing." },
    { id: 3, name: "Azure Pool Villa", type: "VIP SANCTUARY", price: 890, rating: 5.0, image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", description: "Private heated infinity pool and 24-hour butler service." }
];

function renderLuxuryRooms() {
    const grid = document.getElementById('roomGrid');
    if (!grid) return;
    
    grid.innerHTML = roomsData.map((room, index) => {
        const isLarge = index === 0; // First room gets more space
        return `
        <div class="reveal ${isLarge ? 'md:col-span-7' : 'md:col-span-5'} group cursor-pointer" style="transition-delay: ${index * 0.2}s">
            <div class="relative overflow-hidden rounded-2xl shadow-lg">
                <img src="${room.image}" alt="${room.name}" class="img-editorial w-full h-full object-cover aspect-[${isLarge ? '4/3' : '3/4'}]" />
                <div class="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                    ${room.type}
                </div>
                <div class="absolute bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold">
                    $${room.price} / night
                </div>
            </div>
            <div class="mt-6">
                <h3 class="text-luxury-h2 text-xl mb-2 group-hover:text-primary transition-colors">${room.name}</h3>
                <p class="text-luxury-body text-sm line-clamp-2 mb-4">${room.description}</p>
                <a href="/pages/hotel/room-detail-lumina/?id=${room.id}" class="text-xs uppercase tracking-widest font-bold text-primary hover:text-secondary transition-colors">View Details →</a>
            </div>
        </div>
    `}).join('');
}

// Search
function searchRooms() {
    const ci = document.getElementById('homeCheckIn');
    const co = document.getElementById('homeCheckOut');
    const params = new URLSearchParams();
    if (ci && ci.value) params.set('checkIn', ci.value);
    if (co && co.value) params.set('checkOut', co.value);
    window.location.href = `/pages/hotel/rooms-lumina/${params.toString() ? '?' + params.toString() : ''}`;
}

// Mobile menu
document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('mobileMenu')?.classList.toggle('hidden');
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderLuxuryRooms();
    
    // Initialize dates
    const ci = document.getElementById('homeCheckIn');
    const co = document.getElementById('homeCheckOut');
    if (ci && co) {
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        ci.value = today.toISOString().split('T')[0];
        co.value = tomorrow.toISOString().split('T')[0];
        ci.min = today.toISOString().split('T')[0];
        co.min = tomorrow.toISOString().split('T')[0];
    }
});
