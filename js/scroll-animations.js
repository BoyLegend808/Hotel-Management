// Lumina Hospitality - Scroll Reveal Animations
// Uses Intersection Observer API for performance

// Scroll reveal animation class
class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px 0px -50px 0px',
            delay: options.delay || 0
        };
        this.observer = null;
        this.init();
    }

    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reveal(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.options);

        // Observe all elements with scroll-reveal class
        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll('.scroll-reveal');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${this.options.delay}ms, transform 0.6s ease ${this.options.delay}ms`;
            this.observer.observe(el);
        });
    }

    reveal(element) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }

    // Add new elements dynamically
    observeNewElements() {
        this.observeElements();
    }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Accordion functionality
function initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const icon = header.querySelector('.accordion-icon');

        if (header && content && icon) {
            header.addEventListener('click', () => {
                const isOpen = accordion.classList.contains('active');
                
                // Close all other accordions
                accordions.forEach(other => {
                    if (other !== accordion) {
                        other.classList.remove('active');
                        other.querySelector('.accordion-content').style.maxHeight = '0';
                        other.querySelector('.accordion-icon').style.transform = 'rotate(0deg)';
                    }
                });

                // Toggle current accordion
                accordion.classList.toggle('active');
                if (isOpen) {
                    content.style.maxHeight = '0';
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.style.transform = 'rotate(180deg)';
                }
            });
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize scroll reveal
    const scrollReveal = new ScrollReveal({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        delay: 100
    });

    // Initialize smooth scroll
    initSmoothScroll();

    // Initialize accordions
    initAccordions();

    // Expose to global scope for dynamic content
    window.scrollReveal = scrollReveal;
});
