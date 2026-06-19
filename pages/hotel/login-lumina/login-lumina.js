// Lumina Hospitality - Login Page JavaScript

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const submitButton = e.target.querySelector('button[type="submit"]');

    if (!username || !password) {
        showToast('Please enter your username and password.', 'error');
        return;
    }

    // Show loading state
    const originalButtonHTML = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite; display:inline-block;">hourglass_empty</span> Signing in...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token and user info in sessionStorage
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('sessionStart', Date.now());
            sessionStorage.setItem('user', JSON.stringify({
                name: data.name,
                role: data.role
            }));

            showToast('Login successful! Redirecting...', 'success');

            // Redirect based on role returned from server
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
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Unable to connect. Please check your connection and try again.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
    }
});

// Go back function
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/pages/hotel/home-lumina/';
    }
}

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
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
});

