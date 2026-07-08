const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");
const appEvents = require("../events");
const router = express.Router();

// Get all rooms that need cleaning or maintenance (Manager, Housekeeper)
router.get("/tasks", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "housekeeper") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const rooms = db.rooms || [];
  const tasks = rooms.filter(r => r.status === "Cleaning" || r.status === "Maintenance");
  
  res.json({
    success: true,
    tasks
  });
});

// SSE endpoint for real-time notifications
router.get("/events", requireAuth, (req, res) => {
  // We allow housekeeper and manager roles
  if (req.session.role !== "manager" && req.session.role !== "housekeeper") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Initial ping to establish connection
  res.write('data: {"type": "ping"}\n\n');

  const onCheckout = (room) => {
    res.write(`data: ${JSON.stringify({ type: 'checkout', room })}\n\n`);
  };
  
  appEvents.on('roomCheckedOut', onCheckout);
  
  req.on('close', () => {
    appEvents.off('roomCheckedOut', onCheckout);
  });
});

// Get all housekeeping logs
router.get("/logs", requireAuth, async (req, res) => {
  if (req.session.role !== "manager" && req.session.role !== "housekeeper") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const logs = db.housekeepingLogs || [];
  
  res.json({
    success: true,
    logs
  });
});

// Log maintenance/cleaning completion (Housekeeper only)
router.post("/log", requireAuth, async (req, res) => {
  if (req.session.role !== "housekeeper" && req.session.role !== "manager") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const db = await readDB();
  const { roomId, notes, newStatus } = req.body;
  
  const roomIndex = (db.rooms || []).findIndex(r => r.id === parseInt(roomId));
  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  // Valid status transitions from Housekeeping are usually back to Available, or shifting from Cleaning to Maintenance
  const validStatuses = ["Available", "Maintenance"];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ success: false, message: "Invalid status update for housekeeping" });
  }
  
  // Create log entry
  const newLog = {
    logId: Date.now().toString(),
    roomId: parseInt(roomId),
    housekeeperId: req.session.id,
    housekeeperName: req.session.name,
    cleanedAt: new Date().toISOString(),
    notes: notes || "",
    status: "Completed"
  };
  
  if (!db.housekeepingLogs) db.housekeepingLogs = [];
  db.housekeepingLogs.push(newLog);

  // Update room status
  db.rooms[roomIndex].status = newStatus;
  
  await writeDB(db);
  
  res.json({
    success: true,
    log: newLog,
    room: db.rooms[roomIndex],
    message: `Room status updated to ${newStatus}`
  });
});

module.exports = router;
