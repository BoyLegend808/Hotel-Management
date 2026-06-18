const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db.json");

const DEFAULT_DB = {
  guests: [],
  employees: [],
  rooms: [],
  bookings: [],
  payments: [],
  reviews: [],
  coupons: [],
  settings: {}
};

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DB, ...parsed };
  } catch (err) {
    console.error("Error reading database:", err.message);
    return { ...DEFAULT_DB };
  }
}

function writeDB(data) {
  const payload = JSON.stringify({ ...DEFAULT_DB, ...data }, null, 2);
  const tempPath = `${DB_PATH}.tmp`;

  try {
    fs.writeFileSync(tempPath, payload, "utf8");
    fs.renameSync(tempPath, DB_PATH);
    return true;
  } catch (err) {
    console.error("Error writing database:", err.message);
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (_) {}
    return false;
  }
}

function saveOrFail(res, db, successPayload) {
  if (!writeDB(db)) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to save changes." });
  }

  return res.json(successPayload);
}

module.exports = {
  readDB,
  writeDB,
  saveOrFail,
};
