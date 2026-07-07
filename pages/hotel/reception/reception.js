// Tailwind configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#1A3636',
                secondary: '#D4AF37',
                surface: '#F8F9FA'
            }
        }
    }
};

// Auth check
const token = sessionStorage.getItem('token');
if (!token) window.location.href = '/pages/hotel/login-lumina/';

function _toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `p-4 rounded shadow-lg text-white font-medium transition-all transform translate-y-full opacity-0 ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function logout() {
    sessionStorage.clear();
    window.location.href = '/pages/hotel/login-lumina/';
}

async function loadBookings() {
    try {
        const res = await fetch('/api/bookings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            const tbody = document.getElementById('bookingsTableBody');
            if (data.bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500">No bookings found.</td></tr>';
                return;
            }

            // Sort so pending/confirmed are at top
            data.bookings.sort((a,b) => new Date(a.checkInDate) - new Date(b.checkInDate));

            tbody.innerHTML = data.bookings.map(b => `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="p-4">
                        <div class="font-medium">${b.guestName}</div>
                        <div class="text-sm text-gray-500">${b.guests} Guests</div>
                    </td>
                    <td class="p-4">
                        <div class="text-sm font-semibold text-primary">Code: ${b.bookingCode || 'N/A'}</div>
                        <div class="text-xs text-gray-500 break-all">${b.guestEmail || 'No Email'}</div>
                        <div class="text-xs text-gray-500">${b.guestPhone || 'No Phone'}</div>
                        ${b.arrivalTime ? `<div class="text-xs text-blue-600 mt-1">Arrival: ${b.arrivalTime}</div>` : ''}
                        ${b.specialRequests ? `<div class="text-xs text-yellow-600 italic" title="${b.specialRequests.replace(/"/g, '&quot;')}">Has Requests</div>` : ''}
                    </td>
                    <td class="p-4">
                        <div class="font-medium">Room ${b.roomId}</div>
                        <div class="text-xs text-gray-500">$${b.total} Total</div>
                    </td>
                    <td class="p-4">
                        <div class="text-sm">${b.checkInDate} to</div>
                        <div class="text-sm">${b.checkOutDate}</div>
                    </td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded text-xs font-medium block w-max mb-1 ${
                            b.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            b.status === 'CheckedIn' ? 'bg-green-100 text-green-800' :
                            b.status === 'CheckedOut' ? 'bg-gray-100 text-gray-800' :
                            b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }">${b.status}</span>
                        ${b.paymentState === 'Pending' ? `<span class="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs block w-max">Payment: Pending</span>` : ''}
                    </td>
                    <td class="p-4 flex flex-col gap-2">
                        <div class="flex gap-2">
                            ${b.status === 'Confirmed' ? `<button data-action="checkin" data-id="${b.id}" class="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 w-full">Check In</button>` : ''}
                            ${b.status === 'CheckedIn' ? `<button data-action="checkout" data-id="${b.id}" class="px-2 py-1 bg-primary text-white rounded text-xs hover:bg-opacity-90 w-full">Check Out</button>` : ''}
                            ${b.paymentState === 'Pending' && b.status !== 'Cancelled' ? `<button data-action="confirmpay" data-id="${b.id}" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 w-full">Confirm Pay</button>` : ''}
                        </div>
                        <div class="flex gap-2">
                            <button data-action="edit" data-id="${b.id}" class="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs hover:bg-gray-300 w-full">Edit</button>
                            ${b.status === 'Confirmed' || b.status === 'Pending' ? `<button data-action="cancel" data-id="${b.id}" class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 w-full">Cancel</button>` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');

            // Store bookings data globally so we can access it for editing
            window.allBookings = data.bookings;
        }
    } catch (err) {
        console.error(err);
        _toast('Failed to load bookings', 'error');
    }
}

