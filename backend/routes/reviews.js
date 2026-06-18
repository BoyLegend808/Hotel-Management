const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get all reviews
router.get("/", async (req, res) => {
  const db = await readDB();
  const { roomId } = req.query;
  
  let reviews = db.reviews || [];
  
  // Filter by room if specified
  if (roomId) {
    reviews = reviews.filter(r => r.roomId === parseInt(roomId));
  }
  
  res.json({
    success: true,
    reviews
  });
});

// Get review by ID
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const review = (db.reviews || []).find(r => r.id === parseInt(req.params.id));
  
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  
  res.json({
    success: true,
    review
  });
});

// Create new review (guest only)
router.post("/", requireAuth, requireRole("guest"), async (req, res) => {
  const db = await readDB();
  const { roomId, rating, comment } = req.body;
  
  // Validate room exists
  const room = (db.rooms || []).find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }
  
  // Validate rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }
  
  // Check if user has already reviewed this room
  const existingReview = (db.reviews || []).find(r => 
    r.roomId === parseInt(roomId) && r.guestId === req.user.id
  );
  
  if (existingReview) {
    return res.status(400).json({ success: false, message: "You have already reviewed this room" });
  }
  
  const newReview = {
    id: Date.now(),
    roomId: parseInt(roomId),
    guestId: req.user.id,
    guestName: req.user.name,
    rating,
    comment,
    status: "approved",
    createdAt: new Date().toISOString()
  };
  
  if (!db.reviews) db.reviews = [];
  db.reviews.push(newReview);
  await writeDB(db);
  
  res.json({
    success: true,
    review: newReview,
    message: "Review submitted successfully"
  });
});

// Update review (guest can update their own reviews)
router.put("/:id", requireAuth, requireRole("guest"), async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));
  
  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  
  const review = db.reviews[reviewIndex];
  
  // Guests can only update their own reviews
  if (review.guestId !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  const { rating, comment } = req.body;
  
  // Validate rating
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }
  
  db.reviews[reviewIndex] = {
    ...review,
    rating: rating || review.rating,
    comment: comment || review.comment,
    updatedAt: new Date().toISOString()
  };
  
  await writeDB(db);
  
  res.json({
    success: true,
    review: db.reviews[reviewIndex],
    message: "Review updated successfully"
  });
});

// Delete review (guest can delete their own reviews, admin can delete any)
router.delete("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));
  
  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  
  const review = db.reviews[reviewIndex];
  
  // Guests can only delete their own reviews
  if (req.user.role === "guest" && review.guestId !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  
  db.reviews.splice(reviewIndex, 1);
  await writeDB(db);
  
  res.json({
    success: true,
    message: "Review deleted successfully"
  });
});

// Approve/reject review (admin only)
router.put("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));
  
  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  
  const { status } = req.body;
  const validStatuses = ["approved", "rejected"];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }
  
  db.reviews[reviewIndex].status = status;
  db.reviews[reviewIndex].updatedAt = new Date().toISOString();
  await writeDB(db);
  
  res.json({
    success: true,
    review: db.reviews[reviewIndex],
    message: `Review ${status} successfully`
  });
});

module.exports = router;
