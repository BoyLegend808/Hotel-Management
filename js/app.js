// Performance: Load performance utilities first
if (typeof debounce === 'undefined') {
  const script = document.createElement('script');
  script.src = '/js/performance-utils.js';
  script.async = true;
  document.head.appendChild(script);
}

const API_BASE = "";

// Loading state management
let loadingCount = 0;

function showLoading() {
  loadingCount++;
  updateLoadingIndicator();
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  updateLoadingIndicator();
}

function createSkeletonItem(width = "100%", height = "20px", marginBottom = "12px") {
  const skeleton = document.createElement("div");
  skeleton.style.cssText = `
    width: ${width};
    height: ${height};
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 8px;
    margin-bottom: ${marginBottom};
  `;
  return skeleton;
}

function updateLoadingIndicator() {
  let loader = document.getElementById("global-loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "global-loader";
    loader.innerHTML = `
      <div class="loader-overlay">
        <div class="skeleton-container">
          <div style="width: 100%; max-width: 400px; margin: 0 auto;">
            <!-- Header skeleton -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px; align-items: center;">
              <div class="skeleton-loader" style="width: 48px; height: 48px; border-radius: 50%;"></div>
              <div style="flex: 1;">
                <div class="skeleton-loader" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
                <div class="skeleton-loader" style="width: 70%; height: 12px;"></div>
              </div>
            </div>
            <!-- Content skeletons -->
            <div class="skeleton-loader" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>
            <div class="skeleton-loader" style="width: 95%; height: 12px; margin-bottom: 8px;"></div>
            <div class="skeleton-loader" style="width: 90%; height: 12px; margin-bottom: 24px;"></div>
            <!-- More content -->
            <div class="skeleton-loader" style="width: 100%; height: 12px; margin-bottom: 8px;"></div>
            <div class="skeleton-loader" style="width: 85%; height: 12px;"></div>
          </div>
        </div>
      </div>
    `;
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    const style = document.createElement("style");
    style.textContent = `
      .loader-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(4px);
      }
      .skeleton-container {
        width: 100%;
        max-width: 500px;
        padding: 24px;
      }
      .skeleton-loader {
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite;
        border-radius: 8px;
      }
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loader);
  }

  loader.style.opacity = loadingCount > 0 ? "1" : "0";
  loader.style.pointerEvents = loadingCount > 0 ? "auto" : "none";
}

async function api(url, options = {}) {
  const user = getStoredUser();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (user?.token) headers.Authorization = `Bearer ${user.token}`;

  showLoading();

  try {
    const res = await fetch(API_BASE + url, {
      headers,
      ...options,
    });
    if (res.status === 401 && !location.pathname.includes("/login")) {
      sessionStorage.removeItem("user");
      location.href = "/pages/public/home/";
      return;
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  } finally {
    hideLoading();
  }
}

function get(url) {
  return api(url);
}
function post(url, body) {
  return api(url, { method: "POST", body: JSON.stringify(body) });
}
function put(url, body) {
  return api(url, { method: "PUT", body: JSON.stringify(body) });
}
function del(url) {
  return api(url, { method: "DELETE" });
}

function $(sel) {
  return document.querySelector(sel);
}
function $$(sel) {
  return document.querySelectorAll(sel);
}

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}
function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (_) {
    return null;
  }
}
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function initTabs() {
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      $$(".tab-btn").forEach((b) => b.classList.remove("active"));
      $$(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      $(`#panel-${tab}`)?.classList.add("active");
    });
  });
}

function initModals() {
  $$("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = $(`#modal-${btn.dataset.modal}`);
      if (modal) modal.classList.add("active");
    });
  });
  $$(".modal-close, .modal-overlay").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target === el)
        el.closest(".modal-overlay").classList.remove("active");
    });
  });
}

// Error boundary for JavaScript failures
function initErrorBoundary() {
  window.addEventListener("error", (event) => {
    console.error("JavaScript Error:", event.error);
    showErrorNotification(
      "An unexpected error occurred. Please refresh the page.",
    );
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
    showErrorNotification("An unexpected error occurred. Please try again.");
  });
}

function showErrorNotification(message) {
  showToast(message, "error");
}

