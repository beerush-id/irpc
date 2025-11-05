---
title: getContext
description: API reference for the getContext function - retrieves values from the current IRPC context for request-scoped data access.
head:
  - - meta
    - property: og:title
    - content: getContext API Reference
  - - meta
    - property: og:description
    - content: API reference for the getContext function - retrieves values from the current IRPC context for request-scoped data access.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/api/core/get-context
  - - meta
    - name: keywords
    - content: irpc, getContext, api, reference, context, typescript, request-scoped
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: getContext API Reference
  - - meta
    - name: twitter:description
    - content: API reference for the getContext function - retrieves values from the current IRPC context for request-scoped data access.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# getContext

Retrieves a value from the current IRPC context, providing access to request-scoped data that was previously set using `setContext()`.

## Signature

```typescript
import { getContext } from '@irpclib/irpc';

const value = getContext<V, K extends string = string>(key: K, fallback?: V): V | undefined;
```

## Type Parameters

### `V`
The expected type of the value being retrieved from the context.

### `K extends string` (Optional, defaults to `string`)
The type of the key. Must extend string to ensure type safety.

## Parameters

### `key`
The key identifying the value to retrieve from the context.

| Type | Description |
|------|-------------|
| `K` | String key identifying the context value |

### `fallback` (Optional)
A default value to return if the key is not found in the context.

| Type | Description |
|------|-------------|
| `V` | Default value to return when key is not present |

## Returns

Returns the value associated with the key, or the fallback value if provided. If no fallback is provided and the key is not found, returns `undefined`.

## Examples

### Basic Usage

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Set context values
setContext('userId', 123);
setContext('requestId', 'req-abc-123');
setContext('authenticated', true);

// Retrieve values
const userId = getContext<number>('userId');
console.log(userId); // 123

const requestId = getContext<string>('requestId');
console.log(requestId); // 'req-abc-123'

const isAuthenticated = getContext<boolean>('authenticated');
console.log(isAuthenticated); // true
```

### Using Fallback Values

```typescript
import { getContext } from '@irpclib/irpc';

// Get value with fallback
const timeout = getContext<number>('timeout', 30000);
console.log(timeout); // 30000 if 'timeout' not set, otherwise the actual value

const role = getContext<string>('role', 'guest');
console.log(role); // 'guest' if 'role' not set

const debug = getContext<boolean>('debug', false);
console.log(debug); // false if 'debug' not set
```

### Type-Safe Context Access

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Define context keys as constants
const CONTEXT_KEYS = {
  USER_ID: 'userId',
  USER_ROLE: 'userRole',
  REQUEST_ID: 'requestId',
  TENANT_ID: 'tenantId'
} as const;

// Set typed context values
setContext(CONTEXT_KEYS.USER_ID, 123);
setContext(CONTEXT_KEYS.USER_ROLE, 'admin');
setContext(CONTEXT_KEYS.REQUEST_ID, 'req-abc-123');

// Get typed context values
const userId = getContext<number>(CONTEXT_KEYS.USER_ID);
const userRole = getContext<string>(CONTEXT_KEYS.USER_ROLE);
const requestId = getContext<string>(CONTEXT_KEYS.REQUEST_ID);

// Type safety ensures correct usage
// const invalid = getContext<boolean>(CONTEXT_KEYS.USER_ID); // TypeScript error
```

### Authentication Context in Handlers

```typescript
import { getContext } from '@irpclib/irpc';

// Protected function that requires authentication
irpc.construct(getUserProfile, async () => {
  // Get authentication context
  const userId = getContext<number>('userId');
  const userRole = getContext<string>('userRole');
  const isAuthenticated = getContext<boolean>('authenticated', false);
  
  // Check authentication
  if (!isAuthenticated || !userId) {
    throw new Error('Authentication required');
  }
  
  // Check authorization
  if (userRole !== 'admin' && userRole !== 'user') {
    throw new Error('Insufficient permissions');
  }
  
  // Load user profile
  const profile = await userProfileRepository.findByUserId(userId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }
  
  return profile;
});
```

### Request Tracing

```typescript
import { getContext } from '@irpclib/irpc';

// Logging helper that uses context
function logWithContext(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const requestId = getContext<string>('requestId', 'unknown');
  const userId = getContext<number>('userId');
  const startTime = getContext<number>('startTime');
  
  const elapsed = startTime ? Date.now() - startTime : 0;
  const userPrefix = userId ? `[User:${userId}]` : '';
  
  console.log(`[${requestId}]${userPrefix} [${elapsed}ms] [${level.toUpperCase()}] ${message}`);
}

// Usage in handlers
irpc.construct(processData, async (data: ProcessDataDto) => {
  logWithContext(`Starting data processing`, 'info');
  
  try {
    const result = await processData(data);
    logWithContext(`Data processing completed successfully`, 'info');
    return result;
  } catch (error) {
    logWithContext(`Data processing failed: ${error.message}`, 'error');
    throw error;
  }
});
```

### Multi-Tenant Context

