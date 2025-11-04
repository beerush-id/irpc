---
title: IRPC TypeScript Usage Patterns
description: Learn advanced usage patterns and features of IRPC in TypeScript including schema validation, context management, error handling, and batch operations.
head:
  - - meta
    - property: og:title
      content: IRPC TypeScript Usage Patterns
  - - meta
    - property: og:description
      content: Learn advanced usage patterns and features of IRPC in TypeScript including schema validation, context management, error handling, and batch operations.
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/typescript/usage
  - - meta
    - name: keywords
      content: irpc, typescript, usage, patterns, schema validation, context management, error handling, batch operations
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: IRPC TypeScript Usage Patterns
  - - meta
    - name: twitter:description
      content: Learn advanced usage patterns and features of IRPC in TypeScript including schema validation, context management, error handling, and batch operations.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "IRPC TypeScript Usage Patterns", "description": "Learn advanced usage patterns and features of IRPC in TypeScript including schema validation, context management, error handling, and batch operations.", "url": "https://irpc.anchorlib.dev/typescript/usage" }'
---

# Usage Patterns

This guide covers advanced usage patterns and features of IRPC in TypeScript.

## Schema Validation

IRPC supports input and output validation using Zod schemas, ensuring type safety at runtime:

```ts
import { z } from 'zod';
import { createModule } from '@irpclib/irpc';

const irpc = createModule({ name: 'user-service', version: '1.0.0' });

// Define schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const UserIdSchema = z.number().positive();

// Function with validation
export const getUser = irpc<{
  (id: number): Promise<{ id: number; name: string; email: string }>;
}>({
  name: 'getUser',
  description: 'Get a user by ID',
  schema: {
    input: [UserIdSchema],
    output: UserSchema,
  }
});

// Handler implementation with validation
irpc.construct(getUser, async (id: number) => {
  // At this point, id is guaranteed to be a positive number
  const user = await db.users.findById(id);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Return value will be validated against UserSchema
  return user;
});
```

## Context Management

IRPC provides context management for sharing request-scoped data across your application:

```ts
import { setContextProvider, setContext, getContext } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';

// Set up context provider (server-side)
setContextProvider(new AsyncLocalStorage());

// Set context values (in middleware or transport)
setContext('userId', 123);
setContext('requestId', 'req-abc-123');

// Get context values (in handlers)
const userId = getContext<number>('userId');
const requestId = getContext<string>('requestId', 'default-id');
```

## Error Handling

IRPC provides robust error handling for RPC calls with automatic propagation from server to client:

```ts
// Client-side error handling
try {
  const result = await someRemoteFunction(param);
  console.log('Success:', result);
} catch (error) {
  if (error instanceof Error) {
    console.error('RPC Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// Server-side error throwing
irpc.construct(someFunction, async (param) => {
  if (!isValid(param)) {
    throw new Error('Invalid parameter');
  }
  
  // Errors are automatically propagated to the client
  return await processData(param);
});
```

## Batch Operations

IRPC automatically batches multiple calls made in the same event loop tick to optimize network usage:

```ts
// These calls will be automatically batched into a single HTTP request
const [result1, result2, result3] = await Promise.all([
  function1(param1),
  function2(param2),
  function3(param3),
]);

// You can also manually control batching with delays
setTimeout(async () => {
  // This will be batched with other calls in the same tick
  const result = await function4(param4);
}, 10);
```

## Transports

You can create custom transports for different communication mechanisms. IRPC provides an HTTP transport by default, but you can implement your own:

