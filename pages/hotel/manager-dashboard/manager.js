const token = sessionStorage.getItem('token');
const user = JSON.parse(sessionStorage.getItem('user') || '{}');

// Redirect if not manager
if (!token || user.role !== 'manager') {
    window.location.href = '/pages/hotel/login-lumina/login-lumina.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (user.name) document.getElementById('userNameDisplay').textContent = user.name;
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/pages/hotel/login-lumina/login-lumina.html';
    });

    loadAnalytics();
});

async function loadAnalytics() {
    try {
        const res = await fetch('/api/manager/analytics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            // Update KPIs
            document.getElementById('statRevenue').textContent = `$${data.analytics.totalRevenue}`;
            document.getElementById('statOccupancy').textContent = `${data.analytics.occupancyRate}%`;
            document.getElementById('statOccupancyDetails').textContent = `${data.analytics.occupiedRooms} of ${data.analytics.totalRooms} Rooms`;
            document.getElementById('statTotalBookings').textContent = data.analytics.totalBookings;

            // Update Recent Bookings Table
            const tbody = document.getElementById('recentBookingsBody');
            if (data.recentBookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500">No recent bookings.</td></tr>';
                return;
            }

            tbody.innerHTML = data.recentBookings.map(b => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="p-4">
                        <div class="font-medium text-gray-800">${b.guestName}</div>
                        <div class="text-xs text-gray-500">${b.bookingCode || 'N/A'}</div>
                    </td>
                    <td class="p-4 text-gray-700">Room ${b.roomId}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-medium ${
                            b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            b.status === 'CheckedIn' ? 'bg-green-100 text-green-800' :
                            b.status === 'CheckedOut' ? 'bg-gray-100 text-gray-800' :
                            b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }">${b.status}</span>
                    </td>
                    <td class="p-4 font-medium text-gray-800">$${b.total}</td>
                    <td class="p-4 text-sm text-gray-500">${new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('');
        } else {
            console.error("Failed to load analytics:", data.message);
        }
    } catch (err) {
        console.error("Network error fetching analytics:", err);
    }
}
