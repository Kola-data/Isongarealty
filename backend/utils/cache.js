import { createClient } from 'redis';
import dotenv from 'dotenv';
import { promisify } from 'util';
import { performance } from 'perf_hooks';

dotenv.config();

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'isonga';
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL) || 300; // 5 minutes
const MAX_RETRIES = parseInt(process.env.CACHE_MAX_RETRIES) || 3;
const RETRY_DELAY = parseInt(process.env.CACHE_RETRY_DELAY) || 1000; // 1 second

// Cache statistics
const cacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  operations: 0,
  totalTime: 0,
  lastReset: Date.now()
};

// Cache strategies
const CACHE_STRATEGIES = {
  WRITE_THROUGH: 'write_through',
  WRITE_BEHIND: 'write_behind',
  CACHE_ASIDE: 'cache_aside'
};

let redisClient;
let isRedisConnected = false;
let connectionRetries = 0;
let reconnectTimer = null;

// Enhanced connection with retry logic
const connectRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
    }

    redisClient = createClient({ 
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > MAX_RETRIES) {
            console.error('[redis] Max reconnection attempts reached');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('[redis] client error:', err.message);
      isRedisConnected = false;
      cacheStats.errors++;
    });

    redisClient.on('connect', () => {
      console.log('[redis] client connected');
      isRedisConnected = true;
      connectionRetries = 0;
    });

    redisClient.on('end', () => {
      console.log('[redis] client disconnected');
      isRedisConnected = false;
    });

    redisClient.on('reconnecting', () => {
      console.log('[redis] client reconnecting...');
      connectionRetries++;
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    console.log('[redis] connection established and tested');
    
  } catch (error) {
    console.error('[redis] failed to connect:', error.message);
    isRedisConnected = false;
    cacheStats.errors++;
    
    // Schedule retry
    if (connectionRetries < MAX_RETRIES) {
      reconnectTimer = setTimeout(() => {
        console.log('[redis] attempting reconnection...');
        connectRedis();
      }, RETRY_DELAY * Math.pow(2, connectionRetries));
    }
  }
};

// Initialize connection
connectRedis();

// Utility functions
const getCacheKey = (key) => `${REDIS_PREFIX}:${key}`;
const getStatsKey = (key) => `${REDIS_PREFIX}:stats:${key}`;

// Enhanced serialization with compression support
const serialize = (data) => {
  try {
    const serialized = JSON.stringify(data);
    // Add compression logic here if needed for large objects
    return serialized;
  } catch (error) {
    console.error('[cache] serialization error:', error.message);
    throw new Error('Failed to serialize data');
  }
};

const deserialize = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('[cache] deserialization error:', error.message);
    throw new Error('Failed to deserialize data');
  }
};

// Cache operation wrapper with performance monitoring
const withPerformanceMonitoring = async (operation, operationName) => {
  const startTime = performance.now();
  cacheStats.operations++;
  
  try {
    const result = await operation();
    const endTime = performance.now();
    cacheStats.totalTime += (endTime - startTime);
    return result;
  } catch (error) {
    const endTime = performance.now();
    cacheStats.totalTime += (endTime - startTime);
    cacheStats.errors++;
    console.error(`[cache] ${operationName} failed:`, error.message);
    throw error;
  }
};

