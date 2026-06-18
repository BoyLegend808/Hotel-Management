// Lumina Hospitality - Admin Dashboard JavaScript

// Sample recent bookings data
const recentBookings = [
    {
        id: 1,
        guestName: "John Smith",
        roomName: "Azure Ocean Suite",
        checkIn: "2024-11-15",
        checkOut: "2024-11-20",
        status: "confirmed",
        totalPrice: 2250
    },
    {
        id: 2,
        guestName: "Emily Johnson",
        roomName: "The Horizon Loft",
        checkIn: "2024-11-18",
        checkOut: "2024-11-22",
        status: "pending",
        totalPrice: 1800
    },
    {
        id: 3,
        guestName: "Michael Brown",
        roomName: "Royal Heritage Room",
        checkIn: "2024-11-20",
        checkOut: "2024-11-25",
        status: "confirmed",
        totalPrice: 1600
    },
    {
        id: 4,
        guestName: "Sarah Davis",
        roomName: "Peak View Cabin",
        checkIn: "2024-11-22",
        checkOut: "2024-11-27",
        status: "confirmed",
        totalPrice: 2800
    }
];

// Render recent bookings
function renderRecentBookings() {
    const container = document.getElementById('recentBookings');
    if (!container) return;
    
    container.innerHTML = recentBookings.map(booking => {
        const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 
                           booking.status === 'pending' ? 'status-pending' : 'status-cancelled';
        
        return `
            <div class="booking-item">
                <div>
                    <div class="font-medium">${booking.guestName}</div>
                    <div class="text-body-sm text-on-surface-variant">${booking.roomName}</div>
                    <div class="text-body-sm text-on-surface-variant">${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}</div>
                </div>
                <div class="text-right">
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                    <div class="font-bold text-primary mt-sm">$${booking.totalPrice}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Format date
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/pages/hotel/login/';
        }, 1000);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderRecentBookings();
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
