---
title: Performance Optimization Guide
description: Learn how to optimize IRPC performance with batching, connection pooling, caching strategies, and monitoring techniques.
head:
  - - meta
    - property: og:title
    - content: IRPC Performance Optimization Guide
  - - meta
    - property: og:description
    - content: Learn how to optimize IRPC performance with batching, connection pooling, caching strategies, and monitoring techniques.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/guides/performance
  - - meta
    - name: keywords
    - content: irpc, performance, optimization, batching, caching, monitoring, typescript
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: IRPC Performance Optimization Guide
  - - meta
    - name: twitter:description
    - content: Learn how to optimize IRPC performance with batching, connection pooling, caching strategies, and monitoring techniques.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# Performance Optimization Guide

This guide covers performance optimization techniques for IRPC applications, from basic optimizations to advanced strategies for high-throughput systems.

## Understanding IRPC Performance

IRPC performance depends on several factors:

- **Network Latency**: Time for requests to travel between client and server
- **Batching Efficiency**: How well multiple calls are grouped together
- **Serialization Overhead**: Cost of converting data to/from transport format
- **Connection Management**: How efficiently connections are reused
- **Handler Execution**: Time taken by your actual business logic

## Automatic Batching

IRPC automatically batches calls made within the same event loop tick to minimize network overhead.

### How Batching Works

```typescript
// These calls will be automatically batched into a single HTTP request
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getPostsByUser(123),
  getCommentsByUser(123)
]);

// Equivalent to a single batch request:
// POST /rpc
// [
//   { "id": "1", "name": "getUser", "args": [123] },
//   { "id": "2", "name": "getPostsByUser", "args": [123] },
//   { "id": "3", "name": "getCommentsByUser", "args": [123] }
// ]
```

### Optimizing Batching

#### Group Related Operations

```typescript
// Good: Related operations batched together
async function loadUserProfile(userId: number) {
  const [user, posts, followers] = await Promise.all([
    getUser(userId),
    getPostsByUser(userId),
    getFollowersByUser(userId)
  ]);
  
  return { user, posts, followers };
}

// Avoid: Unrelated operations spread across ticks
async function badExample() {
  const user = await getUser(123);  // First batch
  
  setTimeout(async () => {
    const posts = await getPostsByUser(123);  // Second batch
  }, 10);
}
```

#### Use Promise.all for Parallel Operations

```typescript
// Best: Maximum batching efficiency
async function loadDashboard(userId: number) {
  const [
    user,
    notifications,
    recentActivity,
    stats
  ] = await Promise.all([
    getUser(userId),
    getNotifications(userId),
    getRecentActivity(userId),
    getUserStats(userId)
  ]);
  
  return { user, notifications, recentActivity, stats };
}
```

#### Manual Batching Control

```typescript
import { batch } from '@irpclib/irpc';

// Manually control batching window
async function customBatching() {
  const promises = [];
  
  // Start collecting calls
  for (let i = 0; i < 100; i++) {
    promises.push(getUser(i));
  }
  
  // All 100 calls will be batched together
  return await Promise.all(promises);
}
```

## Connection Management

### HTTP Connection Reuse

IRPC's HTTP transport automatically reuses connections when possible.

#### Configure Keep-Alive

```typescript
import { HTTPTransport } from '@irpclib/http';

const transport = new HTTPTransport({
  baseURL: 'https://api.example.com',
  endpoint: '/rpc',
  headers: {
    'Connection': 'keep-alive',
    'Keep-Alive': 'timeout=60, max=1000'
  }
}, irpc);
```

#### Connection Pooling for High Concurrency

```typescript
class PooledHTTPTransport extends HTTPTransport {
  private connections: HTTPTransport[] = [];
  private currentIndex = 0;
  private poolSize: number;
  
  constructor(config: any, factory: any, poolSize = 10) {
    // Create multiple transport instances
    for (let i = 0; i < poolSize; i++) {
      this.connections.push(new HTTPTransport(config, factory));
    }
    this.poolSize = poolSize;
  }
  
  async send(calls: IRPCCall[]) {
    // Round-robin connection selection
    const transport = this.connections[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;
    
    return transport.send(calls);
  }
}

// Use pooled transport
const pooledTransport = new PooledHTTPTransport(
  { baseURL: 'https://api.example.com', endpoint: '/rpc' },
  irpc,
  20 // 20 concurrent connections
);
```

## Caching Strategies

### Response Caching

Implement caching at the transport level to avoid redundant calls:

```typescript
class CachedHTTPTransport extends HTTPTransport {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async send(calls: IRPCCall[]) {
    const uncachedCalls: IRPCCall[] = [];
    const cacheKeys: string[] = [];
    const results: IRPCResponse[] = [];
    
    // Check cache for each call
    calls.forEach((call, index) => {
      const cacheKey = this.getCacheKey(call);
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        // Return cached result
        results.push({
          id: call.id,
          name: call.payload.name,
          result: cached.data
        });
        cacheKeys.push('');
      } else {
        // Need to make actual call
        uncachedCalls.push(call);
        cacheKeys.push(cacheKey);
      }
    });
    
    // Make uncached calls
    if (uncachedCalls.length > 0) {
      const uncachedResults = await super.send(uncachedCalls);
      
      // Cache results and combine with cached ones
      uncachedResults.forEach((result, index) => {
        const cacheKey = cacheKeys[index];
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data: result.result,
            timestamp: Date.now(),
            ttl: this.getTTL(result.name)
          });
        }
        results.push(result);
      });
    }
    
    return results;
  }
  
  private getCacheKey(call: IRPCCall): string {
    return `${call.payload.name}:${JSON.stringify(call.payload.args)}`;
  }
  
  private getTTL(functionName: string): number {
    // Different TTLs for different functions
    const ttlMap = {
      'getUser': 300000,        // 5 minutes
      'getPosts': 60000,        // 1 minute
      'getStats': 300000,       // 5 minutes
      'getUserProfile': 120000  // 2 minutes
    };
    
    return ttlMap[functionName] || 60000; // Default 1 minute
  }
}
```

### Client-Side Caching

```typescript
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = 60000
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    return data;
  }
  
  invalidate(pattern: string | RegExp) {
    if (typeof pattern === 'string') {
      this.cache.delete(pattern);
    } else {
      for (const key of this.cache.keys()) {
        if (pattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }
}

// Usage with IRPC
const cache = new ClientCache();

export const cachedGetUser = (id: number) => 
  cache.get(`user:${id}`, () => getUser(id), 300000); // 5 minutes
```

## Serialization Optimization

### Efficient Data Structures

```typescript
// Avoid: Large nested objects
const badUserData = {
  id: 123,
  profile: {
    personal: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345',
        country: 'USA'
      }
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    }
  }
};

// Better: Flatten and optimize
const optimizedUserData = {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  address: '123 Main St, Anytown, CA 12345',
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: true
};
```

### Selective Field Loading

```typescript
// Define functions with field selection
const getUser = irpc<{
  (id: number, fields?: string[]): Promise<Partial<User>>;
}>({
  name: 'getUser'
});

// Server implementation
irpc.construct(getUser, async (id: number, fields?: string[]) => {
  const user = await userRepository.findById(id);
  
  if (!fields) {
    return user; // Return all fields
  }
  
  // Return only requested fields
  const result: Partial<User> = {};
  fields.forEach(field => {
    if (field in user) {
      result[field] = user[field];
    }
  });
  
  return result;
});

// Client usage - only fetch needed data
const userBasic = await getUser(123, ['id', 'name', 'email']);
const userWithProfile = await getUser(123, ['id', 'name', 'email', 'profile']);
```

## Memory Management

### Efficient Context Usage

```typescript
// Avoid: Storing large objects in context
const badMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const largeData = await fetchLargeDataset(); // Bad: Large object in context
  setContext('largeData', largeData);
};

// Better: Store references or IDs
const goodMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const dataId = await getDataId(); // Good: Small identifier
  setContext('dataId', dataId);
};

// Handler loads data when needed
irpc.construct(processData, async () => {
  const dataId = getContext<string>('dataId');
  const data = await loadLargeDataset(dataId); // Load on demand
  return processData(data);
});
```

### Context Cleanup

```typescript
import { setContextProvider, withContext } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';

class ContextManager {
  private storage = new AsyncLocalStorage();
  
  constructor() {
    setContextProvider(this);
  }
  
  run<R>(ctx: Map<string, unknown>, fn: () => R): R {
    return this.storage.run(ctx, fn);
  }
  
  getStore<K, V>(): Map<K, V> {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('No context available');
    }
    
    // Auto-cleanup when request ends
    const originalClear = store.clear;
    store.clear = () => {
      // Custom cleanup logic
      console.log('Cleaning up context');
      originalClear.call(store);
    };
    
    return store;
  }
}
```

## Monitoring and Metrics

### Performance Monitoring

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Performance monitoring middleware
const performanceMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  
  // Log request start
  console.log(`[${requestId}] Request started: ${req.method} ${req.url}`);
  
  // Setup cleanup logging
  req.signal.addEventListener('abort', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Request completed in ${duration}ms`);
    
    // Send metrics to monitoring system
    metrics.record('rpc.request.duration', duration, {
      method: req.method,
      endpoint: req.url,
      status: 'completed'
    });
  });
};

// Function-level performance tracking
irpc.construct(getUser, async (id: number) => {
  const startTime = Date.now();
  const requestId = getContext<string>('requestId');
  
  try {
    const user = await userRepository.findById(id);
    
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] getUser completed in ${duration}ms`);
    
    // Record function-specific metrics
    metrics.record('rpc.function.duration', duration, {
      function: 'getUser',
      requestId
    });
    
    return user;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] getUser failed in ${duration}ms: ${error.message}`);
    
    metrics.record('rpc.function.error', 1, {
      function: 'getUser',
      error: error.constructor.name
    });
    
    throw error;
  }
});
```