// Enhanced cache implementation
export const cache = {
  // Basic operations
  get: async (key, options = {}) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) {
        cacheStats.misses++;
        return null;
      }

      try {
        const cacheKey = getCacheKey(key);
        const data = await redisClient.get(cacheKey);
        
        if (data) {
          cacheStats.hits++;
          return deserialize(data);
        } else {
          cacheStats.misses++;
          return null;
        }
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] get error for key ${key}:`, error.message);
        return null;
      }
    }, 'get');
  },

  set: async (key, value, ttl = DEFAULT_TTL, options = {}) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return false;

      try {
        const cacheKey = getCacheKey(key);
        const serializedValue = serialize(value);
        
        if (ttl > 0) {
          await redisClient.setEx(cacheKey, ttl, serializedValue);
        } else {
          await redisClient.set(cacheKey, serializedValue);
        }
        
        return true;
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] set error for key ${key}:`, error.message);
        return false;
      }
    }, 'set');
  },

  del: async (key) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return false;

      try {
        const cacheKey = getCacheKey(key);
        const result = await redisClient.del(cacheKey);
        return result > 0;
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] del error for key ${key}:`, error.message);
        return false;
      }
    }, 'del');
  },

  // Pattern-based operations
  delByPattern: async (pattern) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return false;

      try {
        const searchPattern = getCacheKey(pattern);
        const keys = await redisClient.keys(searchPattern);
        
        if (keys.length > 0) {
          const result = await redisClient.del(keys);
          return result > 0;
        }
        return false;
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] delByPattern error for pattern ${pattern}:`, error.message);
        return false;
      }
    }, 'delByPattern');
  },

  // Advanced operations
  exists: async (key) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return false;

      try {
        const cacheKey = getCacheKey(key);
        const result = await redisClient.exists(cacheKey);
        return result === 1;
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] exists error for key ${key}:`, error.message);
        return false;
      }
    }, 'exists');
  },

  ttl: async (key) => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return -1;

      try {
        const cacheKey = getCacheKey(key);
        return await redisClient.ttl(cacheKey);
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] ttl error for key ${key}:`, error.message);
        return -1;
      }
    }, 'ttl');
  },

  // Cache strategies implementation
  writeThrough: async (key, value, ttl = DEFAULT_TTL) => {
    // Write to cache and database simultaneously
    const cacheResult = await cache.set(key, value, ttl);
    return cacheResult;
  },

  writeBehind: async (key, value, ttl = DEFAULT_TTL) => {
    // Write to cache immediately, database write can be async
    const cacheResult = await cache.set(key, value, ttl);
    return cacheResult;
  },

  cacheAside: async (key, fetchFunction, ttl = DEFAULT_TTL) => {
    // Try cache first, if miss, fetch from source and cache
    let data = await cache.get(key);
    
    if (data === null) {
      try {
        data = await fetchFunction();
        if (data !== null && data !== undefined) {
          await cache.set(key, data, ttl);
        }
      } catch (error) {
        console.error(`[cache] cacheAside fetch error for key ${key}:`, error.message);
        throw error;
      }
    }
    
    return data;
  },

  // Cache warming
  warm: async (keys, fetchFunction, ttl = DEFAULT_TTL) => {
    const promises = keys.map(async (key) => {
      const exists = await cache.exists(key);
      if (!exists) {
        try {
          const data = await fetchFunction(key);
          if (data !== null && data !== undefined) {
            await cache.set(key, data, ttl);
          }
        } catch (error) {
          console.error(`[cache] warm error for key ${key}:`, error.message);
        }
      }
    });
    
    await Promise.allSettled(promises);
  },

  // Cache invalidation strategies
  invalidatePattern: async (pattern) => {
    return await cache.delByPattern(pattern);
  },

  invalidateRelated: async (baseKey, relatedKeys) => {
    const keysToInvalidate = [baseKey, ...relatedKeys];
    const promises = keysToInvalidate.map(key => cache.del(key));
    const results = await Promise.allSettled(promises);
    return results.every(result => result.status === 'fulfilled');
  },

  // Statistics and monitoring
  getStats: () => {
    const hitRate = cacheStats.operations > 0 ? (cacheStats.hits / cacheStats.operations) * 100 : 0;
    const avgResponseTime = cacheStats.operations > 0 ? cacheStats.totalTime / cacheStats.operations : 0;
    
    return {
      ...cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      isConnected: isRedisConnected,
      uptime: Date.now() - cacheStats.lastReset
    };
  },

  resetStats: () => {
    cacheStats.hits = 0;
    cacheStats.misses = 0;
    cacheStats.errors = 0;
    cacheStats.operations = 0;
    cacheStats.totalTime = 0;
    cacheStats.lastReset = Date.now();
  },

  // Health check
  healthCheck: async () => {
    try {
      if (!isRedisConnected) {
        return { status: 'unhealthy', reason: 'Redis not connected' };
      }
      
      await redisClient.ping();
      return { status: 'healthy', stats: cache.getStats() };
    } catch (error) {
      return { status: 'unhealthy', reason: error.message };
    }
  },

  // Connection management
  reconnect: async () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    await connectRedis();
  },

  disconnect: async () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (redisClient && isRedisConnected) {
      await redisClient.quit();
      isRedisConnected = false;
    }
  },

  // Utility methods
  flush: async () => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return false;

      try {
        const pattern = getCacheKey('*');
        const keys = await redisClient.keys(pattern);
        
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        
        return true;
      } catch (error) {
        cacheStats.errors++;
        console.error('[cache] flush error:', error.message);
        return false;
      }
    }, 'flush');
  },

  // Get all keys matching pattern
  keys: async (pattern = '*') => {
    return withPerformanceMonitoring(async () => {
      if (!isRedisConnected) return [];

      try {
        const searchPattern = getCacheKey(pattern);
        const keys = await redisClient.keys(searchPattern);
        return keys.map(key => key.replace(`${REDIS_PREFIX}:`, ''));
      } catch (error) {
        cacheStats.errors++;
        console.error(`[cache] keys error for pattern ${pattern}:`, error.message);
        return [];
      }
    }, 'keys');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[cache] Graceful shutdown...');
  await cache.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[cache] Graceful shutdown...');
  await cache.disconnect();
  process.exit(0);
});

export default cache;