// Toast notification system
function showToast(message, type = "info", duration = 4000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const colors = {
    success: {
      bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
      color: "#059669",
      border: "#6ee7b7",
    },
    error: {
      bg: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      color: "#b91c1c",
      border: "#fca5a5",
    },
    warning: {
      bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      color: "#d97706",
      border: "#fcd34d",
    },
    info: {
      bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
      color: "#2563eb",
      border: "#93c5fd",
    },
  };

  const theme = colors[type] || colors.info;

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${theme.bg};
    color: ${theme.color};
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    max-width: 400px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    border: 1px solid ${theme.border};
    animation: toastSlideIn 0.3s ease-out;
    cursor: pointer;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  toast.addEventListener("click", () => {
    toast.style.animation = "toastSlideOut 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Client-side form validation
function initFormValidation() {
  const forms = document.querySelectorAll("form[data-validate]");

  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Real-time validation on input
    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.classList.contains("error")) {
          validateField(input);
        }
      });
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false;
    }
  });

  return isValid;
}

function validateField(input) {
  const value = input.value.trim();
  const fieldName = input.name || input.id;
  const label =
    document.querySelector(`label[for="${input.id}"]`)?.textContent ||
    fieldName;

  // Remove existing error
  clearFieldError(input);

  // Required validation
  if (input.required && !value) {
    showFieldError(input, `${label} is required`);
    return false;
  }

  // Email validation
  if (input.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(input, `${label} must be a valid email address`);
      return false;
    }
  }

  // Password validation (minimum 8 characters)
  if (input.type === "password" && value && value.length < 8) {
    showFieldError(input, `${label} must be at least 8 characters`);
    return false;
  }

  // Phone validation
  if (input.type === "tel" && value) {
    const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
    if (!phoneRegex.test(value)) {
      showFieldError(input, `${label} must be a valid phone number`);
      return false;
    }
  }

  // Min/Max length validation
  if (input.minLength && value.length < input.minLength) {
    showFieldError(
      input,
      `${label} must be at least ${input.minLength} characters`,
    );
    return false;
  }

  if (input.maxLength && value.length > input.maxLength) {
    showFieldError(
      input,
      `${label} must not exceed ${input.maxLength} characters`,
    );
    return false;
  }

  return true;
}

function showFieldError(input, message) {
  input.classList.add("error");
  input.style.borderColor = "#b91c1c";

  let errorElement = input.parentElement.querySelector(".field-error");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.style.cssText = `
      color: #b91c1c;
      font-size: 0.8rem;
      margin-top: 4px;
      font-family: 'Inter', sans-serif;
    `;
    input.parentElement.appendChild(errorElement);
  }
  errorElement.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("error");
  input.style.borderColor = "";

  const errorElement = input.parentElement.querySelector(".field-error");
  if (errorElement) {
    errorElement.remove();
  }
}

function showAlert(type, message, container = "#alert-container") {
  const el = $(container);
  if (!el) return;
  el.replaceChildren();
  const alert = document.createElement("div");
  alert.className = `alert alert-${escapeHTML(type)}`;
  alert.textContent = message;
  el.appendChild(alert);
  setTimeout(() => el.replaceChildren(), 4000);
}

function renderTable(container, data, columns, actions) {
  if (!data.length) {
    container.innerHTML = `<div class="empty-state"><h3>No records found</h3><p>There are no items to display.</p></div>`;
    return;
  }
  let html = '<div class="table-wrapper"><table class="table"><thead><tr>';
  columns.forEach((c) => (html += `<th>${c.label}</th>`));
  if (actions) html += "<th>Actions</th>";
  html += "</tr></thead><tbody>";
  data.forEach((row) => {
    html += "<tr>";
    columns.forEach((c) => {
      let val = c.key.includes(".")
        ? c.key.split(".").reduce((o, k) => o?.[k], row)
        : row[c.key];
      if (c.format) val = c.format(val, row);
      if (c.badge)
        val = `<span class="badge badge-${escapeHTML(c.badge(val, row))}">${escapeHTML(val)}</span>`;
      html += `<td>${c.allowHTML ? (val ?? "N/A") : escapeHTML(val ?? "N/A")}</td>`;
    });
    if (actions) {
      html += '<td><div class="flex gap-sm">';
      actions.forEach(
        (a) =>
          (html += `<button class="btn btn-sm btn-${a.type || "ghost"}" onclick="${a.onclick(row)}">${a.label}</button>`),
      );
      html += "</div></td>";
    }
    html += "</tr>";
  });
  html += "</tbody></table></div>";
  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initModals();
  initErrorBoundary();
  initFormValidation();

  // Initialize UI enhancements (back buttons, breadcrumbs, session timeout)
  if (typeof require === "undefined") {
    // Load page-init.js for page initialization
    const script = document.createElement("script");
    script.src = "/js/page-init.js";
    document.head.appendChild(script);
  }
});

