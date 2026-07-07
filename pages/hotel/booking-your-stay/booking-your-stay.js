// Lumina Hospitality - Booking Page JavaScript
// Fetches room data from /api/rooms and uses real API for booking + payment.

// XSS escape helper
function esc(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let currentStep = 1;
let selectedRoom = null;
let availableRooms = []; // fetched from API
let bookingData = {
    checkIn: null,
    checkOut: null,
    guests: 2,
    roomId: null,
    guestName: '',
    guestEmail: '',
    guestPhone: ''
};

// Toast helper
function _toast(message, type) {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(message, type);
    } else {
        alert(message);
    }
}

// Fetch rooms from API
async function fetchRooms() {
    try {
        const res = await fetch('/api/rooms');
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms)) {
            return data.rooms;
        }
        return [];
    } catch (err) {
        console.error('Failed to fetch rooms:', err);
        return [];
    }
}

// Ensure CSRF token is available
async function ensureCsrfToken() {
    if (sessionStorage.getItem('csrfToken')) return sessionStorage.getItem('csrfToken');
    try {
        const res = await fetch('/api/csrf-token');
        const data = await res.json();
        if (data.csrfToken) {
            sessionStorage.setItem('csrfToken', data.csrfToken);
            return data.csrfToken;
        }
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
    }
    return '';
}

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
        updateSidebarSummary();
    } else if (step === 3) {
        loadOrderSummary();
        updateSidebarSummary();
    }

    // Show booking summary only if a room is selected (or on step 3)
    const bookingSummary = document.getElementById('booking-summary-sidebar');
    if (bookingSummary) {
        if ((step === 2 && selectedRoom) || step === 3) {
            bookingSummary.classList.remove('hidden');
            setTimeout(() => {
                bookingSummary.classList.remove('opacity-0', 'pointer-events-none');
                bookingSummary.classList.add('opacity-100', 'pointer-events-auto');
            }, 50);
        } else {
            bookingSummary.classList.remove('opacity-100', 'pointer-events-auto');
            bookingSummary.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => {
                if (currentStep < 3 && !selectedRoom) bookingSummary.classList.add('hidden');
            }, 500);
        }
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
        // bookingData.guests is now updated by clicking the occupancy buttons
        clearFieldErrors();
    } else if (step === 2) {
        if (!selectedRoom) {
            _toast('Please select a room', 'error');
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
    _toast(message, 'error');
}

// Clear all field errors
function clearFieldErrors() {
    document.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
    });
    document.querySelectorAll('[id$="-error"]').forEach(el => el.remove());
}

// Update sidebar booking summary based on current data
function updateSidebarSummary() {
    // Also handle visibility if we are on step 2 and just selected a room
    const bookingSummary = document.getElementById('booking-summary-sidebar');
    if (bookingSummary && currentStep === 2) {
        if (selectedRoom) {
            bookingSummary.classList.remove('hidden');
            setTimeout(() => {
                bookingSummary.classList.remove('opacity-0', 'pointer-events-none');
                bookingSummary.classList.add('opacity-100', 'pointer-events-auto');
            }, 50);
        }
    }

    if (currentStep < 2) return;

    const checkInStr = bookingData.checkIn;
    const checkOutStr = bookingData.checkOut;
    
    if (checkInStr && checkOutStr) {
        const ci = new Date(checkInStr);
        const co = new Date(checkOutStr);
        const opts = { month: 'short', day: 'numeric', year: 'numeric' };
        
        document.getElementById('summary-checkin').textContent = ci.toLocaleDateString(undefined, opts);
        document.getElementById('summary-checkout').textContent = co.toLocaleDateString(undefined, opts);

        // Cancel date (2 days before check-in)
        const cancelDate = new Date(ci);
        cancelDate.setDate(cancelDate.getDate() - 2);
        document.getElementById('summary-cancel-date').textContent = cancelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        if (selectedRoom) {
            const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24)) || 1;
            const price = selectedRoom.price;
            const total = price * nights;
            
            document.getElementById('summary-room').textContent = selectedRoom.name;
            document.getElementById('summary-calc').textContent = `$${price.toFixed(2)} x ${nights} night${nights > 1 ? 's' : ''}`;
            document.getElementById('summary-calc-total').textContent = `$${total.toFixed(2)}`;
            document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
        } else {
            document.getElementById('summary-room').textContent = 'None Selected';
            document.getElementById('summary-calc').textContent = '-';
            document.getElementById('summary-calc-total').textContent = '-';
            document.getElementById('summary-total').textContent = '-';
        }
    }
}

