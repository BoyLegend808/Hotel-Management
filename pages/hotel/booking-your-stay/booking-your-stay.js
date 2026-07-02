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

// Navigate between steps (kept for backward compat, delegation below)
function nextStep(step) {
    goToStep(step);
}

function goToStep(step) {
    // Validate current step before moving
    if (step > currentStep) {
        if (!validateStep(currentStep)) {
            return;
        }
    }

    // Hide all steps with beautiful transition
    [1, 2, 3].forEach(i => {
        const el = document.getElementById(`step-${i}`);
        if (el) {
            if (i === step) {
                // Show target step
                el.classList.remove('opacity-0', 'translate-x-20', 'pointer-events-none', 'absolute', 'top-0', 'left-0', 'w-full');
                el.classList.add('opacity-100', 'translate-x-0');
            } else {
                // Hide other steps
                el.classList.remove('opacity-100', 'translate-x-0');
                el.classList.add('opacity-0', 'translate-x-20', 'pointer-events-none', 'absolute', 'top-0', 'left-0', 'w-full');
            }
        }
    });

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
        const indicator = document.getElementById(`step-${i}-indicator`);
        
        if (indicator) {
            if (i <= step) {
                // Completed and Current steps
                indicator.classList.remove('bg-surface-container-highest', 'text-on-surface-variant');
                indicator.classList.add('bg-primary', 'text-on-primary', 'shadow-lg', 'scale-110');
            } else {
                // Future steps
                indicator.classList.remove('bg-primary', 'text-on-primary', 'shadow-lg', 'scale-110');
                indicator.classList.add('bg-surface-container-highest', 'text-on-surface-variant');
            }
        }
    }

    // Update progress bar width
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.style.width = step === 1 ? '33%' : step === 2 ? '66%' : '100%';
    }
}

// Validate current step with enhanced validation
function validateStep(step) {
    if (step === 1) {
        const checkIn = document.getElementById('checkin').value;
        const checkOut = document.getElementById('checkout').value;
        
        if (!checkIn || !checkOut) {
            showFieldError('checkin', 'Please select check-in and check-out dates');
            return false;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            showFieldError('checkin', 'Check-in date cannot be in the past');
            return false;
        }
        
        if (checkOutDate <= checkInDate) {
            showFieldError('checkout', 'Check-out date must be after check-in date');
            return false;
        }

        const maxNights = 30;
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        if (nights > maxNights) {
            showFieldError('checkout', `Maximum stay is ${maxNights} nights`);
            return false;
        }

        bookingData.checkIn = checkIn;
        bookingData.checkOut = checkOut;
        bookingData.guests = 2;
        clearFieldErrors();
    } else if (step === 2) {
        if (!selectedRoom) {
            showToast('Please select a room', 'error');
            return false;
        }
        bookingData.roomId = selectedRoom.id;
    } else if (step === 3) {
        const cardName = document.querySelector('input[placeholder="Name on Card"]').value;
        const cardNumber = document.querySelector('input[placeholder="Card Number"]').value;
        const cardExpiry = document.querySelector('input[placeholder="Expiry (MM/YY)"]').value;
        const cardCvc = document.querySelector('input[placeholder="CVC"]').value;

        if (!cardName || cardName.trim().length < 2) {
            showFieldError('cardName', 'Please enter cardholder name');
            return false;
        }

        if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showFieldError('cardNumber', 'Please enter a valid 16-digit card number');
            return false;
        }

        if (!cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
            showFieldError('cardExpiry', 'Please enter valid expiry (MM/YY)');
            return false;
        }

        if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
            showFieldError('cardCvc', 'Please enter valid CVC (3-4 digits)');
            return false;
        }

        clearFieldErrors();
    }

    return true;
}

// Show field-specific error
function showFieldError(fieldId, message) {
    clearFieldErrors();
    const field = document.getElementById(fieldId) || document.querySelector(`input[placeholder="${fieldId}"]`);
    if (field) {
        field.classList.add('border-red-500', 'ring-2', 'ring-red-200');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 font-medium';
        errorDiv.id = `${fieldId}-error`;
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    showToast(message, 'error');
}

// Clear all field errors
function clearFieldErrors() {
    document.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
    });
    document.querySelectorAll('[id$="-error"]').forEach(el => el.remove());
}

