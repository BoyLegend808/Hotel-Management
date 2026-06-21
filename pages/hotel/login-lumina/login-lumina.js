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

// Handle login form submission
function handleLogin(e) {
    if (e) e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = document.querySelector('button[type="submit"]');

    if (!username || !password) {
        showToast('Please enter your username and password.', 'error');
        return false;
    }

    // Show loading state
    const originalHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;display:inline-block">hourglass_empty</span> Signing in...';

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('sessionStart', Date.now());
            sessionStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));

            showToast('Login successful! Redirecting...', 'success');

            setTimeout(() => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else if (data.role === 'admin') {
                    window.location.href = '/pages/hotel/admin-dashboard-lumina/';
                } else {
                    window.location.href = '/pages/hotel/guest-dashboard-lumina/';
                }
            }, 1000);
        } else {
            showToast(data.message || 'Invalid credentials. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalHTML;
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showToast('Unable to connect. Please check your connection and try again.', 'error');
        submitButton.disabled = false;
        submitButton.innerHTML = originalHTML;
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
            if (userData.role === 'admin') {
                window.location.href = '/pages/hotel/admin-dashboard-lumina/';
            } else {
                window.location.href = '/pages/hotel/guest-dashboard-lumina/';
            }
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
