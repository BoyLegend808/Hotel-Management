// Lumina Hospitality - Home Page JavaScript

// Carousel functionality
let currentSlide = 0;
const track = document.getElementById('hero-carousel');
const slides = track ? track.children.length : 0;

function moveCarousel(direction) {
    if (!track) return;
    currentSlide = (currentSlide + direction + slides) % slides;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Auto-play carousel
let autoPlayTimer = null;
if (slides > 0) {
    autoPlayTimer = setInterval(() => {
        moveCarousel(1);
    }, 6000);
}

// Pause auto-play on hover
if (track) {
    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', () => {
        autoPlayTimer = setInterval(() => moveCarousel(1), 6000);
    });
}

// Simple Fade-in animation on load
window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-in';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// Add atmospheric micro-interactions
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousedown', () => {
        card.style.transform = 'scale(0.98) translateY(0px)';
    });
    card.addEventListener('mouseup', () => {
        card.style.transform = '';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// Search functionality — redirect to rooms page with params
const searchButton = document.querySelector('button.bg-primary');
if (searchButton) {
    searchButton.addEventListener('click', () => {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const guestSelect = document.querySelector('select');

        const checkIn = dateInputs[0] ? dateInputs[0].value : '';
        const checkOut = dateInputs[1] ? dateInputs[1].value : '';
        const guests = guestSelect ? guestSelect.value : '';

        if (checkIn && checkOut) {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (checkOutDate <= checkInDate) {
                showToast('Check-out date must be after check-in date', 'error');
                return;
            }
        }

        const params = new URLSearchParams();
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        if (guests) params.set('guests', guests);

        window.location.href = `/pages/hotel/rooms-lumina/${params.toString() ? '?' + params.toString() : ''}`;
    });
}

// Mobile menu toggle (hamburger icon)
const menuButton = document.querySelector('.material-symbols-outlined.lg\\:hidden, .material-symbols-outlined.cursor-pointer');
if (menuButton && menuButton.textContent.trim() === 'menu') {
    menuButton.addEventListener('click', () => {
        showToast('Mobile menu coming soon', 'info');
    });
}

// Mobile bottom nav click handlers
document.querySelectorAll('nav.md\\:hidden a, nav a').forEach(link => {
    // links already have href, nothing to do
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
