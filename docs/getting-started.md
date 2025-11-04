# Getting Started with IRPC

IRPC (Isomorphic Remote Procedure Call) allows you to call remote functions as naturally as local ones. This guide will walk you through creating your first IRPC module.

## Installation

First, install the core IRPC package:

```bash
npm install @irpclib/irpc
```

For HTTP transport (most common), also install:

```bash
npm install @irpclib/http
```

## Creating Your First IRPC Module

Let's create a simple file system module that can read files remotely.

### 1. Define the Module

Create a file `fs.ts`:

```ts
import { irpc } from '@irpclib/irpc';
import { IRPCHttpTransport } from '@irpclib/http';

// Create the module
export const fs = irpc.configure({
  name: 'fs',
  version: '1.0.0'
});

// Define the function signature
export const readFile = fs<(path: string, encoding: string) => Promise<string>>({
  name: 'readFile',
  description: 'Read a file from the filesystem'
});

// Set up the transport (for client-side)
export const transport = new IRPCHttpTransport(
  {
    baseURL: 'http://localhost:3000',
    endpoint: '/rpc',
  },
  fs
);

fs.use(transport);
```

### 2. Implement the Handler (Server-side)

In your server file:

```ts
import { fs, readFile } from './fs';
import { setContextStore } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';

// Set up context store
setContextStore(new AsyncLocalStorage());

// Implement the actual function
fs.construct(readFile, async (path, encoding) => {
  // Your actual implementation here
  const fs = await import('fs/promises');
  return await fs.readFile(path, encoding);
});

// Serve the RPC endpoint
Bun.serve({
  routes: {
    ...transport.serve(),
  },
});
```

### 3. Use the Function (Client-side)

Now you can use the function naturally:

```ts
import { readFile } from './fs';

// This feels like a local function call but executes remotely
const content = await readFile('/path/to/file.txt', 'utf8');
console.log(content);
```

## Key Concepts

1. **Module**: A container for related functions
2. **Function**: A typed stub that can be called locally but executes remotely
3. **Transport**: The mechanism that carries calls between client and server
4. **Handler**: The server-side implementation of a function

## Benefits

- **No API endpoints to manage**: Functions are automatically exposed
- **Full TypeScript support**: End-to-end type safety
- **Automatic serialization**: No manual JSON handling
- **Error handling**: Native Promise-based error handling
- **Batching**: Multiple calls can be batched automatically for efficiency

This is just the beginning. IRPC allows you to build complex distributed systems while maintaining the simplicity of local function calls.