const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");
const { backupBookingToCSV } = require("../backup");
const router = express.Router();

// Get all bookings (manager/receptionist) or user's bookings (guest)
router.get("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const userRole = req.session.role;
  const userId = req.session.id;
  
  let bookings = db.bookings || [];
  
  // Guests can only see their own bookings
  if (userRole !== "manager" && userRole !== "receptionist") {
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
  
  // Non-manager/receptionist can only view their own bookings
  if (req.session.role !== "manager" && req.session.role !== "receptionist" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  res.json({
    success: true,
    booking
  });
});

// Initiate new booking (Public route, no auth required)
router.post("/initiate", async (req, res) => {
  const db = await readDB();
  const { roomId, checkIn, checkOut, guests, guestInfo } = req.body;
  
  // Validate room exists
  const room = (db.rooms || []).find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  // Validate dates
  const checkInDateObj = new Date(checkIn);
  const checkOutDateObj = new Date(checkOut);
  if (checkOutDateObj <= checkInDateObj) {
    return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
  }
  
  // Check for overlapping bookings
  const existingBookings = (db.bookings || []).filter(b => 
    b.roomId === parseInt(roomId) &&
    b.status !== "Cancelled" &&
    new Date(b.checkInDate) < checkOutDateObj &&
    new Date(b.checkOutDate) > checkInDateObj
  );
  
  if (existingBookings.length > 0) {
    return res.status(400).json({ success: false, message: "Room is already booked for these dates" });
  }
  
  const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
  const roomTotal = room.bookingPrice * nights;
  const tax = roomTotal * 0.1;
  const total = roomTotal + tax;
  
  const virtualAccountNumber = db.settings?.bankDetails?.accountNumber || Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 digits
  const bankName = db.settings?.bankDetails?.accountName || "Lumina Virtual Bank";
  
  const newBooking = {
    id: Date.now(),
    bookingCode: guestInfo.bookingCode || 'N/A',
    roomId: parseInt(roomId),
    guestId: req.session?.id || null, // Optional if logged in
    guestName: guestInfo.name || 'Guest',
    guestEmail: guestInfo.email || '',
    guestPhone: guestInfo.phone || '',
    specialRequests: guestInfo.specialRequests || '',
    arrivalTime: guestInfo.arrivalTime || 'Not specified',
    checkIn, 
    checkOut, 
    checkInDate: checkIn,
    checkOutDate: checkOut,
    guests,
    nights,
    roomPrice: room.bookingPrice,
    roomTotal,
    tax,
    total,
    status: "Pending", // Wait for payment
    paymentMethod: "Bank Transfer",
    paymentState: "Pending",
    virtualAccount: {
      accountNumber: virtualAccountNumber,
      bankName: bankName,
      amount: total
    },
    createdAt: new Date().toISOString()
  };
  
  if (!db.bookings) db.bookings = [];
  db.bookings.push(newBooking);
  await writeDB(db);
  
  // Backup to CSV
  await backupBookingToCSV(newBooking);
  
  res.json({
    success: true,
    booking: newBooking,
    message: "Booking initiated. Waiting for payment."
  });
});

// Admin Walk-In Booking (Requires Auth)
router.post("/admin", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "receptionist") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const { roomId, checkIn, checkOut, guests, guestInfo } = req.body;
  
  const room = (db.rooms || []).find(r => r.id === parseInt(roomId));
  if (!room) return res.status(404).json({ success: false, message: "Room not found" });

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const roomTotal = room.bookingPrice * nights;
  const tax = roomTotal * 0.1;
  const total = roomTotal + tax;

  const newBooking = {
    id: Date.now(),
    bookingCode: guestInfo.bookingCode || 'N/A',
    roomId: parseInt(roomId),
    guestId: req.session.id,
    guestName: guestInfo.name,
    guestEmail: guestInfo.email,
    guestPhone: guestInfo.phone,
    specialRequests: guestInfo.specialRequests || 'Walk-In Booking',
    arrivalTime: 'Arrived',
    checkInDate: checkIn,
    checkOutDate: checkOut,
    guests,
    nights,
    roomPrice: room.bookingPrice,
    roomTotal,
    tax,
    total,
    status: "Confirmed", 
    paymentMethod: guestInfo.paymentMethod || "Cash",
    paymentState: "Confirmed",
    createdAt: new Date().toISOString()
  };

  if (!db.bookings) db.bookings = [];
  db.bookings.push(newBooking);
  await writeDB(db);

  // Backup to CSV
  await backupBookingToCSV(newBooking);

  // Print slip to console (simulated email)
  console.log(`\n================================`);
  console.log(`🏨 ADMIN BOOKING SLIP GENERATED`);
  console.log(`================================`);
  console.log(`Guest: ${newBooking.guestName}`);
  console.log(`Booking Code: ${newBooking.bookingCode}`);
  console.log(`Total Paid: $${newBooking.total}`);
  console.log(`================================\n`);

  res.json({ success: true, booking: newBooking });
});

