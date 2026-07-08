const express = require("express");
const fs = require("fs");
const path = require("path");
const apiRoutes = require("./backend/routes");
const { registerPageRoutes } = require("./backend/page-router");
const {
  apiRateLimiter,
  strictRateLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  sanitizeQuery,
  responseTime,
  securityHeaders,
  requestId,
  healthCheck
} = require("./backend/middleware");
const { requireAuth, requireRole } = require("./backend/auth");
const { csrfMiddleware, generateToken } = require("./backend/csrf");
const { logger, performanceMonitor } = require("./backend/logger");
const { memoryLeakPrevention } = require("./backend/memory-prevention");
const cacheManager = require("./backend/cache");

// Load environment configuration
const { SESSION_TTL_MS, DEMO_USERS } = require("./.env.config");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const CDN_URL = process.env.CDN_URL || '';

// Log application startup
logger.info('Starting Lumina Hospitality server', {
  port: PORT,
  nodeEnv: process.env.NODE_ENV || 'development',
  cdnEnabled: !!CDN_URL
});

// Apply middleware in optimal order
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security and performance middleware
app.use(requestId);
app.use(securityHeaders);
app.use(sanitizeQuery);
app.use(responseTime);

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// CDN-aware static file serving
const staticOptions = {
  index: false,
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    
    // CDN cache headers
    if (CDN_URL) {
      res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Local cache headers based on file type
    if (ext.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      res.setHeader('Vary', 'Accept-Encoding');
    } else if (ext.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Vary', 'Accept');
    } else if (ext.match(/\.(woff|woff2|ttf|eot)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    
    // Add CORS headers for CDN
    if (CDN_URL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    }
  }
};

app.use("/css", express.static(path.join(ROOT_DIR, "css"), staticOptions));
app.use("/js", express.static(path.join(ROOT_DIR, "js"), staticOptions));
app.use("/pages", express.static(path.join(ROOT_DIR, "pages"), staticOptions));
app.use("/hero%20imgs", express.static(path.join(ROOT_DIR, "hero imgs"), staticOptions));
app.use("/hero imgs", express.static(path.join(ROOT_DIR, "hero imgs"), staticOptions));

// Staff Portal easy link
app.get("/staff-portal", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "pages/hotel/login-lumina/login-lumina.html"));
});

// CDN URL injection middleware
if (CDN_URL) {
  app.use((req, res, next) => {
    // Inject CDN URL into response locals for use in templates
    res.locals.cdnUrl = CDN_URL;
    next();
  });
  
  console.log(`✓ CDN enabled: ${CDN_URL}`);
}

const topLevelAssets = new Set([
  "favicon.svg",
  "favicon.ico",
  "logo.png",
  "The Canopy Lodge_.jpg"
]);

app.get("/:asset", (req, res, next) => {
  const asset = decodeURIComponent(req.params.asset);
  if (!topLevelAssets.has(asset)) return next();

  const filePath = path.join(ROOT_DIR, asset === "favicon.ico" ? "favicon.svg" : asset);
  if (!fs.existsSync(filePath)) return next();

  if (asset.startsWith("favicon")) res.setHeader("Content-Type", "image/svg+xml");
  
  // Add cache headers for images - 1 year for static assets
  if (asset.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  
  return res.sendFile(filePath);
});

// Health check endpoint
app.get("/health", healthCheck);

// Cache stats endpoint (protected — admin only)
app.get("/api/cache-stats", requireAuth, requireRole("admin"), (req, res) => {
  res.json(cacheManager.getStats());
});

// Performance monitoring endpoint (protected — admin only)
app.get("/api/performance-stats", requireAuth, requireRole("admin"), (req, res) => {
  res.json({
    logger: logger.getStats(),
    performance: performanceMonitor.getReport(),
    memory: memoryLeakPrevention.getStatus()
  });
});

// CSRF token endpoint — must be before csrfMiddleware
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken() });
});

// Apply rate limiting to API routes
app.use("/api/login", strictRateLimiter.middleware());
app.use("/api", apiRateLimiter.middleware());

// CSRF protection for all state-changing API routes
app.use("/api", csrfMiddleware);

app.use("/api", apiRoutes);

// Register page routes (no rate limiting for public pages)
registerPageRoutes(app, ROOT_DIR);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  // Take final memory snapshot
  memoryLeakPrevention.takeSnapshot('shutdown');
  
  // Log final statistics
  logger.info('Final statistics', {
    logger: logger.getStats(),
    performance: performanceMonitor.getReport(),
    memory: memoryLeakPrevention.getStatus()
  });
  
  // Cleanup resources
  memoryLeakPrevention.cleanup();
  
  // Close server
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    message: err.message,
    stack: err.stack
  });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason,
    promise
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Lumina Hospitality running at: http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
  logger.info('Performance monitoring enabled');
  
  // Initial memory snapshot
  memoryLeakPrevention.takeSnapshot('startup');
});
