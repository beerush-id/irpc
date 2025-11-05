---
title: Frequently Asked Questions
description: Comprehensive FAQ covering common questions about IRPC, from basic usage to advanced patterns and troubleshooting.
head:
  - - meta
    - property: og:title
    - content: IRPC FAQ
  - - meta
    - property: og:description
    - content: Comprehensive FAQ covering common questions about IRPC, from basic usage to advanced patterns and troubleshooting.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/guides/faq
  - - meta
    - name: keywords
    - content: irpc, faq, questions, troubleshooting, help, guide
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: IRPC FAQ
  - - meta
    - name: twitter:description
    - content: Comprehensive FAQ covering common questions about IRPC, from basic usage to advanced patterns and troubleshooting.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# Frequently Asked Questions

This FAQ covers common questions about IRPC, from basic setup to advanced usage patterns.

## Getting Started

### What is IRPC?

IRPC (Isomorphic Remote Procedure Call) is a TypeScript library that enables seamless remote procedure calls between client and server with a unified API. It allows you to call remote functions with the same ergonomics as local function calls.

### How is IRPC different from REST?

| Aspect | REST | IRPC |
|--------|------|-------|
| **API Design** | URL endpoints and HTTP methods | Function definitions |
| **Type Safety** | Manual type definitions | End-to-end TypeScript support |
| **Batching** | Manual implementation | Automatic batching |
| **Error Handling** | HTTP status codes | Promise-based errors |
| **Boilerplate** | Request/response handling | Zero boilerplate |

### What are the system requirements?

- **Node.js**: 16.0+ or Bun 1.0+
- **TypeScript**: 4.5+ (recommended)
- **Browser**: Modern browsers with ES2020 support

### How do I install IRPC?

```bash
# Core package
npm install @irpclib/irpc

# HTTP transport (most common)
npm install @irpclib/http

# Optional: for schema validation
npm install zod
```

### Can I use IRPC with JavaScript instead of TypeScript?

Yes! IRPC works with plain JavaScript, though you'll miss out on type safety benefits:

```javascript
import { createModule } from '@irpclib/irpc';

const irpc = createModule({ name: 'api', version: '1.0.0' });
const myFunction = irpc({ name: 'myFunction' });
```

## Usage Questions

### How do I create my first IRPC function?

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// 1. Create module
const irpc = createModule({ name: 'my-app', version: '1.0.0' });

// 2. Define function
const greetUser = irpc<(name: string) => Promise<string>>({
  name: 'greetUser'
});

// 3. Configure transport (client-side)
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: irpc.endpoint
}, irpc);

// 4. Implement handler (server-side)
irpc.construct(greetUser, async (name: string) => {
  return `Hello, ${name}!`;
});

// 5. Use function
const message = await greetUser('Alice'); // "Hello, Alice!"
```

### How does automatic batching work?

IRPC automatically batches calls made within the same event loop tick:

```typescript
// These calls are automatically batched into one HTTP request
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getPostsByUser(123),
  getCommentsByUser(123)
]);
```

### Can I control batching manually?

Yes, you can use the `batch` function:

```typescript
import { batch } from '@irpclib/irpc';

// Manually batch with custom delay
batch(call1, handler, 100); // 100ms delay
```

### How do I handle errors?

IRPC uses Promise-based error handling:

```typescript
try {
  const result = await someFunction(param);
  console.log('Success:', result);
} catch (error) {
  if (error.message.includes('timeout')) {
    console.log('Request timed out');
  } else if (error.message.includes('validation')) {
    console.log('Invalid input');
  } else {
    console.log('Other error:', error.message);
  }
}
```

## Architecture Questions

### Can I use multiple modules?

Yes, you can create multiple modules for different domains:

```typescript
const userModule = createModule({ name: 'users', version: '1.0.0' });
const productModule = createModule({ name: 'products', version: '1.0.0' });

const getUser = userModule<(id: number) => Promise<User>>({
  name: 'getUser'
});

