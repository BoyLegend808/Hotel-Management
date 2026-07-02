/**
 * Performance Optimization: Memory Leak Prevention
 * Provides tools and utilities to prevent memory leaks in the application
 */

const { logger } = require('./logger');

/**
 * Helper function for safe logging
 */
function safeLog(level, message, meta = {}) {
  if (typeof logger[level] === 'function') {
    logger[level](message, meta);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, meta);
  }
}

class MemoryLeakPrevention {
  constructor() {
    this.timers = new Map();
    this.eventListeners = new Map();
    this.intervals = new Map();
    this.requests = new Map();
    this.memorySnapshots = [];
    this.maxSnapshots = 100;
  }
  
  /**
   * Track a timer
   */
  trackTimer(id, timer) {
    this.timers.set(id, {
      timer,
      createdAt: Date.now(),
      type: timer._onTimeout ? 'timeout' : 'interval'
    });
    
    safeLog('debug', `Timer tracked: ${id}`);
  }
  
  /**
   * Clear a tracked timer
   */
  clearTimer(id) {
    const timerData = this.timers.get(id);
    if (timerData) {
      if (timerData.type === 'timeout') {
        clearTimeout(timerData.timer);
      } else {
        clearInterval(timerData.timer);
      }
      this.timers.delete(id);
      safeLog('debug', `Timer cleared: ${id}`);
    }
  }
  
  /**
   * Clear all tracked timers
   */
  clearAllTimers() {
    for (const [id, timerData] of this.timers.entries()) {
      if (timerData.type === 'timeout') {
        clearTimeout(timerData.timer);
      } else {
        clearInterval(timerData.timer);
      }
    }
    const count = this.timers.size;
    this.timers.clear();
    safeLog('info', `Cleared ${count} timers`);
  }
  
  /**
   * Track an event listener
   */
  trackEventListener(target, event, handler, id = null) {
    const listenerId = id || `${event}_${Date.now()}`;
    this.eventListeners.set(listenerId, {
      target,
      event,
      handler,
      createdAt: Date.now()
    });
    
    safeLog('debug', `Event listener tracked: ${listenerId}`);
    return listenerId;
  }
  
  /**
   * Remove a tracked event listener
   */
  removeEventListener(id) {
    const listenerData = this.eventListeners.get(id);
    if (listenerData) {
      listenerData.target.removeEventListener(listenerData.event, listenerData.handler);
      this.eventListeners.delete(id);
      safeLog('debug', `Event listener removed: ${id}`);
    }
  }
  
  /**
   * Remove all tracked event listeners
   */
  removeAllEventListeners() {
    for (const [id, listenerData] of this.eventListeners.entries()) {
      listenerData.target.removeEventListener(listenerData.event, listenerData.handler);
    }
    const count = this.eventListeners.size;
    this.eventListeners.clear();
    safeLog('info', `Removed ${count} event listeners`);
  }
  
  /**
   * Track an interval
   */
  trackInterval(id, interval) {
    this.intervals.set(id, {
      interval,
      createdAt: Date.now()
    });
    
    safeLog('debug', `Interval tracked: ${id}`);
  }
  
  /**
   * Clear a tracked interval
   */
  clearInterval(id) {
    const intervalData = this.intervals.get(id);
    if (intervalData) {
      clearInterval(intervalData.interval);
      this.intervals.delete(id);
      safeLog('debug', `Interval cleared: ${id}`);
    }
  }
  
  /**
   * Clear all tracked intervals
   */
  clearAllIntervals() {
    for (const [id, intervalData] of this.intervals.entries()) {
      clearInterval(intervalData.interval);
    }
    const count = this.intervals.size;
    this.intervals.clear();
    safeLog('info', `Cleared ${count} intervals`);
  }
  
  /**
   * Track a request
   */
  trackRequest(req, res, id = null) {
    const requestId = id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.requests.set(requestId, {
      req,
      res,
      createdAt: Date.now(),
      completed: false
    });
    
    // Mark as completed when response finishes
    res.on('finish', () => {
      const requestData = this.requests.get(requestId);
      if (requestData) {
        requestData.completed = true;
        requestData.completedAt = Date.now();
        requestData.duration = requestData.completedAt - requestData.createdAt;
        safeLog('debug', `Request completed: ${requestId} (${requestData.duration}ms)`);
        
        // Remove old completed requests
        this.cleanupOldRequests();
      }
    });
    
    // Handle case where request is aborted
    res.on('close', () => {
      const requestData = this.requests.get(requestId);
      if (requestData && !requestData.completed) {
        safeLog('warn', `Request aborted: ${requestId}`);
        this.requests.delete(requestId);
      }
    });
    
    return requestId;
  }
  
