# IRPC - Isomorphic Remote Procedure Call

This is a mono-repo workspace for the IRPC (Isomorphic Remote Procedure Call) project. IRPC is a revolutionary approach
to distributed computing that eliminates the cognitive overhead of network communication.

## What's inside?

This project includes the following **Workspaces** and **Packages**:

### Workspaces

- `**apps**` (**Apps**) - Apps are where your client-side applications live.
- `**packages**` (**Packages**) - Packages are where your shared libraries live.

### Packages

- [`@irpclib/irpc`](./packages/irpc) - The core IRPC library that provides the foundation for creating isomorphic remote
  procedure calls
- [`@irpclib/http`](./packages/http) - HTTP transport implementation for IRPC, enabling communication over HTTP/HTTPS

## About IRPC

IRPC enables developers to invoke remote functions with the same ergonomics as local function calls, abstracting away
the transport layer entirely.

Unlike traditional approaches like REST APIs, GraphQL, or gRPC, IRPC removes the need to think about endpoints,
serialization, or transport protocols. You focus on business logic while IRPC handles the communication complexity
transparently.