async function updateStatus(id, status) {
    const csrf = sessionStorage.getItem('csrfToken');
    try {
        const res = await fetch(`/api/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-CSRF-Token': csrf
            },
            body: JSON.stringify({ status })
        });
        
        const data = await res.json();
        if (data.success) {
            _toast(`Successfully updated to ${status}`, 'success');
            loadBookings();
        } else {
            _toast(data.message || 'Update failed', 'error');
        }
    } catch(e) {
        _toast('Network error', 'error');
    }
}

async function confirmPayment(id) {
    const csrf = sessionStorage.getItem('csrfToken');
    try {
        const res = await fetch(`/api/bookings/${id}/payment`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'X-CSRF-Token': csrf
            }
        });
        const data = await res.json();
        if (data.success) {
            _toast('Payment confirmed', 'success');
            loadBookings();
        } else {
            _toast(data.message, 'error');
        }
    } catch(e) { _toast('Network error', 'error'); }
}

async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    const csrf = sessionStorage.getItem('csrfToken');
    try {
        const res = await fetch(`/api/bookings/${id}/cancel`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'X-CSRF-Token': csrf
            }
        });
        const data = await res.json();
        if (data.success) {
            _toast('Booking cancelled', 'success');
            loadBookings();
        } else {
            _toast(data.message, 'error');
        }
    } catch(e) { _toast('Network error', 'error'); }
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.name) document.getElementById('userNameDisplay').textContent = user.name;
    loadBookings();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Event delegation for dynamically generated buttons
    const tbody = document.getElementById('bookingsTableBody');
    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            
            if (action === 'checkin') {
                updateStatus(id, 'CheckedIn');
            } else if (action === 'checkout') {
                updateStatus(id, 'CheckedOut');
            } else if (action === 'confirmpay') {
                confirmPayment(id);
            } else if (action === 'cancel') {
                cancelBooking(id);
            } else if (action === 'edit') {
                openEditModal(id);
            }
        });
    }

    // Walk-In Booking Modal Logic
    const walkInModal = document.getElementById('walkInModal');
    const openWalkInBtn = document.getElementById('openWalkInBtn');
    const closeWalkInBtn = document.getElementById('closeWalkInBtn');
    const cancelWalkInBtn = document.getElementById('cancelWalkInBtn');
    const walkInForm = document.getElementById('walkInForm');
    const walkInLoader = document.getElementById('walkInLoader');
    const submitWalkInBtn = document.getElementById('submitWalkInBtn');

    if (openWalkInBtn && walkInModal) {
        const toggleModal = (show) => {
            if (show) {
                walkInModal.classList.remove('hidden');
                requestAnimationFrame(() => walkInModal.classList.remove('opacity-0'));
            } else {
                walkInModal.classList.add('opacity-0');
                setTimeout(() => walkInModal.classList.add('hidden'), 300);
            }
        };

        openWalkInBtn.addEventListener('click', () => toggleModal(true));
        closeWalkInBtn.addEventListener('click', () => toggleModal(false));
        cancelWalkInBtn.addEventListener('click', () => toggleModal(false));

        walkInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnText = submitWalkInBtn.querySelector('span');
            btnText.textContent = 'Processing...';
            walkInLoader.classList.remove('hidden');
            submitWalkInBtn.disabled = true;

            const bookingCode = 'LUM-' + Math.floor(10000 + Math.random() * 90000);

            try {
                const res = await fetch('/api/bookings/admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
                    },
                    body: JSON.stringify({
                        roomId: document.getElementById('wiRoomId').value,
                        checkIn: document.getElementById('wiCheckIn').value,
                        checkOut: document.getElementById('wiCheckOut').value,
                        guests: document.getElementById('wiGuests').value,
                        guestInfo: {
                            name: document.getElementById('wiName').value,
                            email: document.getElementById('wiEmail').value,
                            phone: document.getElementById('wiPhone').value,
                            paymentMethod: document.getElementById('wiPayment').value,
                            bookingCode: bookingCode,
                            specialRequests: 'Walk-In Booking'
                        }
                    })
                });

                const data = await res.json();
                if (data.success) {
                    _toast('Walk-In Booking Created!', 'success');
                    toggleModal(false);
                    walkInForm.reset();
                    loadBookings();
                } else {
                    _toast(data.message, 'error');
                }
            } catch (err) {
                _toast('Network Error', 'error');
            } finally {
                btnText.textContent = 'Confirm Walk-In';
                walkInLoader.classList.add('hidden');
                submitWalkInBtn.disabled = false;
            }
        });
    }

    // Settings Modal Logic
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const settingsForm = document.getElementById('settingsForm');
    const settingsLoader = document.getElementById('settingsLoader');
    const submitSettingsBtn = document.getElementById('submitSettingsBtn');

    if (openSettingsBtn && settingsModal) {
        const toggleSettingsModal = (show) => {
            if (show) {
                settingsModal.classList.remove('hidden');
                requestAnimationFrame(() => settingsModal.classList.remove('opacity-0'));
                
                // Fetch current settings to populate form
                fetch('/api/settings/bank-details', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.bankDetails) {
                        document.getElementById('setBankName').value = data.bankDetails.accountName || '';
                        document.getElementById('setAccountNumber').value = data.bankDetails.accountNumber || '';
                    }
                });
            } else {
                settingsModal.classList.add('opacity-0');
                setTimeout(() => settingsModal.classList.add('hidden'), 300);
            }
        };

        openSettingsBtn.addEventListener('click', () => toggleSettingsModal(true));
        closeSettingsBtn.addEventListener('click', () => toggleSettingsModal(false));
        cancelSettingsBtn.addEventListener('click', () => toggleSettingsModal(false));

        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnText = submitSettingsBtn.querySelector('span');
            btnText.textContent = 'Saving...';
            settingsLoader.classList.remove('hidden');
            submitSettingsBtn.disabled = true;

            try {
                const res = await fetch('/api/settings/bank-details', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
                    },
                    body: JSON.stringify({
                        accountName: document.getElementById('setBankName').value,
                        accountNumber: document.getElementById('setAccountNumber').value
                    })
                });
                
                const data = await res.json();
                if (data.success) {
                    _toast('Bank Settings Saved', 'success');
                    toggleSettingsModal(false);
                } else {
                    _toast(data.message, 'error');
                }
            } catch (err) {
                _toast('Network Error', 'error');
            } finally {
                btnText.textContent = 'Save Settings';
                settingsLoader.classList.add('hidden');
                submitSettingsBtn.disabled = false;
            }
        });
    }

    // Edit Booking Modal Logic
    const editModal = document.getElementById('editModal');
    const closeEditBtn = document.getElementById('closeEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editForm = document.getElementById('editForm');
    
    if (editModal) {
        window.openEditModal = (id) => {
            const booking = window.allBookings.find(b => b.id == id);
            if (!booking) return;
            
            document.getElementById('editBookingId').value = booking.id;
            document.getElementById('editName').value = booking.guestName;
            document.getElementById('editEmail').value = booking.guestEmail;
            document.getElementById('editPhone').value = booking.guestPhone;
            document.getElementById('editRoomId').value = booking.roomId;
            document.getElementById('editCheckIn').value = booking.checkInDate.split('T')[0];
            document.getElementById('editCheckOut').value = booking.checkOutDate.split('T')[0];
            document.getElementById('editRequests').value = booking.specialRequests || '';
            
            editModal.classList.remove('hidden');
            requestAnimationFrame(() => editModal.classList.remove('opacity-0'));
        };

        const closeEditModal = () => {
            editModal.classList.add('opacity-0');
            setTimeout(() => editModal.classList.add('hidden'), 300);
        };

        closeEditBtn.addEventListener('click', closeEditModal);
        cancelEditBtn.addEventListener('click', closeEditModal);

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editBookingId').value;
            const btn = document.getElementById('submitEditBtn');
            const loader = document.getElementById('editLoader');
            const span = btn.querySelector('span');
            
            span.textContent = 'Saving...';
            loader.classList.remove('hidden');
            btn.disabled = true;

            try {
                const res = await fetch(`/api/bookings/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || ''
                    },
                    body: JSON.stringify({
                        guestName: document.getElementById('editName').value,
                        guestEmail: document.getElementById('editEmail').value,
                        guestPhone: document.getElementById('editPhone').value,
                        roomId: document.getElementById('editRoomId').value,
                        checkInDate: document.getElementById('editCheckIn').value,
                        checkOutDate: document.getElementById('editCheckOut').value,
                        specialRequests: document.getElementById('editRequests').value
                    })
                });
                
                const data = await res.json();
                if (data.success) {
                    _toast('Booking Updated', 'success');
                    closeEditModal();
                    loadBookings();
                } else {
                    _toast(data.message, 'error');
                }
            } catch (err) {
                _toast('Network Error', 'error');
            } finally {
                span.textContent = 'Save Changes';
                loader.classList.add('hidden');
                btn.disabled = false;
            }
        });
    }
});
