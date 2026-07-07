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

// Create new room (manager only)
router.post("/", requireAuth, requireRole("manager"), async (req, res) => {
  const db = await readDB();
  const { name, type, price, bookingPrice, capacity, description, amenities, images, roomNumber } = req.body;

  if (!name || !price || isNaN(price) || price <= 0) {
    return res.status(400).json({ success: false, message: "Room name and a valid price are required" });
  }
  if (!capacity || isNaN(capacity) || capacity < 1) {
    return res.status(400).json({ success: false, message: "Valid capacity is required" });
  }

  const validTypes = ["Standard", "Deluxe", "Family Suite", "Business Suite"];
  
  const newRoom = {
    id: Date.now(),
    roomNumber: String(roomNumber || "").trim(),
    name: String(name).trim().slice(0, 100),
    type: validTypes.includes(type) ? type : "Standard",
    price: Number(price),
    bookingPrice: Number(bookingPrice || price),
    capacity: parseInt(capacity, 10),
    description: description ? String(description).trim().slice(0, 500) : "",
    amenities: Array.isArray(amenities) ? amenities.map(a => String(a).trim().slice(0, 50)) : [],
    images: Array.isArray(images) ? images.slice(0, 10).map(i => String(i).trim()) : [],
    status: "Available",
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

// Update room (manager only)
router.put("/:id", requireAuth, requireRole("manager"), async (req, res) => {
  const db = await readDB();
  const roomIndex = (db.rooms || []).findIndex(r => r.id === parseInt(req.params.id));

  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  const { name, type, price, bookingPrice, capacity, description, amenities, images, status, roomNumber } = req.body;
  const allowedStatuses = ["Available", "Occupied", "Cleaning", "Maintenance"];
  const validTypes = ["Standard", "Deluxe", "Family Suite", "Business Suite"];

  const updates = {};
  if (roomNumber !== undefined) updates.roomNumber = String(roomNumber).trim();
  if (name !== undefined) updates.name = String(name).trim().slice(0, 100);
  if (type !== undefined && validTypes.includes(type)) updates.type = type;
  if (price !== undefined && !isNaN(price) && price > 0) updates.price = Number(price);
  if (bookingPrice !== undefined && !isNaN(bookingPrice) && bookingPrice > 0) updates.bookingPrice = Number(bookingPrice);
  if (capacity !== undefined && !isNaN(capacity) && capacity >= 1) updates.capacity = parseInt(capacity, 10);
  if (description !== undefined) updates.description = String(description).trim().slice(0, 500);
  if (Array.isArray(amenities)) updates.amenities = amenities.map(a => String(a).trim().slice(0, 50));
  if (Array.isArray(images)) updates.images = images.slice(0, 10).map(i => String(i).trim());
  if (status !== undefined && allowedStatuses.includes(status)) updates.status = status;

  db.rooms[roomIndex] = { ...db.rooms[roomIndex], ...updates, updatedAt: new Date().toISOString() };
  await writeDB(db);

  res.json({
    success: true,
    room: db.rooms[roomIndex],
    message: "Room updated successfully"
  });
});

// Delete room (manager only)
router.delete("/:id", requireAuth, requireRole("manager"), async (req, res) => {
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