// Load room selection with real-time price calculation
function loadRoomSelection() {
    const roomSelection = document.getElementById('roomSelection');
    if (!roomSelection) return;

    if (availableRooms.length === 0) {
        roomSelection.innerHTML = `
            <div style="text-align:center; padding:2rem; color: var(--text-muted, #888);">
                <span class="material-symbols-outlined" style="font-size:2.5rem; display:block; margin-bottom:0.5rem;">hotel</span>
                <p>Loading rooms...</p>
            </div>`;
        return;
    }

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
        const roomDesc = room.description || room.type || '';
            
        return `
        <div class="${esc(containerClasses)}">
            <div class="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${esc(room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80')}" alt="${esc(room.name)}"/>
            </div>
            <div class="flex-grow flex flex-col justify-between py-xs">
                <div>
                    <h4 class="font-h3 text-h3 text-on-surface">${esc(room.name)}</h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">${esc(roomDesc)}</p>
                    <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">$${esc(String(room.price))}/night × ${esc(String(nights))} night${nights > 1 ? 's' : ''}</p>
                </div>
                <div class="flex justify-between items-end mt-2 md:mt-0">
                    <div class="text-primary font-h3">$${esc(String(totalPrice.toLocaleString()))} <span class="text-body-sm text-outline">total</span></div>
                    <button class="${esc(buttonClasses)}" data-room="${esc(String(room.id))}">
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
    updateSidebarSummary();
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
            <span class="text-body-md">${esc(selectedRoom.name)}</span>
            <span class="text-body-md">$${esc(String(selectedRoom.price))} x ${esc(String(nights))} nights</span>
        </div>
        <div class="order-item">
            <span class="text-body-md">Room Total</span>
            <span class="text-body-md">$${esc(roomTotal.toFixed(2))}</span>
        </div>
        <div class="order-item">
            <span class="text-body-md">Tax (10%)</span>
            <span class="text-body-md">$${esc(tax.toFixed(2))}</span>
        </div>
        <div class="order-total">
            <span class="text-h3">Total</span>
            <span class="text-h3 text-primary">$${esc(total.toFixed(2))}</span>
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

// Handle Booking based on Payment Method
async function initiateBooking() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Shared validation
    const guestName = document.getElementById('guestName').value;
    const guestEmail = document.getElementById('guestEmail').value;
    const guestPhone = document.getElementById('guestPhone').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    const specialRequests = document.getElementById('specialRequests').value;

    if (!guestName || guestName.trim().length < 2) {
        showFieldError('guestName', 'Please enter your full name');
        return;
    }
    if (!guestEmail || !/^\S+@\S+\.\S+$/.test(guestEmail)) {
        showFieldError('guestEmail', 'Please enter a valid email address');
        return;
    }
    if (!guestPhone || guestPhone.length < 5) {
        showFieldError('guestPhone', 'Please enter a valid phone number');
        return;
    }

    // Card-specific validation
    let cardName, cardNumber, cardExpiry, cardCvc;
    if (paymentMethod === 'card') {
        cardName = document.getElementById('cardName').value;
        cardNumber = document.getElementById('cardNumber').value;
        cardExpiry = document.getElementById('cardExpiry').value;
        cardCvc = document.getElementById('cardCvc').value;

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
    }

    await ensureCsrfToken();

    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const confirmBtn = document.querySelector('button[data-confirm]');
    
    if (btnText && btnLoader && confirmBtn) {
        btnText.textContent = paymentMethod === 'card' ? 'Processing...' : 'Generating Account...';
        btnLoader.classList.remove('hidden');
        confirmBtn.disabled = true;
        if (paymentMethod === 'card') confirmBtn.classList.add('opacity-70', 'cursor-not-allowed');
    }

    const bookingCode = 'LUM-' + Math.floor(10000 + Math.random() * 90000);

    try {
        if (paymentMethod === 'card') {
            // -- CREDIT CARD FLOW --
            const bookingRes = await fetch('/api/bookings', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guests: bookingData.guests,
                    guestInfo: {
                        name: guestName, // the guest using the room
                        email: guestEmail,
                        phone: guestPhone,
                        arrivalTime: arrivalTime,
                        specialRequests: specialRequests,
                        bookingCode: bookingCode,
                        paymentMethod: 'Credit Card'
                    }
                })
            });

            if (!bookingRes.ok) throw new Error(`Booking API returned ${bookingRes.status}`);
            const bookingData_res = await bookingRes.json();
            if (!bookingData_res.success) throw new Error(bookingData_res.message || 'Booking failed');

            // Process simulated payment
            const paymentRes = await fetch('/api/payments', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    bookingId: bookingData_res.booking.id,
                    paymentMethod: 'card'
                })
            });

            if (!paymentRes.ok) throw new Error(`Payment API returned ${paymentRes.status}`);
            const paymentData = await paymentRes.json();

            if (paymentData.success) {
                _toast('Booking confirmed! Check your email for details.', 'success');
                setTimeout(() => {
                    // Redirect to home since we don't have a specific guest dashboard without login
                    window.location.href = '/pages/hotel/home-lumina/home-lumina.html';
                }, 2000);
            } else {
                throw new Error(paymentData.message || 'Payment failed');
            }

        } else {
            // -- BANK TRANSFER FLOW --
            const res = await fetch('/api/bookings/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
                },
                body: JSON.stringify({
                    roomId: selectedRoom.id,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guests: bookingData.guests,
                    guestInfo: {
                        name: guestName,
                        email: guestEmail,
                        phone: guestPhone,
                        arrivalTime: arrivalTime,
                        specialRequests: specialRequests,
                        bookingCode: bookingCode
                    }
                })
            });

            if (!res.ok) throw new Error('API returned ' + res.status);
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to initiate booking');

            // Show Virtual Account Details
            document.getElementById('virtualAccountBox').classList.remove('hidden');
            document.getElementById('vaAccountNumber').textContent = data.booking.virtualAccount.accountNumber;
            document.getElementById('vaBankName').textContent = data.booking.virtualAccount.bankName;
            document.getElementById('vaAmount').textContent = `$${data.booking.virtualAccount.amount.toFixed(2)}`;

            // Change button to "I Have Paid"
            btnLoader.classList.add('hidden');
            btnText.textContent = 'I Have Paid';
            confirmBtn.disabled = false;
            
            // Change action on button
            confirmBtn.removeAttribute('data-confirm');
            confirmBtn.setAttribute('data-pay', data.booking.id);

            _toast('Virtual Account generated. Please transfer the exact amount.', 'success');
        }

    } catch (err) {
        console.error(err);
        let errorMessage = err.message || 'Error initiating booking. Please try again.';
        if (err.message.includes('already booked')) errorMessage = 'This room is already booked for the selected dates.';
        
        _toast(errorMessage, 'error');
        
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

// Verify Payment by Polling (and triggering Mock Webhook)
async function verifyPayment(bookingId) {
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const confirmBtn = document.querySelector(`button[data-pay="${bookingId}"]`);

    if (btnText && btnLoader && confirmBtn) {
        btnText.textContent = 'Confirming payment...';
        btnLoader.classList.remove('hidden');
        confirmBtn.disabled = true;
    }

    // Trigger Mock Webhook after 5 seconds (Simulating external gateway)
    const amountText = document.getElementById('vaAmount').textContent.replace('$', '');
    setTimeout(async () => {
        try {
            await fetch('/api/bookings/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingId,
                    status: 'success',
                    amount_paid: parseFloat(amountText)
                })
            });
        } catch(e) { console.error('Mock webhook failed', e); }
    }, 5000);

    // Poll endpoint every 2 seconds
    const pollInterval = setInterval(async () => {
        try {
            const res = await fetch(`/api/bookings/${bookingId}/payment-status`);
            const data = await res.json();
            
            if (data.success && data.paymentState === 'Confirmed') {
                clearInterval(pollInterval);
                _toast('Payment Confirmed! Your booking is complete.', 'success');
                setTimeout(() => {
                    // Redirect to home since we don't have a specific guest dashboard without login
                    window.location.href = '/pages/hotel/home-lumina/home-lumina.html';
                }, 2000);
            } else if (data.success && data.paymentState === 'Failed') {
                clearInterval(pollInterval);
                _toast('Payment failed. Please try again.', 'error');
                if (btnText) btnText.textContent = 'I Have Paid';
                if (btnLoader) btnLoader.classList.add('hidden');
                if (confirmBtn) confirmBtn.disabled = false;
            }
        } catch (e) {
            console.error('Polling error', e);
        }
    }, 2000);
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
    const btn = e.target.closest('button[data-step], button[data-room], button[data-confirm], button[data-pay]');
    if (!btn) return;
    if (btn.dataset.step !== undefined) nextStep(Number(btn.dataset.step));
    if (btn.dataset.room !== undefined) selectRoom(Number(btn.dataset.room));
    if (btn.dataset.confirm !== undefined) initiateBooking();
    if (btn.dataset.pay !== undefined) verifyPayment(btn.dataset.pay);
});

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch rooms from API
    availableRooms = await fetchRooms();

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

    // Pre-fill dates from URL if provided
    const checkInParam = urlParams.get('checkIn');
    const checkOutParam = urlParams.get('checkOut');
    const guestsParam = urlParams.get('guests');

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

        // Pre-fill from URL params
        if (checkInParam) checkinEl.value = checkInParam;
        if (checkOutParam) checkoutEl.value = checkOutParam;

        // When check-in changes, update check-out min
        checkinEl.addEventListener('change', () => {
            const nextDay = new Date(checkinEl.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutEl.setAttribute('min', nextDay.toISOString().split('T')[0]);
        });
    }

    // Occupancy Buttons Logic
    const occupancyButtons = document.querySelectorAll('.occupancy-btn');
    if (occupancyButtons.length > 0) {
        // Pre-select button based on URL param or default to '2'
        const initialGuests = guestsParam ? parseInt(guestsParam, 10) : 2;
        bookingData.guests = initialGuests;

        occupancyButtons.forEach(btn => {
            const btnGuests = parseInt(btn.getAttribute('data-guests'), 10);
            
            // Set initial style
            if (btnGuests === initialGuests) {
                btn.classList.remove('border', 'border-outline/20');
                btn.classList.add('border-2', 'border-primary', 'bg-primary/5');
            } else {
                btn.classList.remove('border-2', 'border-primary', 'bg-primary/5');
                btn.classList.add('border', 'border-outline/20');
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Reset styles for all buttons
                occupancyButtons.forEach(b => {
                    b.classList.remove('border-2', 'border-primary', 'bg-primary/5');
                    b.classList.add('border', 'border-outline/20');
                });
                
                // Set active style for clicked button
                btn.classList.remove('border', 'border-outline/20');
                btn.classList.add('border-2', 'border-primary', 'bg-primary/5');
                
                // Update bookingData
                bookingData.guests = parseInt(btn.getAttribute('data-guests'), 10);
            });
        });
    }

    // Payment Method Toggle Logic
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardForm = document.getElementById('cardPaymentForm');
    const virtualAccountBox = document.getElementById('virtualAccountBox');
    const confirmBtn = document.querySelector('button[data-confirm]');
    const confirmBtnPay = document.querySelector('button[data-pay]');
    const btnText = document.getElementById('btn-text');

    if (paymentRadios.length > 0) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'card') {
                    cardForm.classList.remove('hidden');
                    virtualAccountBox.classList.add('hidden');
                    
                    // Reset button if it was in 'transfer' state
                    let btnToUpdate = confirmBtn || document.querySelector('button[data-pay]');
                    if (btnToUpdate) {
                        btnToUpdate.removeAttribute('data-pay');
                        btnToUpdate.setAttribute('data-confirm', '');
                        
                        // Recalculate total for button text
                        if (bookingData.checkIn && bookingData.checkOut && selectedRoom) {
                            const checkIn = new Date(bookingData.checkIn);
                            const checkOut = new Date(bookingData.checkOut);
                            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                            const total = selectedRoom.price * nights;
                            btnText.textContent = `Confirm & Pay $${total.toLocaleString()}`;
                        } else {
                            btnText.textContent = `Confirm & Pay`;
                        }
                    }
                } else if (e.target.value === 'transfer') {
                    cardForm.classList.add('hidden');
                    // We don't show virtual account box until they click confirm
                    virtualAccountBox.classList.add('hidden'); 
                    
                    let btnToUpdate = confirmBtn || document.querySelector('button[data-pay]');
                    if (btnToUpdate) {
                        btnToUpdate.removeAttribute('data-pay');
                        btnToUpdate.setAttribute('data-confirm', '');
                        btnText.textContent = `Generate Virtual Account`;
                    }
                }
            });
        });
    }
});
