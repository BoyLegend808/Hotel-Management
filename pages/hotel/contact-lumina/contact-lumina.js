/**
 * Contact Page — Lumina Hospitality
 * Handles: contact form submission feedback.
 * No inline handlers.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', e => {
            e.preventDefault();
            if (window.UI) {
                window.UI.showToast('Thank you! We will respond within 24 hours.', 'success');
            }
            form.reset();
        });
    });
})();
