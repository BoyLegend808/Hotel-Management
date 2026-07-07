/**
 * Booking Wizard Form Handler
 * Lumina Hospitality — Booking System
 *
 * Handles: Form validation, step navigation, API calls, error handling
 * No inline handlers — all listeners attached here.
 */

(function () {
  "use strict";

  /* ────────────────────────────────────────────
     State Management
     ──────────────────────────────────────────── */

  const wizard = {
    currentStep: 1,
    totalSteps: 3,
    data: {
      // Step 1: Dates & Guests
      checkIn: "",
      checkOut: "",
      guests: 1,

      // Step 2: Room Selection
      roomId: null,
      roomName: "",
      roomPrice: 0,

      // Step 3: Guest Info & Payment
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      paymentMethod: "card",
    },
  };

  /* ────────────────────────────────────────────
     Step Navigation
     ──────────────────────────────────────────── */

  function updateStepIndicator() {
    // Update progress bar
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      const progress =
        ((wizard.currentStep - 1) / (wizard.totalSteps - 1)) * 100;
      progressBar.style.width = progress + "%";
    }

    // Update step indicators
    for (let i = 1; i <= wizard.totalSteps; i++) {
      const indicator = document.getElementById(`step-${i}-indicator`);
      if (indicator) {
        if (i < wizard.currentStep) {
          indicator.classList.remove(
            "bg-surface-container-highest",
            "text-on-surface-variant",
          );
          indicator.classList.add("bg-secondary", "text-on-secondary");
        } else if (i === wizard.currentStep) {
          indicator.classList.remove(
            "bg-surface-container-highest",
            "text-on-surface-variant",
          );
          indicator.classList.add("bg-primary", "text-on-primary");
        } else {
          indicator.classList.remove(
            "bg-secondary",
            "text-on-secondary",
            "bg-primary",
            "text-on-primary",
          );
          indicator.classList.add(
            "bg-surface-container-highest",
            "text-on-surface-variant",
          );
        }
      }
    }
  }

  function showStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('[id^="step-"][id$="content"]').forEach((el) => {
      el.classList.remove("active");
    });

    // Show current step
    const stepContent = document.getElementById(`step-${stepNum}content`);
    if (stepContent) {
      stepContent.classList.add("active");
    }

    // Update header
    const stepTitle = document.getElementById("step-title");
    const stepSubtitle = document.getElementById("step-subtitle");

    const stepTitles = {
      1: "Plan Your Stay",
      2: "Select Your Room",
      3: "Complete Booking",
    };

    const stepSubtitles = {
      1: "Select your preferred dates and guest count.",
      2: "Choose from our available rooms.",
      3: "Enter your details and confirm payment.",
    };

    if (stepTitle) stepTitle.textContent = stepTitles[stepNum] || "";
    if (stepSubtitle) stepSubtitle.textContent = stepSubtitles[stepNum] || "";

    updateStepIndicator();
    updateButtonStates();
  }

  function updateButtonStates() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const confirmBtn = document.getElementById("confirmBtn");

    if (prevBtn) {
      prevBtn.disabled = wizard.currentStep === 1;
      prevBtn.style.opacity = wizard.currentStep === 1 ? "0.5" : "1";
    }

    if (nextBtn) {
      nextBtn.style.display =
        wizard.currentStep === wizard.totalSteps ? "none" : "block";
    }

    if (confirmBtn) {
      confirmBtn.style.display =
        wizard.currentStep === wizard.totalSteps ? "block" : "none";
    }
  }

  /* ────────────────────────────────────────────
     Validation
     ──────────────────────────────────────────── */

  function validateStep(stepNum) {
    switch (stepNum) {
      case 1:
        return validateDatesAndGuests();
      case 2:
        return validateRoomSelection();
      case 3:
        return validateGuestInfo();
      default:
        return true;
    }
  }

  function validateDatesAndGuests() {
    const checkInInput = document.getElementById("checkin");
    const checkOutInput = document.getElementById("checkout");
    const guestsInput = document.getElementById("guests-count");

    if (!checkInInput || !checkOutInput || !guestsInput) {
      return false;
    }

    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const today = new Date(new Date().toDateString());

    // Validation checks
    if (!checkInInput.value) {
      showError("Please select a check-in date");
      return false;
    }

    if (!checkOutInput.value) {
      showError("Please select a check-out date");
      return false;
    }

    if (checkIn < today) {
      showError("Check-in date must be today or later");
      return false;
    }

    if (checkOut <= checkIn) {
      showError("Check-out date must be after check-in date");
      return false;
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights > 365) {
      showError("Maximum stay is 365 days");
      return false;
    }

    const guests = parseInt(guestsInput.value, 10);
    if (!guests || guests < 1 || guests > 8) {
      showError("Guest count must be between 1 and 8");
      return false;
    }

    wizard.data.checkIn = checkInInput.value;
    wizard.data.checkOut = checkOutInput.value;
    wizard.data.guests = guests;

    return true;
  }

  function validateRoomSelection() {
    if (!wizard.data.roomId) {
      showError("Please select a room");
      return false;
    }
    return true;
  }

  function validateGuestInfo() {
    const nameInput = document.getElementById("guestName");
    const emailInput = document.getElementById("guestEmail");
    const phoneInput = document.getElementById("guestPhone");

    if (!nameInput || !emailInput) {
      return false;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : "";

    if (!name || name.length < 2) {
      showError("Please enter a valid name");
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Please enter a valid email address");
      return false;
    }

    wizard.data.guestName = name;
    wizard.data.guestEmail = email;
    wizard.data.guestPhone = phone;

    return true;
  }

  function showError(message) {
    if (typeof UI !== "undefined" && UI.showToast) {
      UI.showToast(message, "error", 3000);
    } else {
      console.error(message);
    }
  }

  function showSuccess(message) {
    if (typeof UI !== "undefined" && UI.showToast) {
      UI.showToast(message, "success", 2000);
    }
  }

  /* ────────────────────────────────────────────
     Button Handlers
     ──────────────────────────────────────────── */

  function handleNext() {
    if (!validateStep(wizard.currentStep)) {
      return;
    }

    if (wizard.currentStep < wizard.totalSteps) {
      wizard.currentStep++;
      showStep(wizard.currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePrev() {
    if (wizard.currentStep > 1) {
      wizard.currentStep--;
      showStep(wizard.currentStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleConfirm() {
    if (!validateStep(wizard.currentStep)) {
      return;
    }

    const confirmBtn = document.getElementById("confirmBtn");
    if (!confirmBtn) return;

    // Show loading state
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Processing...";

    try {
      // Get auth token
      const token = sessionStorage.getItem("token") || "";

      // Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: wizard.data.roomId,
          checkIn: wizard.data.checkIn,
          checkOut: wizard.data.checkOut,
          guests: wizard.data.guests,
          guestInfo: {
            name: wizard.data.guestName,
            email: wizard.data.guestEmail,
            phone: wizard.data.guestPhone,
          },
        }),
      });

      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const bookingData = await bookingRes.json();
      const bookingId = bookingData.booking.id;

      // Process payment
      const paymentRes = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          paymentMethod: wizard.data.paymentMethod,
        }),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.message || "Failed to process payment");
      }

      showSuccess("Booking confirmed successfully!");

      // Redirect to guest dashboard after 2 seconds
      setTimeout(() => {
        window.location.href =
          "/pages/hotel/guest-dashboard-lumina/guest-dashboard-lumina.html";
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      showError(
        error.message || "An error occurred while processing your booking",
      );
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText;
    }
  }

  /* ────────────────────────────────────────────
     Room Selection (Step 2)
     ──────────────────────────────────────────── */

  function handleRoomCardSelection(roomId, roomName, roomPrice) {
    // Remove previous selection
    document.querySelectorAll(".room-card").forEach((card) => {
      card.classList.remove("selected");
    });

    // Add selection to clicked card
    const selectedCard = document.querySelector(`[data-room-id="${roomId}"]`);
    if (selectedCard) {
      selectedCard.classList.add("selected");
    }

    // Update wizard data
    wizard.data.roomId = roomId;
    wizard.data.roomName = roomName;
    wizard.data.roomPrice = roomPrice;

    // Update price breakdown (if exists)
    updatePriceBreakdown();
  }

  function updatePriceBreakdown() {
    const checkIn = new Date(wizard.data.checkIn);
    const checkOut = new Date(wizard.data.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomTotal = wizard.data.roomPrice * nights;
    const tax = roomTotal * 0.1;
    const total = roomTotal + tax;

    // Update DOM elements
    const nightsEl = document.getElementById("totalNights");
    const ratioEl = document.getElementById("nightlyRate");
    const roomTotalEl = document.getElementById("roomTotal");
    const taxEl = document.getElementById("taxAmount");
    const totalEl = document.getElementById("totalAmount");

    if (nightsEl) nightsEl.textContent = nights;
    if (ratioEl)
      ratioEl.textContent = "$" + wizard.data.roomPrice.toLocaleString();
    if (roomTotalEl) roomTotalEl.textContent = "$" + roomTotal.toLocaleString();
    if (taxEl) taxEl.textContent = "$" + tax.toFixed(2);
    if (totalEl) totalEl.textContent = "$" + total.toLocaleString();
  }

  /* ────────────────────────────────────────────
     Initialization
     ──────────────────────────────────────────── */

  function init() {
    // Attach button listeners
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const confirmBtn = document.getElementById("confirmBtn");

    if (prevBtn) prevBtn.addEventListener("click", handlePrev);
    if (nextBtn) nextBtn.addEventListener("click", handleNext);
    if (confirmBtn) confirmBtn.addEventListener("click", handleConfirm);

    // Attach room card listeners
    document.addEventListener("click", (e) => {
      const roomCard = e.target.closest("[data-room-id]");
      if (roomCard) {
        const roomId = parseInt(roomCard.dataset.roomId, 10);
        const roomName = roomCard.dataset.roomName || "";
        const roomPrice = parseInt(roomCard.dataset.roomPrice, 10) || 0;
        handleRoomCardSelection(roomId, roomName, roomPrice);
      }
    });

    // Get room ID from URL if present
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get("roomId");
    if (urlRoomId) {
      // Pre-select room if passed via URL
      const roomCard = document.querySelector(`[data-room-id="${urlRoomId}"]`);
      if (roomCard) {
        roomCard.click();
      }
    }

    // Initialize UI
    showStep(1);
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for manual testing
  window.BookingWizard = {
    getData: () => wizard.data,
    setStep: (stepNum) => {
      wizard.currentStep = stepNum;
      showStep(stepNum);
    },
  };
})();
