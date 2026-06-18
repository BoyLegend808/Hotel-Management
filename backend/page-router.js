const fs = require("fs");
const path = require("path");
const { getSession } = require("./auth");

const PAGE_ALIASES = {
  "/": "/pages/hotel/home",
  "/home": "/pages/hotel/home",
  "/about": "/pages/hotel/home",
  "/about-us": "/pages/hotel/home",
  "/services": "/pages/hotel/home",
  "/contact": "/pages/hotel/home",
  "/resources": "/pages/hotel/home",
  "/rooms": "/pages/hotel/rooms",
  "/booking": "/pages/hotel/booking",
  "/bookings": "/pages/hotel/booking",
  "/login": "/pages/hotel/login",
  "/guest-dashboard": "/pages/hotel/guest-dashboard",
  "/admin-dashboard": "/pages/hotel/admin-dashboard",
  "/room-detail": "/pages/hotel/room-detail",
  // Legacy care management routes (for backward compatibility)
  "/admin": "/pages/hotel/admin-dashboard",
  "/admin/login": "/pages/hotel/login",
  "/admin/dashboard": "/pages/hotel/admin-dashboard",
  "/family-portal": "/pages/hotel/guest-dashboard",
  "/staff-portal": "/pages/hotel/admin-dashboard",
};

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
  if (normalized.startsWith("/admin-dashboard/")) return `/pages${normalized}`;
  if (normalized === "/admin-dashboard") return "/pages/hotel/admin-dashboard";
  if (normalized.startsWith("/guest-dashboard/")) return `/pages${normalized}`;
  if (normalized === "/guest-dashboard") return "/pages/hotel/guest-dashboard";
  // Legacy care management shortcuts (redirect to hotel)
  if (normalized.startsWith("/admin/")) return "/pages/hotel/admin-dashboard";
  if (normalized === "/admin") return "/pages/hotel/admin-dashboard";
  if (normalized.startsWith("/family-portal/")) return "/pages/hotel/guest-dashboard";
  if (normalized === "/family-portal") return "/pages/hotel/guest-dashboard";
  if (normalized.startsWith("/staff-portal/")) return "/pages/hotel/admin-dashboard";
  if (normalized === "/staff-portal") return "/pages/hotel/admin-dashboard";

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

    // Check if this is a protected route (hotel admin-dashboard, guest-dashboard)
    const isProtectedRoute = req.path.startsWith("/admin-dashboard/") || 
                            req.path.startsWith("/guest-dashboard/") ||
                            req.path === "/admin-dashboard" || 
                            req.path === "/guest-dashboard";
    
    // Allow access to login page without authentication
    const isLoginPage = req.path.includes("/login");

    if (isProtectedRoute && !isLoginPage) {
      // Check for session token in cookie or header
      const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
      
      if (!token) {
        // No token found, redirect to hotel login page
        return res.redirect("/pages/hotel/login/");
      }

      // Validate the session
      const session = getSession(token);
      if (!session) {
        // Invalid session, redirect to hotel login page
        return res.redirect("/pages/hotel/login/");
      }
    }

    const page = resolvePage(rootDir, req.path);
    if (page) return res.sendFile(page);

    return res.status(404).sendFile(path.join(rootDir, "404.html"));
  });
}

module.exports = {
  registerPageRoutes,
  resolvePage,
};
