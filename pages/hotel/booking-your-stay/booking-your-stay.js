// Lumina Hospitality - Booking Page JavaScript

let currentStep = 1;
let selectedRoom = null;
let bookingData = {
    checkIn: null,
    checkOut: null,
    guests: 2,
    roomId: null,
    guestName: '',
    guestEmail: '',
    guestPhone: ''
};

// Sample room data for selection
const availableRooms = [
    {
        id: 1,
        name: "The Horizon Loft",
        type: "EXECUTIVE SUITE",
        price: 450,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxi0wjU6aLr44vsc3N063QAcEDEQM9Cv_MImZtSci66HzHWmuEI1UYwKsCF6sUkq7G7qaH5JuacNzh_a81nzUGG9tWMl1uHBWxh-tPU8Uspt_ZTciCarVyGerQz9D-BYgOpSZd3Bxb_Dbe82m11YHPJ3AAJy2UaIbgLrxaSbgdEwnisnNrfgsNIar8UbY0-W34S7O9PUWpMETQPAWpwtWwog5Jle5uvR_PYQTpIkch7nhIkiIKeFbPTwihSWHciu0v75ouoFScCXQ",
        description: "Expansive 80sqm space with panoramic views"
    },
    {
        id: 2,
        name: "Royal Heritage Room",
        type: "DELUXE KING",
        price: 320,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC19eUlmgJWbWeAf0lnzVzsqE5UlsJ7Nqr5b0gy5DSaxM-PHFp3X3lGJ-Cg_DI4RK5YfJAkZcWkRUyRnpMwo41TKGXCxQF2yE827K3OP07qsBfTUB-c9yFRfg8QYFKv6xa-BT7p3QmtSKH5RbdxoLZw8cf4AR-PuqZo3oN7XV22ETDR312PkUsk8mf3gIaZ6wXO0MZjEfxOygHvOeRKY6-wFN0Byvz9XIYOcq9y7EfTlohzCWKQRm_prBdoux9YheMj3IwqrZcLE4Q",
        description: "Classic elegance meets modern amenities"
    },
    {
        id: 3,
        name: "Azure Pool Villa",
        type: "VIP SANCTUARY",
        price: 890,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm7EtnzitMANt2-UME2fY9aLJLCkLdpGi8ka-IvidgCJCvI2U_rFfVpGyPj16jGngYysv4mEBbfQs2WZrVtNK8RIly3Nl2fS5ZiR6plduwT-gc-N_o__ARr4HWaV7Xo3oDemGtCQEuPHX40_8QIfqtn4ga7MgAcgUkcA35dWHsB6vjnNcYujTzTyZWZQyZuNjmpwgfQ6Ur-_qA7H-dS5gnPJcRVISF7LgiTJKzSqj6P_roE7l3B6w5hQrCxM5Xtn0Q_6jX11QJrkw",
        description: "Private heated infinity pool and 24-hour butler"
    }
];

// Navigate between steps
function goToStep(step) {
    // Validate current step before moving
    if (step > currentStep) {
        if (!validateStep(currentStep)) {
            return;
        }
    }

    // Hide all steps
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');

    // Show target step
    document.getElementById(`step${step}`).classList.remove('hidden');

    // Update progress indicators
    updateProgressIndicators(step);

    currentStep = step;

    // Load step-specific data
    if (step === 2) {
        loadRoomSelection();
    } else if (step === 3) {
        loadOrderSummary();
    }
}

