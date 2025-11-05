---
title: Troubleshooting Guide
description: Common issues and solutions for IRPC applications, including debugging techniques, error handling, and problem resolution.
head:
  - - meta
    - property: og:title
    - content: IRPC Troubleshooting Guide
  - - meta
    - property: og:description
    - content: Common issues and solutions for IRPC applications, including debugging techniques, error handling, and problem resolution.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/guides/troubleshooting
  - - meta
    - name: keywords
    - content: irpc, troubleshooting, debugging, errors, solutions, typescript
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: IRPC Troubleshooting Guide
  - - meta
    - name: twitter:description
    - content: Common issues and solutions for IRPC applications, including debugging techniques, error handling, and problem resolution.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# Troubleshooting Guide

This guide covers common issues you might encounter when working with IRPC and provides solutions to resolve them.

## Connection Issues

### "IRPC transport can not be found"

**Problem**: RPC calls fail with "IRPC transport can not be found" error.

**Causes**:
- No transport configured for the module
- Transport not properly attached to the module
- Module configuration issues

**Solutions**:

```typescript
// Ensure transport is properly configured
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

const irpc = createModule({ name: 'api', version: '1.0.0' });

// Create and attach transport
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: irpc.endpoint
}, irpc);

// Transport is automatically attached, but you can also do it explicitly
irpc.use(transport);

// Now RPC calls will work
const result = await someFunction();
```

**Verification**:

```typescript
// Check if transport is configured
console.log('Transport configured:', !!irpc.namespace.transport);
console.log('Endpoint:', irpc.endpoint());
```

### Network Connection Refused

**Problem**: Connection refused when trying to connect to the server.

**Causes**:
- Server not running
- Wrong port or host
- Firewall blocking connection
- CORS issues

**Solutions**:

```typescript
// 1. Verify server is running
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000', // Verify port and host
  endpoint: '/rpc'
}, irpc);

// 2. Add connection timeout
irpc.configure({ timeout: 10000 }); // 10 seconds

// 3. Test connection with health check
async function testConnection() {
  try {
    const response = await fetch('http://localhost:3000/rpc');
    console.log('Server status:', response.status);
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}
```

**CORS Issues**:

```typescript
// Server-side CORS configuration (Bun example)
Bun.serve({
  routes: {
    '/rpc': {
      OPTIONS: () => new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }),
      POST: (req) => {
        const response = await transport.respond(req);
        // Add CORS headers to response
        response.headers.set('Access-Control-Allow-Origin', '*');
        return response;
      }
    }
  }
});
```

## Function Definition Issues

### "IRPC can not be found"

**Problem**: Server responds with "IRPC can not be found" error.

**Causes**:
- Function not registered on server
- Function name mismatch
- Module configuration differences

**Solutions**:

```typescript
// 1. Ensure function is registered on server
irpc.construct(myFunction, async (param) => {
  return await processParam(param);
});

// 2. Verify function names match exactly
const myFunction = irpc<(param: string) => Promise<string>>({
  name: 'myFunction' // Must match server registration
});

// 3. Check module configuration
console.log('Client module:', irpc.namespace);
console.log('Server module:', serverIrpc.namespace);
```

**Debug Function Registration**:

```typescript
// Add debugging to see registered functions
function debugModule(module: IRPCFactory) {
  console.log(`Module: ${module.namespace.name}@${module.namespace.version}`);
  console.log('Registered functions:');
  
  // Access internal registry (for debugging only)
  const registeredFunctions = [];
  // Note: This requires access to internal module state
  // In production, add logging to your construct calls
}

debugModule(irpc);
```

### Type Mismatch Errors

**Problem**: Runtime errors due to type mismatches between client and server.

**Causes**:
- Different function signatures
- Missing or extra parameters
- Type conversion issues

**Solutions**:

```typescript
// 1. Share type definitions
// types.ts
export type GetUserFunction = (id: number) => Promise<{
  id: number;
  name: string;
  email: string;
}>;

// client.ts
const getUser = irpc<GetUserFunction>({
  name: 'getUser'
});

// server.ts
irpc.construct(getUser, async (id: number) => {
  // Ensure return type matches
  const user = await userRepository.findById(id);
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
});

// 2. Add runtime validation
irpc.construct(getUser, async (id: number) => {
  if (typeof id !== 'number' || id <= 0) {
    throw new Error('Invalid user ID');
  }
  
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
});
```

## Timeout Issues

### "IRPC timeout"

**Problem**: RPC calls timeout after waiting too long.