const getProduct = productModule<(id: number) => Promise<Product>>({
  name: 'getProduct'
});
```

### Can I use different transports for different modules?

Yes, each module can have its own transport:

```typescript
const userTransport = new HTTPTransport({
  baseURL: 'https://user-api.example.com',
  endpoint: userModule.endpoint
}, userModule);

const productTransport = new HTTPTransport({
  baseURL: 'https://product-api.example.com',
  endpoint: productModule.endpoint
}, productModule);
```

### How do I implement authentication?

Use middleware to extract authentication data and store it in context:

```typescript
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

transport.use(authMiddleware);
```

### How do I implement authorization?

Check context values in your handlers:

```typescript
irpc.construct(deleteUser, async (id: number) => {
  const userId = getContext<number>('userId');
  const userRole = getContext<string>('userRole');
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  if (userRole !== 'admin' && userId !== id) {
    throw new Error('Insufficient permissions');
  }
  
  return await userService.delete(id);
});
```

## Performance Questions

### Is IRPC faster than REST?

Yes, IRPC can be significantly faster due to:

- **Automatic Batching**: Multiple calls in one HTTP request
- **Connection Reuse**: Persistent connections
- **Reduced Overhead**: No manual JSON parsing/stringifying
- **Optimized Serialization**: Efficient data handling

### How can I optimize performance?

1. **Batch Related Calls**: Use `Promise.all()` for parallel operations
2. **Implement Caching**: Cache frequently accessed data
3. **Use Selective Fields**: Only fetch needed data
4. **Optimize Payloads**: Minimize data transfer
5. **Connection Pooling**: Use multiple connections for high concurrency

### Does IRPC support streaming?

The HTTP transport supports streaming responses:

```typescript
// Responses stream back as they become available
const [result1, result2, result3] = await Promise.all([
  slowFunction1(),
  slowFunction2(),
  slowFunction3()
]);
// result1 arrives first, then result2, etc.
```

## Integration Questions

### Can I use IRPC with React?

Yes! IRPC works great with React:

```typescript
// api/user.ts
export const getUser = irpc<(id: number) => Promise<User>>({
  name: 'getUser'
});

// components/UserProfile.tsx
import { useState, useEffect } from 'react';
import { getUser } from '../api/user';

export function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getUser(userId)
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  
  return <div>{user.name}</div>;
}
```

### Can I use IRPC with Vue.js?

Yes, IRPC works with Vue.js:

```typescript
// composables/useUser.ts
import { ref } from 'vue';
import { getUser } from '../api/user';

export function useUser(userId: number) {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  
  getUser(userId)
    .then(data => user.value = data)
    .catch(err => error.value = err)
    .finally(() => loading.value = false);
  
  return { user, loading, error };
}
```

### Can I use IRPC with Next.js?

Yes, IRPC works great with Next.js:

```typescript
// pages/api/rpc.ts
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { transport } from '../../services/irpc';

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

## Testing Questions

### How do I test IRPC functions?

You can test IRPC functions by constructing them locally:

```typescript
import { createModule } from '@irpclib/irpc';

const testModule = createModule({ name: 'test', version: '1.0.0' });
const myFunction = testModule<(input: string) => Promise<string>>({
  name: 'myFunction'
});

// Mock implementation for testing
testModule.construct(myFunction, async (input: string) => {
  return `processed: ${input}`;
});

// Test
it('should process input correctly', async () => {
  const result = await myFunction('test');
  expect(result).toBe('processed: test');
});
```

### How do I mock IRPC functions in tests?

```typescript
// Mock the entire module
vi.mock('../api/user', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
  createUser: vi.fn().mockResolvedValue({ id: 2, name: 'New User' })
}));

// Test component
it('should display user data', async () => {
  render(<UserProfile userId={1} />);
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

## Troubleshooting Questions

### Why do I get "IRPC transport can not be found"?

This error occurs when:
- No transport is configured for the module
- Transport is not properly attached to the module

**Solution**:
```typescript
const transport = new HTTPTransport({
  baseURL: 'http://localhost:3000',
  endpoint: irpc.endpoint
}, irpc); // Transport is automatically attached
```

### Why do I get "IRPC can not be found"?

This error occurs when:
- Function is not registered on the server
- Function name doesn't match between client and server

**Solution**:
```typescript
// Ensure function is registered on server
irpc.construct(myFunction, async (param) => {
  // implementation
});

