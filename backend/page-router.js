const fs = require("fs");
const path = require("path");
const { getSession } = require("./auth");

// ─── Domain-specific page allowlists ─────────────────────────────────
// These define which page directories are accessible on each domain.
// Any page NOT in the list for the current domain returns a 404.

const ADMIN_PAGES = new Set([
  "admin-dashboard-lumina",
  "receptionist-dashboard",
  "reception",
  "housekeeping",
  "housekeeping-dashboard",
  "manage-bookings-lumina",
  "manager-dashboard",
  "resource-management-lumina",
  "staff-directory-lumina",
]);

const GUEST_PAGES = new Set([
  "home-lumina",
  "about-lumina",
  "amenities-lumina",
  "booking-your-stay",
  "contact-lumina",
  "dining-lumina",
  "faq-lumina",
  "gallery-lumina",
  "guest-dashboard-lumina",
  "local-area",
  "meetings-events",
  "policies",
  "privacy",
  "reviews-lumina",
  "room-detail-lumina",
  "rooms-lumina",
  "spa-wellness",
  "special-offers",
  "accessibility",
]);

// Pages accessible on BOTH domains
const SHARED_PAGES = new Set([
  "login-lumina",
]);

// ─── Aliases ──────────────────────────────────────────────────────────
const GUEST_ALIASES = {
  "/": "/home-lumina",
  "/home": "/home-lumina",
  "/about": "/about-lumina",
  "/about-us": "/about-lumina",
  "/services": "/amenities-lumina",
  "/contact": "/contact-lumina",
  "/rooms": "/rooms-lumina",
  "/booking": "/booking-your-stay",
  "/bookings": "/booking-your-stay",
  "/login": "/login-lumina",
  "/guest-dashboard": "/guest-dashboard-lumina",
  "/room-detail": "/room-detail-lumina",
};

const ADMIN_ALIASES = {
  "/": "/admin-dashboard-lumina",
  "/login": "/login-lumina",
  "/admin": "/admin-dashboard-lumina",
  "/admin/login": "/login-lumina",
  "/admin/dashboard": "/admin-dashboard-lumina",
  "/dashboard": "/admin-dashboard-lumina",
  "/reception": "/receptionist-dashboard",
  "/housekeeping": "/housekeeping-dashboard",
  "/staff-portal": "/admin-dashboard-lumina",
  "/staff": "/staff-directory-lumina",
  "/resources": "/resource-management-lumina",
  "/bookings": "/manage-bookings-lumina",
  "/manager": "/manager-dashboard",
};

// ─── Helpers ──────────────────────────────────────────────────────────

function isInside(baseDir, candidate) {
  const relative = path.relative(baseDir, candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function normalizeRequestPath(requestPath) {
  const decoded = decodeURIComponent(String(requestPath).split("?")[0]);
  let normalized = path.posix.normalize(decoded);

  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  if (normalized.endsWith(".html")) {
    normalized = normalized.slice(0, -5);
  }
  return normalized;
}

/**
 * Extracts the page directory name from a resolved path.
 * e.g. "/admin-dashboard-lumina" → "admin-dashboard-lumina"
 *      "/pages/hotel/rooms-lumina" → "rooms-lumina"
 */
function getPageDirName(mappedPath) {
  // Strip /pages/hotel/ prefix if present
  let clean = mappedPath;
  if (clean.startsWith("/pages/")) {
    const parts = clean.split("/");
    clean = "/" + parts.slice(3).join("/");
  }
  // Remove leading slash and get first path segment
  const segments = clean.replace(/^\//, "").split("/");
  return segments[0] || "";
}

function isPageAllowed(pageDirName, isAdminDomain) {
  if (SHARED_PAGES.has(pageDirName)) return true;
  if (isAdminDomain) return ADMIN_PAGES.has(pageDirName);
  return GUEST_PAGES.has(pageDirName);
}

function toPageRequestPath(requestPath, isAdminDomain) {
  const normalized = normalizeRequestPath(requestPath);
  if (!normalized || normalized.includes("..")) return null;

  let mappedPath = normalized;

  // Apply domain-specific aliases
  const aliases = isAdminDomain ? ADMIN_ALIASES : GUEST_ALIASES;
  if (aliases[normalized]) {
    mappedPath = aliases[normalized];
  }

  // If the path already has /pages/, strip it to re-apply the correct prefix
  if (mappedPath.startsWith("/pages/")) {
    const parts = mappedPath.split("/");
    mappedPath = "/" + parts.slice(3).join("/");
  }

  // Ensure the path has a leading slash
  if (!mappedPath.startsWith("/")) mappedPath = "/" + mappedPath;

  // All pages live under /pages/hotel/ (single source of truth)
  return "/pages/hotel" + mappedPath;
}

function tryPickHtmlInDir(dirPath) {
  const basename = path.basename(dirPath);

  const preferred = [
    path.join(dirPath, "index.html"),
    path.join(dirPath, `${basename}.html`),
    path.join(dirPath, `${basename}-list.html`),
  ];

  const direct = preferred.find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  if (direct) return direct;

  const entries = fs.readdirSync(dirPath);
  const htmlFiles = entries
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .sort((a, b) => a.localeCompare(b));

  if (htmlFiles.length === 0) return null;
  return path.join(dirPath, htmlFiles[0]);
}

function resolvePage(rootDir, requestPath, isAdminDomain) {
  const safeRequest = toPageRequestPath(requestPath, isAdminDomain);
  if (!safeRequest) return null;

  // ── Domain boundary enforcement ──
  const pageDirName = getPageDirName(safeRequest);
  if (pageDirName && !isPageAllowed(pageDirName, isAdminDomain)) {
    return null; // Block — returns 404 in the route handler
  }

  const absolutePath = path.join(rootDir, safeRequest);

  if (!isInside(rootDir, absolutePath)) return null;

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    if (absolutePath.toLowerCase().endsWith(".html")) return absolutePath;
    return null;
  }

  if (fs.existsSync(`${absolutePath}.html`) && fs.statSync(`${absolutePath}.html`).isFile()) {
    return `${absolutePath}.html`;
  }

  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    return tryPickHtmlInDir(absolutePath);
  }

  return null;
}

// ─── Route registration ───────────────────────────────────────────────

function registerPageRoutes(app, rootDir) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();

    if (path.extname(req.path) && !req.path.endsWith(".html")) return next();

    // Determine if we are on the admin domain
    const host = (req.hostname || req.headers.host || "").split(":")[0];
    const isAdminDomain = host.startsWith("admin.");

    // Auth check for protected routes
    const isProtectedRoute =
      req.path.includes("admin-dashboard") ||
      req.path.includes("guest-dashboard") ||
      req.path.includes("housekeeping") ||
      req.path.includes("reception") ||
      req.path.includes("manage-bookings") ||
      req.path.includes("manager-dashboard") ||
      req.path.includes("resource-management") ||
      req.path.includes("staff-directory");

    if (isProtectedRoute) {
      const session = getSession(req);
      if (!session) {
        return res.redirect("/login");
      }
    }

    const page = resolvePage(rootDir, req.path, isAdminDomain);
    if (page) return res.sendFile(page);

    return res.status(404).sendFile(path.join(rootDir, "404.html"));
  });
}

module.exports = {
  registerPageRoutes,
  resolvePage,
};
