# Overview

**IRPC** (**Isomorphic Remote Procedure Call**) is a revolutionary approach to cross-boundary communication that eliminates the complexity traditionally associated with network APIs. It allows developers to call remote functions as naturally as local ones, removing the friction between client and server interactions.

With **IRPC**, you can write code like this:

```ts
import { readFile } from '/assets/fs.js';

// Calling a remote function feels exactly like a local one
readFile('file.txt', 'utf8').then(console.log);
```

Unlike traditional approaches such as **REST APIs**, **GraphQL**, or **gRPC**, **IRPC** doesn't require you to think about paths, payloads, or serialization. You simply call functions as you would locally, and **IRPC** handles all the networking complexity behind the scenes.

::: tip Note

**IRPC** is a pattern that can be implemented in various languages. This overview uses the **TypeScript** implementation as an example. For details on the specification and implementations in other languages, please see the [Specification](/specification).

:::

## The Problem

Modern application development suffers from a fundamental disconnect: the communication layer has become a boundary that impedes productivity rather than enabling it.

Traditional solutions force developers to think about:

- How to structure API endpoints (REST)
- How to craft complex queries (GraphQL)
- How to define service contracts (gRPC)
- How to handle serialization and deserialization
- How to manage error states across network boundaries

This complexity diverts attention from solving actual business problems. For example, reading a file locally is as simple as `readFile()`, but doing the same over a network requires creating dedicated endpoints, defining payloads, handling HTTP status codes, and managing serialization.

### Traditional REST API Approach

```ts
// Client side - Complex fetch with specific URL and payload
const response = await fetch('/api/files/readFile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    path: 'file.txt',
    encoding: 'utf8',
  }),
});

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

const result = await response.json();
console.log(result.content);
```

```ts
// Server side - Need to define routes and handle requests
app.post('/api/files/readFile', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.path || !req.body.encoding) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Actually read the file
    const content = await fs.readFile(req.body.path, req.body.encoding);

    // Format response
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## The Solution

IRPC reimagines cross-boundary communication by abstracting away all networking concerns. Think of IRPC as Node.js, Transport as libuv, and Functions as Node APIs:

- **IRPC** acts like **_Node.js_** - it's the runtime that orchestrates everything
- **Transport** acts like **_libuv_** - it's the underlying mechanism that handles the actual communication
- **Functions** act like **_Node APIs_** (e.g., `fs.readFile`) - they're the familiar interfaces you use

This architecture allows developers to focus entirely on solving problems rather than wrestling with communication protocols. IRPC automatically handles:

- Serialization and deserialization
- Network error handling
- Request/response matching
- Load balancing and batching
- Type safety and validation

### IRPC Approach

First, you define your function stub in a header file (e.g., `/assets/fs.ts`):

```ts
import { irpc } from '@irpclib/irpc';

export const readFile = irpc<(path: string, encoding?: string) => Promise<string>>({
  name: 'readFile',
});
```

And implement it on the server side:

```ts
// Server side - Just implement the function
import { readFile as nodeReadFile } from 'node:fs/promises';
import { irpc } from '@irpclib/irpc';
import { readFile } from './fs';

irpc.construct(readFile, async (path, encoding) => {
  // Actual implementation using Node.js fs module
  return await nodeReadFile(path, encoding);
});
```

Then use it on the client side:

```ts
// Client side - Simple function call
import { readFile } from '/assets/fs.js';

const content = await readFile('file.txt', 'utf8');
console.log(content);
```

## Key Benefits

1. **Unified Developer Experience**: Write remote calls as naturally as local ones with the same code working seamlessly on both client and server
2. **Reduced Complexity**: Eliminate boilerplate API code and configuration
3. **Type Safety**: Full TypeScript support with end-to-end type checking
4. **Performance**: Automatic batching and optimization of network requests
5. **Flexibility**: Pluggable transport layer supporting HTTP, WebSockets, and more
6. **Distribution**: Package and distribute IRPC functions as libraries with semantic versioning for easy reuse across projects
7. **Tree-Shakable**: Import only the functions you need, allowing bundlers to eliminate unused code for optimal bundle size
8. **Automatic Serialization**: No more manual JSON serialization/deserialization or request/response parsing
9. **Built-in Error Handling**: Consistent error handling without dealing with HTTP status codes
10. **Protocol Agnostic**: Switch between HTTP, WebSockets, or other transports without changing your business logic

IRPC dramatically reduces development time across the entire project lifecycle:

### API Design & Implementation

- No need to design REST endpoints or GraphQL schemas
- Eliminates API contract definition and maintenance
- No OpenAPI/Swagger documentation to create and synchronize

### Client-Server Communication

- No fetch/axios configuration for every remote call
- Eliminates manual JSON serialization/deserialization
- No HTTP status code handling throughout the codebase
- No CORS configuration or network proxy setup

### Error Handling & Debugging

- Single consistent error handling pattern
- No mapping HTTP status codes to business errors
- Eliminates network layer debugging and traffic inspection

### Testing & Quality Assurance

- Easy mocking by replacing function implementations
- No need to mock HTTP requests/responses
- Direct function calls in unit tests without network overhead
- Less boilerplate code to review in code reviews

### Development & Onboarding

- Functions are self-documenting with clear signatures
- No separate API documentation to maintain
- Rapid prototyping without stubbing endpoints
- Faster onboarding for new team members

### Deployment & Operations

- No coordination needed between client and server API deployments
- Functions can be deployed and versioned independently
- Centralized function call tracing and monitoring
- No separate API versioning strategy to maintain

### Refactoring & Maintenance

- Renaming functions automatically updates all callers (with proper IDE support)
- Changing function signatures provides compile-time safety
- No need to update multiple API endpoints when logic changes
- Eliminates duplicate caching or rate limiting logic

By treating network communication as what it should be - an implementation detail rather than a primary concern - IRPC unlocks a new level of developer productivity and code simplicity.
