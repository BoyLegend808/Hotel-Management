/**
 * Validation & Sanitization Module
 * Provides consistent validation across all API endpoints
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
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phone.length === 0 || phoneRegex.test(phone);
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
}

function validateAge(age) {
  const num = parseInt(age, 10);
  return num >= 0 && num <= 150;
}

function validateResidentData(data) {
  const errors = [];

  if (!clean(data.name)) errors.push("Name is required");
  if (!clean(data.careType)) errors.push("Care Type is required");
  if (data.email && !validateEmail(data.email))
    errors.push("Invalid email format");
  if (data.emergencyPhone && !validatePhone(data.emergencyPhone))
    errors.push("Invalid phone format");
  if (data.dob && !validateDate(data.dob)) errors.push("Invalid date of birth");
  if (data.age !== undefined && !validateAge(data.age))
    errors.push("Age must be between 0-150");

  return { valid: errors.length === 0, errors };
}

function validateStaffData(data) {
  const errors = [];

  if (!clean(data.name)) errors.push("Name is required");
  if (!clean(data.position)) errors.push("Position is required");
  if (data.email && !validateEmail(data.email))
    errors.push("Invalid email format");
  if (data.phone && !validatePhone(data.phone))
    errors.push("Invalid phone format");
  if (data.dob && !validateDate(data.dob)) errors.push("Invalid date of birth");

  return { valid: errors.length === 0, errors };
}

function validateFamilyData(data) {
  const errors = [];

  if (!clean(data.name)) errors.push("Name is required");
  if (data.email && !validateEmail(data.email))
    errors.push("Invalid email format");
  if (data.phone && !validatePhone(data.phone))
    errors.push("Invalid phone format");

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
  validateAge,
  validateResidentData,
  validateStaffData,
  validateFamilyData,
  sendError,
  sendSuccess,
};
