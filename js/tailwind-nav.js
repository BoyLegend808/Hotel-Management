/**
 * Tailwind Navigation Mobile Menu Script
 * Handles the mobile menu toggle for the unified Tailwind CSS navigation bar.
 */
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuBackdrop = document.getElementById('menu-backdrop');
  
  if (!mobileMenuBtn || !closeMenuBtn || !mobileMenu || !menuBackdrop) {
    return;
  }

  const mobileMenuLinks = mobileMenu.querySelectorAll('.mobile-menu-link');
  
  function openMenu() {
    mobileMenu.classList.remove('hidden');
    menuBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Animate menu in
    mobileMenu.style.opacity = '0';
    mobileMenu.style.transform = 'translateX(-100%)';
    requestAnimationFrame(() => {
      mobileMenu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      mobileMenu.style.opacity = '1';
      mobileMenu.style.transform = 'translateX(0)';
    });
    
    // Animate backdrop
    menuBackdrop.style.opacity = '0';
    requestAnimationFrame(() => {
      menuBackdrop.style.transition = 'opacity 0.3s ease';
      menuBackdrop.style.opacity = '1';
    });
  }
  
  function closeMenu() {
    // Animate menu out
    mobileMenu.style.opacity = '1';
    mobileMenu.style.transform = 'translateX(0)';
    requestAnimationFrame(() => {
      mobileMenu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      mobileMenu.style.opacity = '0';
      mobileMenu.style.transform = 'translateX(-100%)';
    });
    
    // Animate backdrop out
    menuBackdrop.style.opacity = '1';
    requestAnimationFrame(() => {
      menuBackdrop.style.transition = 'opacity 0.3s ease';
      menuBackdrop.style.opacity = '0';
    });
    
    // Hide after animation
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      menuBackdrop.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
    }, 300);
  }
  
  mobileMenuBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);
  menuBackdrop.addEventListener('click', closeMenu);
  
  // Close mobile menu when clicking on links
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      closeMenu();
    }
  });
});