**Causes**:
- Long-running operations
- Network latency
- Server overload
- Deadlocks

**Solutions**:

```typescript
// 1. Adjust timeout configuration
irpc.configure({ timeout: 30000 }); // 30 seconds

// 2. Implement progressive timeouts
const fastFunctions = createModule({ 
  name: 'fast', 
  version: '1.0.0',
  timeout: 5000 // 5 seconds
});

const slowFunctions = createModule({ 
  name: 'slow', 
  version: '1.0.0',
  timeout: 60000 // 1 minute
});

// 3. Add timeout handling with retry
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('timeout') && attempt < maxRetries) {
        const delay = baseDelay * attempt;
        console.log(`Timeout, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
const result = await callWithRetry(() => slowOperation());
```

## Serialization Issues

### "Invalid arguments" Error

**Problem**: Server rejects arguments due to serialization or validation issues.

**Causes**:
- Non-serializable data (functions, Dates, etc.)
- Schema validation failures
- Circular references

**Solutions**:

```typescript
// 1. Ensure data is serializable
const badData = {
  id: 123,
  createdAt: new Date(), // Date objects need special handling
  callback: () => {},    // Functions can't be serialized
  circular: null
};
badData.circular = badData; // Circular reference

// Good: Convert to serializable format
const goodData = {
  id: 123,
  createdAt: new Date().toISOString(), // Convert to string
  // Remove functions and circular references
};

// 2. Add schema validation
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  email: z.string().email()
});

const createUser = irpc<(data: z.infer<typeof UserSchema>) => Promise<User>>({
  name: 'createUser',
  schema: {
    input: [UserSchema],
    output: UserSchema
  }
});

// 3. Custom serialization for complex types
function serializeData(data: any): any {
  if (data instanceof Date) {
    return { __type: 'Date', value: data.toISOString() };
  }
  
  if (typeof data === 'object' && data !== null) {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'function') {
        serialized[key] = serializeData(value);
      }
    }
    return serialized;
  }
  
  return data;
}

function deserializeData(data: any): any {
  if (data && typeof data === 'object' && data.__type === 'Date') {
    return new Date(data.value);
  }
  
  if (Array.isArray(data)) {
    return data.map(deserializeData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const deserialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      deserialized[key] = deserializeData(value);
    }
    return deserialized;
  }
  
  return data;
}
```

## Context Issues

### Context Not Available

**Problem**: `getContext()` returns undefined or throws errors.

**Causes**:
- Context provider not configured
- Context accessed outside request scope
- Async context loss

**Solutions**:

```typescript
// 1. Configure context provider
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';

// Must be called before any RPC operations
setContextProvider(new AsyncLocalStorage());

// 2. Ensure context is set in middleware
const contextMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  setContext('requestId', generateRequestId());
  setContext('startTime', Date.now());
};

// 3. Handle async context correctly
irpc.construct(asyncFunction, async (param: string) => {
  // Context is available here
  const requestId = getContext<string>('requestId');
  
  // For complex async operations, preserve context
  const result = await someAsyncOperation(param);
  
  // Context should still be available
  const endTime = getContext<number>('startTime');
  
  return result;
});

// 4. Debug context availability
function debugContext() {
  try {
    const requestId = getContext<string>('requestId');
    console.log('Context available:', !!requestId);
  } catch (error) {
    console.log('Context not available:', error.message);
  }
}
```

## Performance Issues

### Slow Response Times

**Problem**: RPC calls are taking too long to complete.

**Causes**:
- Inefficient batching
- Network latency
- Database queries
- Large payloads

**Solutions**:

```typescript
// 1. Monitor performance
const performanceMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  
  req.signal.addEventListener('abort', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Request completed in ${duration}ms`);
  });
};

// 2. Optimize batching
// Bad: Sequential calls
const user = await getUser(123);
const posts = await getPostsByUser(123);

// Good: Parallel calls
const [user, posts] = await Promise.all([
  getUser(123),
  getPostsByUser(123)
]);

// 3. Implement response caching
class PerformanceCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  get(key: string, ttl: number = 60000): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const cache = new PerformanceCache();

irpc.construct(getUser, async (id: number) => {
  const cacheKey = `user:${id}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Cache hit for user:', id);
    return cached;
  }
  
  const user = await userRepository.findById(id);
  cache.set(cacheKey, user);
  
  return user;
});
```

## Memory Issues

### Memory Leaks

**Problem**: Memory usage increases over time.

**Causes**:
- Large objects in context
- Unclosed connections
- Cache not cleaned up

**Solutions**:

```typescript
// 1. Clean up context properly
const cleanupMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  req.signal.addEventListener('abort', () => {
    // Clear context
    ctx.clear();
    console.log('Context cleaned up');
  });
};