// Update progress indicators
function updateProgressIndicators(step) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step${i}-indicator`);
        const label = document.getElementById(`step${i}-label`);
        
        if (i < step) {
            // Completed steps
            indicator.classList.remove('bg-outline-variant', 'text-on-surface-variant');
            indicator.classList.add('bg-primary', 'text-white');
            if (label) {
                label.classList.remove('text-on-surface-variant');
                label.classList.add('text-primary', 'font-bold');
            }
        } else if (i === step) {
            // Current step
            indicator.classList.remove('bg-outline-variant', 'text-on-surface-variant');
            indicator.classList.add('bg-primary', 'text-white');
            if (label) {
                label.classList.remove('text-on-surface-variant');
                label.classList.add('text-primary', 'font-bold');
            }
        } else {
            // Future steps
            indicator.classList.remove('bg-primary', 'text-white');
            indicator.classList.add('bg-outline-variant', 'text-on-surface-variant');
            if (label) {
                label.classList.remove('text-primary', 'font-bold');
                label.classList.add('text-on-surface-variant');
            }
        }
    }

    // Update progress bars
    if (step >= 2) {
        document.getElementById('progress1').classList.remove('bg-outline-variant');
        document.getElementById('progress1').classList.add('bg-primary');
    }
    if (step >= 3) {
        document.getElementById('progress2').classList.remove('bg-outline-variant');
        document.getElementById('progress2').classList.add('bg-primary');
    }
}

// Validate current step
function validateStep(step) {
    if (step === 1) {
        const checkIn = document.getElementById('checkInDate').value;
        const checkOut = document.getElementById('checkOutDate').value;
        
        if (!checkIn || !checkOut) {
            showToast('Please select check-in and check-out dates', 'error');
            return false;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        if (checkOutDate <= checkInDate) {
            showToast('Check-out date must be after check-in date', 'error');
            return false;
        }

        bookingData.checkIn = checkIn;
        bookingData.checkOut = checkOut;
        bookingData.guests = parseInt(document.getElementById('guestCount').value);
    } else if (step === 2) {
        if (!selectedRoom) {
            showToast('Please select a room', 'error');
            return false;
        }
        bookingData.roomId = selectedRoom.id;
    }

    return true;
}

// Load room selection
function loadRoomSelection() {
    const roomSelection = document.getElementById('roomSelection');
    if (!roomSelection) return;

    roomSelection.innerHTML = availableRooms.map(room => `
        <div class="room-option ${selectedRoom && selectedRoom.id === room.id ? 'selected' : ''}" onclick="selectRoom(${room.id})">
            <img src="${room.image}" alt="${room.name}" class="w-full h-32 object-cover rounded-lg mb-md"/>
            <h4 class="font-h3 text-h3 mb-sm">${room.name}</h4>
            <p class="text-body-sm text-on-surface-variant mb-sm">${room.type}</p>
            <div class="flex justify-between items-center">
                <span class="font-bold text-primary">$${room.price}/night</span>
                <span class="text-body-sm text-on-surface-variant">${room.description}</span>
            </div>
        </div>
    `).join('');
}

// Select room
function selectRoom(roomId) {
    selectedRoom = availableRooms.find(room => room.id === roomId);
    loadRoomSelection();
}

// Load order summary
function loadOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary || !selectedRoom) return;

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomTotal = selectedRoom.price * nights;
    const tax = roomTotal * 0.1;
    const total = roomTotal + tax;

    orderSummary.innerHTML = `
        <div class="order-item">
            <span class="text-body-md">${selectedRoom.name}</span>
            <span class="text-body-md">$${selectedRoom.price} x ${nights} nights</span>
        </div>
        <div class="order-item">
            <span class="text-body-md">Room Total</span>
            <span class="text-body-md">$${roomTotal.toFixed(2)}</span>
        </div>
        <div class="order-item">
            <span class="text-body-md">Tax (10%)</span>
            <span class="text-body-md">$${tax.toFixed(2)}</span>
        </div>
        <div class="order-total">
            <span class="text-h3">Total</span>
            <span class="text-h3 text-primary">$${total.toFixed(2)}</span>
        </div>
    `;
}

// Complete booking
function completeBooking() {
    // Validate payment information
    const guestName = document.getElementById('guestName').value;
    const guestEmail = document.getElementById('guestEmail').value;
    const guestPhone = document.getElementById('guestPhone').value;
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const cardName = document.getElementById('cardName').value;

    if (!guestName || !guestEmail || !guestPhone) {
        showToast('Please fill in all guest information', 'error');
        return;
    }

    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        showToast('Please fill in all payment information', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Save booking data
    bookingData.guestName = guestName;
    bookingData.guestEmail = guestEmail;
    bookingData.guestPhone = guestPhone;

    // Simulate booking submission
    showToast('Processing your booking...', 'info');

    setTimeout(() => {
        showToast('Booking confirmed! Check your email for details.', 'success');
        // Redirect to confirmation page or dashboard
        setTimeout(() => {
            window.location.href = '/pages/hotel/guest-dashboard/';
        }, 2000);
    }, 2000);
}

// Go back function
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/pages/hotel/rooms/';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    
    if (roomId) {
        // Pre-select room if coming from room detail page
        const room = availableRooms.find(r => r.id === parseInt(roomId));
        if (room) {
            selectedRoom = room;
        }
    }

    // Set minimum date for check-in (today)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInDate').setAttribute('min', today);
    document.getElementById('checkOutDate').setAttribute('min', today);
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
