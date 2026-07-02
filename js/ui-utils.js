/**
 * UI/UX Utility Module
 * Provides toast notifications, loading states, and navigation helpers
 */

/**
 * Escape a string for safe insertion into HTML (prevents XSS / CWE-94).
 */
function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const UI = {
  // Toast notification system
  showToast(message, type = "info", duration = 3000) {
    const toastContainer =
      document.getElementById("toast-container") || this.createToastContainer();

    const toast = document.createElement("div");
    toast.className = `toast toast-${escapeHtml(type)}`;

    const content = document.createElement("div");
    content.className = "toast-content";

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = this.getToastIcon(type); // textContent — safe

    const msg = document.createElement("span");
    msg.className = "toast-message";
    msg.textContent = message; // textContent — safe, no XSS

    content.appendChild(icon);
    content.appendChild(msg);
    toast.appendChild(content);
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-exit");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  createToastContainer() {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
    return container;
  },

  getToastIcon(type) {
    const icons = {
      success: "check_circle",
      error: "error",
      warning: "warning",
      info: "info",
    };
    return icons[type] || icons.info;
  },

  // Loading state management
  setLoading(element, isLoading, originalText = null) {
    if (!element) return;

    if (isLoading) {
      originalText = originalText || element.textContent;
      element.dataset.originalText = originalText;
      element.innerHTML =
        '<span class="material-symbols-outlined spin">hourglass_empty</span> Loading...';
      element.disabled = true;
      element.classList.add("loading");
    } else {
      element.textContent =
        element.dataset.originalText || originalText || "Submit";
      element.disabled = false;
      element.classList.remove("loading");
    }
  },

  // Back button with history fallback
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  },

  // Add back buttons to pages dynamically
  addBackButton(targetSelector = "body", backUrl = null) {
    const container = document.querySelector(targetSelector);
    if (!container || container.querySelector(".page-back-button")) return;

    const backBtn = document.createElement("button");
    backBtn.className = "page-back-button";
    backBtn.innerHTML =
      '<span class="material-symbols-outlined">arrow_back</span> Back';
    backBtn.type = "button";
    backBtn.onclick = (e) => {
      e.preventDefault();
      backUrl ? (window.location.href = backUrl) : this.goBack();
    };

    if (container === document.body) {
      container.insertBefore(backBtn, container.firstChild);
    } else {
      container.insertBefore(backBtn, container.firstChild);
    }
  },

  // Breadcrumb navigation
  addBreadcrumb(items = []) {
    const existing = document.getElementById("breadcrumb-nav");
    if (existing) existing.remove();

    const breadcrumb = document.createElement("nav");
    breadcrumb.id = "breadcrumb-nav";
    breadcrumb.className = "breadcrumb-nav";

    const navInner = document.createElement("div");
    navInner.className = "breadcrumb-inner";

    items.forEach((item, index) => {
      if (index > 0) {
        const sep = document.createElement("span");
        sep.className = "breadcrumb-sep";
        sep.innerHTML =
          '<span class="material-symbols-outlined">chevron_right</span>';
        navInner.appendChild(sep);
      }

      if (item.url) {
        const link = document.createElement("a");
        link.href = item.url;
        link.className = "breadcrumb-link";
        link.textContent = item.label;
        navInner.appendChild(link);
      } else {
        const span = document.createElement("span");
        span.className = "breadcrumb-current";
        span.textContent = item.label;
        navInner.appendChild(span);
      }
    });

    breadcrumb.appendChild(navInner);

    const mainContent =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;
    mainContent.insertBefore(breadcrumb, mainContent.firstChild);
  },
};

// Global error handler for fetch
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  UI.showToast("An error occurred. Please try again.", "error");
});

// Export for use in modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { UI, escapeHtml };
}
