// Load performance utilities for debounce
if (typeof debounce === 'undefined') {
  const script = document.createElement('script');
  script.src = '/js/performance-utils.js';
  script.async = true;
  document.head.appendChild(script);
}

const PublicApp = {
  initHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    const setHeaderState = () => {
      header.classList.toggle("scrolled", window.scrollY > 48);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  },

  initAuth() {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const portalBtn = document.getElementById("portal-btn");
    const portalBtnText = document.getElementById("portal-btn-text");
    
    // Check if user is logged in
    const user = sessionStorage.getItem("user");
    
    if (user) {
      const userData = JSON.parse(user);
      
      // User is logged in, show logout and portal buttons
      loginBtn?.classList.add("hidden");
      logoutBtn?.classList.remove("hidden");
      portalBtn?.classList.remove("hidden");
      
      // Set portal button text and link based on role
      if (userData.role === 'admin') {
        portalBtnText.textContent = 'Admin';
        portalBtn.href = '/pages/admin/dashboard/dashboard.html';
      } else if (userData.role === 'staff') {
        portalBtnText.textContent = 'Staff';
        portalBtn.href = '/pages/staff/dashboard/staff-dashboard.html';
      } else if (userData.role === 'family') {
        portalBtnText.textContent = 'Family';
        portalBtn.href = '/pages/family-portal/dashboard/family-dashboard.html';
      } else {
        portalBtnText.textContent = 'Portal';
        portalBtn.href = '/pages/admin/login/';
      }
      
      // Add logout functionality
      logoutBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("user");
        window.location.href = "/pages/public/home/";
      });
    } else {
      // User is not logged in, show login button
      loginBtn?.classList.remove("hidden");
      logoutBtn?.classList.add("hidden");
      portalBtn?.classList.add("hidden");
    }
  },

  initContactForm() {
    const form = document.getElementById("enquiry-form");
    if (!form) return;

    const success = document.getElementById("form-success");
    const submitButton = document.getElementById("submit-btn");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!submitButton) return;

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";

      const payload = {
        name: document.getElementById("name")?.value || "",
        email: document.getElementById("email")?.value || "",
        phone: document.getElementById("phone")?.value || "",
        relationship: document.getElementById("relationship")?.value || "Self",
        residentName: document.getElementById("residentName")?.value || "",
        message: document.getElementById("message")?.value || "",
      };

      try {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          success?.style.removeProperty("display");
          success?.setAttribute("aria-live", "polite");
          form.reset();
        } else {
          success?.style.setProperty("display", "none");
          alert(data.message || "Unable to send your enquiry right now.");
        }
      } catch (error) {
        console.error("Unable to submit enquiry:", error);
        alert("Unable to send your enquiry right now. Please try again.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send Enquiry";
      }
    });
  },

  initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    if (btn && nav) {
      btn.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  PublicApp.initHeader();
  PublicApp.initAuth();
  PublicApp.initContactForm();
  PublicApp.initMobileMenu();
});
