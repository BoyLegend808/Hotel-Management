// about-lumina.js — Mobile menu logic for About page
(function () {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuContent = document.getElementById('mobileMenuContent');
    const closeMobileMenuBtn = document.getElementById('closeMobileMenu');

    if (!mobileMenuBtn || !mobileMenu) return;

    function openMobileMenu() {
        mobileMenu.classList.remove('hidden');
        mobileMenuContent.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenuFn() {
        mobileMenuContent.classList.add('translate-x-full');
        setTimeout(() => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenuFn);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMobileMenuFn);

    // Close when navigating
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenuFn));
})();
