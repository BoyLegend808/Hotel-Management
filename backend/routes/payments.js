const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");
const { csrfMiddleware } = require("../csrf");

const router = express.Router();

// Apply CSRF protection to all state-changing routes in this router
router.use(csrfMiddleware);

// Get all payments (admin only)
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  res.json({ success: true, payments: db.payments || [] });
});

// Get payments for a specific booking
router.get("/booking/:bookingId", requireAuth, async (req, res) => {
  const db = await readDB();
  const bookingId = parseInt(req.params.bookingId);

  const booking = (db.bookings || []).find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Non-admin can only see their own booking payments
  if (req.session.role !== "admin" && req.session.role !== "staff" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const payments = (db.payments || []).filter(p => p.bookingId === bookingId);
  res.json({ success: true, payments });
});

// Create payment for a booking
router.post("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const { bookingId, paymentMethod } = req.body;

  const booking = (db.bookings || []).find(b => b.id === parseInt(bookingId));
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  // Non-admin/staff can only pay for their own bookings
  if (req.session.role !== "admin" && req.session.role !== "staff" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  // Prevent double-payment
  const alreadyPaid = (db.payments || []).some(
    p => p.bookingId === parseInt(bookingId) && p.status === "completed"
  );
  if (alreadyPaid) {
    return res.status(400).json({ success: false, message: "Booking already paid" });
  }

  const newPayment = {
    id: Date.now(),
    bookingId: parseInt(bookingId),
    amount: booking.total, // always use server-calculated total, never client-supplied
    paymentMethod: ["card", "cash", "transfer"].includes(paymentMethod) ? paymentMethod : "card",
    // Note: never store raw card details — only a masked last-4 from a real payment gateway
    status: "completed",
    createdAt: new Date().toISOString()
  };

  if (!db.payments) db.payments = [];
  db.payments.push(newPayment);

  // Confirm the booking
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(bookingId));
  if (bookingIndex !== -1) {
    db.bookings[bookingIndex].status = "confirmed";
    db.bookings[bookingIndex].paymentId = newPayment.id;
  }

  await writeDB(db);

  res.json({ success: true, payment: newPayment, message: "Payment processed successfully" });
});

// Get payment by ID
router.get("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const payment = (db.payments || []).find(p => p.id === parseInt(req.params.id));

  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }

  if (req.session.role !== "admin" && req.session.role !== "staff") {
    const booking = (db.bookings || []).find(b => b.id === payment.bookingId);
    if (!booking || booking.guestId !== req.session.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
  }

  res.json({ success: true, payment });
});

// Refund payment (admin only)
router.post("/:id/refund", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const paymentIndex = (db.payments || []).findIndex(p => p.id === parseInt(req.params.id));

  if (paymentIndex === -1) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }

  if (db.payments[paymentIndex].status === "refunded") {
    return res.status(400).json({ success: false, message: "Payment already refunded" });
  }

  db.payments[paymentIndex].status = "refunded";
  db.payments[paymentIndex].refundedAt = new Date().toISOString();

  const bookingIndex = (db.bookings || []).findIndex(b => b.id === db.payments[paymentIndex].bookingId);
  if (bookingIndex !== -1) {
    db.bookings[bookingIndex].status = "cancelled";
  }

  await writeDB(db);

  res.json({ success: true, payment: db.payments[paymentIndex], message: "Payment refunded successfully" });
});

module.exports = router;
