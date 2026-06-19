const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get all reviews (public — optionally filter by roomId)
router.get("/", async (req, res) => {
  const db = await readDB();
  const { roomId } = req.query;

  let reviews = db.reviews || [];
  if (roomId) {
    reviews = reviews.filter(r => r.roomId === parseInt(roomId));
  }

  res.json({ success: true, reviews });
});

// Get review by ID
router.get("/:id", async (req, res) => {
  const db = await readDB();
  const review = (db.reviews || []).find(r => r.id === parseInt(req.params.id));

  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  res.json({ success: true, review });
});

// Create a review (any authenticated user)
router.post("/", requireAuth, async (req, res) => {
  const db = await readDB();
  const { roomId, rating, comment } = req.body;

  const room = (db.rooms || []).find(r => r.id === parseInt(roomId));
  if (!room) {
    return res.status(404).json({ success: false, message: "Room not found" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  const existing = (db.reviews || []).find(r =>
    r.roomId === parseInt(roomId) && r.guestId === req.session.id
  );
  if (existing) {
    return res.status(400).json({ success: false, message: "You have already reviewed this room" });
  }

  const newReview = {
    id: Date.now(),
    roomId: parseInt(roomId),
    guestId: req.session.id,
    guestName: req.session.name,
    rating: parseInt(rating),
    comment: comment || "",
    status: "approved",
    createdAt: new Date().toISOString()
  };

  if (!db.reviews) db.reviews = [];
  db.reviews.push(newReview);
  await writeDB(db);

  res.json({ success: true, review: newReview, message: "Review submitted successfully" });
});

// Update own review
router.put("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));

  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const review = db.reviews[reviewIndex];

  if (req.session.role !== "admin" && review.guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  const { rating, comment } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  db.reviews[reviewIndex] = {
    ...review,
    rating: rating ? parseInt(rating) : review.rating,
    comment: comment !== undefined ? comment : review.comment,
    updatedAt: new Date().toISOString()
  };

  await writeDB(db);

  res.json({ success: true, review: db.reviews[reviewIndex], message: "Review updated successfully" });
});

// Delete review (own or admin)
router.delete("/:id", requireAuth, async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));

  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  if (req.session.role !== "admin" && db.reviews[reviewIndex].guestId !== req.session.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  db.reviews.splice(reviewIndex, 1);
  await writeDB(db);

  res.json({ success: true, message: "Review deleted successfully" });
});

// Approve/reject review (admin only)
router.put("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const db = await readDB();
  const reviewIndex = (db.reviews || []).findIndex(r => r.id === parseInt(req.params.id));

  if (reviewIndex === -1) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  db.reviews[reviewIndex].status = status;
  db.reviews[reviewIndex].updatedAt = new Date().toISOString();
  await writeDB(db);

  res.json({ success: true, review: db.reviews[reviewIndex], message: `Review ${status} successfully` });
});

module.exports = router;
