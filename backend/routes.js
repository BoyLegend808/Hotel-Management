const express = require("express");
const { requireAuth, requireRole, findDemoUser, createSession, destroySession } = require("./auth");
const { readDB } = require("./db-optimized");

const roomsRouter = require("./routes/rooms");
const bookingsRouter = require("./routes/bookings");
const paymentsRouter = require("./routes/payments");
const reviewsRouter = require("./routes/reviews");
const housekeepingRouter = require("./routes/housekeeping");
const settingsRouter = require("./routes/settings");
const managerRouter = require("./routes/manager");

const router = express.Router();

// Auth endpoints
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = findDemoUser(username, password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const session = createSession(user);
  res.json({
    success: true,
    token: session.token,
    role: session.role,
    name: session.name,
    redirect: user.redirect
  });
});

router.post("/logout", (req, res) => {
  destroySession(req);
  res.json({ success: true });
});

// Mount each router under its path
router.use("/rooms", roomsRouter);
router.use("/bookings", bookingsRouter);
router.use("/payments", paymentsRouter);
router.use("/reviews", reviewsRouter);
router.use("/housekeeping", housekeepingRouter);
router.use("/settings", settingsRouter);
router.use("/manager", managerRouter);

// Stats endpoint (manager only)
router.get("/stats", requireAuth, requireRole("manager"), async (req, res) => {
  const db = await readDB();
  const totalBookings = (db.bookings || []).length;
  const confirmedBookings = (db.bookings || []).filter(b => b.status === "confirmed").length;
  const pendingBookings = (db.bookings || []).filter(b => b.status === "pending").length;
  const totalRooms = (db.rooms || []).length;
  const availableRooms = (db.rooms || []).filter(r => r.status === "available").length;
  const totalRevenue = (db.payments || []).reduce((sum, p) => sum + (p.status === "completed" ? p.amount : 0), 0);
  const averageRating = (db.reviews || []).length > 0 
    ? (db.reviews.reduce((sum, r) => sum + r.rating, 0) / db.reviews.length).toFixed(1)
    : "0.0";

  res.json({
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalRooms,
    availableRooms,
    occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100).toFixed(0) : 0,
    totalRevenue: totalRevenue.toFixed(2),
    averageRating,
    totalReviews: (db.reviews || []).length
  });
});

module.exports = router;