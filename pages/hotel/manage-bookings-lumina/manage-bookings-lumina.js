document.addEventListener('DOMContentLoaded', () => {
    // ── Mock Data ──
    const mockBookings = [
        { id: 'BKG-7829', guestName: 'Eleanor Vance', email: 'eleanor.v@example.com', phone: '+1 555-0192', roomType: 'Oceanview Suite', checkIn: '2026-07-08', checkOut: '2026-07-12', status: 'upcoming', guests: 2, price: '$2,400', notes: 'VIP. Anniversary trip. Requesting champagne on arrival.' },
        { id: 'BKG-7830', guestName: 'Marcus Thorne', email: 'm.thorne@example.com', phone: '+1 555-0188', roomType: 'Deluxe King', checkIn: '2026-07-05', checkOut: '2026-07-09', status: 'checked-in', guests: 1, price: '$1,200', notes: 'Late checkout requested.' },
        { id: 'BKG-7831', guestName: 'Sarah Jenkins', email: 's.jenkins@example.com', phone: '+1 555-0145', roomType: 'Penthouse', checkIn: '2026-07-01', checkOut: '2026-07-05', status: 'checked-out', guests: 4, price: '$8,500', notes: 'Corporate booking.' },
        { id: 'BKG-7832', guestName: 'David Chen', email: 'd.chen@example.com', phone: '+1 555-0112', roomType: 'Standard Queen', checkIn: '2026-07-10', checkOut: '2026-07-11', status: 'cancelled', guests: 2, price: '$400', notes: 'Flight cancelled.' },
        { id: 'BKG-7833', guestName: 'Amelia Pond', email: 'a.pond@example.com', phone: '+44 7700 900077', roomType: 'Oceanview Suite', checkIn: '2026-07-15', checkOut: '2026-07-20', status: 'upcoming', guests: 2, price: '$3,000', notes: 'Allergies: Peanuts.' },
        { id: 'BKG-7834', guestName: 'James Holden', email: 'j.holden@example.com', phone: '+1 555-0199', roomType: 'Deluxe King', checkIn: '2026-07-06', checkOut: '2026-07-08', status: 'checked-in', guests: 2, price: '$600', notes: 'Extra pillows requested.' },
    ];

    let currentBookings = [...mockBookings];

    // ── DOM Elements ──
    const tableBody = document.getElementById('bookingsTableBody');
    const searchInput = document.getElementById('bookingSearch');
    const statusFilter = document.getElementById('bookingStatusFilter');
    
    // Slide-over Elements
    const slideOver = document.getElementById('bookingSlideOver');
    const slideOverBackdrop = document.getElementById('slideOverBackdrop');
    const closeSlideOverBtn = document.getElementById('closeSlideOver');
    const slideOverContent = document.getElementById('slideOverContent');
    const slideOverActions = document.getElementById('slideOverActions');

    // ── Render Table ──
    function renderTable() {
        tableBody.innerHTML = '';
        
        if (currentBookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="p-xl text-center text-on-surface-variant">
                        <span class="material-symbols-outlined text-4xl mb-sm block">search_off</span>
                        <p>No bookings found.</p>
                    </td>
                </tr>
            `;
            return;
        }

        currentBookings.forEach(booking => {
            const tr = document.createElement('tr');
            tr.className = 'group';
            tr.innerHTML = `
                <td class="p-md font-semibold text-primary">${booking.id}</td>
                <td class="p-md">
                    <p class="font-bold">${booking.guestName}</p>
                    <p class="text-sm text-on-surface-variant">${booking.email}</p>
                </td>
                <td class="p-md">${booking.roomType}</td>
                <td class="p-md">
                    <p>${formatDate(booking.checkIn)} -</p>
                    <p>${formatDate(booking.checkOut)}</p>
                </td>
                <td class="p-md">
                    <span class="status-badge status-${booking.status}">${booking.status.replace('-', ' ')}</span>
                </td>
                <td class="p-md text-right">
                    <button class="view-btn text-primary hover:bg-primary/10 p-sm rounded-full transition-colors" data-id="${booking.id}" title="View Details">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </td>
            `;
            
            // Allow clicking anywhere on the row to open details
            tr.addEventListener('click', (e) => {
                // Don't trigger if they clicked a button specifically (though we handle it below too)
                if(!e.target.closest('button')) {
                    openBookingDetails(booking);
                }
            });
            
            // Button specific listener
            tr.querySelector('.view-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openBookingDetails(booking);
            });

            tableBody.appendChild(tr);
        });
    }

    // ── Filter & Search Logic ──
    function filterBookings() {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;

        currentBookings = mockBookings.filter(booking => {
            const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm) || 
                                  booking.id.toLowerCase().includes(searchTerm) || 
                                  booking.roomType.toLowerCase().includes(searchTerm);
            const matchesStatus = status === 'all' || booking.status === status;
            return matchesSearch && matchesStatus;
        });

        renderTable();
    }

    searchInput.addEventListener('input', filterBookings);
    statusFilter.addEventListener('change', filterBookings);

    // ── Slide-over Logic ──
    function openBookingDetails(booking) {
        // Populate Content
        slideOverContent.innerHTML = `
            <div class="mb-lg">
                <span class="status-badge status-${booking.status} mb-md">${booking.status.replace('-', ' ')}</span>
                <h3 class="font-h2 text-h2 text-primary mb-xs">${booking.guestName}</h3>
                <p class="text-on-surface-variant flex items-center gap-xs"><span class="material-symbols-outlined text-sm">mail</span> ${booking.email}</p>
                <p class="text-on-surface-variant flex items-center gap-xs"><span class="material-symbols-outlined text-sm">call</span> ${booking.phone}</p>
            </div>
            
            <div class="glass-card p-md rounded-lg mb-lg">
                <h4 class="font-bold mb-sm border-b border-outline-variant/30 pb-xs">Stay Details</h4>
                <div class="grid grid-cols-2 gap-sm text-sm">
                    <div>
                        <p class="text-on-surface-variant">Booking ID</p>
                        <p class="font-semibold">${booking.id}</p>
                    </div>
                    <div>
                        <p class="text-on-surface-variant">Room Type</p>
                        <p class="font-semibold">${booking.roomType}</p>
                    </div>
                    <div>
                        <p class="text-on-surface-variant">Check-in</p>
                        <p class="font-semibold">${formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                        <p class="text-on-surface-variant">Check-out</p>
                        <p class="font-semibold">${formatDate(booking.checkOut)}</p>
                    </div>
                    <div>
                        <p class="text-on-surface-variant">Guests</p>
                        <p class="font-semibold">${booking.guests}</p>
                    </div>
                    <div>
                        <p class="text-on-surface-variant">Total Price</p>
                        <p class="font-semibold">${booking.price}</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card p-md rounded-lg bg-tertiary-container/10 border-tertiary/20 text-tertiary">
                <h4 class="font-bold flex items-center gap-xs mb-xs"><span class="material-symbols-outlined">notes</span> Special Requests / Notes</h4>
                <p class="text-sm">${booking.notes || 'No special requests.'}</p>
            </div>
        `;

        // Populate Actions based on status
        let actionsHtml = '';
        if (booking.status === 'upcoming') {
            actionsHtml = `
                <button class="btn btn-outline btn-small text-error border-error hover:bg-error/10" id="cancelBtn" data-id="${booking.id}">Cancel Booking</button>
                <button class="btn btn-primary btn-small" id="checkInBtn" data-id="${booking.id}">Check-in Guest</button>
            `;
        } else if (booking.status === 'checked-in') {
            actionsHtml = `
                <button class="btn btn-primary btn-small" id="checkOutBtn" data-id="${booking.id}">Check-out Guest</button>
            `;
        } else {
            actionsHtml = `
                <button class="btn btn-outline btn-small" onclick="closeSlideOverFunc()">Close</button>
            `;
        }
        slideOverActions.innerHTML = actionsHtml;

        // Add action listeners
        const cancelBtn = document.getElementById('cancelBtn');
        if(cancelBtn) {
            cancelBtn.addEventListener('click', () => updateBookingStatus(booking.id, 'cancelled', 'Booking has been cancelled successfully.'));
        }
        
        const checkInBtn = document.getElementById('checkInBtn');
        if(checkInBtn) {
            checkInBtn.addEventListener('click', () => updateBookingStatus(booking.id, 'checked-in', 'Guest has been checked in successfully.'));
        }

        const checkOutBtn = document.getElementById('checkOutBtn');
        if(checkOutBtn) {
            checkOutBtn.addEventListener('click', () => updateBookingStatus(booking.id, 'checked-out', 'Guest has been checked out successfully.'));
        }

        // Open Slide-over
        slideOver.classList.add('slide-over-open');
        slideOverBackdrop.classList.add('backdrop-open');
    }

    function closeSlideOverFunc() {
        slideOver.classList.remove('slide-over-open');
        slideOverBackdrop.classList.remove('backdrop-open');
    }

    closeSlideOverBtn.addEventListener('click', closeSlideOverFunc);
    slideOverBackdrop.addEventListener('click', closeSlideOverFunc);
    
    // Attach to window so dynamically created buttons can use it if needed
    window.closeSlideOverFunc = closeSlideOverFunc;

    // ── Action Handlers ──
    function updateBookingStatus(id, newStatus, successMsg) {
        const index = mockBookings.findIndex(b => b.id === id);
        if(index > -1) {
            mockBookings[index].status = newStatus;
            filterBookings();
            closeSlideOverFunc();
            if(window.uiUtils && window.uiUtils.showToast) {
                window.uiUtils.showToast(successMsg, 'success');
            } else {
                alert(successMsg);
            }
        }
    }

    // ── Helpers ──
    function formatDate(dateStr) {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    // Initial render
    renderTable();
});
