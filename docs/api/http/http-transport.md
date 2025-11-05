---
title: HTTPTransport
description: API reference for the HTTPTransport class - HTTP-based transport implementation for IRPC with streaming support and middleware.
head:
  - - meta
    - property: og:title
    - content: HTTPTransport API Reference
  - - meta
    - property: og:description
    - content: API reference for the HTTPTransport class - HTTP-based transport implementation for IRPC with streaming support and middleware.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/api/http/http-transport
  - - meta
    - name: keywords
    - content: irpc, HTTPTransport, api, reference, http, transport, typescript, streaming, middleware
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: HTTPTransport API Reference
  - - meta
    - name: twitter:description
    - content: API reference for the HTTPTransport class - HTTP-based transport implementation for IRPC with streaming support and middleware.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# HTTPTransport

HTTP-based transport implementation for IRPC that provides request/response communication over HTTP with streaming support and middleware capabilities.

## Constructor

```typescript
import { HTTPTransport } from '@irpclib/http';

const transport = new HTTPTransport(config: HTTPTransportConfig, factory: IRPCFactory);
```

### Parameters

#### `config: HTTPTransportConfig`

Configuration object for the HTTP transport.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `endpoint` | `string` | Required | The endpoint path for RPC calls |
| `baseURL` | `string` | `undefined` | Base URL for the HTTP server |
| `headers` | `Record<string, string>` | `{ 'Content-Type': 'application/json' }` | Default headers to send with requests |

#### `factory: IRPCFactory`

The IRPC factory instance that this transport will be attached to.

## Properties

### `endpoint: string` (Read-only)

Returns the endpoint path configured for this transport.

```typescript
const transport = new HTTPTransport({ endpoint: '/api/rpc' }, factory);
console.log(transport.endpoint); // '/api/rpc'
```

### `url: string` (Read-only)

Returns the complete URL combining baseURL and endpoint.

```typescript
const transport = new HTTPTransport({
  endpoint: '/api/rpc',
  baseURL: 'https://api.example.com'
}, factory);

console.log(transport.url); // 'https://api.example.com/api/rpc'
```

### `headers: Record<string, string>`

Default headers that will be sent with every request. Can be modified after creation.

```typescript
const transport = new HTTPTransport({ endpoint: '/api/rpc' }, factory);

// Add custom headers
transport.headers['Authorization'] = 'Bearer token123';
transport.headers['X-API-Version'] = '1.0';
```

### `middlewares: HTTPMiddleware[]`

Array of middleware functions that will be executed for each incoming request.

```typescript
const transport = new HTTPTransport({ endpoint: '/api/rpc' }, factory);

// Add middleware
transport.use(authMiddleware);
transport.use(loggingMiddleware);
console.log(transport.middlewares.length); // 2
```

## Methods

### `use(middleware: HTTPMiddleware): HTTPTransport`

Adds a middleware function to the transport's middleware stack.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `middleware` | `HTTPMiddleware` | Middleware function to add |

#### Returns

Returns `this` for method chaining.

#### Example

```typescript
import { HTTPTransport } from '@irpclib/http';

const transport = new HTTPTransport({ endpoint: '/api/rpc' }, factory);

// Chain middleware
transport
  .use(authMiddleware)
  .use(loggingMiddleware)
  .use(rateLimitMiddleware);
```

### `send(calls: IRPCCall[]): Promise<IRPCResponse[]>`

Sends RPC calls to the remote server via HTTP POST request.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `calls` | `IRPCCall[]` | Array of RPC calls to send |

#### Returns

Returns a Promise that resolves to an array of RPC responses.

#### Example

```typescript
// This method is typically called automatically by the IRPC runtime
// when you invoke RPC functions on the client side

const result = await transport.send([
  new IRPCCall({ name: 'getUser', args: [123] }, resolve, reject),
  new IRPCCall({ name: 'getPosts', args: [123] }, resolve, reject)
]);
```

### `respond(req: Request): Promise<Response>`

Handles incoming HTTP requests and routes them to appropriate RPC handlers. This method is used on the server side.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `req` | `Request` | The incoming HTTP request |

#### Returns

Returns a Promise that resolves to an HTTP Response with streaming JSON data.

#### Example

```typescript
// Server-side usage
const server = Bun.serve({
  routes: {
    [transport.endpoint]: {
      GET: () => new Response('OK'),
      POST: (req) => transport.respond(req)
    }
  }
});
```

## Examples

### Basic Setup

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Create module
const irpc = createModule({ name: 'api', version: '1.0.0' });

// Create transport
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: '/rpc',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': '1.0'
  }
}, irpc);

// Transport is automatically attached to the module
```

### Client-Side Usage

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Create module and transport
const irpc = createModule({ name: 'user-service', version: '1.0.0' });
const transport = new HTTPTransport({
  baseURL: 'https://api.example.com',
  endpoint: irpc.endpoint
}, irpc);

// Define function
const getUser = irpc<(id: number) => Promise<User>>({
  name: 'getUser'
});

// Call the function (transport handles the HTTP request)
const user = await getUser(123);
```

### Server-Side Setup with Bun

