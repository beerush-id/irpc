---
title: API Reference
description: Complete API reference for IRPC (Isomorphic Remote Procedure Call) - detailed documentation of all classes, functions, types, and interfaces.
head:
  - - meta
    - property: og:title
      content: IRPC API Reference
  - - meta
    - property: og:description
      content: Complete API reference for IRPC (Isomorphic Remote Procedure Call) - detailed documentation of all classes, functions, types, and interfaces.
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/api/
  - - meta
    - name: keywords
      content: irpc, api, reference, documentation, typescript, functions, classes, interfaces
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: IRPC API Reference
  - - meta
    - name: twitter:description
      content: Complete API reference for IRPC (Isomorphic Remote Procedure Call) - detailed documentation of all classes, functions, types, and interfaces.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "IRPC API Reference", "description": "Complete API reference for IRPC (Isomorphic Remote Procedure Call) - detailed documentation of all classes, functions, types, and interfaces.", "url": "https://irpc.anchorlib.dev/api/" }'
---

# API Reference

This section provides comprehensive documentation for all IRPC APIs, including core functions, classes, types, and interfaces.

## Core Package (@irpclib/irpc)

### Functions

- [`createModule()`](./core/create-module.md) - Create a new IRPC module for organizing RPC functions
- [`batch()`](./core/batch.md) - Manually batch multiple IRPC calls together
- [`createContext()`](./core/create-context.md) - Create a new context map for request-scoped data
- [`setContext()`](./core/set-context.md) - Set a value in the current context
- [`getContext()`](./core/get-context.md) - Get a value from the current context
- [`withContext()`](./core/with-context.md) - Execute a function within a specific context
- [`setContextProvider()`](./core/set-context-provider.md) - Set the global context provider

### Classes

- [`IRPCCall`](./classes/irpc-call.md) - Represents an individual RPC call with promise-like behavior
- [`IRPCTransport`](./classes/irpc-transport.md) - Abstract base class for implementing custom transports

### Types and Interfaces

- [`IRPCFactory`](./types/irpc-factory.md) - Interface for creating and managing RPC functions
- [`IRPCModule`](./types/irpc-module.md) - Configuration interface for IRPC modules
- [`IRPCHandler`](./types/irpc-handler.md) - Type definition for RPC handler functions
- [`IRPCSpec`](./types/irpc-spec.md) - Specification interface for RPC functions
- [`IRPCHost`](./types/irpc-host.md) - Host definition combining specification with execution details
- [`IRPCContext`](./types/irpc-context.md) - Context storage mechanism for RPC operations
- [`IRPCNamespace`](./types/irpc-namespace.md) - Namespace information for IRPC modules
- [`IRPCSchema`](./types/irpc-schema.md) - Schema definition for input/output validation
- [`IRPCRequest`](./types/irpc-request.md) - Request format for RPC calls
- [`IRPCResponse`](./types/irpc-response.md) - Response format for RPC calls
- [`IRPCPayload`](./types/irpc-payload.md) - Payload format for RPC calls
- [`IRPCData`](./types/irpc-data.md) - Data types supported in IRPC communications
- [`IRPCParseResult`](./types/irpc-parse-result.md) - Result type for schema validation operations

## HTTP Transport Package (@irpclib/http)

### Classes

- [`HTTPTransport`](./http/http-transport.md) - HTTP-based transport implementation for IRPC

### Types

- [`HTTPTransportConfig`](./http/http-transport-config.md) - Configuration interface for HTTP transport
- [`HTTPMiddleware`](./http/http-middleware.md) - Middleware function type for HTTP transport

## Quick Reference

### Basic Setup

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Create module
const irpc = createModule({ name: 'my-module', version: '1.0.0' });

// Define function
const myFunction = irpc<(param: string) => Promise<string>>({
  name: 'myFunction'
});

// Configure transport (client-side)
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: irpc.endpoint
}, irpc);

// Implement handler (server-side)
irpc.construct(myFunction, async (param) => {
  return `Hello, ${param}!`;
});
```

### Common Patterns

- [Module Organization](../typescript/usage.md#working-with-modules)
- [Schema Validation](../typescript/usage.md#schema-validation)
- [Context Management](../typescript/usage.md#context-management)
- [Error Handling](../typescript/usage.md#error-handling)
- [Batch Operations](../typescript/usage.md#batch-operations)
- [Custom Transports](../typescript/usage.md#transports)

## Migration Guides

- [From REST](../guides/migration/rest.md)
- [From GraphQL](../guides/migration/graphql.md)
- [From gRPC](../guides/migration/grpc.md)

## Related Documentation

- [Getting Started](../typescript/getting-started.md)
- [Usage Patterns](../typescript/usage.md)
- [Specification](../specification.md)