// Lumina Hospitality - Guest Dashboard JavaScript

// Sample booking data
const upcomingBookings = [
    {
        id: 1,
        roomName: "Azure Ocean Suite",
        roomType: "VIP SANCTUARY",
        checkIn: "2024-11-15",
        checkOut: "2024-11-20",
        status: "confirmed",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzzZYHtqR003gLo_fXte54QqlQlBOqnL294c2nBSU1aGKXjYPDQLHXQ3jm4CP3t_y1DF3CBBGORVAggDzPGDQI_VfXK8kRugK1syJ2gC8g1RTIo4nPhNho0E9gTq0Y_FFMymQzFvysIqnURv67laPRxj_PNIUx-OA07komn3cC7LlPMnfEThCTpsD2FTbadifji6VWd3OlX3zRN2x11MbAc_gCZvgkntr1zSUjofFdomWtfRv5wjTSPHM3NK1qcI3UPm19w27u80",
        totalPrice: 2250
    },
    {
        id: 2,
        roomName: "The Horizon Loft",
        roomType: "EXECUTIVE SUITE",
        checkIn: "2024-12-10",
        checkOut: "2024-12-15",
        status: "pending",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxi0wjU6aLr44vsc3N063QAcEDEQM9Cv_MImZtSci66HzHWmuEI1UYwKsCF6sUkq7G7qaH5JuacNzh_a81nzUGG9tWMl1uHBWxh-tPU8Uspt_ZTciCarVyGerQz9D-BYgOpSZd3Bxb_Dbe82m11YHPJ3AAJy2UaIbgLrxaSbgdEwnisnNrfgsNIar8UbY0-W34S7O9PUWpMETQPAWpwtWwog5Jle5uvR_PYQTpIkch7nhIkiIKeFbPTwihSWHciu0v75ouoFScCXQ",
        totalPrice: 1800
    }
];

const pastBookings = [
    {
        id: 3,
        roomName: "Royal Heritage Room",
        roomType: "DELUXE KING",
        checkIn: "2024-09-01",
        checkOut: "2024-09-05",
        status: "completed",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC19eUlmgJWbWeAf0lnzVzsqE5UlsJ7Nqr5b0gy5DSaxM-PHFp3X3lGJ-Cg_DI4RK5YfJAkZcWkRUyRnpMwo41TKGXCxQF2yE827K3OP07qsBfTUB-c9yFRfg8QYFKv6xa-BT7p3QmtSKH5RbdxoLZw8cf4AR-PuqZo3oN7XV22ETDR312PkUsk8mf3gIaZ6wXO0MZjEfxOygHvOeRKY6-wFN0Byvz9XIYOcq9y7EfTlohzCWKQRm_prBdoux9YheMj3IwqrZcLE4Q",
        totalPrice: 1280
    },
    {
        id: 4,
        roomName: "Peak View Cabin",
        roomType: "ALPINE ESCAPE",
        checkIn: "2024-07-20",
        checkOut: "2024-07-25",
        status: "completed",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFxkqrMt1GmGKYJfSCYgn2H9WMZPlWKbl9yci7Od6p9ffT5HLYaa-PVV0axf5LuGH0llQ-KVbi9U1ykms8W1XA3FxCW1xohYWvWj60itCEftceR-oWaNVplq5F_N0XiJv6rtew0vEhBUNNiDe5tc7tRVgLNiUTyzLQw0U35mixv6iYWwVnfmHiddZ_xqrOp5N1lbICmjaqaJzVY8xph-SquNuOhPboIApwyUqu5NcTkPuq1acgjdLjqvGXdqlOPvuiadiJcynNnzI",
        totalPrice: 2240
    }
];

// Render booking card
function renderBookingCard(booking) {
    const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 
                       booking.status === 'pending' ? 'status-pending' : 'status-cancelled';
    
    return `
        <div class="booking-card">
            <img src="${booking.image}" alt="${booking.roomName}" class="booking-image"/>
            <div class="p-md">
                <div class="flex justify-between items-start mb-sm">
                    <div>
                        <h4 class="font-h3 text-h3">${booking.roomName}</h4>
                        <p class="text-body-sm text-on-surface-variant">${booking.roomType}</p>
                    </div>
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                <div class="space-y-sm mt-md">
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-in</span>
                        <span class="font-medium">${formatDate(booking.checkIn)}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Check-out</span>
                        <span class="font-medium">${formatDate(booking.checkOut)}</span>
                    </div>
                    <div class="flex justify-between text-body-sm">
                        <span class="text-on-surface-variant">Total</span>
                        <span class="font-bold text-primary">$${booking.totalPrice}</span>
                    </div>
                </div>
                <div class="flex gap-sm mt-lg">
                    <button class="flex-1 py-sm border border-primary text-primary rounded-lg font-button text-button hover:bg-primary hover:text-white transition-all" onclick="viewBookingDetails(${booking.id})">
                        View Details
                    </button>
                    ${booking.status === 'confirmed' ? `
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
function renderUpcomingBookings() {
    const container = document.getElementById('upcomingBookings');
    if (!container) return;
    
    if (upcomingBookings.length === 0) {
        container.innerHTML = `
            <div class="glass-card rounded-xl p-lg text-center col-span-full">
                <span class="material-symbols-outlined text-4xl text-on-surface-variant mb-md">calendar_today</span>
                <p class="text-body-md text-on-surface-variant">No upcoming bookings</p>
                <button class="mt-md bg-primary text-white py-md px-xl rounded-lg font-button hover:bg-primary/90 transition-all" onclick="window.location.href='/pages/hotel/rooms/'">
                    Book a Room
                </button>
            </div>
        `;
    } else {
        container.innerHTML = upcomingBookings.map(renderBookingCard).join('');
    }
}

function renderPastBookings() {
    const container = document.getElementById('pastBookings');
    if (!container) return;
    
    if (pastBookings.length === 0) {
        container.innerHTML = `
            <div class="glass-card rounded-xl p-lg text-center col-span-full">
                <p class="text-body-md text-on-surface-variant">No past bookings</p>
            </div>
        `;
    } else {
        container.innerHTML = pastBookings.map(renderBookingCard).join('');
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
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        showToast('Booking cancellation request submitted', 'success');
        // In a real app, this would call an API to cancel the booking
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/pages/hotel/login/';
        }, 1000);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderUpcomingBookings();
    renderPastBookings();
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
