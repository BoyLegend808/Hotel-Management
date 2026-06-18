/**
 * Performance Optimization: API Response Caching
 * Provides in-memory caching with TTL support for frequently accessed data
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Generate cache key from request parameters
   */
  generateKey(prefix, params = {}) {
    const paramStr = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${prefix}${paramStr ? ':' + paramStr : ''}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return cached.data;
  }

  /**
   * Set data in cache with optional TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now()
    });
    this.stats.sets++;
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
  }

  /**
   * Clear expired cache entries
   */
  clearExpired() {
    const now = Date.now();
    let deleted = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.deletes += deleted;
    return deleted;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Estimate memory usage of cache
   */
  getMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(value).length;
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  /**
   * Wrapper for cached function execution
   */
  async cachedFunction(key, fn, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Auto-clear expired entries every minute
setInterval(() => {
  cacheManager.clearExpired();
}, 60 * 1000);

module.exports = cacheManager;