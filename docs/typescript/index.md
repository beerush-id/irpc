# IRPC TypeScript Implementation

IRPC (Isomorphic Remote Procedure Call) is a TypeScript library that enables seamless remote procedure calls between client and server with a unified API. This documentation covers the core concepts and usage patterns of IRPC in TypeScript.

## What is IRPC?

IRPC is a modern RPC framework designed for TypeScript applications. It allows you to define functions that can be called seamlessly across network boundaries while maintaining type safety and the familiar syntax of local function calls.

Unlike traditional RPC systems, IRPC provides a truly isomorphic experience where your function definitions can be shared between client and server without code duplication or complex build processes.

## Core Concepts

IRPC is built around several core concepts that work together to provide a seamless RPC experience:

1. **Module** - The container for your RPC functions. Modules group related functionality and can be configured with their own transport mechanisms. You can organize your application with a single module for all functions or multiple modules for different domains.

2. **Function** - The stub definitions of your remote procedures. These are the client-side representations of your functions that handle serialization and network communication.

3. **Transport** - The communication channel between client and server. Each module can have its own transport, allowing for flexible deployment patterns. HTTP is the most commonly used transport, but you can implement custom transports for other protocols.

4. **Handler** - The server-side implementation of your functions. Handlers contain the actual business logic that executes when an RPC call is made.

## Architecture Overview

IRPC follows a client-server architecture where functions are defined as stubs on the client side and implemented as handlers on the server side. The transport layer handles the communication between the two, making remote calls appear as if they were local function calls.

![IRPC Schema](/diagrams/schema.svg)

## Key Features

- **Type Safety** - Full TypeScript support with end-to-end type checking
- **Isomorphic Implementation** - Works seamlessly on both client and server
- **Flexible Transport** - Pluggable transport mechanisms (HTTP, WebSocket, etc.)
- **Schema Validation** - Built-in Zod schema validation for inputs and outputs
- **Context Management** - Request-scoped data sharing with AsyncLocalStorage
- **Automatic Batching** - Optimizes network usage by batching multiple calls
- **Promise-Based API** - Familiar async/await interface

## Next Steps

- [Installation Guide](installation.md) - How to install IRPC in your project
- [Getting Started](getting-started.md) - Basic usage and setup
- [Usage Patterns](usage.md) - Advanced usage and patterns