// Ensure names match exactly
const myFunction = irpc({ name: 'myFunction' }); // Must match server
```

### Why do my calls timeout?

Common causes:
- Network connectivity issues
- Server not responding
- Long-running operations
- Timeout configuration too low

**Solutions**:
```typescript
// Increase timeout
irpc.configure({ timeout: 60000 }); // 60 seconds

// Check server is running
await fetch('http://localhost:3000/rpc');

// Optimize long-running operations
irpc.construct(slowFunction, async (data) => {
  // Break into smaller chunks
  return await processInChunks(data);
});
```

## Best Practices Questions

### How should I organize my IRPC code?

Recommended structure:

```
src/
├── services/
│   ├── user-service.ts     # User-related IRPC functions
│   ├── product-service.ts  # Product-related IRPC functions
│   └── index.ts          # Export all services
├── types/
│   ├── user.ts           # User types
│   ├── product.ts        # Product types
│   └── index.ts         # Export all types
├── middleware/
│   ├── auth.ts           # Authentication middleware
│   ├── logging.ts        # Logging middleware
│   └── index.ts         # Export all middleware
└── client.ts            # IRPC client configuration
```

### Should I use schema validation?

Yes, schema validation provides:
- Runtime type safety
- Automatic error messages
- Self-documenting APIs
- Development-time validation

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email()
});

const createUser = irpc<{
  (data: z.infer<typeof UserSchema>): Promise<User>;
}>({
  name: 'createUser',
  schema: {
    input: [UserSchema],
    output: UserSchema
  }
});
```

### How do I handle versioning?

Use module versioning:

```typescript
// v1/user-service.ts
export const userServiceV1 = createModule({
  name: 'user-service',
  version: '1.0.0'
});

// v2/user-service.ts
export const userServiceV2 = createModule({
  name: 'user-service',
  version: '2.0.0'
});

// Client can choose version
const userService = useVersion === 'v1' ? userServiceV1 : userServiceV2;
```

## Security Questions

### Is IRPC secure?

IRPC is as secure as your transport layer. For HTTP transport:
- Use HTTPS in production
- Implement proper authentication
- Validate all inputs
- Use appropriate headers

### How do I implement authentication?

```typescript
const authMiddleware = async (req: Request, ctx: Map<string, unknown>) => {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const payload = await verifyJWT(token);
    setContext('userId', payload.userId);
    setContext('userRole', payload.role);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

transport.use(authMiddleware);
```

## Migration Questions

### Can I migrate from REST gradually?

Yes, IRPC can coexist with REST APIs:

```typescript
// Keep existing REST endpoints
app.get('/api/users/:id', getUserHandler);

// Add IRPC endpoint
app.post('/rpc', (req) => transport.respond(req));

// Migrate functions one by one
const getUser = irpc<(id: number) => Promise<User>>({
  name: 'getUser'
});
```

### How do I migrate from GraphQL?

1. **Map Queries to Functions**: Each GraphQL query becomes an IRPC function
2. **Preserve Types**: Convert GraphQL schema to TypeScript types
3. **Update Client**: Replace GraphQL client with IRPC calls
4. **Batch Optimization**: Leverage IRPC's automatic batching

## Still Have Questions?

If you couldn't find an answer to your question:

1. **Check Documentation**: Browse through other sections
2. **Search GitHub Issues**: Look for similar questions
3. **Join Discord Community**: Get help from the community
4. **Create an Issue**: Ask a new question on GitHub

When asking questions, please include:
- IRPC version you're using
- Operating system and runtime
- Code examples
- Error messages
- Expected vs actual behavior

**Resources**:
- [GitHub Repository](https://github.com/beerush-id/irpc)
- [Discord Community](https://discord.gg/aEFgpaghq2)
- [Issue Tracker](https://github.com/beerush-id/irpc/issues)