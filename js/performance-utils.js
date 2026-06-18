/**
 * Performance Optimization Utilities
 * Debouncing, throttling, and other performance enhancement functions
 */

/**
 * Debounce function - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 */
function debounce(func, wait = 100, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function - limits execution to at most once every wait milliseconds
 */
function throttle(func, wait = 100) {
  let inThrottle;
  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

/**
 * RequestIdleCallback wrapper with fallback
 */
function requestIdleCallback(callback, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(callback, 1);
  }
}

/**
 * Cancel idle callback
 */
function cancelIdleCallback(handle) {
  if ('cancelIdleCallback' in window && typeof handle === 'number') {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Passive event listener helper
 */
function addPassiveEventListener(element, event, handler, options = {}) {
  const passiveOptions = { passive: true, ...options };
  element.addEventListener(event, handler, passiveOptions);
  return () => element.removeEventListener(event, handler, passiveOptions);
}

/**
 * Measure function execution time
 */
function measurePerformance(func, label) {
  if (performance && performance.mark) {
    const startLabel = `${label}-start`;
    const endLabel = `${label}-end`;
    
    performance.mark(startLabel);
    const result = func();
    performance.mark(endLabel);
    performance.measure(label, startLabel, endLabel);
    
    const measure = performance.getEntriesByName(label)[0];
    console.log(`${label} took ${measure.duration.toFixed(2)}ms`);
    
    return result;
  }
  return func();
}

/**
 * Batch DOM updates
 */
function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Lazy load images when they come into viewport
 */
function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
  return null;
}

/**
 * Cleanup function for event listeners and timers
 */
class CleanupManager {
  constructor() {
    this.cleanups = [];
  }

  register(cleanupFn) {
    this.cleanups.push(cleanupFn);
    return cleanupFn;
  }

  cleanup() {
    this.cleanups.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    this.cleanups = [];
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debounce,
    throttle,
    requestIdleCallback,
    cancelIdleCallback,
    addPassiveEventListener,
    measurePerformance,
    batchDOMUpdates,
    lazyLoadImages,
    CleanupManager
  };
}