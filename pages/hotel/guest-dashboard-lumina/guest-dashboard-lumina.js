// Lumina Hospitality - Guest Dashboard JavaScript

// XSS escape helper
function esc(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Auth helper — includes Bearer token and CSRF token for all mutating requests
function getAuthHeaders() {
    const token = sessionStorage.getItem('token') || '';
    const csrfToken = sessionStorage.getItem('csrfToken') || '';
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': csrfToken
    };
}

// Sample booking data (fallback)
const upcomingBookingsFallback = [];
const pastBookingsFallback = [];

// Render booking card
function renderBookingCard(booking) {
    const statusColors = {
        confirmed: 'bg-green-100 text-green-800',
        pending:   'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800'
    };
    const statusClass = statusColors[booking.status] || 'bg-gray-100 text-gray-800';

    return `
        <div class="glass-card rounded-xl overflow-hidden booking-card" data-booking-id="${esc(String(booking.id))}">
            <div class="h-48 overflow-hidden bg-surface-container">
                ${booking.image
                    ? `<img src="${esc(booking.image)}" alt="${esc(booking.roomName || 'Room')}" class="w-full h-full object-cover"/>`
                    : `<div class="w-full h-full flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-5xl">bed</span></div>`}
            </div>
            <div class="p-md">
                <div class="flex justify-between items-start mb-sm">
                    <div>
                        <h4 class="font-h3 text-h3">${esc(booking.roomName || 'Room #' + booking.roomId)}</h4>
                        <p class="text-body-sm text-on-surface-variant">${esc(booking.roomType || '')}</p>
                    </div>
                    <span class="px-sm py-xs rounded-full text-label-md font-bold ${esc(statusClass)}">${esc(booking.status)}</span>
                </div>
                <div class="space-y-sm mt-md">
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-in</span>
                        <span class="font-medium">${booking.checkIn ? esc(formatDate(booking.checkIn)) : '&mdash;'}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-out</span>
                        <span class="font-medium">${booking.checkOut ? esc(formatDate(booking.checkOut)) : '&mdash;'}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Total</span>
                        <span class="font-bold text-primary">$${esc(Number(booking.total || booking.totalPrice || 0).toFixed(2))}</span>
                    </div>
                </div>
                <div class="flex gap-sm mt-lg">
                    <button class="flex-1 py-sm border border-primary text-primary rounded-lg font-button text-button hover:bg-primary hover:text-white transition-all" data-action="view-details">
                        View Details
                    </button>
                    ${booking.status === 'confirmed' || booking.status === 'pending' ? `
                        <button class="flex-1 py-sm border border-outline-variant text-on-surface-variant rounded-lg font-button text-button hover:bg-surface-container transition-all" data-action="cancel">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Render bookings
function renderUpcomingBookings(bookings) {
    const container = document.getElementById('upcomingBookings');
    if (!container) return;

    const upcoming = (bookings || []).filter(b => b.status === 'confirmed' || b.status === 'pending');

    if (upcoming.length === 0) {
        container.innerHTML = `
            <div class="glass-card rounded-xl p-lg text-center col-span-full">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-md" style="display:block;">calendar_today</span>
                <p class="text-body-md text-on-surface-variant">No upcoming bookings</p>
                <button class="mt-md bg-primary text-white py-md px-xl rounded-lg font-button hover:bg-primary/90 transition-all" data-action="book-room">
                    Book a Room
                </button>
            </div>`;
    } else {
        container.innerHTML = upcoming.map(renderBookingCard).join('');
    }
}

function renderPastBookings(bookings) {
    const container = document.getElementById('pastBookings');
    if (!container) return;

    const past = (bookings || []).filter(b => b.status === 'completed' || b.status === 'cancelled');

    if (past.length === 0) {
        container.innerHTML = `
            <div class="glass-card rounded-xl p-lg text-center col-span-full">
                <p class="text-body-md text-on-surface-variant">No past bookings</p>
            </div>`;
    } else {
        container.innerHTML = past.map(renderBookingCard).join('');
    }
}

// Switch tabs
function switchTab(tab) {
    // Hide all content
    document.getElementById('content-upcoming').classList.add('hidden');
    document.getElementById('content-past').classList.add('hidden');
    document.getElementById('content-settings').classList.add('hidden');
    
    // Reset all tab styles
    document.getElementById('tab-upcoming').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-upcoming').classList.add('text-on-surface-variant');
    document.getElementById('tab-past').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-past').classList.add('text-on-surface-variant');
    document.getElementById('tab-settings').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-settings').classList.add('text-on-surface-variant');
    
    // Show selected content and style tab
    document.getElementById(`content-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).classList.remove('text-on-surface-variant');
    document.getElementById(`tab-${tab}`).classList.add('text-primary', 'border-b-2', 'border-primary');
}

// View booking details
function viewBookingDetails(bookingId) {
    // In a real app, this would navigate to a booking detail page or show a modal
    showToast(`Viewing details for booking #${bookingId}`, 'info');
    // For now, just show a toast - in production, this would open a detail modal or navigate
    console.log('View booking details:', bookingId);
}

// Open service request modal
function openServiceRequestModal() {
    // Create and show a modal for new service requests
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="glass-panel rounded-2xl p-lg max-w-md w-full mx-4 border border-white/40">
            <div class="flex justify-between items-center mb-lg">
                <h3 class="font-h2 text-h2">New Service Request</h3>
                <button data-action="close-modal" class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="space-y-md">
                <div>
                    <label class="font-label-md text-primary uppercase tracking-widest mb-xs block">Request Type</label>
                    <select class="w-full px-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="room_service">Room Service</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="spa">Spa &amp; Wellness</option>
                        <option value="concierge">Concierge</option>
                        <option value="transportation">Transportation</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="font-label-md text-primary uppercase tracking-widest mb-xs block">Description</label>
                    <textarea class="w-full px-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-transparent h-32 resize-none" placeholder="Please describe your request..."></textarea>
                </div>
                <div>
                    <label class="font-label-md text-primary uppercase tracking-widest mb-xs block">Preferred Time</label>
                    <input type="datetime-local" class="w-full px-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-transparent">
                </div>
                <button data-action="submit-request" class="w-full py-md bg-primary text-white rounded-lg font-button hover:bg-primary/90 transition-all">
                    Submit Request
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-action="submit-request"]').addEventListener('click', (e) => submitServiceRequest(e.currentTarget));
}

// Submit service request
async function submitServiceRequest(button) {
    const modal = button.closest('.fixed');
    const select = modal.querySelector('select');
    const textarea = modal.querySelector('textarea');
    const datetime = modal.querySelector('input[type="datetime-local"]');
    
    if (!textarea.value.trim()) {
        showToast('Please provide a description', 'error');
        return;
    }
    
    button.textContent = 'Submitting...';
    button.disabled = true;
    
    try {
        // In a real app, this would call the API
        // const res = await fetch('/api/service-requests', {
        //     method: 'POST',
        //     headers: getAuthHeaders(),
        //     body: JSON.stringify({
        //         type: select.value,
        //         description: textarea.value,
        //         preferredTime: datetime.value
        //     })
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast('Service request submitted successfully', 'success');
        modal.remove();
        
        // In production, reload the service requests list
        // loadServiceRequests();
    } catch (err) {
        showToast('Failed to submit request. Please try again.', 'error');
        button.textContent = 'Submit Request';
        button.disabled = false;
    }
}

// Cancel booking
async function cancelBooking(bookingId) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/50';
    overlay.innerHTML = `
        <div class="bg-white rounded-xl p-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <p class="font-h3 text-h3 mb-md">Cancel booking?</p>
            <p class="text-body-sm text-on-surface-variant mb-lg">This action cannot be undone.</p>
            <div class="flex gap-md justify-center">
                <button id="confirmCancelYes" class="px-lg py-sm bg-primary text-white rounded-lg font-button">Yes, cancel</button>
                <button id="confirmCancelNo" class="px-lg py-sm border border-outline-variant rounded-lg font-button">Keep booking</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirmCancelNo').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#confirmCancelYes').addEventListener('click', async () => {
        overlay.remove();
        try {
            const res = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                showToast('Booking cancelled successfully', 'success');
                const bookingsRes = await fetch('/api/bookings', { headers: getAuthHeaders() });
                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json();
                    renderUpcomingBookings(bookingsData.bookings || []);
                    renderPastBookings(bookingsData.bookings || []);
                }
            } else {
                showToast(data.message || 'Could not cancel booking', 'error');
            }
        } catch (err) {
            showToast('An error occurred. Please try again.', 'error');
        }
    };
}

// Save settings
function saveSettings() {
    const nameEl = document.querySelector('#content-settings input[type="text"]');
    const emailEl = document.querySelector('#content-settings input[type="email"]');
    const phoneEl = document.querySelector('#content-settings input[type="tel"]');

    const name = nameEl ? nameEl.value.trim().slice(0, 100) : '';
    const email = emailEl ? emailEl.value.trim().slice(0, 200) : '';
    const phone = phoneEl ? phoneEl.value.trim().slice(0, 30) : '';

    // Basic email format check
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Store only non-sensitive display preferences; never store payment/auth data in localStorage
    try {
        localStorage.setItem('guestSettings', JSON.stringify({ name, email, phone }));
        showToast('Settings saved', 'success');
    } catch (e) {
        showToast('Could not save settings', 'error');
    }
}

// Logout — replaced browser confirm() with custom modal
function logout() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/50';
    overlay.innerHTML = `
        <div class="bg-white rounded-xl p-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <p class="font-h3 text-h3 mb-md">Log out?</p>
            <p class="text-body-sm text-on-surface-variant mb-lg">You will be returned to the login page.</p>
            <div class="flex gap-md justify-center">
                <button id="guestLogoutYes" class="px-lg py-sm bg-primary text-white rounded-lg font-button">Log out</button>
                <button id="guestLogoutNo" class="px-lg py-sm border border-outline-variant rounded-lg font-button">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#guestLogoutNo').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#guestLogoutYes').addEventListener('click', () => {
        overlay.remove();
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + (sessionStorage.getItem('token') || '') } })
            .catch(() => {});
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => { window.location.href = '/pages/hotel/login-lumina/'; }, 1000);
    };
}

