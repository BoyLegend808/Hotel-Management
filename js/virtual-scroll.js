/**
 * Virtual Scrolling Implementation
 * Provides efficient scrolling for large lists by only rendering visible items
 * Improves performance from O(n) to O(visible) rendering
 */

class VirtualScroller {
  constructor(options) {
    this.container = options.container;
    this.items = options.items || [];
    this.itemHeight = options.itemHeight || 80;
    this.overscan = options.overscan || 5;
    this.renderItem = options.renderItem || this.defaultRenderItem;
    this.onScroll = options.onScroll || null;
    
    this.viewportHeight = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    this.totalHeight = 0;
    this.scrollTop = 0;
    
    this.init();
  }

  init() {
    this.setupContainer();
    this.calculateDimensions();
    this.setupScrollListener();
    this.render();
  }

  setupContainer() {
    // Ensure container has proper styling
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    this.container.style.height = this.container.style.height || '400px';
    
    // Create spacer for total height
    this.spacer = document.createElement('div');
    this.spacer.style.position = 'absolute';
    this.spacer.style.top = '0';
    this.spacer.style.left = '0';
    this.spacer.style.right = '0';
    this.spacer.style.height = '0';
    this.spacer.style.pointerEvents = 'none';
    this.container.appendChild(this.spacer);
    
    // Create viewport for visible items
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.left = '0';
    this.viewport.style.right = '0';
    this.viewport.style.overflow = 'hidden';
    this.container.appendChild(this.viewport);
  }

  calculateDimensions() {
    this.viewportHeight = this.container.clientHeight;
    this.totalHeight = this.items.length * this.itemHeight;
    this.spacer.style.height = this.totalHeight + 'px';
    
    this.updateVisibleRange();
  }

  setupScrollListener() {
    let ticking = false;
    
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateVisibleRange();
          this.render();
          
          if (this.onScroll) {
            this.onScroll({
              scrollTop: this.scrollTop,
              startIndex: this.startIndex,
              endIndex: this.endIndex
            });
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    }, { passive: true });
  }

  updateVisibleRange() {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan);
    const endIndex = Math.min(
      this.items.length - 1,
      Math.floor((this.scrollTop + this.viewportHeight) / this.itemHeight) + this.overscan
    );
    
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }

  render() {
    // Clear viewport
    this.viewport.innerHTML = '';
    
    // Calculate offset for viewport
    const offsetY = this.startIndex * this.itemHeight;
    this.viewport.style.transform = `translateY(${offsetY}px)`;
    
    // Render visible items
    const fragment = document.createDocumentFragment();
    
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      if (this.items[i]) {
        const itemElement = this.renderItem(this.items[i], i);
        itemElement.style.position = 'absolute';
        itemElement.style.top = '0';
        itemElement.style.left = '0';
        itemElement.style.right = '0';
        itemElement.style.height = this.itemHeight + 'px';
        fragment.appendChild(itemElement);
      }
    }
    
    this.viewport.appendChild(fragment);
  }

  defaultRenderItem(item, index) {
    const element = document.createElement('div');
    element.className = 'virtual-item';
    element.textContent = JSON.stringify(item);
    return element;
  }

  // Public methods

  updateItems(newItems) {
    this.items = newItems;
    this.calculateDimensions();
    this.render();
  }

  scrollToIndex(index) {
    const targetScroll = index * this.itemHeight;
    this.container.scrollTop = targetScroll;
  }

  scrollToTop() {
    this.container.scrollTop = 0;
  }

  scrollToBottom() {
    this.container.scrollTop = this.totalHeight;
  }

  getVisibleItems() {
    return this.items.slice(this.startIndex, this.endIndex + 1);
  }

  getItemCount() {
    return this.items.length;
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll);
    this.container.innerHTML = '';
  }
}

// Factory function for easier usage
function createVirtualScroller(container, options) {
  return new VirtualScroller({
    container,
    ...options
  });
}

// Auto-initialize virtual scrollers on elements with data-virtual-scroll attribute
function initVirtualScrollers() {
  const elements = document.querySelectorAll('[data-virtual-scroll]');
  
  elements.forEach(element => {
    const items = JSON.parse(element.dataset.items || '[]');
    const itemHeight = parseInt(element.dataset.itemHeight || '80');
    
    createVirtualScroller(element, {
      items,
      itemHeight
    });
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVirtualScrollers);
} else {
  initVirtualScrollers();
}

// Expose globally
window.VirtualScroller = VirtualScroller;
window.createVirtualScroller = createVirtualScroller;