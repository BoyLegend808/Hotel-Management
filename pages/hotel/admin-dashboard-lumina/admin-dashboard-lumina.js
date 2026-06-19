// Lumina Hospitality - Admin Dashboard JavaScript

// Auth helper
function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Format date helper
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Render recent bookings
function renderRecentBookings(bookings) {
    const container = document.getElementById('recentBookings');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-lg text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-sm" style="display:block;">calendar_today</span>
                <p>No recent bookings yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = bookings.slice(0, 6).map(booking => {
        const statusColors = {
            confirmed: 'bg-green-100 text-green-800',
            pending:   'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-blue-100 text-blue-800'
        };
        const statusClass = statusColors[booking.status] || 'bg-gray-100 text-gray-800';

        return `
            <div class="booking-item">
                <div>
                    <div class="font-medium">${booking.guestName || 'Unknown Guest'}</div>
                    <div class="text-body-sm text-on-surface-variant">${booking.roomId ? 'Room #' + booking.roomId : 'N/A'}</div>
                    <div class="text-body-sm text-on-surface-variant">
                        ${booking.checkIn ? formatDate(booking.checkIn) : '—'} → ${booking.checkOut ? formatDate(booking.checkOut) : '—'}
                    </div>
                </div>
                <div class="text-right">
                    <span class="booking-status ${statusClass} px-sm py-xs rounded-full text-label-md">${booking.status}</span>
                    <div class="font-bold text-primary mt-sm">$${Number(booking.total || 0).toFixed(2)}</div>
                </div>
            </div>`;
    }).join('');
}

// Update KPI cards with live data
function updateKPICards(stats) {
    const map = {
        'totalBookings':  stats.totalBookings,
        'occupancyRate':  stats.occupancyRate + '%',
        'totalRevenue':   '$' + Number(stats.totalRevenue).toLocaleString(),
        'avgRating':      stats.averageRating
    };

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });

    // Room status overview
    const available = document.getElementById('availableRooms');
    const occupied  = document.getElementById('occupiedRooms');
    if (available) available.textContent = stats.availableRooms ?? '—';
    if (occupied)  occupied.textContent  = (stats.totalRooms - stats.availableRooms) ?? '—';
}

// Load stats from API
async function loadStats() {
    try {
        const res = await fetch('/api/stats', { headers: getAuthHeaders() });
        if (res.ok) {
            const stats = await res.json();
            updateKPICards(stats);
        }
    } catch (err) {
        console.warn('Could not load stats:', err.message);
    }
}

// Load bookings from API
async function loadRecentBookings() {
    try {
        const res = await fetch('/api/bookings', { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            renderRecentBookings(data.bookings || []);
        } else {
            // Fall back to sample data if not authed yet
            renderRecentBookings(sampleBookings);
        }
    } catch (err) {
        renderRecentBookings(sampleBookings);
    }
}

// Sample fallback data
const sampleBookings = [
    { id: 1, guestName: 'John Smith',    roomId: 101, checkIn: '2025-11-15', checkOut: '2025-11-20', status: 'confirmed', total: 2250 },
    { id: 2, guestName: 'Emily Johnson', roomId: 102, checkIn: '2025-11-18', checkOut: '2025-11-22', status: 'pending',   total: 1800 },
    { id: 3, guestName: 'Michael Brown', roomId: 103, checkIn: '2025-11-20', checkOut: '2025-11-25', status: 'confirmed', total: 1600 },
    { id: 4, guestName: 'Sarah Davis',   roomId: 105, checkIn: '2025-11-22', checkOut: '2025-11-27', status: 'confirmed', total: 2800 }
];

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/api/logout', {
            method: 'POST',
            headers: getAuthHeaders()
        }).catch(() => {});
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/pages/hotel/login-lumina/';
        }, 1000);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecentBookings();
});

