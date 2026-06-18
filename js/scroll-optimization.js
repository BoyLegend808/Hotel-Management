/**
 * Scroll Optimization Utility
 * Provides optimized scroll handlers with debouncing and passive listeners
 * 
 * This file should be included in pages that have scroll handlers
 * to replace traditional scroll event listeners with performance-optimized versions
 */

(function() {
  'use strict';

  // Ensure debounce function is available
  if (typeof debounce === 'undefined') {
    // Simple debounce implementation if performance-utils isn't loaded
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
    window.debounce = debounce;
  }

  /**
   * Optimized scroll progress handler
   * Updates scroll progress bar with debouncing to prevent layout thrashing
   */
  function createScrollProgressHandler(elementId, updateInterval = 100) {
    const updateProgress = debounce(() => {
      const scrollProgress = document.getElementById(elementId);
      if (!scrollProgress) return;
      
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - 
                          document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / scrollHeight) * 100;
      scrollProgress.style.width = scrollPercent + "%";
    }, updateInterval);

    return updateProgress;
  }

  /**
   * Optimized back-to-top button handler
   * Shows/hides button based on scroll position with debouncing
   */
  function createBackToTopHandler(buttonId, threshold = 500, updateInterval = 100) {
    const backToTop = document.getElementById(buttonId);
    if (!backToTop) return null;

    const updateButton = debounce(() => {
      if (window.scrollY > threshold) {
        backToTop.classList.add("visible");
      } else {
        backToTop.classList.remove("visible");
      }
    }, updateInterval);

    // Add click handler
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return updateButton;
  }

  /**
   * Generic scroll handler with custom callback
   */
  function createScrollHandler(callback, options = {}) {
    const {
      interval = 100,
      passive = true,
      immediate = false
    } = options;

    const debouncedCallback = debounce(callback, interval, immediate);
    
    window.addEventListener("scroll", debouncedCallback, { passive });
    
    // Return cleanup function
    return () => {
      window.removeEventListener("scroll", debouncedCallback, { passive });
    };
  }

  /**
   * Setup all common scroll handlers
   */
  function setupScrollOptimizations() {
    const handlers = [];

    // Setup scroll progress if element exists
    const scrollProgress = document.getElementById("scrollProgress");
    if (scrollProgress) {
      const progressHandler = createScrollProgressHandler("scrollProgress");
      window.addEventListener("scroll", progressHandler, { passive: true });
      handlers.push(() => {
        window.removeEventListener("scroll", progressHandler, { passive: true });
      });
    }

    // Setup back-to-top button if element exists
    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
      const backToTopHandler = createBackToTopHandler("backToTop");
      if (backToTopHandler) {
        window.addEventListener("scroll", backToTopHandler, { passive: true });
        handlers.push(() => {
          window.removeEventListener("scroll", backToTopHandler, { passive: true });
        });
      }
    }

    return {
      cleanup: () => handlers.forEach(fn => fn())
    };
  }

  // Auto-initialize if on appropriate pages
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupScrollOptimizations);
  } else {
    setupScrollOptimizations();
  }

  // Expose utilities globally
  window.ScrollOptimization = {
    createScrollProgressHandler,
    createBackToTopHandler,
    createScrollHandler,
    setupScrollOptimizations
  };

})();