/**
 * Lazy Component Loading
 * Dynamically loads JavaScript components only when needed
 * Reduces initial bundle size and improves page load performance
 */

(function() {
  'use strict';

  // Registry of component loaders
  const componentRegistry = new Map();

  /**
   * Register a lazy component loader
   */
  function registerComponent(name, loader) {
    componentRegistry.set(name, {
      loader,
      loaded: false,
      loading: false,
      module: null
    });
  }

  /**
   * Load a component on demand
   */
  async function loadComponent(name) {
    const component = componentRegistry.get(name);
    
    if (!component) {
      throw new Error(`Component "${name}" is not registered`);
    }
    
    // Already loaded
    if (component.loaded) {
      return component.module;
    }
    
    // Currently loading
    if (component.loading) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (component.loaded) {
            clearInterval(checkInterval);
            resolve(component.module);
          } else if (!component.loading) {
            clearInterval(checkInterval);
            reject(new Error(`Component "${name}" failed to load`));
          }
        }, 50);
      });
    }
    
    // Start loading
    component.loading = true;
    
    try {
      const module = await component.loader();
      component.module = module;
      component.loaded = true;
      component.loading = false;
      
      console.log(`[Lazy Components] Loaded component: ${name}`);
      return module;
    } catch (error) {
      component.loading = false;
      console.error(`[Lazy Components] Failed to load component: ${name}`, error);
      throw error;
    }
  }

  /**
   * Load multiple components in parallel
   */
  async function loadComponents(names) {
    const promises = names.map(name => loadComponent(name));
    return Promise.all(promises);
  }

  /**
   * Preload components for faster navigation
   */
  async function preloadComponents(names) {
    return loadComponents(names).catch(error => {
      console.warn('[Lazy Components] Preload failed:', error);
    });
  }

  /**
   * Intersection Observer for viewport-based loading
   */
  function setupViewportLoading() {
    if (!('IntersectionObserver' in window)) {
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const componentName = element.dataset.lazyComponent;
          
          if (componentName) {
            loadComponent(componentName)
              .then(module => {
                // Call init function if available
                if (module.init && typeof module.init === 'function') {
                  module.init(element);
                }
                
                // Remove loading indicator
                element.classList.remove('loading');
                element.classList.add('loaded');
              })
              .catch(error => {
                console.error('[Lazy Components] Viewport load failed:', error);
                element.classList.add('error');
              });
            
            observer.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '100px' // Load when within 100px of viewport
    });
    
    // Observe elements with data-lazy-component attribute
    document.querySelectorAll('[data-lazy-component]').forEach(element => {
      element.classList.add('loading');
      observer.observe(element);
    });
    
    return observer;
  }

  /**
   * Route-based component loading
   */
  function setupRouteBasedLoading() {
    const path = window.location.pathname;
    
    // Define route-component mappings
    const routeComponents = {
      '/pages/admin/dashboard/': ['dashboard-charts', 'dashboard-stats'],
      '/pages/admin/residents/list/': ['residents-table', 'resident-filters'],
      '/pages/admin/staff/list/': ['staff-table', 'staff-schedule'],
      '/pages/family-portal/dashboard/': ['family-dashboard', 'family-updates'],
      '/pages/staff-portal/dashboard/': ['staff-dashboard', 'staff-tasks']
    };
    
    // Find matching route components
    const componentsToLoad = Object.keys(routeComponents).find(route => 
      path.startsWith(route)
    );
    
    if (componentsToLoad) {
      preloadComponents(routeComponents[componentsToLoad]);
    }
  }

  /**
   * Register common dashboard components
   */
  function registerDashboardComponents() {
    // Chart components
    registerComponent('dashboard-charts', () => 
      import('/pages/admin/dashboard/charts.js').catch(() => {
        // Fallback if module doesn't exist
        return { init: () => console.log('Charts loaded (fallback)') };
      })
    );
    
    // Stats components
    registerComponent('dashboard-stats', () => 
      import('/pages/admin/dashboard/stats.js').catch(() => {
        return { init: () => console.log('Stats loaded (fallback)') };
      })
    );
    
    // Residents table
    registerComponent('residents-table', () => 
      import('/pages/admin/residents/list/table.js').catch(() => {
        return { init: () => console.log('Residents table loaded (fallback)') };
      })
    );
    
    // Staff table
    registerComponent('staff-table', () => 
      import('/pages/admin/staff/list/table.js').catch(() => {
        return { init: () => console.log('Staff table loaded (fallback)') };
      })
    );
  }

  /**
   * Initialize lazy loading system
   */
  function initLazyLoading() {
    registerDashboardComponents();
    setupViewportLoading();
    setupRouteBasedLoading();
    
    console.log('[Lazy Components] System initialized');
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }

  // Expose utilities globally
  window.LazyComponents = {
    register: registerComponent,
    load: loadComponent,
    loadMultiple: loadComponents,
    preload: preloadComponents,
    init: initLazyLoading
  };

})();