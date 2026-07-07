/**
 * Scroll Reveal JavaScript — Lumina Hospitality
 *
 * Automatically reveals elements with the .scroll-reveal or .scroll-reveal-scale
 * classes when they scroll into the viewport.
 */

window.initScrollReveals = function() {
  const revealElements = document.querySelectorAll('.scroll-reveal:not(.active), .scroll-reveal-scale:not(.active), .stagger-fade-in > *:not(.active)');

  if (!('IntersectionObserver' in window)) {
    // Fallback for very old browsers: just show everything
    revealElements.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px', // Trigger slightly before the element fully enters
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add active class to trigger CSS transition
        entry.target.classList.add('active');
        
        // Stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    // If element is already in view on load, show it immediately
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('active');
    } else {
      observer.observe(el);
    }
  });
};

document.addEventListener('DOMContentLoaded', window.initScrollReveals);
