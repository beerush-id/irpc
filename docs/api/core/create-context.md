---
title: createContext
description: API reference for the createContext function - creates a new context map for request-scoped data in IRPC.
head:
  - - meta
    - property: og:title
    - content: createContext API Reference
  - - meta
    - property: og:description
    - content: API reference for the createContext function - creates a new context map for request-scoped data in IRPC.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/api/core/create-context
  - - meta
    - name: keywords
    - content: irpc, createContext, api, reference, context, typescript, request-scoped
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: createContext API Reference
  - - meta
    - name: twitter:description
    - content: API reference for the createContext function - creates a new context map for request-scoped data in IRPC.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# createContext

Creates a new context map for storing request-scoped data that can be shared across RPC function calls within the same request lifecycle.

## Signature

```typescript
import { createContext } from '@irpclib/irpc';

const context = createContext<K extends string, V>(init?: [K, V][]): Map<K, V>;
```

## Type Parameters

### `K extends string`
The type for context keys. Must extend string to ensure type safety.

### `V`
The type for context values. Can be any type.

## Parameters

### `init` (Optional)
An array of key-value pairs to initialize the context with.

| Type | Description |
|------|-------------|
| `[K, V][]` | Array of tuples containing key-value pairs for initialization |

## Returns

Returns a `Map<K, V>` instance that can be used to store and retrieve context data.

## Examples

### Basic Context Creation

```typescript
import { createContext } from '@irpclib/irpc';

// Create an empty context
const context = createContext<string, unknown>();

// Create context with initial values
const contextWithData = createContext<string, unknown>([
  ['userId', 123],
  ['requestId', 'req-abc-123'],
  ['authToken', 'bearer-token-xyz']
]);
```

### Using with TypeScript Types

```typescript
import { createContext } from '@irpclib/irpc';

// Define specific context types
type ContextKey = 'userId' | 'requestId' | 'authToken' | 'tenantId';
type ContextValue = number | string;

// Create typed context
const context = createContext<ContextKey, ContextValue>([
  ['userId', 123],
  ['requestId', 'req-abc-123']
]);

// Type-safe operations
context.set('tenantId', 'tenant-456');
const userId = context.get('userId'); // Type: number | undefined
```

### Context in Middleware

```typescript
import { createContext, setContext } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Authentication middleware
const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Create context with auth data
    const context = createContext<string, unknown>([
      ['authToken', token],
      ['authenticated', true]
    ]);
    
    // Set context values
    setContext('userId', await extractUserIdFromToken(token));
    setContext('authToken', token);
  }
};

// Apply middleware to transport
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: '/rpc'
}, irpc);

transport.use(authMiddleware);
```

### Context in RPC Handlers

```typescript
import { getContext } from '@irpclib/irpc';
import { z } from 'zod';

// Define a protected function
const getUserProfile = irpc<{
  (userId: number): Promise<UserProfile>;
}>({
  name: 'getUserProfile',
  schema: {
    input: [z.number().positive()],
    output: UserProfileSchema
  }
});

// Implement handler with context access
irpc.construct(getUserProfile, async (userId: number) => {
  // Get context values
  const currentUserId = getContext<number>('userId');
  const isAuthenticated = getContext<boolean>('authenticated', false);
  const tenantId = getContext<string>('tenantId');
  
  // Check authorization
  if (!isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  // Users can only access their own profile (unless admin)
  if (currentUserId !== userId && !isAdmin(currentUserId)) {
    throw new Error('Access denied');
  }
  
  // Query with tenant isolation
  const profile = await userProfileRepository.findByUserIdAndTenant(userId, tenantId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  return profile;
});
```

### Context for Request Tracing

```typescript
import { createContext, setContext, getContext } from '@irpclib/irpc';

// Request tracing middleware
const tracingMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const requestId = req.headers.get('X-Request-ID') || generateRequestId();
  const startTime = Date.now();
  
  // Set tracing context
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  setContext('userAgent', req.headers.get('User-Agent'));
  setContext('ip', req.headers.get('X-Forwarded-For') || 'unknown');
  
  console.log(`[${requestId}] Request started`);
};

// Logging helper using context
function logWithContext(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const requestId = getContext<string>('requestId', 'unknown');
  const elapsed = Date.now() - (getContext<number>('startTime') || Date.now());
  
  console.log(`[${requestId}] [${elapsed}ms] [${level.toUpperCase()}] ${message}`);
}

// Usage in handlers
irpc.construct(someFunction, async (param: string) => {
  logWithContext(`Processing ${param}`);
  
  try {
    const result = await processParam(param);
    logWithContext(`Successfully processed ${param}`);
    return result;
  } catch (error) {
    logWithContext(`Error processing ${param}: ${error.message}`, 'error');
    throw error;
  }
});
```

### Context for Multi-tenant Applications

```typescript
import { createContext, setContext, getContext } from '@irpclib/irpc';

// Tenant resolution middleware
const tenantMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const tenantId = req.headers.get('X-Tenant-ID') || 
                   req.url.split('/')[1] || 
                   'default';
  
  // Validate tenant exists
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant || !tenant.isActive) {
    throw new Error('Invalid tenant');
  }
  
  // Set tenant context
  setContext('tenantId', tenantId);
  setContext('tenant', tenant);
  setContext('tenantConfig', tenant.config);
};

// Tenant-aware handler
irpc.construct(getTenantData, async () => {
  const tenantId = getContext<string>('tenantId');
  const tenant = getContext<Tenant>('tenant');
  const config = getContext<TenantConfig>('tenantConfig');
  
  // Use tenant-specific configuration
  const data = await tenantDataService.getForTenant(tenantId, config);
  
  return {
    tenantId,
    tenantName: tenant.name,
    data
  };
});
```

## Context Lifecycle

Context data follows the request lifecycle:

1. **Creation**: Context is created when a request arrives (typically in middleware)
2. **Population**: Values are set using `setContext()`
3. **Access**: Values are retrieved using `getContext()` in handlers
4. **Cleanup**: Context is automatically cleared when the request completes

## Best Practices

1. **Type Safety**: Always define specific types for your context keys and values
2. **Default Values**: Use `getContext()` with fallback values for optional context data
3. **Minimal Data**: Store only essential data in context to avoid memory bloat
4. **Validation**: Validate context data before using it in handlers
5. **Documentation**: Document what context values each handler expects

## Common Use Cases

- **Authentication**: Store user ID, roles, and permissions
- **Request Tracing**: Track request IDs, timing, and metadata
- **Multi-tenancy**: Store tenant information and configuration
- **Feature Flags**: Store feature flag states for the current request
- **Rate Limiting**: Track request counts per user/IP
- **Caching**: Store cache keys and invalidation data

## Related APIs

- [`setContext()`](./set-context.md) - Set values in the current context
- [`getContext()`](./get-context.md) - Get values from the current context
- [`withContext()`](./with-context.md) - Execute functions within a specific context
- [`setContextProvider()`](./set-context-provider.md) - Configure the context provider
- [`IRPCContext`](../types/irpc-context.md) - Context type definition