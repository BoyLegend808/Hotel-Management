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

async function loadTasks() {
    try {
        const res = await fetch('/api/housekeeping/tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const container = document.getElementById('tasksContainer');
        
        if (data.success) {
            if (data.tasks.length === 0) {
                container.innerHTML = '<div class="p-8 text-center text-gray-500 col-span-full">No rooms require cleaning right now. Great job!</div>';
                return;
            }

            container.innerHTML = data.tasks.map(room => `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div class="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="font-bold text-lg">Room ${room.roomNumber}</h3>
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold uppercase tracking-wider">${room.status}</span>
                    </div>
                    <div class="p-4 flex-grow">
                        <p class="text-sm text-gray-600 mb-4">${room.name} (${room.type})</p>
                        <textarea id="notes-${room.id}" class="w-full p-2 border rounded text-sm mb-4" rows="2" placeholder="Optional notes..."></textarea>
                        <div class="flex gap-2">
                            <button data-action="clean" data-id="${room.id}" class="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 transition-colors">Mark Clean</button>
                            <button data-action="maint" data-id="${room.id}" class="flex-1 bg-orange-500 text-white py-2 rounded font-medium hover:bg-orange-600 transition-colors">Needs Maint.</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
        _toast('Failed to load tasks', 'error');
    }
}

async function logCleaning(roomId, newStatus) {
    const csrf = sessionStorage.getItem('csrfToken');
    const notes = document.getElementById(`notes-${roomId}`).value;
    
    try {
        const res = await fetch('/api/housekeeping/log', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-CSRF-Token': csrf
            },
            body: JSON.stringify({ roomId, notes, newStatus })
        });
        
        const data = await res.json();
        if (data.success) {
            _toast(`Room marked as ${newStatus}`, 'success');
            loadTasks();
        } else {
            _toast(data.message || 'Update failed', 'error');
        }
    } catch(e) {
        _toast('Network error', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.name) document.getElementById('userNameDisplay').textContent = user.name;
    loadTasks();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Event delegation
    const container = document.getElementById('tasksContainer');
    if (container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const id = btn.getAttribute('data-id');
            
            if (action === 'clean') {
                logCleaning(id, 'Available');
            } else if (action === 'maint') {
                logCleaning(id, 'Maintenance');
            }
        });
    }
});
