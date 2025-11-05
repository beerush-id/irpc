---
title: Quick Reference
description: Quick reference guide for IRPC - essential syntax, patterns, and examples in one place.
head:
  - - meta
    - property: og:title
    - content: IRPC Quick Reference
  - - meta
    - property: og:description
    - content: Quick reference guide for IRPC - essential syntax, patterns, and examples in one place.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/quick-reference
  - - meta
    - name: keywords
    - content: irpc, quick reference, cheat sheet, syntax, examples
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: IRPC Quick Reference
  - - meta
    - name: twitter:description
    - content: Quick reference guide for IRPC - essential syntax, patterns, and examples in one place.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# Quick Reference

This guide provides essential IRPC syntax, patterns, and examples in one place for quick reference.

## Installation

```bash
# Core package
npm install @irpclib/irpc

# HTTP transport
npm install @irpclib/http

# Optional schema validation
npm install zod
```

## Basic Setup

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Create module
const irpc = createModule({ 
  name: 'my-module', 
  version: '1.0.0' 
});

// Configure transport
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: irpc.endpoint
}, irpc);
```

## Function Definition

```typescript
// Basic function
const myFunction = irpc<(param: string) => Promise<string>>({
  name: 'myFunction',
  description: 'Function description'
});

// With schema validation
import { z } from 'zod';

const createUser = irpc<{
  (data: { name: string; email: string }): Promise<User>;
}>({
  name: 'createUser',
  description: 'Create a new user',
  schema: {
    input: [z.object({
      name: z.string().min(1),
      email: z.string().email()
    })],
    output: UserSchema
  }
});
```

## Handler Implementation

```typescript
// Basic handler
irpc.construct(myFunction, async (param: string) => {
  return `Processed: ${param}`;
});

// With error handling
irpc.construct(getUser, async (id: number) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
});

// With validation
irpc.construct(createUser, async (data: CreateUserDto) => {
  // Input is already validated by schema
  const user = await userRepository.create(data);
  return user;
});
```

## Function Usage

```typescript
// Basic call
const result = await myFunction('hello');

// With error handling
try {
  const user = await getUser(123);
  console.log(user);
} catch (error) {
  console.error('Error:', error.message);
}

// Automatic batching
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getPostsByUser(123),
  getCommentsByUser(123)
]);
```

## Context Management

```typescript
import { setContext, getContext } from '@irpclib/irpc';

// Set context values
setContext('userId', 123);
setContext('requestId', 'req-abc-123');
setContext('authenticated', true);

// Get context values
const userId = getContext<number>('userId');
const requestId = getContext<string>('requestId', 'default-id');
const isAuthenticated = getContext<boolean>('authenticated', false);
```

## Middleware

```typescript
// Authentication middleware
const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token);
    
    setContext('userId', payload.userId);
    setContext('userRole', payload.role);
    setContext('authenticated', true);
  }
};

// Apply middleware
transport.use(authMiddleware);
```

## Module Configuration

```typescript
// Create module with configuration
const irpc = createModule({
  name: 'api',
  version: '1.0.0',
  timeout: 30000,
  description: 'Main API module'
});

// Update configuration
irpc.configure({
  version: '1.1.0',
  timeout: 60000
});

// Get module info
console.log(irpc.namespace); // { name: 'api', version: '1.1.0' }
console.log(irpc.endpoint()); // '/irpc/api/1.1.0'
```

## Common Patterns

### CRUD Operations

```typescript
// Define CRUD functions
const getUser = irpc<(id: number) => Promise<User>>({ name: 'getUser' });
const createUser = irpc<(data: CreateUserDto) => Promise<User>>({ name: 'createUser' });
const updateUser = irpc<(id: number, data: UpdateUserDto) => Promise<User>>({ name: 'updateUser' });
const deleteUser = irpc<(id: number) => Promise<void>>({ name: 'deleteUser' });

// Implement handlers
irpc.construct(getUser, async (id) => await userRepository.findById(id));
irpc.construct(createUser, async (data) => await userRepository.create(data));
irpc.construct(updateUser, async (id, data) => await userRepository.update(id, data));
irpc.construct(deleteUser, async (id) => await userRepository.delete(id));
```

### Batch Operations

```typescript
// Automatic batching
const results = await Promise.all([
  getUser(1),
  getUser(2),
  getUser(3)
]);