```typescript
import { getContext } from '@irpclib/irpc';

// Tenant-aware handler
irpc.construct(getTenantData, async () => {
  // Get tenant context
  const tenantId = getContext<string>('tenantId');
  const tenant = getContext<Tenant>('tenant');
  const tenantConfig = getContext<TenantConfig>('tenantConfig');
  
  if (!tenantId) {
    throw new Error('Tenant context not found');
  }
  
  // Use tenant-specific configuration
  const database = getContext<DatabaseConnection>('tenantDatabase');
  const data = await database.query('SELECT * FROM data WHERE tenant_id = ?', [tenantId]);
  
  return {
    tenantId,
    tenantName: tenant?.name,
    config: tenantConfig,
    data
  };
});

// Function that checks tenant permissions
irpc.construct(checkPermission, async (resource: string, action: string) => {
  const userId = getContext<number>('userId');
  const userRole = getContext<string>('userRole');
  const tenantId = getContext<string>('tenantId');
  
  // Check tenant-specific permissions
  const hasPermission = await permissionService.check({
    userId,
    tenantId,
    resource,
    action,
    role: userRole
  });
  
  return hasPermission;
});
```

### Feature Flags

```typescript
import { getContext } from '@irpclib/irpc';

// Feature flag helper
function isFeatureEnabled(featureName: string, defaultValue = false): boolean {
  return getContext<boolean>(`feature:${featureName}`, defaultValue);
}

// Usage in handlers
irpc.construct(getUserDashboard, async () => {
  const userId = getContext<number>('userId');
  
  // Check feature flags
  const showNewUI = isFeatureEnabled('new-dashboard-ui', false);
  const enableAnalytics = isFeatureEnabled('analytics-dashboard', true);
  const betaFeatures = isFeatureEnabled('beta-features', false);
  
  const dashboard = await buildDashboard(userId, {
    newUI: showNewUI,
    analytics: enableAnalytics,
    beta: betaFeatures
  });
  
  return dashboard;
});
```

### Error Handling with Context

```typescript
import { getContext } from '@irpclib/irpc';

// Error handler that includes context information
irpc.construct(someOperation, async (param: string) => {
  const requestId = getContext<string>('requestId');
  const userId = getContext<number>('userId');
  const operationType = getContext<string>('operationType');
  
  try {
    const result = await performOperation(param);
    return result;
  } catch (error) {
    // Enhance error with context information
    const enhancedError = new Error(`${error.message} (Request: ${requestId}, User: ${userId}, Operation: ${operationType})`);
    
    // Log with context
    console.error(`[${requestId}] Operation failed for user ${userId}:`, error);
    
    throw enhancedError;
  }
});
```

### Context Validation

```typescript
import { getContext } from '@irpclib/irpc';

// Helper to validate required context
function requireContext<T>(key: string): T {
  const value = getContext<T>(key);
  
  if (value === undefined || value === null) {
    throw new Error(`Required context '${key}' is missing`);
  }
  
  return value;
}

// Usage in handlers
irpc.construct(protectedOperation, async () => {
  // Require specific context values
  const userId = requireContext<number>('userId');
  const tenantId = requireContext<string>('tenantId');
  const authToken = requireContext<string>('authToken');
  
  // Proceed with operation
  return await performProtectedOperation(userId, tenantId, authToken);
});
```

## Context Availability

Context is only available within the scope of an IRPC request:

```typescript
// Context is available here
irpc.construct(myFunction, async () => {
  const userId = getContext<number>('userId'); // ✅ Available
  return userId;
});

// Context is NOT available outside of request scope
const userId = getContext<number>('userId'); // ❌ Returns undefined
```

## Best Practices

1. **Use Fallbacks**: Always provide fallback values for optional context data
2. **Type Safety**: Use TypeScript generics to ensure type correctness
3. **Constant Keys**: Define context keys as constants to avoid typos
4. **Validation**: Validate required context values before using them
5. **Documentation**: Document what context values each function expects
6. **Namespace Keys**: Use prefixes for different types of context data

## Common Patterns

### Authentication Pattern
```typescript
const userId = getContext<number>('userId');
const isAuthenticated = getContext<boolean>('authenticated', false);

if (!isAuthenticated || !userId) {
  throw new Error('Authentication required');
}
```

### Request Tracing Pattern
```typescript
const requestId = getContext<string>('requestId', 'unknown');
const startTime = getContext<number>('startTime', Date.now());

console.log(`[${requestId}] Operation completed in ${Date.now() - startTime}ms`);
```

### Multi-tenancy Pattern
```typescript
const tenantId = getContext<string>('tenantId');
const tenantConfig = getContext<TenantConfig>('tenantConfig');

if (!tenantId) {
  throw new Error('Tenant context required');
}
```

## Related APIs

- [`setContext()`](./set-context.md) - Set values in the current context
- [`createContext()`](./create-context.md) - Create a new context map
- [`withContext()`](./with-context.md) - Execute functions within a specific context
- [`setContextProvider()`](./set-context-provider.md) - Configure the context provider
- [`IRPCContext`](../types/irpc-context.md) - Context type definition