document.addEventListener('DOMContentLoaded', () => {
    // ── Mock Data ──
    const mockStaff = [
        { id: 'EMP-001', name: 'Julian Reed', role: 'General Manager', dept: 'Management', email: 'j.reed@lumina.com', phone: '+1 555-0101', status: 'active', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80' },
        { id: 'EMP-002', name: 'Sophia Lin', role: 'Head Concierge', dept: 'Front Desk', email: 's.lin@lumina.com', phone: '+1 555-0102', status: 'active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80' },
        { id: 'EMP-003', name: 'Marcus Johnson', role: 'Executive Chef', dept: 'Food & Beverage', email: 'm.johnson@lumina.com', phone: '+1 555-0103', status: 'offline', avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&q=80' },
        { id: 'EMP-004', name: 'Elena Rodriguez', role: 'Housekeeping Manager', dept: 'Housekeeping', email: 'e.rodriguez@lumina.com', phone: '+1 555-0104', status: 'active', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&q=80' },
        { id: 'EMP-005', name: 'David Kim', role: 'Front Desk Agent', dept: 'Front Desk', email: 'd.kim@lumina.com', phone: '+1 555-0105', status: 'active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80' },
        { id: 'EMP-006', name: 'Sarah Patel', role: 'Sommelier', dept: 'Food & Beverage', email: 's.patel@lumina.com', phone: '+1 555-0106', status: 'offline', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' }
    ];

    let currentStaff = [...mockStaff];

    // ── DOM Elements ──
    const grid = document.getElementById('staffGrid');
    const searchInput = document.getElementById('staffSearch');
    const deptFilter = document.getElementById('departmentFilter');

    // ── Render Grid ──
    function renderGrid() {
        grid.innerHTML = '';
        
        if (currentStaff.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full p-xl text-center text-on-surface-variant glass-card rounded-xl">
                    <span class="material-symbols-outlined text-4xl mb-sm block">search_off</span>
                    <p>No staff members found.</p>
                </div>
            `;
            return;
        }

        currentStaff.forEach(staff => {
            const card = document.createElement('div');
            card.className = 'glass-card rounded-xl p-lg staff-card flex flex-col justify-between';
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-md">
                        <div class="staff-avatar-wrapper">
                            <img src="${staff.avatar}" alt="${staff.name}" class="staff-avatar" loading="lazy" />
                        </div>
                        <button class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant" title="Edit Staff">
                            <span class="material-symbols-outlined text-sm">edit</span>
                        </button>
                    </div>
                    <h3 class="font-h3 text-h3 text-primary mb-xs">${staff.name}</h3>
                    <p class="font-bold text-secondary mb-sm">${staff.role}</p>
                    <div class="flex items-center text-sm text-on-surface-variant mb-xs">
                        <span class="material-symbols-outlined text-sm mr-xs">business</span> ${staff.dept}
                    </div>
                    <div class="flex items-center text-sm text-on-surface-variant mb-xs">
                        <span class="material-symbols-outlined text-sm mr-xs">mail</span> ${staff.email}
                    </div>
                    <div class="flex items-center text-sm text-on-surface-variant mb-md">
                        <span class="material-symbols-outlined text-sm mr-xs">call</span> ${staff.phone}
                    </div>
                </div>
                <div class="pt-sm border-t border-outline-variant/30 mt-auto flex justify-between items-center">
                    <span class="text-sm font-semibold flex items-center">
                        <span class="status-dot status-${staff.status}"></span>
                        ${staff.status === 'active' ? 'On Duty' : 'Off Duty'}
                    </span>
                    <span class="text-xs text-on-surface-variant bg-surface-container px-sm py-xs rounded-md border border-outline-variant/50">${staff.id}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // ── Filter & Search Logic ──
    function filterStaff() {
        const searchTerm = searchInput.value.toLowerCase();
        const dept = deptFilter.value;

        currentStaff = mockStaff.filter(staff => {
            const matchesSearch = staff.name.toLowerCase().includes(searchTerm) || 
                                  staff.role.toLowerCase().includes(searchTerm) || 
                                  staff.id.toLowerCase().includes(searchTerm);
            const matchesDept = dept === 'all' || staff.dept === dept;
            return matchesSearch && matchesDept;
        });

        renderGrid();
    }

    searchInput.addEventListener('input', filterStaff);
    deptFilter.addEventListener('change', filterStaff);

    // Initial render
    renderGrid();
});