// Webhook for Payment Confirmation (Mocked for external gateway)
router.post("/webhook", async (req, res) => {
  const db = await readDB();
  const { bookingId, status, amount_paid } = req.body;
  
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(bookingId));
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const booking = db.bookings[bookingIndex];

  if (status === 'success' && amount_paid >= booking.total) {
    booking.paymentState = "Confirmed";
    booking.status = "Confirmed";
    booking.updatedAt = new Date().toISOString();

    await writeDB(db);

    // Simulated Email Sending
    console.log(`\n================================`);
    console.log(`📧 EMAIL SENT TO: ${booking.guestEmail}`);
    console.log(`================================`);
    console.log(`Dear ${booking.guestName},`);
    console.log(`Your payment of $${booking.total} via Bank Transfer was received.`);
    console.log(`Your room is confirmed!`);
    console.log(`Your Booking Code / Access Key: ${booking.bookingCode}`);
    console.log(`================================\n`);

    res.json({ success: true, message: "Webhook processed" });
  } else {
    booking.paymentState = "Failed";
    await writeDB(db);
    res.json({ success: false, message: "Payment failed or insufficient amount" });
  }
});

// Poll payment status
router.get("/:id/payment-status", async (req, res) => {
  const db = await readDB();
  const booking = (db.bookings || []).find(b => b.id === parseInt(req.params.id));
  
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  res.json({ success: true, paymentState: booking.paymentState });
});

// Update booking status (Manager/Receptionist only)
// Workflow B: Check-in, Checkout
router.put("/:id/status", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "receptionist") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  const { status } = req.body;
  const validStatuses = ["Confirmed", "Cancelled", "CheckedIn", "CheckedOut"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  
  const booking = db.bookings[bookingIndex];
  booking.status = status;
  booking.updatedAt = new Date().toISOString();

  // Workflow logic: Update Room status based on booking status
  const roomIndex = (db.rooms || []).findIndex(r => r.id === booking.roomId);
  if (roomIndex !== -1) {
    if (status === "CheckedIn") {
      db.rooms[roomIndex].status = "Occupied";
    } else if (status === "CheckedOut") {
      db.rooms[roomIndex].status = "Cleaning";
    } else if (status === "Cancelled") {
      db.rooms[roomIndex].status = "Available";
    }
  }
  
  await writeDB(db);
  
  res.json({
    success: true,
    booking: db.bookings[bookingIndex],
    message: `Booking status updated to ${status}`
  });
});

// Cancel booking (Guest can cancel their own bookings)
// Workflow C: Cancellation
router.put("/:id/cancel", requireAuth, async (req, res) => {
  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  const booking = db.bookings[bookingIndex];
  
  // Guests can only cancel their own bookings
  if (req.session.role !== "manager" && req.session.role !== "receptionist" && booking.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  // Can only cancel Confirmed bookings
  if (booking.status !== "Confirmed" && booking.status !== "pending") {
    return res.status(400).json({ success: false, message: "Cannot cancel this booking as it is not Confirmed" });
  }
  
  booking.status = "Cancelled";
  booking.cancelledAt = new Date().toISOString();

  // Update room status
  const roomIndex = (db.rooms || []).findIndex(r => r.id === booking.roomId);
  if (roomIndex !== -1) {
      db.rooms[roomIndex].status = "Available";
  }

  await writeDB(db);
  
  res.json({
    success: true,
    booking: db.bookings[bookingIndex],
    message: "Booking cancelled successfully"
  });
});

// Edit booking (Manager/Receptionist only)
router.put("/:id", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "receptionist") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  
  const booking = db.bookings[bookingIndex];
  const updates = req.body;
  
  // If room is changed, recalculate price
  if (updates.roomId && parseInt(updates.roomId) !== booking.roomId) {
    const newRoom = (db.rooms || []).find(r => r.id === parseInt(updates.roomId));
    if (newRoom) {
      booking.roomId = parseInt(updates.roomId);
      booking.roomPrice = newRoom.bookingPrice;
      
      const checkInDateObj = new Date(updates.checkInDate || booking.checkInDate);
      const checkOutDateObj = new Date(updates.checkOutDate || booking.checkOutDate);
      const nights = Math.ceil((checkOutDateObj - checkInDateObj) / (1000 * 60 * 60 * 24));
      
      booking.nights = nights;
      booking.roomTotal = newRoom.bookingPrice * nights;
      booking.tax = booking.roomTotal * 0.1;
      booking.total = booking.roomTotal + booking.tax;
      
      if (booking.virtualAccount) {
        booking.virtualAccount.amount = booking.total;
      }
    }
  }

  // Update other fields
  if (updates.guestName) booking.guestName = updates.guestName;
  if (updates.guestEmail) booking.guestEmail = updates.guestEmail;
  if (updates.guestPhone) booking.guestPhone = updates.guestPhone;
  if (updates.checkInDate) booking.checkInDate = updates.checkInDate;
  if (updates.checkOutDate) booking.checkOutDate = updates.checkOutDate;
  if (updates.specialRequests !== undefined) booking.specialRequests = updates.specialRequests;
  if (updates.guests) booking.guests = updates.guests;

  booking.updatedAt = new Date().toISOString();
  await writeDB(db);
  
  res.json({
    success: true,
    booking,
    message: "Booking updated successfully"
  });
});

// Manually Confirm Payment (Manager/Receptionist only)
router.put("/:id/payment", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "receptionist") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const bookingIndex = (db.bookings || []).findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const booking = db.bookings[bookingIndex];
  booking.paymentState = "Confirmed";
  
  // If status is still Pending, move it to Confirmed since payment is done
  if (booking.status === "Pending") {
    booking.status = "Confirmed";
  }

  booking.updatedAt = new Date().toISOString();
  await writeDB(db);

  res.json({
    success: true,
    booking,
    message: "Payment confirmed manually"
  });
});

module.exports = router;