// Load room selection with real-time price calculation
function loadRoomSelection() {
    const roomSelection = document.getElementById('roomSelection');
    if (!roomSelection) return;

    const checkIn = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
    const checkOut = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
    const nights = checkIn && checkOut ? Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 1;

    roomSelection.innerHTML = availableRooms.map(room => {
        const isSelected = selectedRoom && selectedRoom.id === room.id;
        const containerClasses = isSelected 
            ? "group relative flex flex-col md:flex-row gap-md p-sm rounded-lg border border-primary/30 bg-primary/5 shadow-inner transition-all transform scale-[1.02]"
            : "group relative flex flex-col md:flex-row gap-md p-sm rounded-lg border border-outline/10 hover:border-primary/30 transition-all bg-white/20";
        
        const buttonClasses = isSelected
            ? "px-md py-sm bg-primary text-on-primary rounded font-button text-button transition-all flex items-center gap-2"
            : "px-md py-sm bg-primary/10 text-primary border border-primary/20 rounded font-button text-button hover:bg-primary hover:text-on-primary transition-all";
            
        const totalPrice = room.price * nights;
            
        return `
        <div class="${containerClasses}">
            <div class="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${room.image}" alt="${room.name}"/>
            </div>
            <div class="flex-grow flex flex-col justify-between py-xs">
                <div>
                    <h4 class="font-h3 text-h3 text-on-surface">${room.name}</h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">${room.description}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">$${room.price}/night × ${nights} night${nights > 1 ? 's' : ''}</p>
                </div>
                <div class="flex justify-between items-end mt-2 md:mt-0">
                    <div class="text-primary font-h3">$${totalPrice.toLocaleString()} <span class="text-body-sm text-outline">total</span></div>
                    <button class="${buttonClasses}" data-room="${room.id}">
                        ${isSelected ? '<span class="material-symbols-outlined text-sm">check</span> Selected' : 'Select'}
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
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

// Get auth headers from session
function getAuthHeaders() {
    const token = sessionStorage.getItem('token') || '';
    const csrfToken = sessionStorage.getItem('csrfToken') || '';
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': csrfToken
    };
}

// Complete booking with improved error handling
async function completeBooking() {
    const cardName = document.querySelector('input[placeholder="Name on Card"]').value;
    const cardNumber = document.querySelector('input[placeholder="Card Number"]').value;
    const cardExpiry = document.querySelector('input[placeholder="Expiry (MM/YY)"]').value;
    const cardCvc = document.querySelector('input[placeholder="CVC"]').value;

    // Validate payment form
    if (!cardName || cardName.trim().length < 2) {
        showFieldError('cardName', 'Please enter cardholder name');
        return;
    }

    if (!cardNumber || !/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        showFieldError('cardNumber', 'Please enter a valid 16-digit card number');
        return;
    }

    if (!cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        showFieldError('cardExpiry', 'Please enter valid expiry (MM/YY)');
        return;
    }

    if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
        showFieldError('cardCvc', 'Please enter valid CVC (3-4 digits)');
        return;
    }

    // Check if logged in
    if (!sessionStorage.getItem('token')) {
        showToast('Please sign in to complete your booking', 'error');
        setTimeout(() => {
            window.location.href = '/pages/hotel/login-lumina/';
        }, 1500);
        return;
    }

    // Show loading state
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const confirmBtn = document.querySelector('button[data-confirm]');
    
    if (btnText && btnLoader && confirmBtn) {
        btnText.textContent = 'Processing...';
        btnLoader.classList.remove('hidden');
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-70', 'cursor-not-allowed');
    }

    try {
        // Create booking via API
        const bookingRes = await fetch('/api/bookings', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                roomId: selectedRoom.id,
                checkIn: bookingData.checkIn,
                checkOut: bookingData.checkOut,
                guests: bookingData.guests,
                guestInfo: {
                    name: cardName,
                    email: sessionStorage.getItem('userEmail') || '',
                    phone: sessionStorage.getItem('userPhone') || ''
                }
            })
        });

        if (!bookingRes.ok) {
            throw new Error(`Booking API returned ${bookingRes.status}`);
        }

        const bookingData_res = await bookingRes.json();

        if (!bookingData_res.success) {
            throw new Error(bookingData_res.message || 'Booking failed');
        }

        // Process payment
        const paymentRes = await fetch('/api/payments', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                bookingId: bookingData_res.booking.id,
                amount: bookingData_res.booking.total,
                cardNumber: cardNumber.slice(-4),
                cardName: cardName
            })
        });

        if (!paymentRes.ok) {
            throw new Error(`Payment API returned ${paymentRes.status}`);
        }

        const paymentData = await paymentRes.json();

        if (paymentData.success) {
            showToast('Booking confirmed! Check your email for details.', 'success');
            setTimeout(() => {
                window.location.href = '/pages/hotel/guest-dashboard-lumina/';
            }, 2000);
        } else {
            throw new Error(paymentData.message || 'Payment failed');
        }
    } catch (err) {
        console.error('Booking error:', err);
        
        // Handle specific error types
        let errorMessage = 'An error occurred. Please try again.';
        
        if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('401') || err.message.includes('403')) {
            errorMessage = 'Session expired. Please sign in again.';
            setTimeout(() => {
                window.location.href = '/pages/hotel/login-lumina/';
            }, 2000);
        } else if (err.message.includes('409')) {
            errorMessage = 'This room is already booked for the selected dates.';
        } else if (err.message.includes('400')) {
            errorMessage = 'Invalid booking details. Please review and try again.';
        }
        
        showToast(errorMessage, 'error');
    } finally {
        // Reset button state
        if (btnText && btnLoader && confirmBtn) {
            const checkIn = new Date(bookingData.checkIn);
            const checkOut = new Date(bookingData.checkOut);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const total = selectedRoom.price * nights;
            
            btnText.textContent = `Confirm & Pay $${total.toLocaleString()}`;
            btnLoader.classList.add('hidden');
            confirmBtn.disabled = false;
            confirmBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }
}

// Go back function
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/pages/hotel/rooms-lumina/';
    }
}

// Event delegation — replaces all onclick attributes
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-step], button[data-room], button[data-confirm]');
    if (!btn) return;
    if (btn.dataset.step !== undefined) nextStep(Number(btn.dataset.step));
    if (btn.dataset.room !== undefined) selectRoom(Number(btn.dataset.room));
    if (btn.dataset.confirm !== undefined) completeBooking();
});

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
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const checkinEl = document.getElementById('checkin');
    const checkoutEl = document.getElementById('checkout');
    
    if(checkinEl && checkoutEl) {
        checkinEl.setAttribute('min', todayStr);
        checkoutEl.setAttribute('min', tomorrowStr);

        // When check-in changes, update check-out min
        checkinEl.addEventListener('change', () => {
            const nextDay = new Date(checkinEl.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutEl.setAttribute('min', nextDay.toISOString().split('T')[0]);
        });
    }
});

