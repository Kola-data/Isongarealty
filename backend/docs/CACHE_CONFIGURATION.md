# Cache Configuration Guide

## Overview
This document describes the comprehensive caching system implemented for the Isonga Realty application, following software engineering best practices.

## Features

### 🚀 Core Features
- **Multiple Cache Strategies**: Write-through, Write-behind, Cache-aside
- **Performance Monitoring**: Real-time statistics and metrics
- **Error Handling**: Graceful degradation when Redis is unavailable
- **Connection Management**: Automatic reconnection with exponential backoff
- **Cache Warming**: Proactive cache population
- **Pattern-based Invalidation**: Efficient cache cleanup
- **Concurrent Operations**: Thread-safe operations
- **Health Monitoring**: Comprehensive health checks

### 📊 Monitoring & Analytics
- Hit rate tracking
- Response time monitoring
- Error rate tracking
- Operation counting
- Connection status monitoring

## Configuration

### Environment Variables
```bash
# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
REDIS_PREFIX=isonga
CACHE_TTL=300
CACHE_MAX_RETRIES=3
CACHE_RETRY_DELAY=1000

# Cache Strategy
DEFAULT_CACHE_STRATEGY=cache_aside
ENABLE_CACHE_WARMING=true
ENABLE_CACHE_MONITORING=true
```

### Cache Strategies

#### 1. Cache-Aside (Default)
```javascript
const data = await cache.cacheAside(
  'properties:all',
  async () => await fetchFromDatabase(),
  300 // TTL in seconds
);
```

#### 2. Write-Through
```javascript
await cache.writeThrough('property:123', propertyData, 300);
```

#### 3. Write-Behind
```javascript
await cache.writeBehind('property:123', propertyData, 300);
```

## API Endpoints

### Cache Management
- `GET /api/cache/health` - Cache health check
- `GET /api/cache/stats` - Cache statistics
- `POST /api/cache/stats/reset` - Reset statistics
- `POST /api/cache/warm` - Warm cache with data
- `POST /api/cache/invalidate` - Invalidate cache
- `GET /api/cache/keys` - List cache keys
- `POST /api/cache/flush` - Flush all cache
- `POST /api/cache/reconnect` - Reconnect to Redis

### Usage Examples

#### Health Check
```bash
curl http://localhost:3200/api/cache/health
```

#### Get Statistics
```bash
curl http://localhost:3200/api/cache/stats
```

#### Warm Cache
```bash
curl -X POST http://localhost:3200/api/cache/warm \
  -H "Content-Type: application/json" \
  -d '{"keys": ["properties:all"], "ttl": 300}'
```

#### Invalidate Cache
```bash
curl -X POST http://localhost:3200/api/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"pattern": "properties:*"}'
```

## Implementation in Services

### Property Service Example
```javascript
// Enhanced getProperties with caching
export const getProperties = async (options = {}) => {
  const { 
    useCache = true, 
    ttl = 300, 
    strategy = 'cache_aside',
    includeStats = false 
  } = options;
  
  const cacheKey = "properties:all";
  
  if (useCache) {
    const data = await cache.cacheAside(
      cacheKey,
      async () => {
        console.log('[cache] Cache miss for properties:all, fetching from database');
        return await db.all("SELECT * FROM properties ORDER BY created_at DESC");
      },
      ttl
    );
    
    if (includeStats) {
      return { data, stats: cache.getStats() };
    }
    return data;
  } else {
    return await db.all("SELECT * FROM properties ORDER BY created_at DESC");
  }
};
```

## Performance Optimization

### 1. Cache Warming
```javascript
// Warm frequently accessed data
await cache.warm(
  ['properties:all', 'properties:featured'],
  async (key) => {
    if (key === 'properties:all') {
      return await getProperties({ useCache: false });
    }
    return await getFeaturedProperties({ useCache: false });
  },
  300
);
```

### 2. Batch Operations
```javascript
// Invalidate multiple related keys
await cache.invalidateRelated(
  'properties:all',
  [`properties:${id}`, `property_images:${id}`]
);
```

### 3. Pattern-based Cleanup
```javascript
// Clean up all property-related cache
await cache.invalidatePattern('properties:*');
```

## Monitoring & Debugging

### Statistics Tracking
```javascript
const stats = cache.getStats();
console.log({
  hitRate: stats.hitRate,
  operations: stats.operations,
  avgResponseTime: stats.avgResponseTime,
  isConnected: stats.isConnected
});
```

### Health Monitoring
```javascript
const health = await cache.healthCheck();
if (health.status === 'unhealthy') {
  console.error('Cache health issue:', health.reason);
}
```

## Testing

### Run Cache Tests
```bash
node backend/utils/cacheTest.js
```

### Test Coverage
- Basic operations (GET, SET, DELETE)
- Cache strategies
- Performance benchmarks
- Error handling
- Concurrent operations
- Cache invalidation
- Statistics accuracy

## Best Practices

### 1. Cache Key Naming
```javascript
// Good: Hierarchical and descriptive
'properties:all'
'properties:123'
'property_images:123'
'user:profile:456'

// Bad: Unclear or conflicting
'data'
'info'
'cache'
```

### 2. TTL Management
```javascript
// Short TTL for frequently changing data
await cache.set('user:session:123', sessionData, 60);

// Long TTL for static data
await cache.set('config:settings', configData, 3600);
```

### 3. Error Handling
```javascript
try {
  const data = await cache.get('key');
  if (!data) {
    // Handle cache miss
    const freshData = await fetchFromSource();
    await cache.set('key', freshData, 300);
    return freshData;
  }
  return data;
} catch (error) {
  console.error('Cache operation failed:', error);
  // Fallback to direct database access
  return await fetchFromSource();
}
```

### 4. Cache Invalidation
```javascript
// Invalidate related data when updating
await updateProperty(id, data);
await cache.invalidateRelated('properties:all', [`properties:${id}`]);
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify REDIS_URL configuration
   - Check network connectivity

2. **High Memory Usage**
   - Review TTL settings
   - Implement cache size limits
   - Monitor cache statistics

3. **Low Hit Rate**
   - Review cache key patterns
   - Check TTL settings
   - Analyze access patterns

4. **Performance Issues**
   - Monitor response times
   - Check Redis server performance
   - Review cache strategy selection

### Debug Commands
```bash
# Check Redis connection
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys
redis-cli keys "isonga:*"
```

## Security Considerations

1. **Access Control**: Redis should be secured with authentication
2. **Data Encryption**: Sensitive data should be encrypted before caching
3. **Key Isolation**: Use prefixes to isolate different applications
4. **TTL Management**: Set appropriate expiration times for sensitive data

## Scaling Considerations

1. **Redis Clustering**: For high availability and performance
2. **Cache Partitioning**: Distribute cache across multiple Redis instances
3. **Monitoring**: Implement comprehensive monitoring and alerting
4. **Backup Strategy**: Regular cache backup and recovery procedures
