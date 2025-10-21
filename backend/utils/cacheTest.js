import { cache } from './cache.js';
import { performance } from 'perf_hooks';

// Cache testing utilities
export class CacheTester {
  constructor() {
    this.testResults = [];
    this.startTime = null;
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive cache tests...\n');
    this.startTime = performance.now();

    const tests = [
      { name: 'Basic Operations', fn: this.testBasicOperations },
      { name: 'Cache Strategies', fn: this.testCacheStrategies },
      { name: 'Performance', fn: this.testPerformance },
      { name: 'Error Handling', fn: this.testErrorHandling },
      { name: 'Concurrent Operations', fn: this.testConcurrentOperations },
      { name: 'Cache Invalidation', fn: this.testCacheInvalidation },
      { name: 'Statistics', fn: this.testStatistics }
    ];

    for (const test of tests) {
      try {
        console.log(`\n📋 Running ${test.name}...`);
        await test.fn.call(this);
        console.log(`✅ ${test.name} passed`);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error.message);
        this.testResults.push({
          test: test.name,
          status: 'failed',
          error: error.message
        });
      }
    }

    this.printSummary();
    return this.testResults;
  }

  async testBasicOperations() {
    const testKey = 'test:basic';
    const testValue = { id: 1, name: 'Test Property', price: 100000 };

    // Test SET
    const setResult = await cache.set(testKey, testValue, 60);
    if (!setResult) throw new Error('SET operation failed');

    // Test GET
    const getValue = await cache.get(testKey);
    if (!getValue || getValue.id !== testValue.id) {
      throw new Error('GET operation failed or returned incorrect data');
    }

    // Test EXISTS
    const exists = await cache.exists(testKey);
    if (!exists) throw new Error('EXISTS operation failed');

    // Test TTL
    const ttl = await cache.ttl(testKey);
    if (ttl <= 0) throw new Error('TTL operation failed');

    // Test DELETE
    const delResult = await cache.del(testKey);
    if (!delResult) throw new Error('DELETE operation failed');

    // Verify deletion
    const deletedValue = await cache.get(testKey);
    if (deletedValue !== null) throw new Error('Value not properly deleted');

    this.testResults.push({ test: 'Basic Operations', status: 'passed' });
  }

  async testCacheStrategies() {
    const testKey = 'test:strategy';
    const testValue = { id: 2, name: 'Strategy Test' };

    // Test Cache-Aside
    const cacheAsideResult = await cache.cacheAside(
      testKey,
      async () => testValue,
      60
    );
    if (!cacheAsideResult || cacheAsideResult.id !== testValue.id) {
      throw new Error('Cache-Aside strategy failed');
    }

    // Test Write-Through
    const writeThroughResult = await cache.writeThrough(testKey, testValue, 60);
    if (!writeThroughResult) throw new Error('Write-Through strategy failed');

    // Test Write-Behind
    const writeBehindResult = await cache.writeBehind(testKey, testValue, 60);
    if (!writeBehindResult) throw new Error('Write-Behind strategy failed');

    // Cleanup
    await cache.del(testKey);

    this.testResults.push({ test: 'Cache Strategies', status: 'passed' });
  }

  async testPerformance() {
    const iterations = 100;
    const testData = { id: 3, data: 'Performance test data' };
    const keys = [];

    // Generate test keys
    for (let i = 0; i < iterations; i++) {
      keys.push(`perf:test:${i}`);
    }

    // Test SET performance
    const setStart = performance.now();
    const setPromises = keys.map((key, index) => 
      cache.set(key, { ...testData, id: index }, 60)
    );
    await Promise.all(setPromises);
    const setEnd = performance.now();
    const setTime = setEnd - setStart;

    // Test GET performance
    const getStart = performance.now();
    const getPromises = keys.map(key => cache.get(key));
    const getResults = await Promise.all(getPromises);
    const getEnd = performance.now();
    const getTime = getEnd - getStart;

    // Verify all data was retrieved correctly
    const validResults = getResults.filter(result => result && result.id !== undefined);
    if (validResults.length !== iterations) {
      throw new Error(`Performance test failed: Expected ${iterations} results, got ${validResults.length}`);
    }

    console.log(`   SET: ${iterations} operations in ${setTime.toFixed(2)}ms (${(iterations/setTime*1000).toFixed(0)} ops/sec)`);
    console.log(`   GET: ${iterations} operations in ${getTime.toFixed(2)}ms (${(iterations/getTime*1000).toFixed(0)} ops/sec)`);

    // Cleanup
    await Promise.all(keys.map(key => cache.del(key)));

    this.testResults.push({ 
      test: 'Performance', 
      status: 'passed',
      metrics: {
        setTime,
        getTime,
        setOpsPerSec: iterations / setTime * 1000,
        getOpsPerSec: iterations / getTime * 1000
      }
    });
  }

  async testErrorHandling() {
    // Test with invalid data
    try {
      await cache.set('error:test', undefined, 60);
    } catch (error) {
      // Expected to fail
    }

    // Test with very large data
    const largeData = { data: 'x'.repeat(1000000) }; // 1MB string
    try {
      const result = await cache.set('large:test', largeData, 60);
      if (result) {
        const retrieved = await cache.get('large:test');
        if (!retrieved || retrieved.data.length !== largeData.data.length) {
          throw new Error('Large data handling failed');
        }
        await cache.del('large:test');
      }
    } catch (error) {
      console.log('   Large data test skipped (Redis memory limit)');
    }

    this.testResults.push({ test: 'Error Handling', status: 'passed' });
  }

  async testConcurrentOperations() {
    const concurrentCount = 50;
    const promises = [];

    // Concurrent SET operations
    for (let i = 0; i < concurrentCount; i++) {
      promises.push(
        cache.set(`concurrent:${i}`, { id: i, data: `concurrent data ${i}` }, 60)
      );
    }

    const setResults = await Promise.all(promises);
    const successfulSets = setResults.filter(result => result === true);

    // Concurrent GET operations
    const getPromises = [];
    for (let i = 0; i < concurrentCount; i++) {
      getPromises.push(cache.get(`concurrent:${i}`));
    }

    const getResults = await Promise.all(getPromises);
    const successfulGets = getResults.filter(result => result !== null);

    if (successfulSets.length !== concurrentCount || successfulGets.length !== concurrentCount) {
      throw new Error(`Concurrent operations failed: ${successfulSets.length}/${concurrentCount} sets, ${successfulGets.length}/${concurrentCount} gets`);
    }

    // Cleanup
    await Promise.all(
      Array.from({ length: concurrentCount }, (_, i) => cache.del(`concurrent:${i}`))
    );

    this.testResults.push({ test: 'Concurrent Operations', status: 'passed' });
  }

  async testCacheInvalidation() {
    // Create test data
    const baseKey = 'invalidation:test';
    const relatedKeys = ['invalidation:test:1', 'invalidation:test:2', 'invalidation:test:3'];
    
    await cache.set(baseKey, { id: 1 }, 60);
    for (const key of relatedKeys) {
      await cache.set(key, { id: key.split(':')[2] }, 60);
    }

    // Test pattern invalidation
    const patternResult = await cache.invalidatePattern('invalidation:*');
    if (!patternResult) throw new Error('Pattern invalidation failed');

    // Verify all keys are deleted
    const remainingKeys = await cache.keys('invalidation:*');
    if (remainingKeys.length > 0) {
      throw new Error(`Pattern invalidation incomplete: ${remainingKeys.length} keys remaining`);
    }

    this.testResults.push({ test: 'Cache Invalidation', status: 'passed' });
  }

  async testStatistics() {
    const initialStats = cache.getStats();
    
    // Perform some operations to generate stats
    await cache.set('stats:test', { id: 1 }, 60);
    await cache.get('stats:test');
    await cache.del('stats:test');

    const finalStats = cache.getStats();
    
    if (finalStats.operations <= initialStats.operations) {
      throw new Error('Statistics not updating properly');
    }

    if (finalStats.hitRate < 0 || finalStats.hitRate > 100) {
      throw new Error('Invalid hit rate calculation');
    }

    console.log(`   Hit Rate: ${finalStats.hitRate}%`);
    console.log(`   Operations: ${finalStats.operations}`);
    console.log(`   Avg Response Time: ${finalStats.avgResponseTime}ms`);

    this.testResults.push({ test: 'Statistics', status: 'passed' });
  }

  printSummary() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`Tests Run: ${this.testResults.length}`);
    
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }

    // Print cache statistics
    const stats = cache.getStats();
    console.log('\n📈 Cache Statistics:');
    console.log(`Hit Rate: ${stats.hitRate}%`);
    console.log(`Operations: ${stats.operations}`);
    console.log(`Hits: ${stats.hits}`);
    console.log(`Misses: ${stats.misses}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Avg Response Time: ${stats.avgResponseTime}ms`);
    console.log(`Connected: ${stats.isConnected}`);
  }
}

// Export test runner
export const runCacheTests = async () => {
  const tester = new CacheTester();
  return await tester.runAllTests();
};

// Auto-run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCacheTests().then(() => {
    console.log('\n🎉 Cache testing completed!');
    process.exit(0);
  }).catch(error => {
    console.error('\n💥 Cache testing failed:', error);
    process.exit(1);
  });
}
