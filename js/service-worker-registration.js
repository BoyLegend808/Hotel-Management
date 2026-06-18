/**
 * Service Worker Registration
 * Registers the service worker for offline support and caching
 */

(function() {
  'use strict';

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swPath = '/sw.js';
        
        navigator.serviceWorker.register(swPath)
          .then((registration) => {
            console.log('[Service Worker] Registered successfully:', registration.scope);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('A new version is available. Would you like to update?')) {
                    newWorker.postMessage({ action: 'skipWaiting' });
                    window.location.reload();
                  }
                }
              });
            });
            
            // Periodic update checks
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch((error) => {
            console.error('[Service Worker] Registration failed:', error);
          });
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[Service Worker] Message received:', event.data);
          
          if (event.data.action === 'cacheUpdated') {
            // Cache was updated, optionally show notification
            if (typeof UI !== 'undefined' && UI.showToast) {
              UI.showToast('Content updated successfully', 'success', 3000);
            }
          }
        });
        
        // Detect when service worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[Service Worker] Controller changed');
          window.location.reload();
        });
      });
    } else {
      console.warn('[Service Worker] Service workers are not supported in this browser');
    }
  }

  /**
   * Check if service worker is active
   */
  function isServiceWorkerActive() {
    return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
  }

  /**
   * Force cache clear
   */
  function clearCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'clearCache' });
    }
  }

  /**
   * Get service worker status
   */
  function getServiceWorkerStatus() {
    return {
      supported: 'serviceWorker' in navigator,
      active: isServiceWorkerActive(),
      ready: navigator.serviceWorker && navigator.serviceWorker.ready
    };
  }

  // Auto-register on load
  registerServiceWorker();

  // Expose utilities globally
  window.ServiceWorkerHelper = {
    register: registerServiceWorker,
    isActive: isServiceWorkerActive,
    clearCache: clearCache,
    getStatus: getServiceWorkerStatus
  };

})();