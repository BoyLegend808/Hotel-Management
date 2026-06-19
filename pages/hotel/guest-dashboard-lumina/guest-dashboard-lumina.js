// Lumina Hospitality - Guest Dashboard JavaScript

// Auth helper
function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
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
        <div class="glass-card rounded-xl overflow-hidden booking-card">
            <div class="h-48 overflow-hidden bg-surface-container">
                ${booking.image ? `<img src="${booking.image}" alt="${booking.roomName || 'Room'}" class="w-full h-full object-cover"/>` : 
                  `<div class="w-full h-full flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-5xl">bed</span></div>`}
            </div>
            <div class="p-md">
                <div class="flex justify-between items-start mb-sm">
                    <div>
                        <h4 class="font-h3 text-h3">${booking.roomName || 'Room #' + booking.roomId}</h4>
                        <p class="text-body-sm text-on-surface-variant">${booking.roomType || ''}</p>
                    </div>
                    <span class="px-sm py-xs rounded-full text-label-md font-bold ${statusClass}">${booking.status}</span>
                </div>
                <div class="space-y-sm mt-md">
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-in</span>
                        <span class="font-medium">${booking.checkIn ? formatDate(booking.checkIn) : '—'}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-out</span>
                        <span class="font-medium">${booking.checkOut ? formatDate(booking.checkOut) : '—'}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Total</span>
                        <span class="font-bold text-primary">$${Number(booking.total || booking.totalPrice || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div class="flex gap-sm mt-lg">
                    <button class="flex-1 py-sm border border-primary text-primary rounded-lg font-button text-button hover:bg-primary hover:text-white transition-all" onclick="viewBookingDetails(${booking.id})">
                        View Details
                    </button>
                    ${booking.status === 'confirmed' || booking.status === 'pending' ? `
                        <button class="flex-1 py-sm border border-outline-variant text-on-surface-variant rounded-lg font-button text-button hover:bg-surface-container transition-all" onclick="cancelBooking(${booking.id})">
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
                <button class="mt-md bg-primary text-white py-md px-xl rounded-lg font-button hover:bg-primary/90 transition-all" onclick="window.location.href='/pages/hotel/rooms-lumina/'">
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
    // In a real app, this would navigate to a booking detail page
    showToast(`Viewing details for booking #${bookingId}`, 'info');
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
            showToast('Booking cancelled successfully', 'success');
            // Reload bookings
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
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Call API logout
        fetch('/api/logout', { method: 'POST', headers: { 'Authorization': 'Bearer ' + (sessionStorage.getItem('token') || '') } })
            .catch(() => {});
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/pages/hotel/login-lumina/';
        }, 1000);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
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
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
