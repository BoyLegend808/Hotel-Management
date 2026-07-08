/**
 * Performance Optimization: Async Database Layer
 * Provides asynchronous file I/O operations with connection pooling simulation
 * and in-memory caching for improved performance
 */

const fs = require("fs").promises;
const path = require("path");
const { promisify } = require("util");

const DB_PATH = path.join(__dirname, "..", "db.json");

const DEFAULT_DB = {
  guests: [],
  employees: [],
  rooms: [],
  bookings: [],
  payments: [],
  reviews: [],
  coupons: [],
  settings: {}
};

// In-memory cache for database reads
let dbCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 1000; // 5 seconds cache TTL

/**
 * Read database asynchronously with caching
 */
async function readDB() {
  const now = Date.now();

  // Return a deep copy of the cached version if fresh
  if (dbCache && (now - cacheTimestamp) < CACHE_TTL) {
    return JSON.parse(JSON.stringify(dbCache));
  }

  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    dbCache = { ...DEFAULT_DB, ...parsed };
    cacheTimestamp = now;
    return JSON.parse(JSON.stringify(dbCache));
  } catch (err) {
    console.error("Error reading database:", err.message);
    return { ...DEFAULT_DB };
  }
}

/**
 * Write database asynchronously with atomic file operations
 * Falls back to in-memory only mode on read-only filesystems (e.g. Vercel)
 */
async function writeDB(data) {
  const mergedData = { ...DEFAULT_DB, ...data };

  // Always update the in-memory cache regardless of filesystem access
  dbCache = mergedData;
  cacheTimestamp = Date.now();

  // On Vercel (read-only fs), skip the file write entirely
  if (process.env.VERCEL) {
    return true;
  }

  const payload = JSON.stringify(mergedData, null, 2);
  const tempPath = `${DB_PATH}.tmp`;

  try {
    // Write to temporary file first
    await fs.writeFile(tempPath, payload, "utf8");
    
    // Atomic rename operation
    await fs.rename(tempPath, DB_PATH);
    
    return true;
  } catch (err) {
    console.error("Error writing database:", err.message);
    try {
      // Clean up temporary file if it exists
      await fs.unlink(tempPath);
    } catch (_) {}
    return false;
  }
}

/**
 * Save or fail with proper error handling
 */
async function saveOrFail(res, db, successPayload) {
  const success = await writeDB(db);
  if (!success) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to save changes." });
  }

  return res.json(successPayload);
}

/**
 * Batch read operation for multiple collections
 */
async function readCollections(...collections) {
  const db = await readDB();
  const result = {};
  
  for (const collection of collections) {
    if (db[collection]) {
      result[collection] = db[collection];
    }
  }
  
  return result;
}

/**
 * Query builder for database operations
 */
class QueryBuilder {
  constructor(collection) {
    this.collection = collection;
    this.filters = [];
    this.sortField = null;
    this.sortOrder = 'asc';
    this.limit = null;
    this.offset = 0;
  }

  /**
   * Add filter condition
   */
  where(field, operator, value) {
    this.filters.push({ field, operator, value });
    return this;
  }

  /**
   * Add sorting
   */
  orderBy(field, order = 'asc') {
    this.sortField = field;
    this.sortOrder = order;
    return this;
  }

  /**
   * Set limit
   */
  limitTo(count) {
    this.limit = count;
    return this;
  }

  /**
   * Set offset
   */
  skip(count) {
    this.offset = count;
    return this;
  }

  /**
   * Execute the query
   */
  async execute() {
    const db = await readDB();
    let results = db[this.collection] || [];

    // Apply filters
    for (const filter of this.filters) {
      results = results.filter(item => {
        const itemValue = item[filter.field];
        
        switch (filter.operator) {
          case '==':
            return itemValue === filter.value;
          case '!=':
            return itemValue !== filter.value;
          case 'contains':
            return String(itemValue || '').toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(itemValue || '').toLowerCase().startsWith(String(filter.value).toLowerCase());
          case '>':
            return itemValue > filter.value;
          case '<':
            return itemValue < filter.value;
          case '>=':
            return itemValue >= filter.value;
          case '<=':
            return itemValue <= filter.value;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (this.sortField) {
      results.sort((a, b) => {
        const aVal = a[this.sortField];
        const bVal = b[this.sortField];
        
        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    // Apply offset
    if (this.offset > 0) {
      results = results.slice(this.offset);
    }

    // Apply limit
    if (this.limit !== null) {
      results = results.slice(0, this.limit);
    }

    return results;
  }

  /**
   * Get count of matching records
   */
  async count() {
    const results = await this.execute();
    return results.length;
  }
}

/**
 * Create query builder for a collection
 */
function query(collection) {
  return new QueryBuilder(collection);
}

/**
 * Clear database cache manually
 */
function clearCache() {
  dbCache = null;
  cacheTimestamp = 0;
}

module.exports = {
  readDB,
  writeDB,
  saveOrFail,
  readCollections,
  query,
  clearCache,
  QueryBuilder
};
