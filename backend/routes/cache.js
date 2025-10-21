import express from 'express';
import { cache } from '../utils/cache.js';

const router = express.Router();

// Cache health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = await cache.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      reason: error.message 
    });
  }
});

// Cache statistics endpoint
router.get('/stats', (req, res) => {
  try {
    const stats = cache.getStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Reset cache statistics
router.post('/stats/reset', (req, res) => {
  try {
    cache.resetStats();
    res.json({
      success: true,
      message: 'Cache statistics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cache warming endpoint
router.post('/warm', async (req, res) => {
  try {
    const { keys, ttl = 300 } = req.body;
    
    if (!keys || !Array.isArray(keys)) {
      return res.status(400).json({
        success: false,
        error: 'Keys array is required'
      });
    }

    // Define fetch functions for different key types
    const fetchFunctions = {
      'properties:all': async () => {
        const { getProperties } = await import('../services/PropertyManagement/services.js');
        return await getProperties({ useCache: false });
      },
      'property_images': async (key) => {
        const propertyId = key.split(':')[1];
        const { getPropertyImages } = await import('../services/PropertyManagement/services.js');
        return await getPropertyImages(propertyId, { useCache: false });
      }
    };

    // Warm cache for each key
    const results = [];
    for (const key of keys) {
      try {
        let fetchFunction;
        
        if (key === 'properties:all') {
          fetchFunction = fetchFunctions['properties:all'];
        } else if (key.startsWith('property_images:')) {
          fetchFunction = fetchFunctions['property_images'];
        } else {
          continue; // Skip unknown key types
        }

        await cache.warm([key], fetchFunction, ttl);
        results.push({ key, status: 'success' });
      } catch (error) {
        results.push({ key, status: 'error', error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Cache warming completed',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cache invalidation endpoint
router.post('/invalidate', async (req, res) => {
  try {
    const { pattern, keys } = req.body;
    
    if (pattern) {
      const result = await cache.invalidatePattern(pattern);
      res.json({
        success: true,
        message: `Cache invalidated for pattern: ${pattern}`,
        result,
        timestamp: new Date().toISOString()
      });
    } else if (keys && Array.isArray(keys)) {
      const results = await Promise.allSettled(
        keys.map(key => cache.del(key))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      res.json({
        success: true,
        message: `Cache invalidated for ${successCount}/${keys.length} keys`,
        results: results.map((r, i) => ({
          key: keys[i],
          status: r.status,
          success: r.status === 'fulfilled' ? r.value : false,
          error: r.status === 'rejected' ? r.reason.message : null
        })),
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Either pattern or keys array is required'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get cache keys endpoint
router.get('/keys', async (req, res) => {
  try {
    const { pattern = '*' } = req.query;
    const keys = await cache.keys(pattern);
    
    res.json({
      success: true,
      data: keys,
      count: keys.length,
      pattern,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Flush cache endpoint (use with caution)
router.post('/flush', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'FLUSH_ALL_CACHE') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required. Send { "confirm": "FLUSH_ALL_CACHE" }'
      });
    }

    const result = await cache.flush();
    
    res.json({
      success: result,
      message: result ? 'Cache flushed successfully' : 'Failed to flush cache',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cache reconnection endpoint
router.post('/reconnect', async (req, res) => {
  try {
    await cache.reconnect();
    res.json({
      success: true,
      message: 'Cache reconnection initiated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
