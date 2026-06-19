/**
 * Page Initialization Script
 * Provides toast helpers, logout handling, and session timeout for all pages.
 * Does NOT auto-inject back buttons (pages use their own header back buttons).
 */

document.addEventListener('DOMContentLoaded', function () {
    // Expose global helpers from the UI module
    if (typeof UI !== 'undefined') {
        window.showToast = (message, type, duration) => UI.showToast(message, type, duration);
        window.goBack = () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/pages/hotel/home-lumina/';
            }
        };
    }

    // Enhance all forms — reset submit button on completion
    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', function () {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn && typeof UI !== 'undefined') {
                // Store original and show loading; the form's own handler will reset it
            }
        });
    });

    // Wire up any #logout-btn element
    setupLogout();

    // Replace hardcoded avatar images with user initials when available
    setupAvatarFallback();

    // Session timeout warning (only for logged-in users)
    setupSessionTimeout();
});

function setupAvatarFallback() {
    try {
        const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
        if (!userData.name) return;
        const initial = userData.name.charAt(0).toUpperCase();
        document.querySelectorAll('.rounded-full img').forEach(img => {
            const parent = img.parentElement;
            parent.style.background = 'var(--primary, #006683)';
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            parent.style.color = 'white';
            parent.style.fontWeight = 'bold';
            parent.style.fontSize = '1.25rem';
            img.style.display = 'none';
            if (!parent.querySelector('.avatar-initial')) {
                const span = document.createElement('span');
                span.className = 'avatar-initial';
                span.textContent = initial;
                parent.appendChild(span);
            }
        });
    } catch (e) {}
}

function setupLogout() {
    const user = sessionStorage.getItem('user');
    if (!user) return;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                const token = sessionStorage.getItem('token') || '';
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                sessionStorage.clear();
                if (typeof UI !== 'undefined') {
                    UI.showToast('Logged out successfully', 'success', 1500);
                }
                setTimeout(() => {
                    window.location.href = '/pages/hotel/login-lumina/';
                }, 500);
            }
        });
    }
}

function setupSessionTimeout() {
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours (matches server SESSION_TTL_MS)
    const WARNING_TIME = 5 * 60 * 1000; // warn 5 minutes before

    const user = sessionStorage.getItem('user');
    if (!user) return;

    const sessionStart = parseInt(sessionStorage.getItem('sessionStart') || Date.now(), 10);
    sessionStorage.setItem('sessionStart', sessionStart);

    const elapsed = Date.now() - sessionStart;
    const remaining = SESSION_DURATION - elapsed;

    if (remaining <= 0) {
        sessionStorage.clear();
        window.location.href = '/pages/hotel/login-lumina/';
        return;
    }

    const warningIn = remaining - WARNING_TIME;

    if (warningIn > 0) {
        setTimeout(() => {
            if (typeof UI !== 'undefined') {
                UI.showToast('Your session will expire in 5 minutes.', 'warning', 10000);
            }
        }, warningIn);
    }

    setTimeout(() => {
        sessionStorage.clear();
        if (typeof UI !== 'undefined') {
            UI.showToast('Your session has expired. Please log in again.', 'info', 3000);
        }
        setTimeout(() => {
            window.location.href = '/pages/hotel/login-lumina/';
        }, 3000);
    }, remaining);
}