// 2. Implement cache size limits
class LimitedCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  set(key: string, data: any): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > 300000) { // 5 minutes
        this.cache.delete(key);
      }
    }
  }
}

// 3. Monitor memory usage
function monitorMemory() {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (const [key, value] of Object.entries(used)) {
    console.log(`${key}: ${Math.round(value / 1024 / 1024)} MB`);
  }
}

// Run periodically
setInterval(monitorMemory, 30000); // Every 30 seconds
```

## Debugging Techniques

### Logging and Tracing

```typescript
// 1. Request tracing
const tracingMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  
  console.log(`[${requestId}] → ${req.method} ${req.url}`);
  
  req.signal.addEventListener('abort', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ← Completed in ${duration}ms`);
  });
};

// 2. Function-level logging
function createLoggedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const requestId = getContext<string>('requestId', 'unknown');
    const startTime = Date.now();
    
    console.log(`[${requestId}] Calling ${name}(${args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(', ')})`);
    
    try {
      const result = await fn(...args);
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${name} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${name} failed in ${duration}ms: ${error.message}`);
      throw error;
    }
  }) as T;
}

// Usage
irpc.construct(getUser, createLoggedFunction(async (id: number) => {
  return await userRepository.findById(id);
}, 'getUser'));
```

### Error Handling

```typescript
// 1. Global error handler
const errorHandler = async (req: Request, ctx: Map<string, unknown>) => {
  req.signal.addEventListener('abort', () => {
    const errors = getContext<Error[]>('errors', []);
    if (errors.length > 0) {
      console.error(`Request had ${errors.length} errors:`, errors);
    }
  });
};

// 2. Error classification
function classifyError(error: Error): string {
  if (error.message.includes('timeout')) return 'TIMEOUT';
  if (error.message.includes('network')) return 'NETWORK';
  if (error.message.includes('validation')) return 'VALIDATION';
  if (error.message.includes('permission')) return 'PERMISSION';
  return 'UNKNOWN';
}

// 3. Error reporting
irpc.construct(getUser, async (id: number) => {
  try {
    return await userRepository.findById(id);
  } catch (error) {
    const errorType = classifyError(error);
    const requestId = getContext<string>('requestId');
    
    console.error(`[${requestId}] ${errorType} error in getUser:`, error.message);
    
    // Report to monitoring service
    await reportError(errorType, error, { requestId, function: 'getUser', id });
    
    throw error;
  }
});
```

## Common Debugging Commands

### Browser Console

```javascript
// Check if IRPC is loaded
console.log('IRPC loaded:', typeof window.irpc !== 'undefined');

// Monitor network requests
// Open Network tab in DevTools and filter by XHR/Fetch

// Check response times
// Add performance logging to your functions
```

### Server Logs

```bash
# Check server is running
curl http://localhost:3000/rpc

# Test RPC endpoint
curl -X POST http://localhost:3000/rpc \
  -H "Content-Type: application/json" \
  -d '[{"id": "1", "name": "getUser", "args": [123]}]'

# Monitor logs
tail -f /var/log/irpc.log
```

### Network Debugging

```typescript
// Add request/response logging
const debugTransport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: '/rpc'
}, irpc);

// Override send method for debugging
const originalSend = debugTransport.send.bind(debugTransport);
debugTransport.send = async (calls) => {
  console.log('→ Sending calls:', calls.map(c => ({
    id: c.id,
    name: c.payload.name,
    args: c.payload.args
  })));
  
  const responses = await originalSend(calls);
  
  console.log('← Received responses:', responses.map(r => ({
    id: r.id,
    name: r.name,
    hasResult: !!r.result,
    hasError: !!r.error
  })));
  
  return responses;
};
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look for error messages and warnings
2. **Verify configuration**: Ensure client and server configurations match
3. **Test connectivity**: Use curl or Postman to test the RPC endpoint
4. **Check versions**: Ensure compatible versions of IRPC packages
5. **Minimal reproduction**: Create a minimal example that reproduces the issue
6. **Community support**: Ask for help in the IRPC Discord or GitHub issues

When reporting issues, include:
- IRPC version
- Operating system and Node.js/Bun version
- Complete error messages
- Minimal reproduction code
- Expected vs actual behavior