### Metrics Collection

```typescript
class MetricsCollector {
  private metrics = new Map<string, number[]>();
  
  record(name: string, value: number, tags?: Record<string, string>) {
    const key = tags ? `${name}:${JSON.stringify(tags)}` : name;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const values = this.metrics.get(key)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }
  
  getStats(name: string, tags?: Record<string, string>) {
    const key = tags ? `${name}:${JSON.stringify(tags)}` : name;
    const values = this.metrics.get(key) || [];
    
    if (values.length === 0) {
      return null;
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

const metrics = new MetricsCollector();
```

## Load Testing

### Load Testing Script

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Load test configuration
const loadTest = {
  concurrency: 100,
  duration: 60000, // 1 minute
  rampUpTime: 10000 // 10 seconds
};

async function runLoadTest() {
  const startTime = Date.now();
  const results: number[] = [];
  const errors: Error[] = [];
  
  // Create multiple concurrent clients
  const clients = Array.from({ length: loadTest.concurrency }, (_, i) => 
    createTestClient(i)
  );
  
  // Run concurrent requests
  const promises = clients.map(async (client, index) => {
    // Ramp up
    await new Promise(resolve => 
      setTimeout(resolve, (index / clients.length) * loadTest.rampUpTime)
    );
    
    while (Date.now() - startTime < loadTest.duration) {
      const requestStart = Date.now();
      
      try {
        await client.getUser(Math.floor(Math.random() * 10000));
        const duration = Date.now() - requestStart;
        results.push(duration);
      } catch (error) {
        errors.push(error as Error);
      }
    }
  });
  
  await Promise.all(promises);
  
  // Analyze results
  console.log(`Completed ${results.length} requests`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Average response time: ${results.reduce((a, b) => a + b, 0) / results.length}ms`);
  console.log(`P95: ${results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)]}ms`);
}

function createTestClient(clientId: number) {
  const irpc = createModule({ name: `test-${clientId}`, version: '1.0.0' });
  const transport = new HTTPTransport({
    baseURL: 'http://localhost:3000',
    endpoint: '/rpc'
  }, irpc);
  
  return {
    getUser: irpc<(id: number) => Promise<any>>({ name: 'getUser' })
  };
}
```

## Production Optimization Checklist

### Server-Side

- [ ] Enable HTTP keep-alive
- [ ] Implement connection pooling
- [ ] Add response caching where appropriate
- [ ] Use efficient data structures
- [ ] Implement request timeouts
- [ ] Add rate limiting
- [ ] Monitor performance metrics
- [ ] Optimize database queries
- [ ] Use CDN for static assets
- [ ] Implement proper error handling

### Client-Side

- [ ] Batch related operations
- [ ] Implement client-side caching
- [ ] Use selective field loading
- [ ] Add request deduplication
- [ ] Implement retry logic
- [ ] Add loading states
- [ ] Optimize bundle size
- [ ] Use connection pooling
- [ ] Implement proper error boundaries
- [ ] Add performance monitoring

### Network

- [ ] Use HTTPS in production
- [ ] Implement proper DNS resolution
- [ ] Use CDN for global distribution
- [ ] Optimize for mobile networks
- [ ] Implement proper compression
- [ ] Monitor network latency
- [ ] Use appropriate timeouts
- [ ] Implement circuit breakers
- [ ] Add health checks
- [ ] Monitor bandwidth usage

## Common Performance Issues

### 1. N+1 Query Problem

```typescript
// Bad: Multiple individual calls
async function getPostsWithAuthors(postIds: number[]) {
  const posts = await Promise.all(
    postIds.map(id => getPost(id))
  );
  
  const authors = await Promise.all(
    posts.map(post => getUser(post.authorId))
  );
  
  return posts.map((post, i) => ({ ...post, author: authors[i] }));
}

// Good: Batch operations
async function getPostsWithAuthorsOptimized(postIds: number[]) {
  const [posts, authors] = await Promise.all([
    getPosts(postIds),           // Batch get posts
    getAuthorsFromPosts(posts)   // Single query for all authors
  ]);
  
  return posts.map(post => ({
    ...post,
    author: authors.find(a => a.id === post.authorId)
  }));
}
```

### 2. Over-fetching Data

```typescript
// Bad: Fetching unnecessary data
const user = await getUser(123); // Returns all user fields
const posts = await getPostsByUser(123); // Returns all post fields

// Good: Selective field loading
const user = await getUser(123, ['id', 'name', 'avatar']);
const posts = await getPostsByUser(123, ['id', 'title', 'createdAt']);
```

### 3. Inefficient Batching

```typescript
// Bad: Sequential calls
const user = await getUser(123);
const posts = await getPostsByUser(123);
const comments = await getCommentsByUser(123);

// Good: Parallel calls
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getPostsByUser(123),
  getCommentsByUser(123)
]);
```

By following these optimization techniques, you can ensure your IRPC applications perform efficiently even under high load conditions.