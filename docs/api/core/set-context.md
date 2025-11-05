---
title: setContext
description: API reference for the setContext function - sets a value in the current IRPC context for request-scoped data sharing.
head:
  - - meta
    - property: og:title
    - content: setContext API Reference
  - - meta
    - property: og:description
    - content: API reference for the setContext function - sets a value in the current IRPC context for request-scoped data sharing.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/api/core/set-context
  - - meta
    - name: keywords
    - content: irpc, setContext, api, reference, context, typescript, request-scoped
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: setContext API Reference
  - - meta
    - name: twitter:description
    - content: API reference for the setContext function - sets a value in the current IRPC context for request-scoped data sharing.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# setContext

Sets a value in the current IRPC context, making it available to all RPC function calls within the same request lifecycle.

## Signature

```typescript
import { setContext } from '@irpclib/irpc';

setContext<V, K extends string = string>(key: K, value: V): void;
```

## Type Parameters

### `V`
The type of the value to store in the context.

### `K extends string` (Optional, defaults to `string`)
The type of the key. Must extend string to ensure type safety.

## Parameters

### `key`
The key under which to store the value in the context.

| Type | Description |
|------|-------------|
| `K` | String key identifying the context value |

### `value`
The value to store in the context.

| Type | Description |
|------|-------------|
| `V` | The value to be stored (can be any type) |

## Returns

Returns `void` - this function performs a side effect by storing data in the context.

## Examples

### Basic Usage

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Set context values
setContext('userId', 123);
setContext('requestId', 'req-abc-123');
setContext('authenticated', true);

// Retrieve values in handlers
const userId = getContext<number>('userId');
const requestId = getContext<string>('requestId');
const isAuthenticated = getContext<boolean>('authenticated');
```

### Authentication Middleware

```typescript
import { setContext } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Authentication middleware
const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Verify token and extract user info
      const payload = await verifyJWT(token);
      
      // Set authentication context
      setContext('userId', payload.userId);
      setContext('userEmail', payload.email);
      setContext('userRole', payload.role);
      setContext('authToken', token);
      setContext('authenticated', true);
      setContext('tokenExpiresAt', payload.exp);
      
    } catch (error) {
      // Token invalid - don't set context values
      console.warn('Invalid token:', error.message);
    }
  }
};

// Apply to transport
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: '/rpc'
}, irpc);

transport.use(authMiddleware);
```

### Request Tracing

```typescript
import { setContext } from '@irpclib/irpc';

// Tracing middleware
const tracingMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const requestId = req.headers.get('X-Request-ID') || generateRequestId();
  const startTime = Date.now();
  
  // Set tracing context
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  setContext('userAgent', req.headers.get('User-Agent'));
  setContext('ip', req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP') || 'unknown');
  setContext('method', req.method);
  setContext('url', req.url);
  
  console.log(`[${requestId}] Request started: ${req.method} ${req.url}`);
};
```

### Multi-tenant Context

```typescript
import { setContext } from '@irpclib/irpc';

// Tenant resolution middleware
const tenantMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  // Extract tenant from various sources
  const tenantId = req.headers.get('X-Tenant-ID') || 
                   req.url.split('/')[1] || 
                   'default';
  
  // Validate and load tenant
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant || !tenant.isActive) {
    throw new Error('Invalid or inactive tenant');
  }
  
  // Set tenant context
  setContext('tenantId', tenant.id);
  setContext('tenantName', tenant.name);
  setContext('tenant', tenant);
  setContext('tenantConfig', tenant.config);
  setContext('tenantDatabase', tenant.database);
};
```

### Feature Flags

```typescript
import { setContext } from '@irpclib/irpc';

// Feature flag middleware
const featureFlagMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const userId = getContext<number>('userId');
  
  if (userId) {
    // Load user-specific feature flags
    const flags = await featureFlagService.getForUser(userId);
    
    // Set each flag in context
    Object.entries(flags).forEach(([key, value]) => {
      setContext(`feature:${key}`, value);
    });
  }
  
  // Set global flags
  const globalFlags = await featureFlagService.getGlobal();
  Object.entries(globalFlags).forEach(([key, value]) => {
    setContext(`feature:${key}`, value);
  });
};
```

### Rate Limiting Context

```typescript
import { setContext } from '@irpclib/irpc';

