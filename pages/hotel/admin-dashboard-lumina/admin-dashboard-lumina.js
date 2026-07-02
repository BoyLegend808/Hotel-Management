// Lumina Hospitality - Admin Dashboard JavaScript

// Escape helper (inline, since this file may load before ui-utils.js)
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
                    <div class="font-medium">${esc(booking.guestName || 'Unknown Guest')}</div>
                    <div class="text-body-sm text-on-surface-variant">${booking.roomId ? 'Room #' + esc(String(booking.roomId)) : 'N/A'}</div>
                    <div class="text-body-sm text-on-surface-variant">
                        ${booking.checkIn ? esc(formatDate(booking.checkIn)) : '&mdash;'} &rarr; ${booking.checkOut ? esc(formatDate(booking.checkOut)) : '&mdash;'}
                    </div>
                </div>
                <div class="text-right">
                    <span class="booking-status ${esc(statusClass)} px-sm py-xs rounded-full text-label-md">${esc(booking.status)}</span>
                    <div class="font-bold text-primary mt-sm">$${esc(Number(booking.total || 0).toFixed(2))}</div>
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

// Logout — replaced browser confirm() with toast + inline confirm UI
function logout() {
    const confirmed = document.createElement('div');
    confirmed.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/50';
    confirmed.innerHTML = `
        <div class="bg-white rounded-xl p-lg shadow-xl max-w-sm w-full mx-4 text-center">
            <p class="font-h3 text-h3 mb-md">Log out?</p>
            <p class="text-body-sm text-on-surface-variant mb-lg">You will be returned to the login page.</p>
            <div class="flex gap-md justify-center">
                <button id="confirmLogoutYes" class="px-lg py-sm bg-primary text-white rounded-lg font-button">Log out</button>
                <button id="confirmLogoutNo" class="px-lg py-sm border border-outline-variant rounded-lg font-button">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(confirmed);
    document.getElementById('confirmLogoutNo').onclick = () => confirmed.remove();
    document.getElementById('confirmLogoutYes').onclick = () => {
        confirmed.remove();
        fetch('/api/logout', { method: 'POST', headers: getAuthHeaders() }).catch(() => {});
        sessionStorage.clear();
        showToast('Logged out successfully', 'success');
        setTimeout(() => { window.location.href = '/pages/hotel/login-lumina/'; }, 1000);
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadRecentBookings();
});

