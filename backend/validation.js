/**
 * Validation & Sanitization Module
 * Generic validation helpers used across hotel API routes.
 */

function clean(value, max = 100) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  if (!phone) return true; // phone is optional
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  return phoneRegex.test(phone);
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

function validateFutureDate(dateStr) {
  if (!validateDate(dateStr)) return false;
  return new Date(dateStr) >= new Date(new Date().toDateString());
}

function validateDateRange(checkIn, checkOut) {
  if (!validateDate(checkIn) || !validateDate(checkOut)) return false;
  return new Date(checkOut) > new Date(checkIn);
}

function validateRating(rating) {
  const r = parseInt(rating, 10);
  return !isNaN(r) && r >= 1 && r <= 5;
}

/**
 * Validate booking request body
 */
function validateBookingData(data) {
  const errors = [];

  if (!data.roomId) errors.push("Room ID is required");
  if (!data.checkIn) errors.push("Check-in date is required");
  if (!data.checkOut) errors.push("Check-out date is required");

  if (data.checkIn && !validateFutureDate(data.checkIn)) {
    errors.push("Check-in date must be today or in the future");
  }

  if (data.checkIn && data.checkOut && !validateDateRange(data.checkIn, data.checkOut)) {
    errors.push("Check-out date must be after check-in date");
  }

  if (data.guestInfo) {
    if (data.guestInfo.email && !validateEmail(data.guestInfo.email)) {
      errors.push("Invalid email format");
    }
    if (data.guestInfo.phone && !validatePhone(data.guestInfo.phone)) {
      errors.push("Invalid phone format");
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate room data
 */
function validateRoomData(data) {
  const errors = [];

  if (!clean(data.name)) errors.push("Room name is required");
  if (!data.price || isNaN(data.price) || data.price <= 0) errors.push("Valid price is required");
  if (!data.capacity || isNaN(data.capacity) || data.capacity < 1) errors.push("Valid capacity is required");

  return { valid: errors.length === 0, errors };
}

function sendError(res, statusCode, message, details = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details.length > 0 && { details }),
  });
}

function sendSuccess(res, data, message = null) {
  return res.json({
    success: true,
    ...(message && { message }),
    data,
  });
}

module.exports = {
  clean,
  validateEmail,
  validatePhone,
  validateDate,
  validateFutureDate,
  validateDateRange,
  validateRating,
  validateBookingData,
  validateRoomData,
  sendError,
  sendSuccess,
};
