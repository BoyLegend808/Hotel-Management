/**
 * Dynamic JavaScript Loader for Performance Optimization
 * Loads page-specific JavaScript only when needed
 */

(function() {
  'use strict';

  // Map of routes to their specific JavaScript files
  const routeScriptMap = {
    '/pages/admin/dashboard/': '/pages/admin/dashboard/dashboard.js',
    '/pages/admin/enquiries/': '/pages/admin/enquiries/enquiries.js',
    '/pages/admin/families/': '/pages/admin/families/families.js',
    '/pages/admin/login/': '/pages/admin/login/login.js',
    '/pages/admin/residents/activity-logs/': '/pages/admin/residents/activity-logs/activity-logs.js',
    '/pages/admin/residents/assigned-staff/': '/pages/admin/residents/assigned-staff/assigned-staff.js',
    '/pages/admin/residents/billing/': '/pages/admin/residents/billing/billing.js',
    '/pages/admin/residents/care-plan/': '/pages/admin/residents/care-plan/care-plan.js',
    '/pages/admin/residents/family-contacts/': '/pages/admin/residents/family-contacts/family-contacts.js',
    '/pages/admin/residents/list/': '/pages/admin/residents/list/residents-list.js',
    '/pages/admin/residents/medical/': '/pages/admin/residents/medical/medical.js',
    '/pages/admin/residents/personal/': '/pages/admin/residents/personal/personal.js',
    '/pages/admin/resources/': '/pages/admin/resources/resources.js',
    '/pages/admin/staff/list/': '/pages/admin/staff/list/staff-list.js',
    '/pages/admin/staff/personal/': '/pages/admin/staff/personal/staff-personal.js',
    '/pages/admin/staff/qualifications/': '/pages/admin/staff/qualifications/staff-qualifications.js',
    '/pages/admin/staff/schedule/': '/pages/admin/staff/schedule/staff-schedule.js',
    '/pages/family-portal/dashboard/': '/pages/family-portal/dashboard/family-dashboard.js',
    '/pages/public/about-us/': '/pages/public/about-us/about-us.js',
    '/pages/public/contact/': '/pages/public/contact/contact.js',
    '/pages/public/home/': '/pages/public/home/home.js',
    '/pages/public/resources/': '/pages/public/resources/resources.js',
    '/pages/public/services/': '/pages/public/services/services.js',
    '/pages/staff-portal/dashboard/': '/pages/staff-portal/dashboard/staff-dashboard.js'
  };

  // Track loaded scripts to avoid duplicate loading
  const loadedScripts = new Set();

  /**
   * Load a JavaScript file dynamically
   * @param {string} src - Path to the JavaScript file
   * @returns {Promise} - Resolves when script is loaded
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (loadedScripts.has(src)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        loadedScripts.add(src);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Get the current route/path
   * @returns {string} - Current path
   */
  function getCurrentPath() {
    const path = window.location.pathname;
    // Ensure path ends with / for consistent matching
    return path.endsWith('/') ? path : path + '/';
  }

  /**
   * Find the matching script for the current route
   * @param {string} path - Current path
   * @returns {string|null} - Script path or null if no match
   */
  function findScriptForPath(path) {
    // Try exact match first
    if (routeScriptMap[path]) {
      return routeScriptMap[path];
    }

    // Try partial match for nested routes
    const matchingKey = Object.keys(routeScriptMap).find(key => 
      path.startsWith(key)
    );

    return matchingKey ? routeScriptMap[matchingKey] : null;
  }

  /**
   * Load page-specific JavaScript for the current route
   */
  async function loadPageSpecificScript() {
    const currentPath = getCurrentPath();
    const scriptPath = findScriptForPath(currentPath);

    if (scriptPath) {
      try {
        await loadScript(scriptPath);
        console.log(`[Dynamic Loader] Loaded: ${scriptPath}`);
      } catch (error) {
        console.error(`[Dynamic Loader] Error loading ${scriptPath}:`, error);
      }
    }
  }

  /**
   * Preload scripts for likely next pages
   * @param {Array<string>} paths - Paths to preload
   */
  function preloadScripts(paths) {
    paths.forEach(path => {
      const scriptPath = findScriptForPath(path);
      if (scriptPath && !loadedScripts.has(scriptPath)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = scriptPath;
        document.head.appendChild(link);
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPageSpecificScript);
  } else {
    loadPageSpecificScript();
  }

  // Expose utility functions globally
  window.DynamicLoader = {
    loadScript,
    loadPageSpecificScript,
    preloadScripts,
    loadedScripts
  };

})();