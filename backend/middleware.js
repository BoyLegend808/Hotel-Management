/**
 * Performance Optimization: Middleware Stack
 * Provides compression, rate limiting, error handling, and logging
 * Note: Some features are implemented without external dependencies for compatibility
 */

const { logger, performanceMonitor } = require('./logger');

// Simple in-memory rate limiter (replaces express-rate-limit)
class SimpleRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.max = options.max || 100;
    this.message = options.message || 'Too many requests from this IP, please try again later.';
    this.requests = new Map();
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now - data.resetTime > this.windowMs) {
        this.requests.delete(key);
      }
    }
  }
  
  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      const key = ip;
      
      if (!this.requests.has(key)) {
        this.requests.set(key, {
          count: 0,
          resetTime: now + this.windowMs
        });
      }
      
      const data = this.requests.get(key);
      
      // Reset if window has expired
      if (now > data.resetTime) {
        data.count = 0;
        data.resetTime = now + this.windowMs;
      }
      
      data.count++;
      
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.max - data.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(data.resetTime / 1000));
      
      if (data.count > this.max) {
        return res.status(429).json({
          success: false,
          message: this.message
        });
      }
      
      next();
    };
  }
}

/**
 * General API Rate Limiter
 */
const apiRateLimiter = new SimpleRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

/**
 * Strict Rate Limiter for Sensitive Operations
 * Used for login, password changes, etc.
 */
const strictRateLimiter = new SimpleRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many attempts, please try again later.',
});

/**
 * Database Write Rate Limiter
 * Prevents rapid successive database writes
 */
const writeRateLimiter = new SimpleRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 writes per minute
});

/**
 * Request Logger Middleware
 * Logs incoming requests with performance metrics
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip } = req;
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Use logger for consistent logging
    logger.logRequest(req, res, duration);
    
    // Record performance metrics
    performanceMonitor.recordResponseTime(duration);
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Error Handling Middleware
 * Centralized error handling with proper error responses
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.name}: ${err.message}`, {
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method
  });
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't leak stack traces in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
};

/**
 * Request Validation Middleware
 * Validates request body against schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    req.body = value;
    next();
  };
};

/**
 * Query Parameter Sanitization
 * Prevents injection attacks and invalid query parameters
 */
const sanitizeQuery = (req, res, next) => {
  const dangerous = new Set(['__proto__', 'constructor', 'prototype']);
  const cleaned = Object.create(null);

  for (const key of Object.keys(req.query)) {
    if (dangerous.has(key)) continue;
    const val = req.query[key];
    cleaned[key] = typeof val === 'string' ? val.trim().substring(0, 1000) : val;
  }

  req.query = cleaned;
  next();
};

/**
 * Response Time Header
 * Adds X-Response-Time header to responses
 */
const responseTime = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end method
  const originalEnd = res.end;
  
  // Override end method to set header before sending
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Security Headers
 * Adds security-related headers to responses
 */
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * Request ID Generator
 * Adds unique ID to each request for tracing
 */
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Health Check Endpoint
 * Returns server health status
 */
const healthCheck = (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(health);
};

/**
 * Cache Stats Endpoint
 * Returns cache statistics for monitoring
 */
const cacheStats = (cacheManager) => (req, res) => {
  res.json(cacheManager.getStats());
};

module.exports = {
  apiRateLimiter,
  strictRateLimiter,
  writeRateLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  validateRequest,
  sanitizeQuery,
  responseTime,
  securityHeaders,
  requestId,
  healthCheck,
  cacheStats
};
