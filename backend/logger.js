/**
 * Performance Optimization: Logging and Monitoring System
 * Provides structured logging, performance monitoring, and alerting
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.logToFile = options.logToFile || false;
    this.logDirectory = options.logDirectory || path.join(__dirname, '../logs');
    this.logFile = options.logFile || 'app.log';
    this.enableConsole = options.enableConsole !== false;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    // Ensure log directory exists
    if (this.logToFile && !fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
    
    this.stats = {
      requests: 0,
      errors: 0,
      warnings: 0,
      slowRequests: 0,
      lastReset: Date.now()
    };
  }
  
  /**
   * Format log entry
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }
  
  /**
   * Write log to file
   */
  writeToFile(message) {
    if (!this.logToFile) return;
    
    const logPath = path.join(this.logDirectory, this.logFile);
    fs.appendFile(logPath, message + '\n', (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }
  
  /**
   * Log at specified level
   */
  log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.level]) return;
    
    const formattedMessage = this.formatMessage(level, message, meta);
    
    if (this.enableConsole) {
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
    
    this.writeToFile(formattedMessage);
    
    // Update stats
    this.stats.requests++;
    if (level === 'error') this.stats.errors++;
    if (level === 'warn') this.stats.warnings++;
  }
  
  error(message, meta = {}) {
    this.log('error', message, meta);
  }
  
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
  
  info(message, meta = {}) {
    this.log('info', message, meta);
  }
  
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
  
  /**
   * Log performance metrics
   */
  logPerformance(operation, duration, meta = {}) {
    const message = `${operation} completed in ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(`[SLOW] ${message}`, { ...meta, duration });
      this.stats.slowRequests++;
    } else {
      this.debug(message, { ...meta, duration });
    }
  }
  
  /**
   * Log API request
   */
  logRequest(req, res, duration) {
    const message = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
    const meta = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 500) {
      this.error(message, meta);
    } else if (res.statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.lastReset;
    return {
      ...this.stats,
      uptime,
      requestsPerSecond: this.stats.requests / (uptime / 1000)
    };
  }
  
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      requests: 0,
      errors: 0,
      warnings: 0,
      slowRequests: 0,
      lastReset: Date.now()
    };
  }
}

/**
 * Performance Monitor
 * Tracks and reports performance metrics
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      responseTimes: [],
      cache: []
    };
    this.maxSamples = 100;
  }
  
  /**
   * Record memory usage
   */
  recordMemory() {
    const usage = process.memoryUsage();
    this.metrics.memory.push({
      timestamp: Date.now(),
      rss: usage.rss,
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      external: usage.external
    });
    
    // Keep only last N samples
    if (this.metrics.memory.length > this.maxSamples) {
      this.metrics.memory.shift();
    }
  }
  
  /**
   * Record response time
   */
  recordResponseTime(duration) {
    this.metrics.responseTimes.push({
      timestamp: Date.now(),
      duration
    });
    
    if (this.metrics.responseTimes.length > this.maxSamples) {
      this.metrics.responseTimes.shift();
    }
  }
  
  /**
   * Get average response time
   */
  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sum = this.metrics.responseTimes.reduce((acc, curr) => acc + curr.duration, 0);
    return sum / this.metrics.responseTimes.length;
  }
  
  /**
   * Get percentile response time
   */
  getPercentileResponseTime(percentile = 95) {
    if (this.metrics.responseTimes.length === 0) return 0;
    const sorted = [...this.metrics.responseTimes].sort((a, b) => a.duration - b.duration);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index].duration;
  }
  
  /**
   * Record cache metrics
   */
  recordCacheMetrics(cacheStats) {
    this.metrics.cache.push({
      timestamp: Date.now(),
      ...cacheStats
    });
    
    if (this.metrics.cache.length > this.maxSamples) {
      this.metrics.cache.shift();
    }
  }
  
  /**
   * Get performance report
   */
  getReport() {
    return {
      memory: {
        current: this.metrics.memory[this.metrics.memory.length - 1],
        average: this.calculateAverageMemory()
      },
      responseTimes: {
        average: this.getAverageResponseTime(),
        p95: this.getPercentileResponseTime(95),
        p99: this.getPercentileResponseTime(99),
        samples: this.metrics.responseTimes.length
      },
      cache: this.metrics.cache[this.metrics.cache.length - 1]
    };
  }
  
  /**
   * Calculate average memory usage
   */
  calculateAverageMemory() {
    if (this.metrics.memory.length === 0) return null;
    
    const sum = this.metrics.memory.reduce((acc, curr) => acc + curr.heapUsed, 0);
    return {
      heapUsed: sum / this.metrics.memory.length
    };
  }
  
  /**
   * Check for memory leaks
   */
  checkMemoryLeak() {
    if (this.metrics.memory.length < 10) return false;
    
    const recent = this.metrics.memory.slice(-10);
    const older = this.metrics.memory.slice(-20, -10);
    
    const recentAvg = recent.reduce((acc, curr) => acc + curr.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((acc, curr) => acc + curr.heapUsed, 0) / older.length;
    
    // If recent memory usage is 50% higher than older, potential leak
    return recentAvg > olderAvg * 1.5;
  }
}

// Create singleton instances
const loggerInstance = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.NODE_ENV === 'production',
  enableConsole: process.env.NODE_ENV !== 'production'
});

const performanceMonitor = new PerformanceMonitor();

// Start periodic monitoring
setInterval(() => {
  performanceMonitor.recordMemory();
}, 60000); // Every minute

// Log warnings if memory leak detected
setInterval(() => {
  if (performanceMonitor.checkMemoryLeak()) {
    loggerInstance.warn('Potential memory leak detected', {
      memory: performanceMonitor.getReport().memory
    });
  }
}, 5 * 60000); // Every 5 minutes

module.exports = {
  logger: loggerInstance,
  performanceMonitor,
  Logger,
  PerformanceMonitor
};
