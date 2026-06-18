/**
 * CSS Loader - Async CSS Loading for Performance
 * Loads CSS files asynchronously to prevent render-blocking
 */

(function() {
  'use strict';

  /**
   * Load CSS file asynchronously
   * @param {string} href - Path to CSS file
   * @param {string} media - Media query (default: 'all')
   * @param {Function} callback - Callback when loaded
   */
  function loadCSS(href, media = 'all', callback) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'only x';
    
    link.onload = function() {
      link.media = media || 'all';
      if (callback) callback();
    };
    
    link.onerror = function() {
      console.error(`Failed to load CSS: ${href}`);
      // Fallback to synchronous loading
      link.media = media || 'all';
    };
    
    document.head.appendChild(link);
    return link;
  }

  /**
   * Load CSS files based on current route
   */
  function loadRouteSpecificCSS() {
    const path = window.location.pathname;
    
    // Admin-specific CSS
    if (path.includes('/admin/')) {
      loadCSS('/pages/admin/css/admin.css');
    }
    
    // Public-specific CSS
    if (path.includes('/public/')) {
      loadCSS('/css/public.css');
    }
    
    // Portal-specific CSS
    if (path.includes('/family-portal/')) {
      loadCSS('/pages/family-portal/css/family-portal.css');
    }
    
    if (path.includes('/staff-portal/')) {
      loadCSS('/pages/staff-portal/css/staff-portal.css');
    }
  }

  /**
   * Preload CSS files for faster navigation
   * @param {Array<string>} hrefs - Array of CSS file paths
   */
  function preloadCSS(hrefs) {
    hrefs.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize CSS loading
   */
  function initCSSLoader() {
    // Load route-specific CSS immediately
    loadRouteSpecificCSS();
    
    // Preload likely next pages CSS
    if (window.location.pathname.includes('/public/')) {
      preloadCSS(['/css/admin.css']);
    } else if (window.location.pathname.includes('/admin/')) {
      preloadCSS(['/css/public.css']);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCSSLoader);
  } else {
    initCSSLoader();
  }

  // Expose globally for manual usage
  window.CSSLoader = {
    loadCSS,
    loadRouteSpecificCSS,
    preloadCSS
  };

})();