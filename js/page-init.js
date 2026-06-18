/**
 * Page Initialization Script
 * Auto-adds back buttons, breadcrumbs, and error handling to all pages
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize UI utilities if available
  if (typeof UI !== "undefined") {
    // Add back button to all internal pages (not home or login)
    const path = window.location.pathname;
    if (!path.includes("/home") && !path.includes("/login") && path !== "/") {
      UI.addBackButton("body");
    }

    // Add breadcrumbs based on current path
    const breadcrumbs = generateBreadcrumbs(path);
    if (breadcrumbs.length > 0) {
      UI.addBreadcrumb(breadcrumbs);
    }
  }

  // Create global convenience functions for hotel pages
  if (typeof UI !== "undefined") {
    window.showToast = (message, type, duration) => UI.showToast(message, type, duration);
    window.goBack = () => UI.goBack();
    window.addBackButton = (selector, backUrl) => UI.addBackButton(selector, backUrl);
    window.addBreadcrumb = (items) => UI.addBreadcrumb(items);
  }

  // Enhance all forms with better error handling and loading states
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", function (e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn && typeof UI !== "undefined") {
        UI.setLoading(submitBtn, true);
      }
    });
  });

  // Add logout functionality
  setupLogout();

  // Session timeout warning
  setupSessionTimeout();
});

function generateBreadcrumbs(path) {
  // Use hotel home as base
  const breadcrumbs = [{ label: "Home", url: "/pages/hotel/home-lumina/" }];

  const parts = path.split("/").filter((p) => p && p !== "pages");

  let currentPath = "";
  parts.forEach((part, index) => {
    currentPath += "/" + part;

    const isLast = index === parts.length - 1;
    const label = formatBreadcrumbLabel(part);

    if (!isLast) {
      breadcrumbs.push({ label, url: currentPath + "/" });
    } else {
      breadcrumbs.push({ label });
    }
  });

  return breadcrumbs.length > 1 ? breadcrumbs : [];
}

function formatBreadcrumbLabel(slug) {
  return slug
    .replace(/-/g, " ")
    .replace(/\//g, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function setupLogout() {
  // Add logout button to all protected pages
  const user = sessionStorage.getItem("user");
  if (!user) return;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          sessionStorage.removeItem("user");
          if (typeof UI !== "undefined") {
            UI.showToast("Logged out successfully", "success", 1500);
          }
          setTimeout(() => {
            window.location.href = "/pages/hotel/login-lumina/";
          }, 500);
        }
      } catch (error) {
        console.error("Logout error:", error);
        if (typeof UI !== "undefined") {
          UI.showToast("Error logging out", "error");
        }
      }
    });
  }
}

function setupSessionTimeout() {
  // Warn user 5 minutes before session expires (8 hour = 28800000ms)
  const SESSION_DURATION = 8 * 60 * 60 * 1000;
  const WARNING_TIME = 5 * 60 * 1000;

  const user = sessionStorage.getItem("user");
  if (!user) return;

  const sessionStart = sessionStorage.getItem("sessionStart") || Date.now();
  sessionStorage.setItem("sessionStart", sessionStart);

  const warningTimeout = SESSION_DURATION - WARNING_TIME;

  setTimeout(() => {
    if (typeof UI !== "undefined") {
      UI.showToast(
        "Your session will expire in 5 minutes. Please save your work.",
        "warning",
        10000,
      );
    }
  }, warningTimeout);

  setTimeout(() => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("sessionStart");
    if (typeof UI !== "undefined") {
      UI.showToast(
        "Your session has expired. Please log in again.",
        "info",
        3000,
      );
    }
    window.location.href = "/pages/hotel/login-lumina/";
  }, SESSION_DURATION);
}

// Global error handler for unhandled API errors
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled error:", event.reason);
  if (typeof UI !== "undefined") {
    UI.showToast("An unexpected error occurred", "error");
  }
});
