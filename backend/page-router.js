const fs = require("fs");
const path = require("path");

// Canonical page locations (actual folder paths, with trailing slash so that
// relative asset links inside each page resolve correctly).
const CANONICAL_PAGES = {
  "/": "/pages/hotel/home-lumina/",
  "/home": "/pages/hotel/home-lumina/",
  "/about": "/pages/hotel/home-lumina/",
  "/about-us": "/pages/hotel/home-lumina/",
  "/services": "/pages/hotel/home-lumina/",
  "/contact": "/pages/hotel/home-lumina/",
  "/resources": "/pages/hotel/home-lumina/",
  "/rooms": "/pages/hotel/rooms-lumina/",
  "/booking": "/pages/hotel/booking-your-stay/",
  "/bookings": "/pages/hotel/booking-your-stay/",
  "/login": "/pages/hotel/login-lumina/",
  "/guest-dashboard": "/pages/hotel/guest-dashboard-lumina/",
  "/admin-dashboard": "/pages/hotel/admin-dashboard-lumina/",
  "/room-detail": "/pages/hotel/room-detail-lumina/",
  // Legacy care management routes (kept for backward compatibility)
  "/admin": "/pages/hotel/admin-dashboard-lumina/",
  "/admin/login": "/pages/hotel/login-lumina/",
  "/admin/dashboard": "/pages/hotel/admin-dashboard-lumina/",
  "/family-portal": "/pages/hotel/guest-dashboard-lumina/",
  "/staff-portal": "/pages/hotel/admin-dashboard-lumina/",
};

// Aliases used as a server-side resolution fallback (no trailing slash).
const PAGE_ALIASES = Object.fromEntries(
  Object.entries(CANONICAL_PAGES).map(([key, value]) => [key, value.replace(/\/$/, "")])
);

function isInside(baseDir, candidate) {
  const relative = path.relative(baseDir, candidate);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function normalizeRequestPath(requestPath) {
  // requestPath comes from req.path; no querystring normally, but keep safe.
  const decoded = decodeURIComponent(String(requestPath).split("?")[0]);
  let normalized = path.posix.normalize(decoded);

  // Remove trailing slash for everything except root "/"
  if (normalized !== "/" && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  // Strip .html extension so aliases can match properly
  if (normalized.endsWith(".html")) {
    normalized = normalized.slice(0, -5);
  }

  return normalized;
}

function toPageRequestPath(requestPath) {
  const normalized = normalizeRequestPath(requestPath);

  if (!normalized || normalized.includes("..")) return null;

  // Direct aliases (normalized, without trailing slashes)
  if (PAGE_ALIASES[normalized]) return PAGE_ALIASES[normalized];

  // Already points to /pages/...
  if (normalized.startsWith("/pages/") || normalized === "/pages") return normalized;

  // Domain-level shortcuts
  if (normalized.startsWith("/hotel/")) return `/pages${normalized}`;
  if (normalized === "/hotel") return "/pages/hotel";
  if (normalized === "/admin-dashboard") return "/pages/hotel/admin-dashboard-lumina";
  if (normalized === "/guest-dashboard") return "/pages/hotel/guest-dashboard-lumina";
  // Legacy care management shortcuts (redirect to hotel)
  if (normalized.startsWith("/admin/")) return "/pages/hotel/admin-dashboard-lumina";
  if (normalized === "/admin") return "/pages/hotel/admin-dashboard-lumina";
  if (normalized.startsWith("/family-portal/")) return "/pages/hotel/guest-dashboard-lumina";
  if (normalized === "/family-portal") return "/pages/hotel/guest-dashboard-lumina";
  if (normalized.startsWith("/staff-portal/")) return "/pages/hotel/admin-dashboard-lumina";
  if (normalized === "/staff-portal") return "/pages/hotel/admin-dashboard-lumina";

  return normalized;
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

  // deterministic fallback: pick first alphabetically
  const entries = fs.readdirSync(dirPath);
  const htmlFiles = entries
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .sort((a, b) => a.localeCompare(b));

  if (htmlFiles.length === 0) return null;
  return path.join(dirPath, htmlFiles[0]);
}

function resolvePage(rootDir, requestPath) {
  const safeRequest = toPageRequestPath(requestPath);
  if (!safeRequest) return null;

  // request path should be like "/pages/...." so join will place it under rootDir
  const absolutePath = path.join(rootDir, safeRequest);

  if (!isInside(rootDir, absolutePath)) return null;

  // If it's a file, serve it (only allow html files here)
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    if (absolutePath.toLowerCase().endsWith(".html")) return absolutePath;
    return null;
  }

  // If requestPath pointed to a path without extension, try .html
  if (fs.existsSync(`${absolutePath}.html`) && fs.statSync(`${absolutePath}.html`).isFile()) {
    return `${absolutePath}.html`;
  }

  // If it's a directory, resolve index/basename/*.html deterministically
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    return tryPickHtmlInDir(absolutePath);
  }

  return null;
}

function registerPageRoutes(app, rootDir) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();

    // If it's a real file request (like .css/.js/.png), ignore - static middleware should serve it.
    if (path.extname(req.path) && !req.path.endsWith(".html")) return next();

    // Redirect short clean URLs (e.g. "/rooms") to their canonical folder path
    // (e.g. "/pages/hotel/rooms-lumina/"). The trailing slash is required so the
    // page's relative CSS/JS links resolve correctly.
    const normalized = normalizeRequestPath(req.path);
    if (CANONICAL_PAGES[normalized]) {
      const target = CANONICAL_PAGES[normalized];
      if (req.path !== target) {
        const queryIndex = req.url.indexOf("?");
        const query = queryIndex >= 0 ? req.url.slice(queryIndex) : "";
        return res.redirect(302, target + query);
      }
    }

    // NOTE: Authentication is currently handled client-side (sessionStorage) in the
    // demo, so server-side route protection is disabled to keep dashboards reachable.
    // To re-enable it, wire login to /api/login (cookie-based sessions) and guard the
    // canonical dashboard folder paths below.

    const page = resolvePage(rootDir, req.path);
    if (page) return res.sendFile(page);

    return res.status(404).sendFile(path.join(rootDir, "404.html"));
  });
}

module.exports = {
  registerPageRoutes,
  resolvePage,
};
