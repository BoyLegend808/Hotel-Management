const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get all rooms
router.get("/", async (req, res) => {
  const db = await readDB();
  res.json({
    success: true,
    rooms: db.rooms || []
  });
});

// Get room by ID
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const room = (db.rooms || []).find(r => r.id === parseInt(req.params.id));
  
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  res.json({
    success: true,
    room
  });
});

// Create new room (admin only)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const newRoom = {
    id: Date.now(),
    ...req.body,
    status: "available",
    createdAt: new Date().toISOString()
  };
  
  if (!db.rooms) db.rooms = [];
  db.rooms.push(newRoom);
  await writeDB(db);
  
  res.json({
    success: true,
    room: newRoom,
    message: "Room created successfully"
  });
});

// Update room (admin only)
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const roomIndex = (db.rooms || []).findIndex(r => r.id === parseInt(req.params.id));
  
  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  db.rooms[roomIndex] = { ...db.rooms[roomIndex], ...req.body };
  await writeDB(db);
  
  res.json({
    success: true,
    room: db.rooms[roomIndex],
    message: "Room updated successfully"
  });
});

// Delete room (admin only)
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const roomIndex = (db.rooms || []).findIndex(r => r.id === parseInt(req.params.id));
  
  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  db.rooms.splice(roomIndex, 1);
  await writeDB(db);
  
  res.json({
    success: true,
    message: "Room deleted successfully"
  });
});

module.exports = router;