// Rate limiting middleware
const rateLimitMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const ip = req.headers.get('X-Forwarded-For') || 'unknown';
  const userId = getContext<number>('userId');
  
  // Check rate limits
  const ipLimit = await rateLimitService.checkIP(ip);
  const userLimit = userId ? await rateLimitService.checkUser(userId) : null;
  
  // Set rate limit context
  setContext('rateLimitIP', {
    remaining: ipLimit.remaining,
    resetAt: ipLimit.resetAt,
    limit: ipLimit.limit
  });
  
  if (userLimit) {
    setContext('rateLimitUser', {
      remaining: userLimit.remaining,
      resetAt: userLimit.resetAt,
      limit: userLimit.limit
    });
  }
};
```

### Database Connection Context

```typescript
import { setContext } from '@irpclib/irpc';

// Database middleware
const databaseMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const tenantId = getContext<string>('tenantId');
  
  // Create tenant-specific database connection
  const dbConnection = await createTenantConnection(tenantId);
  
  // Set database context
  setContext('dbConnection', dbConnection);
  setContext('dbTransaction', null);
  
  // Cleanup on request end
  req.signal.addEventListener('abort', () => {
    dbConnection.close();
  });
};

// Usage in handlers
irpc.construct(createUser, async (userData: CreateUserDto) => {
  const db = getContext<DatabaseConnection>('dbConnection');
  
  // Use the tenant-specific connection
  const user = await db.users.create(userData);
  
  return user;
});
```

### Context Updates in Handlers

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Handler that updates context
irpc.construct(performOperation, async (data: OperationData) => {
  const userId = getContext<number>('userId');
  
  // Update context with operation details
  setContext('operationType', data.type);
  setContext('operationStartTime', Date.now());
  
  try {
    const result = await processOperation(data);
    
    // Update context with success
    setContext('operationSuccess', true);
    setContext('operationResult', result);
    
    return result;
  } catch (error) {
    // Update context with error
    setContext('operationSuccess', false);
    setContext('operationError', error.message);
    
    throw error;
  } finally {
    // Update timing
    const duration = Date.now() - getContext<number>('operationStartTime');
    setContext('operationDuration', duration);
  }
});
```

## Context Hierarchy and Overwrites

Context values can be overwritten within the same request:

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Initial context
setContext('role', 'user');
console.log(getContext('role')); // 'user'

// Overwrite context
setContext('role', 'admin');
console.log(getContext('role')); // 'admin'
```

## Type Safety

Use TypeScript generics for better type safety:

```typescript
import { setContext } from '@irpclib/irpc';

// Type-safe context setting
setContext<number>('userId', 123);
setContext<string>('userEmail', 'user@example.com');
setContext<boolean>('authenticated', true);
setContext<UserRole>('userRole', 'admin');
setContext<Permission[]>('permissions', ['read', 'write']);

// Complex objects
setContext<UserProfile>('userProfile', {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
});
```

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for context keys
2. **Type Safety**: Always specify types when setting context values
3. **Minimal Data**: Store only essential data to avoid memory bloat
4. **Validation**: Validate data before storing it in context
5. **Documentation**: Document what context values your handlers expect
6. **Namespace Keys**: Use prefixes for different types of context data (e.g., `feature:`, `rateLimit:`)

## Common Pitfalls

- **Missing Context Provider**: Ensure `setContextProvider()` is called before using context
- **Type Mismatches**: Be consistent with types when setting and getting context values
- **Memory Leaks**: Avoid storing large objects or references that won't be cleaned up
- **Race Conditions**: Context is request-scoped, don't rely on it across async boundaries incorrectly

## Related APIs

- [`getContext()`](./get-context.md) - Get values from the current context
- [`createContext()`](./create-context.md) - Create a new context map
- [`withContext()`](./with-context.md) - Execute functions within a specific context
- [`setContextProvider()`](./set-context-provider.md) - Configure the context provider
- [`IRPCContext`](../types/irpc-context.md) - Context type definition