const express = require("express");
const { requireAuth, requireRole } = require("../auth");
const { readDB, writeDB } = require("../db-optimized");

const router = express.Router();

// Get settings
router.get("/", async (req, res) => {
  const db = await readDB();
  const settings = db.settings || {
    bankDetails: {
      accountName: "Lumina Virtual Bank",
      accountNumber: "1234567890"
    }
  };
  res.json({ success: true, settings });
});

// Update settings (Admin/Manager only)
router.put("/", requireAuth, requireRole("manager"), async (req, res) => {
  const db = await readDB();
  
  if (!db.settings) {
    db.settings = {};
  }
  
  if (req.body.bankDetails) {
    db.settings.bankDetails = req.body.bankDetails;
  }
  
  await writeDB(db);
  
  res.json({ success: true, settings: db.settings });
});

module.exports = router;
