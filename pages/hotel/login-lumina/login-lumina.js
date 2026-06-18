// Lumina Hospitality - Login Page JavaScript

// Demo credentials
const DEMO_CREDENTIALS = {
    admin: { password: 'demo1234', role: 'admin', redirect: '/pages/hotel/admin-dashboard-lumina/' },
    guest: { password: 'demo1234', role: 'guest', redirect: '/pages/hotel/guest-dashboard-lumina/' }
};

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="material-symbols-outlined animate-spin">hourglass_empty</span> Signing in...';
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check demo credentials
        const user = DEMO_CREDENTIALS[username.toLowerCase()];
        
        if (user && user.password === password) {
            // Store user session
            sessionStorage.setItem('user', JSON.stringify({
                username: username,
                role: user.role,
                name: username.charAt(0).toUpperCase() + username.slice(1)
            }));
            
            showToast('Login successful!', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                window.location.href = user.redirect;
            }, 1000);
        } else {
            showToast('Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
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
    const user = sessionStorage.getItem('user');
    if (user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
            window.location.href = '/pages/hotel/admin-dashboard-lumina/';
        } else {
            window.location.href = '/pages/hotel/guest-dashboard-lumina/';
        }
    }
});

// Initialize UI utilities (if available)
if (typeof initializeUI === 'function') {
    initializeUI();
}
