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
if (slides > 0) {
    setInterval(() => {
        moveCarousel(1);
    }, 6000);
}

// Simple Fade-in animation on load
window.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease-in';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});

// Add atmospheric micro-interactions
const cards = document.querySelectorAll('.glass-card');
cards.forEach(card => {
    card.addEventListener('mousedown', () => {
        card.style.transform = 'scale(0.98) translateY(0px)';
    });
    card.addEventListener('mouseup', () => {
        card.style.transform = 'scale(1) translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1) translateY(0px)';
    });
});

// Search functionality
const searchButton = document.querySelector('button span.material-symbols-outlined').parentElement;
if (searchButton) {
    searchButton.addEventListener('click', () => {
        const checkIn = document.querySelector('input[type="date"]:first-of-type');
        const checkOut = document.querySelector('input[type="date"]:last-of-type');
        const guests = document.querySelector('select');
        
        if (checkIn && checkOut && guests) {
            // Validate dates
            const checkInDate = new Date(checkIn.value);
            const checkOutDate = new Date(checkOut.value);
            
            if (checkOutDate <= checkInDate) {
                showToast('Check-out date must be after check-in date', 'error');
                return;
            }
            
            // Redirect to rooms page with search parameters
            const params = new URLSearchParams({
                checkIn: checkIn.value,
                checkOut: checkOut.value,
                guests: guests.value
            });
            
            window.location.href = `/pages/hotel/rooms/?${params.toString()}`;
        }
    });
}

// Mobile menu toggle
const menuButton = document.querySelector('.material-symbols-outlined.text-primary.cursor-pointer');
if (menuButton) {
    menuButton.addEventListener('click', () => {
        showToast('Mobile menu coming soon', 'info');
    });
}

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