```ts
import { IRPCTransport, IRPCCall, IRPCResponse } from '@irpclib/irpc';

class WebSocketTransport extends IRPCTransport {
  private ws: WebSocket;
  
  constructor(websocket: WebSocket, private factory: IRPCFactory) {
    super();
    this.ws = websocket;
  }
  
  async send(calls: IRPCCall[]): Promise<IRPCResponse[]> {
    // Send calls over WebSocket
    this.ws.send(JSON.stringify(calls));
    
    // Return responses (implementation depends on protocol)
    return new Promise((resolve) => {
      // Implementation would handle WebSocket message responses
      // and map them back to the appropriate IRPCResponse objects
    });
  }
}

// Use custom transport
const transport = new WebSocketTransport(webSocket, irpc);
irpc.use(transport);
```

## Working with Complex Types

IRPC supports complex nested types and arrays with full TypeScript support:

```ts
const complexFunction = irpc<{
  (users: { id: number; name: string; roles: string[] }[]): Promise<{
    processed: number;
    results: { id: number; status: 'success' | 'failed' }[];
  }>;
}>({
  name: 'processUsers'
});

irpc.construct(complexFunction, async (users) => {
  // Process array of complex objects
  const results = users.map(user => ({
    id: user.id,
    status: user.roles.includes('admin') ? 'success' : 'failed'
  }));
  
  return {
    processed: users.length,
    results
  };
});
```

## Middleware Pattern

Middleware in IRPC is designed to extract information from requests and make it available to your RPC function handlers through the context system. All RPC functions go through the same transport endpoint, so middleware focuses on providing contextual data that handlers can use to make their own decisions.

Here's an example of authentication middleware that extracts user information from an Authorization header:

```ts
import { HTTPTransport } from '@irpclib/http';
import { setContext, getContext } from '@irpclib/irpc';

// Authentication middleware - extracts user info from Auth header
const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Verify the token and extract user information
      const userId = await verifyToken(token); // Your token verification logic
      // Store user information in the context
      setContext('userId', userId);
      setContext('authToken', token);
    } catch (e) {
      // If token verification fails, we simply don't set context values
      // The handler will determine if authentication is needed
    }
  }
  // If there's no Authorization header or it's not Bearer, we don't set any context
};

// Apply middleware to transport
const transport = new HTTPTransport(
  {
    baseURL: 'http://localhost:3000',
    endpoint: '/rpc',
  },
  irpc
);

transport.use(authMiddleware);

// Handler that requires authentication
irpc.construct(someProtectedFunction, async (param) => {
  // Check if user is authenticated by looking for context values
  const userId = getContext<number>('userId');
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  // Proceed with function logic using the authenticated user
  // ... implementation
});
```

In this pattern:
1. Middleware extracts information from the request and stores it in the context
2. If extraction fails, middleware simply doesn't populate the context
3. Handlers check for required context values and throw appropriate errors when missing
4. This separation of concerns makes the system more flexible and easier to test

This approach works well because:
- All RPC functions go through the same transport endpoint
- Handlers can implement different requirements for context data
- Error handling is consistent with other RPC errors
- Context can be used for more than just authentication (e.g., request tracing, tenant information)

## Performance Considerations

When using IRPC, keep these performance factors in mind:

1. **Batching**: IRPC automatically batches calls made in the same event loop tick, reducing network overhead. You can leverage this by grouping related calls together.

2. **Validation**: Schema validation with Zod adds runtime overhead but improves reliability. Use it judiciously on critical paths.

3. **Context**: Context management has a small performance cost but provides great flexibility for request-scoped data.

4. **Transports**: Choose appropriate transports for your use case. HTTP is versatile but WebSocket might be better for real-time applications.

## Testing

Testing IRPC functions is straightforward with the ability to locally construct handlers:

```ts
// Unit test for handler
import { getUser } from './rpc/user-service';

// Mock the handler for testing
irpc.construct(getUser, async (id: number) => {
  if (id === 1) {
    return { id: 1, name: 'John Doe', email: 'john@example.com' };
  }
  throw new Error('User not found');
});

// Test
it('should get user by ID', async () => {
  const user = await getUser(1);
  expect(user.name).toBe('John Doe');
});
```

These patterns will help you get the most out of IRPC in your TypeScript applications.