```typescript
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { HTTPTransport } from '@irpclib/http';

// Set up context provider
setContextProvider(new AsyncLocalStorage());

// Create module and transport
const irpc = createModule({ name: 'api', version: '1.0.0' });
const transport = new HTTPTransport({
  endpoint: '/rpc'
}, irpc);

// Implement handlers
irpc.construct(getUser, async (id: number) => {
  return await userRepository.findById(id);
});

// Start server
Bun.serve({
  port: 3000,
  routes: {
    '/rpc': {
      GET: () => new Response('IRPC Server Ready'),
      POST: (req) => transport.respond(req)
    }
  }
});
```

### Server-Side Setup with Express

```typescript
import express from 'express';
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { HTTPTransport } from '@irpclib/http';

const app = express();

// Set up context provider
setContextProvider(new AsyncLocalStorage());

// Create module and transport
const irpc = createModule({ name: 'api', version: '1.0.0' });
const transport = new HTTPTransport({
  endpoint: '/rpc'
}, irpc);

// Middleware for JSON parsing
app.use(express.json());

// RPC endpoint
app.post('/rpc', async (req, res) => {
  const response = await transport.respond(new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body)
  }));
  
  const body = await response.text();
  res.status(response.status).send(body);
});

app.get('/rpc', (req, res) => {
  res.send('IRPC Server Ready');
});

app.listen(3000);
```

### Authentication Middleware

```typescript
import { setContext } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const payload = await verifyJWT(token);
      setContext('userId', payload.userId);
      setContext('userRole', payload.role);
      setContext('authenticated', true);
    } catch (error) {
      // Invalid token - don't set context
    }
  }
};

const transport = new HTTPTransport({ endpoint: '/rpc' }, irpc);
transport.use(authMiddleware);
```

### Logging Middleware

```typescript
import { setContext, getContext } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

const loggingMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  setContext('requestId', requestId);
  setContext('startTime', startTime);
  
  console.log(`[${requestId}] ${req.method} ${req.url}`);
  
  // Log response when request completes
  req.signal.addEventListener('abort', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Completed in ${duration}ms`);
  });
};

const transport = new HTTPTransport({ endpoint: '/rpc' }, irpc);
transport.use(loggingMiddleware);
```

### Rate Limiting Middleware

```typescript
import { setContext } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

const rateLimitMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const ip = req.headers.get('X-Forwarded-For') || 'unknown';
  const key = `rate_limit:${ip}`;
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  if (current > 100) { // 100 requests per minute
    throw new Error('Rate limit exceeded');
  }
  
  setContext('rateLimitRemaining', 100 - current);
};

const transport = new HTTPTransport({ endpoint: '/rpc' }, irpc);
transport.use(rateLimitMiddleware);
```

### Custom Headers per Request

```typescript
// Create transport with base headers
const transport = new HTTPTransport({
  baseURL: 'https://api.example.com',
  endpoint: '/rpc',
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0'
  }
}, irpc);

// Modify headers dynamically
transport.headers['Authorization'] = `Bearer ${await getAuthToken()}`;
transport.headers['X-Request-ID'] = generateRequestId();

// Now all requests will include these headers
const result = await someFunction();
```

### Error Handling

```typescript
import { HTTPTransport } from '@irpclib/http';

const transport = new HTTPTransport({
  baseURL: 'https://api.example.com',
  endpoint: '/rpc',
  headers: {
    'Authorization': 'Bearer token123'
  }
}, irpc);

// The transport automatically handles HTTP errors
// and converts them to RPC errors

try {
  const result = await someFunction();
} catch (error) {
  if (error.message.includes('401')) {
    // Handle authentication error
    console.log('Authentication failed');
  } else if (error.message.includes('429')) {
    // Handle rate limit error
    console.log('Rate limit exceeded');
  } else {
    // Handle other errors
    console.error('RPC Error:', error.message);
  }
}
```

## Streaming Behavior

HTTPTransport uses streaming responses for better performance:

1. **Request Streaming**: Multiple RPC calls are batched into a single HTTP request
2. **Response Streaming**: Individual responses are streamed as they become available
3. **Backpressure Handling**: The transport handles flow control automatically

```typescript
// These calls will be batched into one HTTP request
const [user1, user2, user3] = await Promise.all([
  getUser(1),
  getUser(2),
  getUser(3)
]);

// Responses stream back as each getUser() completes
// No need to wait for all to complete before receiving results
```

## Best Practices

1. **Base URL Configuration**: Always configure baseURL for production environments
2. **Authentication**: Use middleware for authentication rather than manual header management
3. **Error Handling**: Implement proper error handling for network and authentication errors
4. **Rate Limiting**: Use middleware to implement rate limiting on the server side
5. **Request Tracing**: Add request IDs for better debugging and monitoring
6. **HTTPS**: Always use HTTPS in production environments
7. **Timeout Configuration**: Set appropriate timeouts at the module level

## Related APIs

- [`HTTPTransportConfig`](./http-transport-config.md) - Configuration interface
- [`HTTPMiddleware`](./http-middleware.md) - Middleware type definition
- [`IRPCTransport`](../classes/irpc-transport.md) - Base transport class
- [`createModule()`](../core/create-module.md) - Module creation function