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
    track.addEventListener('mouseenter', () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        autoPlayTimer = null;
    });
    track.addEventListener('mouseleave', () => {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
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

    // Initialize search bar dates
    const checkIn = document.getElementById('homeCheckIn');
    const checkOut = document.getElementById('homeCheckOut');
    if (checkIn && checkOut) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        checkIn.value = today.toISOString().split('T')[0];
        checkOut.value = tomorrow.toISOString().split('T')[0];
        checkIn.min = today.toISOString().split('T')[0];
        checkOut.min = tomorrow.toISOString().split('T')[0];
        checkIn.addEventListener('change', () => {
            const nextDay = new Date(checkIn.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOut.value = nextDay.toISOString().split('T')[0];
            checkOut.min = nextDay.toISOString().split('T')[0];
        });
    }
});

// Add atmospheric micro-interactions
window.addEventListener('DOMContentLoaded', () => {
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
});

// Search functionality — redirect to rooms page with params
const searchButton = document.querySelector('button:has(span.material-symbols-outlined)');
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