  /**
   * Clean up old completed requests
   */
  cleanupOldRequests(maxAge = 60000) {
    const now = Date.now();
    for (const [id, requestData] of this.requests.entries()) {
      if (requestData.completed && (now - requestData.completedAt) > maxAge) {
        this.requests.delete(id);
      }
    }
  }
  
  /**
   * Take a memory snapshot
   */
  takeSnapshot(label = '') {
    const snapshot = {
      timestamp: Date.now(),
      label,
      memory: process.memoryUsage(),
      timers: this.timers.size,
      eventListeners: this.eventListeners.size,
      intervals: this.intervals.size,
      activeRequests: this.getActiveRequestCount()
    };
    
    this.memorySnapshots.push(snapshot);
    
    // Keep only last N snapshots
    if (this.memorySnapshots.length > this.maxSnapshots) {
      this.memorySnapshots.shift();
    }
    
    safeLog('debug', `Memory snapshot: ${label}`, snapshot);
    
    return snapshot;
  }
  
  /**
   * Get active request count
   */
  getActiveRequestCount() {
    let count = 0;
    for (const requestData of this.requests.values()) {
      if (!requestData.completed) count++;
    }
    return count;
  }
  
  /**
   * Analyze memory trends
   */
  analyzeMemoryTrends() {
    if (this.memorySnapshots.length < 10) {
      return { trend: 'insufficient_data', message: 'Need more snapshots' };
    }
    
    const recent = this.memorySnapshots.slice(-10);
    const older = this.memorySnapshots.slice(-20, -10);
    
    const recentAvg = recent.reduce((acc, curr) => acc + curr.memory.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((acc, curr) => acc + curr.memory.heapUsed, 0) / older.length;
    
    const growth = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (growth > 50) {
      return { trend: 'growing_fast', message: `Memory growing ${growth.toFixed(1)}%`, growth };
    } else if (growth > 20) {
      return { trend: 'growing', message: `Memory growing ${growth.toFixed(1)}%`, growth };
    } else if (growth < -20) {
      return { trend: 'decreasing', message: `Memory decreasing ${Math.abs(growth).toFixed(1)}%`, growth };
    } else {
      return { trend: 'stable', message: `Memory stable (${growth.toFixed(1)}%)`, growth };
    }
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      timers: this.timers.size,
      eventListeners: this.eventListeners.size,
      intervals: this.intervals.size,
      totalRequests: this.requests.size,
      activeRequests: this.getActiveRequestCount(),
      memoryTrends: this.analyzeMemoryTrends(),
      lastSnapshot: this.memorySnapshots[this.memorySnapshots.length - 1]
    };
  }
  
  /**
   * Force garbage collection (if available)
   */
  forceGC() {
    if (global.gc) {
      safeLog('info', 'Forcing garbage collection');
      global.gc();
      this.takeSnapshot('after_gc');
    } else {
      safeLog('warn', 'Garbage collection not available');
    }
  }
  
  /**
   * Cleanup all resources
   */
  cleanup() {
    this.clearAllTimers();
    this.removeAllEventListeners();
    this.clearAllIntervals();
    this.requests.clear();
    safeLog('info', 'All resources cleaned up');
  }
}

/**
 * Create safe setTimeout with automatic cleanup
 */
function safeTimeout(callback, delay, id = null) {
  const timerId = id || `timeout_${Date.now()}`;
  const timer = setTimeout(() => {
    callback();
    memoryLeakPrevention.clearTimer(timerId);
  }, delay);
  
  memoryLeakPrevention.trackTimer(timerId, timer);
  return timerId;
}

/**
 * Create safe setInterval with automatic cleanup
 */
function safeInterval(callback, delay, id = null) {
  const intervalId = id || `interval_${Date.now()}`;
  const interval = setInterval(callback, delay);
  
  memoryLeakPrevention.trackInterval(intervalId, interval);
  return intervalId;
}

// Create singleton instance
const memoryLeakPrevention = new MemoryLeakPrevention();

// Periodic cleanup
setInterval(() => {
  memoryLeakPrevention.cleanupOldRequests();
}, 5 * 60 * 1000); // Every 5 minutes

// Periodic memory analysis
setInterval(() => {
  memoryLeakPrevention.takeSnapshot('periodic');
  const analysis = memoryLeakPrevention.analyzeMemoryTrends();
  
  if (analysis.trend === 'growing_fast') {
    safeLog('warn', 'Memory trend alert', analysis);
  }
}, 10 * 60 * 1000); // Every 10 minutes

module.exports = {
  memoryLeakPrevention,
  safeTimeout,
  safeInterval,
  MemoryLeakPrevention
};
