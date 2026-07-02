/**
 * CSRF Protection
 * Double-submit cookie pattern using a signed random token.
 * The server issues a token via /api/csrf-token, the client
 * must echo it back in the X-CSRF-Token request header on every
 * state-changing request (POST / PUT / PATCH / DELETE).
 */

const crypto = require('crypto');

// In-memory token store: token -> { createdAt }
// Tokens expire after 2 hours.
const tokenStore = new Map();
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

// Clean up expired tokens every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_TTL_MS) {
      tokenStore.delete(token);
    }
  }
}, 30 * 60 * 1000);

/**
 * Generate a new CSRF token and store it server-side.
 */
function generateToken() {
  const token = crypto.randomBytes(32).toString('hex');
  tokenStore.set(token, { createdAt: Date.now() });
  return token;
}

/**
 * Validate a token supplied by the client.
 */
function validateToken(token) {
  if (!token || typeof token !== 'string') return false;
  const data = tokenStore.get(token);
  if (!data) return false;
  if (Date.now() - data.createdAt > TOKEN_TTL_MS) {
    tokenStore.delete(token);
    return false;
  }
  return true;
}

/**
 * Express middleware — rejects state-changing requests that are
 * missing a valid X-CSRF-Token header.
 * Safe methods (GET, HEAD, OPTIONS) are skipped.
 * Login is exempt because the token hasn't been issued yet.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set(['/api/login', '/api/csrf-token']);

function csrfMiddleware(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (EXEMPT_PATHS.has(req.path)) return next();

  const token = req.headers['x-csrf-token'] || '';
  if (!validateToken(token)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token.'
    });
  }
  next();
}

module.exports = { generateToken, validateToken, csrfMiddleware };
