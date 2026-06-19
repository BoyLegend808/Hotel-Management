const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get all bookings (admin only) or user's bookings (guest)
router.get("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const userRole = req.session.role;
  const userId = req.session.id;
  
  let bookings = db.bookings || [];
  
  // Guests/family can only see their own bookings
  if (userRole !== "admin" && userRole !== "staff") {
    bookings = bookings.filter(b => b.guestId === userId);
  }
  
  res.json({
    success: true,
    bookings
  });
});

// Get booking by ID
router.get("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const booking = (db.bookings || []).find(b => b.id === parseInt(req.params.id));
  
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  // Non-admin/staff can only view their own bookings
  if (req.session.role !== "admin" && req.session.role !== "staff" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  res.json({
    success: true,
    booking
  });
});

// Create new booking
router.post("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const { roomId, checkIn, checkOut, guests, guestInfo } = req.body;
  
  // Validate room exists
  const room = (db.rooms || []).find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  // Validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
  }
  
  // Check for overlapping bookings
  const existingBookings = (db.bookings || []).filter(b => 
    b.roomId === parseInt(roomId) &&
    b.status !== "cancelled" &&
    new Date(b.checkIn) < checkOutDate &&
    new Date(b.checkOut) > checkInDate
  );
  
  if (existingBookings.length > 0) {
    return res.status(400).json({ success: false, message: "Room is already booked for these dates" });
  }
  
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const roomTotal = room.price * nights;
  const tax = roomTotal * 0.1;
  const total = roomTotal + tax;
  
  const newBooking = {
    id: Date.now(),
    roomId: parseInt(roomId),
    guestId: req.session.id,
    guestName: guestInfo.name || req.session.name,
    guestEmail: guestInfo.email || '',
    guestPhone: guestInfo.phone || '',
    checkIn,
    checkOut,
    guests,
    nights,
    roomPrice: room.price,
    roomTotal,
    tax,
    total,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  
  if (!db.bookings) db.bookings = [];
  db.bookings.push(newBooking);
  await writeDB(db);
  
  res.json({
    success: true,
    booking: newBooking,
    message: "Booking created successfully"
  });
});

// Update booking status (admin only)
router.put("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  
  db.bookings[bookingIndex].status = status;
  db.bookings[bookingIndex].updatedAt = new Date().toISOString();
  await writeDB(db);
  
  res.json({
    success: true,
    booking: db.bookings[bookingIndex],
    message: "Booking status updated successfully"
  });
});

// Cancel booking (guest can cancel their own bookings)
router.put("/:id/cancel", requireAuth, async (req, res) => {
  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  const booking = db.bookings[bookingIndex];
  
  // Guests can only cancel their own bookings
  if (req.session.role !== "admin" && req.session.role !== "staff" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  // Can only cancel pending or confirmed bookings
  if (!["pending", "confirmed"].includes(booking.status)) {
    return res.status(400).json({ success: false, message: "Cannot cancel this booking" });
  }
  
  db.bookings[bookingIndex].status = "cancelled";
  db.bookings[bookingIndex].cancelledAt = new Date().toISOString();
  await writeDB(db);
  
  res.json({
    success: true,
    booking: db.bookings[bookingIndex],
    message: "Booking cancelled successfully"
  });
});

module.exports = router;
