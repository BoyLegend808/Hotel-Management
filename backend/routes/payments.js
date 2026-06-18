const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get all payments (admin only)
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  res.json({
    success: true,
    payments: db.payments || []
  });
});

// Get payments for a specific booking (guest can see their own)
router.get("/booking/:bookingId", requireAuth, async (req, res) => {
  const db = await readDB();
  const bookingId = parseInt(req.params.bookingId);
  
  // Check if user has access to this booking
  const booking = (db.bookings || []).find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  if (req.user.role === "guest" && booking.guestId !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  const payments = (db.payments || []).filter(p => p.bookingId === bookingId);
  
  res.json({
    success: true,
    payments
  });
});

// Create payment for a booking
router.post("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const { bookingId, amount, paymentMethod, cardDetails } = req.body;
  
  // Validate booking exists
  const booking = (db.bookings || []).find(b => b.id === parseInt(bookingId));
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  // Guests can only pay for their own bookings
  if (req.user.role === "guest" && booking.guestId !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  // Validate amount matches booking total
  if (amount !== booking.total) {
    return res.status(400).json({ success: false, message: "Payment amount does not match booking total" });
  }
  
  const newPayment = {
    id: Date.now(),
    bookingId: parseInt(bookingId),
    amount,
    paymentMethod,
    cardLastFour: cardDetails ? cardDetails.number.slice(-4) : null,
    status: "completed",
    createdAt: new Date().toISOString()
  };
  
  if (!db.payments) db.payments = [];
  db.payments.push(newPayment);
  
  // Update booking status to confirmed
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(bookingId));
  if (bookingIndex !== -1) {
    db.bookings[bookingIndex].status = "confirmed";
    db.bookings[bookingIndex].paymentId = newPayment.id;
  }
  
  await writeDB(db);
  
  res.json({
    success: true,
    payment: newPayment,
    message: "Payment processed successfully"
  });
});

// Get payment by ID
router.get("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const payment = (db.payments || []).find(p => p.id === parseInt(req.params.id));
  
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }
  
  // Guests can only view their own payments
  if (req.user.role === "guest") {
    const booking = (db.bookings || []).find(b => b.id === payment.bookingId);
    if (!booking || booking.guestId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  }
  
  res.json({
    success: true,
    payment
  });
});

// Refund payment (admin only)
router.post("/:id/refund", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const paymentIndex = (db.payments || []).findIndex(p => p.id === parseInt(req.params.id));
  
  if (paymentIndex === -1) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }
  
  const payment = db.payments[paymentIndex];
  
  if (payment.status === "refunded") {
    return res.status(400).json({ success: false, message: "Payment already refunded" });
  }
  
  db.payments[paymentIndex].status = "refunded";
  db.payments[paymentIndex].refundedAt = new Date().toISOString();
  
  // Update booking status
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === payment.bookingId);
  if (bookingIndex !== -1) {
    db.bookings[bookingIndex].status = "cancelled";
  }
  
  await writeDB(db);
  
  res.json({
    success: true,
    payment: db.payments[paymentIndex],
    message: "Payment refunded successfully"
  });
});

module.exports = router;
