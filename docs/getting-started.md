---
title: Getting Started with IRPC
description: Learn how to create your first IRPC module and make remote function calls as naturally as local ones. Step-by-step guide for setting up IRPC in your TypeScript project.
head:
  - - meta
    - property: og:title
    - content: Getting Started with IRPC
  - - meta
    - property: og:description
    - content: Learn how to create your first IRPC module and make remote function calls as naturally as local ones.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/getting-started
  - - meta
    - name: keywords
    - content: irpc, getting started, tutorial, typescript, rpc, setup, installation, remote procedure call
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: Getting Started with IRPC
  - - meta
    - name: twitter:description
    - content: Learn how to create your first IRPC module and make remote function calls as naturally as local ones.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
    - innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Getting Started with IRPC", "description": "Learn how to create your first IRPC module and make remote function calls as naturally as local ones.", "url": "https://irpc.anchorlib.dev/getting-started" }'
---

# Getting Started with IRPC

IRPC (Isomorphic Remote Procedure Call) allows you to call remote functions as naturally as local ones. This guide will walk you through creating your first IRPC application from scratch.

## What You'll Build

We'll create a simple user management API with the following functions:
- `getUser(id)` - Retrieve a user by ID
- `createUser(data)` - Create a new user
- `updateUser(id, data)` - Update an existing user

## Prerequisites

- Node.js 16+ or Bun 1.0+
- TypeScript 4.5+ (recommended)
- Basic knowledge of async/await

## Installation

First, install the required packages:

```bash
# Core IRPC package
npm install @irpclib/irpc

# HTTP transport for communication
npm install @irpclib/http

# Optional: for schema validation
npm install zod

# TypeScript types (if using TypeScript)
npm install -D typescript @types/node
```

## Project Structure

Create the following project structure:

```
my-irpc-app/
├── src/
│   ├── services/
│   │   └── user-service.ts    # IRPC functions and module
│   ├── server/
│   │   └── index.ts          # Server setup
│   ├── client/
│   │   └── app.ts            # Client usage
│   └── types/
│       └── user.ts            # Type definitions
├── package.json
└── tsconfig.json
```

## Step 1: Define Types

Create type definitions for your user data:

```typescript
// src/types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}
```

## Step 2: Create IRPC Module

Create the user service module with function definitions:

```typescript
// src/services/user-service.ts
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';
import { z } from 'zod';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user';

// Create the module
export const userService = createModule({
  name: 'user-service',
  version: '1.0.0',
  description: 'User management API'
});

// Define validation schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
});

// Define IRPC functions
export const getUser = userService<(id: number) => Promise<User>>({
  name: 'getUser',
  description: 'Get a user by ID',
  schema: {
    input: [z.number().positive()],
    output: UserSchema
  }
});

export const createUser = userService<(data: CreateUserDto) => Promise<User>>({
  name: 'createUser',
  description: 'Create a new user',
  schema: {
    input: [CreateUserSchema],
    output: UserSchema
  }
});

export const updateUser = userService<(id: number, data: UpdateUserDto) => Promise<User>>({
  name: 'updateUser',
  description: 'Update an existing user',
  schema: {
    input: [z.number().positive(), UpdateUserSchema],
    output: UserSchema
  }
});

// Configure transport (for client-side usage)
export const userTransport = new HTTPTransport({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  endpoint: userService.endpoint,
  headers: {
    'Content-Type': 'application/json'
  }
}, userService);
```

## Step 3: Implement Server Handlers

Create the server implementation:

```typescript
// src/server/index.ts
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { userService, getUser, createUser, updateUser } from '../services/user-service';
import { userTransport } from '../services/user-service';

// Set up context provider for request-scoped data
setContextProvider(new AsyncLocalStorage());

// Mock database (in real app, use your database)
const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];
let nextId = 2;

// Implement handlers
userService.construct(getUser, async (id: number) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
});

userService.construct(createUser, async (data: CreateUserDto) => {
  const user: User = {
    id: nextId++,
    name: data.name,
    email: data.email,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(user);
  return user;
});

userService.construct(updateUser, async (id: number, data: UpdateUserDto) => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...data,
    updatedAt: new Date()
  };
  
  return users[userIndex];
});

// Start server (using Bun)
Bun.serve({
  port: 3000,
  routes: {
    '/rpc': {
      GET: () => new Response('IRPC Server Ready'),
      POST: (req) => userTransport.respond(req)
    }
  }
});

console.log('IRPC Server running on http://localhost:3000');
```

## Step 4: Use IRPC Functions on Client

Create client code to use the IRPC functions:

```typescript
// src/client/app.ts
import { getUser, createUser, updateUser } from '../services/user-service';

async function demonstrateIRPC() {
  try {
    console.log('=== IRPC Demo ===');
    
    // Get existing user
    console.log('\n1. Getting user...');
    const user = await getUser(1);
    console.log('User:', user);
    
    // Create new user
    console.log('\n2. Creating new user...');
    const newUser = await createUser({
      name: 'Jane Smith',
      email: 'jane@example.com'
    });
    console.log('New user:', newUser);
    
    // Update user
    console.log('\n3. Updating user...');
    const updatedUser = await updateUser(1, {
      name: 'John Updated'
    });
    console.log('Updated user:', updatedUser);
    
    // Demonstrate automatic batching
    console.log('\n4. Batching multiple calls...');
    const [user1, user2, user3] = await Promise.all([
      getUser(1),
      createUser({ name: 'Alice', email: 'alice@example.com' }),
      createUser({ name: 'Bob', email: 'bob@example.com' })
    ]);
    console.log('Batched results:', { user1, user2, user3 });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the demo
demonstrateIRPC();
```

## Step 5: Run the Application

1. **Start the server**:
```bash
bun run src/server/index.ts
# or
npx tsx src/server/index.ts
```

2. **Run the client** (in another terminal):
```bash
bun run src/client/app.ts
# or
npx tsx src/client/app.ts
```

You should see output showing the IRPC calls working seamlessly!

## Key Concepts Explained

### 1. Module
A module is a container for related IRPC functions. It provides:
- Namespace isolation
- Version management
- Transport configuration
- Function registry

### 2. Function Definition
IRPC functions are defined as typed stubs that:
- Specify input/output types
- Include optional validation schemas
- Can be called like regular functions
- Execute remotely when transport is configured

### 3. Transport
The transport layer handles:
- Network communication
- Request/response serialization
- Automatic batching
- Error propagation

### 4. Handler Implementation
Handlers are the server-side implementations that:
- Contain actual business logic
- Receive validated inputs
- Return typed outputs
- Throw errors that propagate to clients

## Benefits Demonstrated

1. **Type Safety**: Full TypeScript support from client to server
2. **Automatic Batching**: Multiple calls in a single HTTP request
3. **Zero Boilerplate**: No manual endpoint management or serialization
4. **Schema Validation**: Runtime validation with Zod
5. **Error Handling**: Natural Promise-based error propagation

## Next Steps

- [API Reference](../api/) - Detailed API documentation
- [Usage Patterns](../typescript/usage.md) - Advanced usage patterns
- [Performance Guide](../guides/performance.md) - Optimization techniques
- [Migration from REST](../guides/migration/rest.md) - Convert existing APIs

This is just the beginning. IRPC allows you to build complex distributed systems while maintaining the simplicity of local function calls.