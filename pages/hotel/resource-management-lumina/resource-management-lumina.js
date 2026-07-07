document.addEventListener('DOMContentLoaded', () => {
    // ── Generate Mock Room Data ──
    // Floors 1-3 have 20 rooms each, Floor 4 has 10 suites
    const mockRooms = [];
    const statuses = ['available', 'available', 'available', 'occupied', 'occupied', 'occupied', 'cleaning', 'maintenance'];
    
    for(let f = 1; f <= 4; f++) {
        let maxRooms = (f === 4) ? 10 : 20;
        for(let r = 1; r <= maxRooms; r++) {
            let roomNumber = `${f}${r.toString().padStart(2, '0')}`;
            // Random status seeded for demo
            let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            mockRooms.push({
                number: roomNumber,
                floor: f,
                type: (f === 4) ? 'Suite' : 'Standard',
                status: randomStatus,
                guest: (randomStatus === 'occupied') ? 'Jane Doe' : null,
                notes: (randomStatus === 'maintenance') ? 'AC Unit repair scheduled' : ''
            });
        }
    }

    let currentRooms = [...mockRooms];

    // ── DOM Elements ──
    const matrix = document.getElementById('roomMatrix');
    const floorFilter = document.getElementById('floorFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const slideOver = document.getElementById('roomSlideOver');
    const slideOverBackdrop = document.getElementById('slideOverBackdrop');
    const closeSlideOverBtn = document.getElementById('closeSlideOver');
    const slideOverContent = document.getElementById('slideOverContent');
    const roomTitle = document.getElementById('roomTitle');

    // ── Render Matrix ──
    function renderMatrix() {
        matrix.innerHTML = '';
        
        if (currentRooms.length === 0) {
            matrix.innerHTML = `<p class="col-span-full text-on-surface-variant">No rooms match criteria.</p>`;
            return;
        }

        currentRooms.forEach(room => {
            const node = document.createElement('div');
            node.className = `room-node room-${room.status}`;
            node.textContent = room.number;
            node.title = `Room ${room.number} - ${room.status}`;
            
            node.addEventListener('click', () => openRoomDetails(room));
            
            matrix.appendChild(node);
        });
    }

    // ── Filter Logic ──
    function filterRooms() {
        const floor = floorFilter.value;
        const status = statusFilter.value;

        currentRooms = mockRooms.filter(room => {
            const matchesFloor = floor === 'all' || room.floor.toString() === floor;
            const matchesStatus = status === 'all' || room.status === status;
            return matchesFloor && matchesStatus;
        });

        renderMatrix();
    }

    floorFilter.addEventListener('change', filterRooms);
    statusFilter.addEventListener('change', filterRooms);

    // ── Slide-over Logic ──
    function openRoomDetails(room) {
        roomTitle.textContent = `Room ${room.number}`;
        
        let statusBadgeColor = 'primary';
        if(room.status === 'available') statusBadgeColor = 'success';
        if(room.status === 'cleaning') statusBadgeColor = 'warning';
        if(room.status === 'maintenance') statusBadgeColor = 'error';

        slideOverContent.innerHTML = `
            <div class="mb-md">
                <span class="inline-block px-3 py-1 rounded-full bg-${statusBadgeColor}/10 text-${statusBadgeColor} border border-${statusBadgeColor}/20 text-xs font-bold uppercase tracking-wider mb-sm">
                    ${room.status}
                </span>
                <p class="text-on-surface-variant font-bold">${room.type}</p>
            </div>
            
            ${room.guest ? `
            <div class="glass-card p-md rounded-lg mb-md">
                <p class="text-xs uppercase text-on-surface-variant font-bold mb-xs">Current Guest</p>
                <p class="font-bold text-primary">${room.guest}</p>
            </div>
            ` : ''}

            ${room.notes ? `
            <div class="glass-card p-md rounded-lg bg-tertiary-container/10 border border-tertiary/20 mb-md">
                <p class="text-xs uppercase text-tertiary font-bold mb-xs">Notes</p>
                <p class="text-sm text-tertiary">${room.notes}</p>
            </div>
            ` : ''}

            <div class="border-t border-outline-variant/30 pt-md mt-lg">
                <p class="font-bold mb-sm">Update Status</p>
                <div class="flex flex-col gap-sm">
                    ${room.status !== 'available' ? `<button class="btn btn-outline border-success text-success hover:bg-success/10 w-full" onclick="updateRoomStatus('${room.number}', 'available')">Mark as Available</button>` : ''}
                    ${room.status !== 'cleaning' ? `<button class="btn btn-outline border-warning text-warning hover:bg-warning/10 w-full" onclick="updateRoomStatus('${room.number}', 'cleaning')">Request Cleaning</button>` : ''}
                    ${room.status !== 'maintenance' ? `<button class="btn btn-outline border-error text-error hover:bg-error/10 w-full" onclick="updateRoomStatus('${room.number}', 'maintenance')">Flag for Maintenance</button>` : ''}
                </div>
            </div>
        `;

        slideOver.classList.add('slide-over-open');
        slideOverBackdrop.classList.add('backdrop-open');
    }

    function closeSlideOverFunc() {
        slideOver.classList.remove('slide-over-open');
        slideOverBackdrop.classList.remove('backdrop-open');
    }

    closeSlideOverBtn.addEventListener('click', closeSlideOverFunc);
    slideOverBackdrop.addEventListener('click', closeSlideOverFunc);
    
    // Global function for inline onclick handlers
    window.updateRoomStatus = function(roomNumber, newStatus) {
        const index = mockRooms.findIndex(r => r.number === roomNumber);
        if(index > -1) {
            mockRooms[index].status = newStatus;
            
            // Clear notes if available
            if(newStatus === 'available') {
                mockRooms[index].notes = '';
            }

            filterRooms();
            closeSlideOverFunc();
            
            if(window.uiUtils && window.uiUtils.showToast) {
                window.uiUtils.showToast(`Room ${roomNumber} updated to ${newStatus}`, 'success');
            } else {
                alert(`Room ${roomNumber} updated.`);
            }
        }
    };

    // Initial render
    renderMatrix();
});
