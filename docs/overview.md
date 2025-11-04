---
title: IRPC Overview
description: Learn about IRPC (Isomorphic Remote Procedure Call) - a paradigm shift in distributed systems that eliminates the cognitive overhead of network communication.
head:
  - - meta
    - property: og:title
      content: IRPC Overview
  - - meta
    - property: og:description
      content: Learn about IRPC (Isomorphic Remote Procedure Call) - a paradigm shift in distributed systems that eliminates the cognitive overhead of network communication.
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/overview
  - - meta
    - name: keywords
      content: irpc, overview, distributed systems, rpc, remote procedure call, isomorphic, typescript, javascript
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: IRPC Overview
  - - meta
    - name: twitter:description
      content: Learn about IRPC (Isomorphic Remote Procedure Call) - a paradigm shift in distributed systems that eliminates the cognitive overhead of network communication.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "IRPC Overview", "description": "Learn about IRPC (Isomorphic Remote Procedure Call) - a paradigm shift in distributed systems that eliminates the cognitive overhead of network communication.", "url": "https://irpc.anchorlib.dev/overview" }'
---

# Overview

**IRPC** (**Isomorphic Remote Procedure Call**) is a paradigm shift in distributed systems that eliminates the cognitive overhead of network communication. It enables developers to invoke remote functions with the same ergonomics as local function calls, abstracting away the transport layer entirely.

With **IRPC**, you write code that feels native:

```ts
import { readFile } from '/assets/fs.js';

// Remote invocation with local function ergonomics
readFile('file.txt', 'utf8').then(console.log);
```

Unlike conventional approaches such as **REST APIs**, **GraphQL**, or **gRPC**, **IRPC** removes the need to think about endpoints, serialization, or transport protocols. You focus on business logic while IRPC handles the communication complexity transparently.

::: tip Note

**IRPC** is a language-agnostic pattern. This documentation demonstrates the **TypeScript** implementation, but the core concepts apply to any language supporting the [IRPC Specification](/specification).

:::

## The Problem: Communication Overhead

Modern distributed systems suffer from a fundamental abstraction leak: the network boundary becomes a primary concern rather than an implementation detail. This forces developers to constantly context-switch between business logic and communication plumbing.

Traditional approaches impose cognitive overhead:

- **Endpoint Design**: Mapping business operations to HTTP resources (REST)
- **Query Construction**: Building complex data retrieval queries (GraphQL)
- **Contract Definition**: Maintaining service definitions and proto files (gRPC)
- **Serialization Logic**: Manual JSON marshaling/unmarshaling
- **Error Translation**: Converting transport errors to domain errors

This overhead fragments development focus. A simple operation like reading a file transforms from a one-liner locally to a multi-step distributed process involving endpoint design, payload validation, error handling, and response parsing.

### Conventional REST Implementation

```ts
// Client: Manual request construction and response handling
const response = await fetch('/api/files/readFile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ path: 'file.txt', encoding: 'utf8' }),
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const { content } = await response.json();
console.log(content);
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

## The Solution: Communication Abstraction

IRPC reestablishes the network as a true abstraction layer. The architecture follows a familiar pattern inspired by Node.js:

- **IRPC Runtime** ≈ **Node.js Core**: Orchestrates execution and manages the lifecycle
- **Transport Layer** ≈ **libuv**: Handles low-level communication details
- **Function Interfaces** ≈ **Node APIs**: Provide familiar, ergonomic interfaces

This separation of concerns allows developers to maintain flow state while working with distributed systems. IRPC transparently manages:

- Request/response serialization and deserialization
- Network error detection and recovery
- Call correlation and timeout handling
- Request batching and optimization
- End-to-end type safety and validation

### IRPC Implementation

Define function contracts in shared modules:

```ts
import { irpc } from '@irpclib/irpc';

export const readFile = irpc<(path: string, encoding?: string) => Promise<string>>({
  name: 'readFile',
});
```

Implement handlers on the server:

```ts
import { readFile as nodeReadFile } from 'node:fs/promises';
import { irpc } from '@irpclib/irpc';
import { readFile } from './fs';

irpc.construct(readFile, async (path, encoding) => {
  return await nodeReadFile(path, encoding);
});
```

Invoke functions from the client:

```ts
import { readFile } from '/assets/fs.js';

const content = await readFile('file.txt', 'utf8');
console.log(content);
```

## Developer Experience Benefits

IRPC delivers productivity gains across the entire development lifecycle:

### Cognitive Load Reduction
- **Single Mental Model**: Functions work the same regardless of execution location
- **No Context Switching**: Stay in the problem domain, not the transport domain
- **Intuitive Debugging**: Stack traces and error handling work as expected

### Boilerplate Elimination
- **Zero Endpoint Configuration**: Functions are automatically discoverable and invocable
- **No Contract Synchronization**: TypeScript types provide the single source of truth
- **Automatic Serialization**: Focus on data structures, not wire formats

### Type Safety
- **End-to-End Type Checking**: Compile-time validation from client to server
- **Refactoring Safety**: IDE support for cross-boundary refactoring
- **Self-Documenting APIs**: Function signatures serve as documentation

### Performance Optimization
- **Intelligent Batching**: Automatic request coalescing for network efficiency
- **Connection Reuse**: Transport layer manages connection pooling
- **Lazy Loading**: Tree-shakable imports minimize bundle size

### Operational Simplicity
- **Unified Error Handling**: Promise-based error propagation across boundaries
- **Protocol Agnosticism**: Switch transports without modifying business logic
- **Observability**: Built-in tracing and monitoring capabilities

## Architectural Principles

IRPC is guided by several core principles:

### Isomorphism
The same function signature and behavior regardless of execution context. This enables seamless local-to-remote transitions without code changes.

### Transport Agnosticism
Business logic remains decoupled from transport mechanisms. HTTP, WebSockets, message queues, or future protocols can be swapped without impacting function implementations.

### Type Preservation
Type information flows across boundaries, enabling compile-time guarantees and IDE support for distributed systems.

### Ergonomic Design
The API prioritizes developer experience, making distributed systems feel like local development.

### Performance by Default
Intelligent batching, connection reuse, and optimization are built-in rather than add-on features.

## Ecosystem Integration

IRPC complements rather than replaces existing tools:

- **Build Systems**: Integrates with bundlers for optimal code splitting
- **Testing Frameworks**: Enables straightforward unit testing without network mocking
- **Monitoring Tools**: Provides hooks for observability and performance tracking
- **Development Tools**: Offers IDE extensions for enhanced development experience

## Migration Path

IRPC can be adopted incrementally:

1. **New Features**: Start with IRPC for new functionality
2. **Critical Paths**: Migrate high-value, frequently changed APIs
3. **Legacy Systems**: Gradually replace complex REST endpoints
4. **Microservices**: Use IRPC for inter-service communication

---

IRPC represents a return to fundamentals: functions should be functions, regardless of where they execute. By treating the network as what it should be—an implementation detail—developers can focus on solving problems rather than managing communication infrastructure.
