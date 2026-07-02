const crypto = require("crypto");
const { SESSION_TTL_MS, DEMO_USERS } = require("../.env.config");

const sessions = new Map();

function clean(value, max = 100) {
  return String(value || "").trim().slice(0, max);
}

function findDemoUser(username, password) {
  const u = clean(username).toLowerCase();
  const p = clean(password);

  // TODO (production): replace plain-text password comparison with
  // bcrypt.compare(password, user.passwordHash) and store hashed passwords only.
  return DEMO_USERS.find((user) => {
    const names = [user.username, ...(user.aliases || [])];
    return names.includes(u) && user.passwords.includes(p);
  });
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const session = {
    token,
    role: user.role,
    name: user.name,
    id: user.id,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  sessions.set(token, session);
  return session;
}

function getBearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function getSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function requireAuth(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Please sign in to continue.",
    });
  }

  req.session = session;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !roles.includes(req.session.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
}

function destroySession(req) {
  const token = getBearerToken(req);
  if (token) sessions.delete(token);
}

module.exports = {
  clean,
  createSession,
  destroySession,
  findDemoUser,
  getSession,
  requireAuth,
  requireRole,
};
