const express = require("express");
const { requireAuth } = require("../auth");
const { readDB } = require("../db-optimized");
const router = express.Router();

router.get("/analytics", requireAuth, async (req, res) => {
  if (req.session.role !== "manager") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const bookings = db.bookings || [];
  const rooms = db.rooms || [];

  // Calculate total revenue (Confirmed, CheckedIn, CheckedOut)
  const validBookings = bookings.filter(b => ["Confirmed", "CheckedIn", "CheckedOut"].includes(b.status));
  const totalRevenue = validBookings.reduce((sum, b) => sum + (b.total || 0), 0);

  // Calculate current occupancy
  const occupiedRooms = rooms.filter(r => r.status === "Occupied").length;
  const totalRooms = rooms.length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

  // Get recent bookings (last 5)
  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  res.json({
    success: true,
    analytics: {
      totalRevenue: totalRevenue.toFixed(2),
      occupancyRate: occupancyRate.toFixed(1),
      occupiedRooms,
      totalRooms,
      totalBookings: bookings.length
    },
    recentBookings
  });
});

module.exports = router;
