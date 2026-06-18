/**
 * Memory Leak Prevention Utility
 * Provides automatic cleanup of event listeners, timers, and observers
 * to prevent memory leaks in single-page applications
 */

(function() {
  'use strict';

  class MemoryLeakPrevention {
    constructor() {
      this.timers = new Set();
      this.eventListeners = new Map();
      this.observers = new Set();
      this.intervals = new Set();
    }

    /**
     * Register a timeout for automatic cleanup
     */
    registerTimeout(timeoutId) {
      if (timeoutId) {
        this.timers.add(timeoutId);
      }
      return timeoutId;
    }

    /**
     * Register an interval for automatic cleanup
     */
    registerInterval(intervalId) {
      if (intervalId) {
        this.intervals.add(intervalId);
      }
      return intervalId;
    }

    /**
     * Register an event listener for automatic cleanup
     */
    registerEventListener(element, event, handler, options) {
      if (!element || !event || !handler) return null;

      element.addEventListener(event, handler, options);
      
      const key = `${element}-${event}`;
      if (!this.eventListeners.has(key)) {
        this.eventListeners.set(key, []);
      }
      this.eventListeners.get(key).push({ element, event, handler, options });

      return () => this.removeEventListener(element, event, handler, options);
    }

    /**
     * Register an observer for automatic cleanup
     */
    registerObserver(observer) {
      if (observer) {
        this.observers.add(observer);
      }
      return observer;
    }

    /**
     * Remove a specific event listener
     */
    removeEventListener(element, event, handler, options) {
      if (element && event && handler) {
        element.removeEventListener(event, handler, options);
        
        const key = `${element}-${event}`;
        const listeners = this.eventListeners.get(key);
        if (listeners) {
          const index = listeners.findIndex(
            l => l.handler === handler && l.options === options
          );
          if (index !== -1) {
            listeners.splice(index, 1);
          }
        }
      }
    }

    /**
     * Clear all registered timeouts
     */
    clearTimeouts() {
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();
    }

    /**
     * Clear all registered intervals
     */
    clearIntervals() {
      this.intervals.forEach(id => clearInterval(id));
      this.intervals.clear();
    }

    /**
     * Disconnect all registered observers
     */
    disconnectObservers() {
      this.observers.forEach(observer => {
        if (observer.disconnect) {
          observer.disconnect();
        }
      });
      this.observers.clear();
    }

    /**
     * Remove all registered event listeners
     */
    removeAllEventListeners() {
      this.eventListeners.forEach((listeners) => {
        listeners.forEach(({ element, event, handler, options }) => {
          element.removeEventListener(event, handler, options);
        });
      });
      this.eventListeners.clear();
    }

    /**
     * Complete cleanup - clears everything
     */
    cleanup() {
      this.clearTimeouts();
      this.clearIntervals();
      this.disconnectObservers();
      this.removeAllEventListeners();
      console.log('Memory leak prevention: Cleanup completed');
    }

    /**
     * Get statistics for debugging
     */
    getStats() {
      return {
        timeouts: this.timers.size,
        intervals: this.intervals.size,
        observers: this.observers.size,
        eventListeners: this.eventListeners.size
      };
    }
  }

  // Global instance
  let globalInstance = null;

  function getGlobalInstance() {
    if (!globalInstance) {
      globalInstance = new MemoryLeakPrevention();
      
      // Auto-cleanup on page navigation
      window.addEventListener('beforeunload', () => {
        globalInstance.cleanup();
      });
    }
    return globalInstance;
  }

  // Expose globally
  window.MemoryLeakPrevention = MemoryLeakPrevention;
  window.memoryLeakPrevention = getGlobalInstance();

})();