// Manual batching control
setTimeout(async () => {
  const results = await Promise.all([
    getUser(4),
    getUser(5)
  ]);
}, 10);
```

### Error Handling

```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
  }
}

// Throw custom errors
irpc.construct(validateUser, async (data: UserDto) => {
  if (!data.email?.includes('@')) {
    throw new ValidationError('Invalid email format', 'email');
  }
  return true;
});

// Handle errors on client
try {
  await validateUser(userData);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation error in ${error.field}: ${error.message}`);
  }
}
```

### Data Validation

```typescript
import { z } from 'zod';

// Define schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

// Use in function definition
const createUser = irpc<{
  (data: z.infer<typeof CreateUserSchema>): Promise<z.infer<typeof UserSchema>>;
}>({
  name: 'createUser',
  schema: {
    input: [CreateUserSchema],
    output: UserSchema
  }
});
```

## Server Setup

### Bun Server

```typescript
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';

// Set up context
setContextProvider(new AsyncLocalStorage());

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

### Express Server

```typescript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/rpc', async (req, res) => {
  const response = await transport.respond(new Request(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body)
  }));
  
  const body = await response.text();
  res.status(response.status).send(body);
});

app.listen(3000);
```

### Next.js API Route

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const response = await transport.respond(new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body)
    }));
    
    const body = await response.text();
    res.status(response.status).send(body);
  } else {
    res.status(200).send('IRPC Server Ready');
  }
}
```

## Client Usage

### React Hook

```typescript
import { useState, useEffect } from 'react';

function useUser(id: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    getUser(id)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);
  
  return { user, loading, error };
}
```

### Vue Composable

```typescript
import { ref } from 'vue';

export function useUser(id: number) {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  
  getUser(id)
    .then(data => user.value = data)
    .catch(err => error.value = err)
    .finally(() => loading.value = false);
  
  return { user, loading, error };
}
```

## Testing

### Unit Tests

```typescript
// Test setup
const testModule = createModule({ name: 'test', version: '1.0.0' });
const testFunction = testModule<(input: string) => Promise<string>>({
  name: 'testFunction'
});

// Mock implementation
testModule.construct(testFunction, async (input: string) => {
  return `mock: ${input}`;
});

// Test
it('should process input correctly', async () => {
  const result = await testFunction('hello');
  expect(result).toBe('mock: hello');
});
```

### Integration Tests

```typescript
// Test with actual transport
const response = await fetch('http://localhost:3000/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify([{
    id: '1',
    name: 'getUser',
    args: [123]
  }])
});

const data = await response.json();
expect(data[0].result).toEqual({ id: 123, name: 'Test User' });
```

## Performance Tips

```typescript
// Batch related operations
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getPostsByUser(123),
  getCommentsByUser(123)
]);

// Use selective field loading
const userBasic = await getUser(123, ['id', 'name', 'email']);
const userFull = await getUser(123, ['*']);

// Implement caching
const cache = new Map();
const cachedGetUser = async (id: number) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  const user = await getUser(id);
  cache.set(id, user);
  return user;
};
```

## Common Errors

```typescript
// "IRPC transport can not be found"
// Solution: Configure transport
const transport = new HTTPTransport({ endpoint: '/rpc' }, irpc);

// "IRPC can not be found"
// Solution: Register function on server
irpc.construct(myFunction, async (param) => {
  return processParam(param);
});

// "IRPC timeout"
// Solution: Increase timeout
irpc.configure({ timeout: 60000 });
```

## Type Definitions

```typescript
// Common interfaces
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

// Function types
type GetUserFunction = (id: number) => Promise<User>;
type CreateUserFunction = (data: CreateUserDto) => Promise<User>;
type UpdateUserFunction = (id: number, data: UpdateUserDto) => Promise<User>;
```

## Environment Variables

```bash
# Server configuration
API_BASE_URL=http://localhost:3000
RPC_TIMEOUT=30000
NODE_ENV=development

# Client configuration
API_BASE_URL=https://api.example.com
REQUEST_TIMEOUT=10000
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev:server": "bun run src/server/index.ts",
    "dev:client": "bun run src/client/app.ts",
    "build": "tsc",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  }
}
```