// Event delegation for dynamically rendered booking card buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const card = btn.closest('[data-booking-id]');
    const bookingId = card ? card.dataset.bookingId : null;
    if (action === 'view-details' && bookingId) viewBookingDetails(bookingId);
    if (action === 'cancel' && bookingId) cancelBooking(bookingId);
    if (action === 'book-room') window.location.href = '/pages/hotel/rooms-lumina/';
});

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings from localStorage
    try {
        const saved = JSON.parse(localStorage.getItem('guestSettings') || '{}');
        if (saved.name) document.querySelector('#content-settings input[type="text"]').value = saved.name;
        if (saved.email) document.querySelector('#content-settings input[type="email"]').value = saved.email;
        if (saved.phone) document.querySelector('#content-settings input[type="tel"]').value = saved.phone;
    } catch (e) {}

    // Load user name from session
    try {
        const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
        const nameEl = document.querySelector('h2.font-h1');
        if (nameEl && userData.name) {
            nameEl.textContent = `Welcome back, ${userData.name}`;
        }
    } catch (e) {}

    // Load bookings from API, fall back to empty
    try {
        const res = await fetch('/api/bookings', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            const bookings = data.bookings || [];
            renderUpcomingBookings(bookings);
            renderPastBookings(bookings);
        } else {
            renderUpcomingBookings([]);
            renderPastBookings([]);
        }
    } catch (err) {
        renderUpcomingBookings([]);
        renderPastBookings([]);
    }

    // Event listeners for externalized inline handlers
    // Book New Stay button
    const bookNewStayBtn = document.getElementById('bookNewStayBtn');
    if (bookNewStayBtn) {
        bookNewStayBtn.addEventListener('click', () => {
            window.location.href = '/pages/hotel/booking-your-stay/';
        });
    }

    // View Details buttons
    const viewDetailsBtns = document.querySelectorAll('.view-details-btn');
    viewDetailsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.bookingId;
            if (bookingId && typeof viewBookingDetails === 'function') {
                viewBookingDetails(bookingId);
            }
        });
    });

    // New Request button
    const newRequestBtn = document.getElementById('newRequestBtn');
    if (newRequestBtn) {
        newRequestBtn.addEventListener('click', () => {
            if (typeof openServiceRequestModal === 'function') {
                openServiceRequestModal();
            }
        });
    }
});

