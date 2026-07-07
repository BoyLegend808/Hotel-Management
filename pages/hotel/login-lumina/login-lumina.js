// Lumina Hospitality - Login Page JavaScript

// Password visibility toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eyeIcon');

if (togglePassword && passwordInput && eyeIcon) {
    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        eyeIcon.textContent = isPassword ? 'visibility' : 'visibility_off';
    });
}

// Add event listeners for buttons that previously used inline onclick
const goBackBtn = document.getElementById('goBackBtn');
if (goBackBtn) {
    goBackBtn.addEventListener('click', goBack);
}

const resetPasswordBtn = document.getElementById('resetPasswordBtn');
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        _toast('Password recovery is currently under maintenance', 'info');
    });
}

const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        _toast('External authentication is currently under maintenance', 'info');
    });
}

const createAccountBtn = document.getElementById('createAccountBtn');
if (createAccountBtn) {
    createAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        _toast('Account registration is currently under maintenance', 'info');
    });
}

// Unified toast helper — works regardless of which global is available
function _toast(message, type) {
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else if (typeof UI !== 'undefined' && UI.showToast) {
        UI.showToast(message, type);
    } else {
        alert(message);
    }
}

// Fetch CSRF token from server and store it
async function fetchAndStoreCsrfToken() {
    try {
        const res = await fetch('/api/csrf-token');
        const data = await res.json();
        if (data.csrfToken) {
            sessionStorage.setItem('csrfToken', data.csrfToken);
        }
        return data.csrfToken || '';
    } catch {
        return '';
    }
}

// Handle login form submission — uses real API
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = document.querySelector('button[type="submit"]');

    if (!username || !password) {
        _toast('Please enter your username and password.', 'error');
        return false;
    }

    const originalHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;display:inline-block">hourglass_empty</span> Signing in...';

    // Fetch CSRF token first
    fetchAndStoreCsrfToken().then(csrfToken => {
        // Use the real backend /api/login endpoint
        fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(async (data) => {
            if (data.success) {
                // Store real auth token from server
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('sessionStart', Date.now());
                sessionStorage.setItem('user', JSON.stringify({
                    name: data.name,
                    role: data.role
                }));
    
                // Fetch and store CSRF token for subsequent API calls just in case
                await fetchAndStoreCsrfToken();
    
                _toast('Login successful! Redirecting...', 'success');
    
                setTimeout(() => {
                    const rolePathMap = {
                        'manager': '/pages/hotel/admin-dashboard-lumina/',
                        'receptionist': '/pages/hotel/reception/reception.html',
                        'housekeeper': '/pages/hotel/housekeeping/housekeeping.html',
                        'guest': '/pages/hotel/guest-dashboard-lumina/'
                    };
                    window.location.href = data.redirect || rolePathMap[data.role] || '/';
                }, 1000);
            } else {
                _toast(data.message || 'Invalid credentials. Please try again.', 'error');
                submitButton.disabled = false;
                submitButton.innerHTML = originalHTML;
            }
        })
        .catch((err) => {
            console.error('Login error:', err);
            _toast('Connection error. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
        });
    });

    return false;
}

// Go back function
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/pages/hotel/home-lumina/';
    }
}

// Show testimonial cards with stagger on load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            const rolePathMap = {
                'manager': '/pages/hotel/admin-dashboard-lumina/',
                'receptionist': '/pages/hotel/reception/reception.html',
                'housekeeper': '/pages/hotel/housekeeping/housekeeping.html',
                'guest': '/pages/hotel/guest-dashboard-lumina/'
            };
            window.location.href = rolePathMap[userData.role] || '/';
        } catch (e) {
            sessionStorage.clear();
        }
    }

    // Animate testimonial cards
    const cards = document.querySelectorAll('.testimonial-card');
    cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), 1200 + (i * 300));
    });
});
