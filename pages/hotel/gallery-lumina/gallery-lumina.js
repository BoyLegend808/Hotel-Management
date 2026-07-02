/**
 * Gallery Page — Lumina Hospitality
 * Handles: category filter, masonry lightbox.
 * No inline handlers.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const filterBtns = document.querySelectorAll('.gallery-filter-btn');
        const items = document.querySelectorAll('.gallery-masonry-item');
        const lightbox = document.getElementById('galleryPageLightbox');
        const lbImg = document.getElementById('galleryLbImg');
        const lbClose = document.getElementById('galleryLbClose');

        /* ── Filter ── */
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                items.forEach(item => {
                    const match = filter === 'all' || item.dataset.category === filter;
                    item.classList.toggle('hidden', !match);
                });
            });
        });

        /* ── Lightbox ── */
        items.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                lbImg.src = img.src;
                lbImg.alt = img.alt;
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
                lbClose.focus();
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        lbClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
        });
    });
})();
