---
title: Migrating from REST to IRPC
description: Learn how to migrate your existing REST APIs to IRPC, with step-by-step instructions, code examples, and best practices.
head:
  - - meta
    - property: og:title
    - content: Migrating from REST to IRPC
  - - meta
    - property: og:description
    - content: Learn how to migrate your existing REST APIs to IRPC, with step-by-step instructions, code examples, and best practices.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/guides/migration/rest
  - - meta
    - name: keywords
    - content: irpc, migration, rest, api, typescript, guide, tutorial
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: Migrating from REST to IRPC
  - - meta
    - name: twitter:description
    - content: Learn how to migrate your existing REST APIs to IRPC, with step-by-step instructions, code examples, and best practices.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# Migrating from REST to IRPC

This guide helps you migrate your existing REST APIs to IRPC, providing a smoother development experience with better type safety and reduced boilerplate.

## Why Migrate from REST?

### REST Challenges
- **Manual endpoint management**: Designing and maintaining URL structures
- **HTTP method semantics**: Deciding between GET, POST, PUT, PATCH, DELETE
- **Status code handling**: Mapping business logic to HTTP status codes
- **Serialization overhead**: Manual JSON parsing and stringification
- **Type safety gaps**: Between client requests and server responses
- **Verbosity**: Repetitive request/response handling code

### IRPC Benefits
- **Function-centric**: Focus on business logic, not HTTP details
- **Type safety**: End-to-end TypeScript support
- **Automatic batching**: Reduced network overhead
- **Simplified error handling**: Promise-based error propagation
- **Zero boilerplate**: No manual serialization or endpoint management

## Migration Strategy

### 1. Incremental Migration
You don't need to migrate everything at once. IRPC can coexist with REST APIs:

```typescript
// Existing REST endpoints
app.get('/api/users/:id', getUserHandler);
app.post('/api/users', createUserHandler);

// New IRPC endpoints alongside REST
const transport = new HTTPTransport({ endpoint: '/rpc' }, irpc);
app.post('/rpc', (req) => transport.respond(req));
```

### 2. Parallel Development
Develop new features with IRPC while maintaining existing REST endpoints.

## Mapping REST Concepts to IRPC

### HTTP Methods → Function Names

| REST Method | IRPC Function Name | Example |
|-------------|-------------------|---------|
| `GET /users` | `getUsers` | `getUsers()` |
| `GET /users/:id` | `getUser` | `getUser(id)` |
| `POST /users` | `createUser` | `createUser(userData)` |
| `PUT /users/:id` | `updateUser` | `updateUser(id, userData)` |
| `DELETE /users/:id` | `deleteUser` | `deleteUser(id)` |

### URL Parameters → Function Arguments

```typescript
// REST: GET /api/users/123/posts?limit=10&offset=20
app.get('/api/users/:userId/posts', async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  // ... implementation
});

// IRPC: getUserPosts(userId, { limit, offset })
const getUserPosts = irpc<{
  (userId: number, options?: { limit?: number; offset?: number }): Promise<Post[]>;
}>({
  name: 'getUserPosts'
});

irpc.construct(getUserPosts, async (userId, options = {}) => {
  const { limit = 10, offset = 0 } = options;
  // ... implementation
});
```

### Request Body → Function Arguments

```typescript
// REST: POST /api/users
app.post('/api/users', async (req, res) => {
  const userData = req.body;
  // ... validation and creation
});

// IRPC: createUser(userData)
const createUser = irpc<{
  (userData: CreateUserDto): Promise<User>;
}>({
  name: 'createUser',
  schema: {
    input: [CreateUserSchema],
    output: UserSchema
  }
});

irpc.construct(createUser, async (userData) => {
  // ... validation and creation
});
```

## Step-by-Step Migration

### Step 1: Identify Migration Candidates

Start with APIs that benefit most from IRPC:

1. **CRUD operations** with clear input/output types
2. **Internal APIs** used by your own frontend
3. **Complex workflows** with multiple related calls
4. **Real-time features** requiring frequent updates

### Step 2: Create IRPC Module

```typescript
// services/user-service.ts
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

export const userService = createModule({
  name: 'user-service',
  version: '1.0.0'
});

export const userTransport = new HTTPTransport({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  endpoint: userService.endpoint
}, userService);
```

### Step 3: Convert REST Endpoints to IRPC Functions

#### Before: REST Controller

```typescript
// controllers/userController.ts
export class UserController {
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.findById(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;
      const user = await userService.create(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error.message.includes('validation')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await userService.update(parseInt(id), userData);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      if (error.message.includes('validation')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await userService.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

#### After: IRPC Functions

```typescript
// services/user-service.ts (continued)
import { z } from 'zod';

// Define schemas
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

export const createUser = userService<(userData: z.infer<typeof CreateUserSchema>) => Promise<User>>({
  name: 'createUser',
  description: 'Create a new user',
  schema: {
    input: [CreateUserSchema],
    output: UserSchema
  }
});

export const updateUser = userService<(id: number, userData: z.infer<typeof UpdateUserSchema>) => Promise<User>>({
  name: 'updateUser',
  description: 'Update an existing user',
  schema: {
    input: [z.number().positive(), UpdateUserSchema],
    output: UserSchema
  }
});

export const deleteUser = userService<(id: number) => Promise<void>>({
  name: 'deleteUser',
  description: 'Delete a user',
  schema: {
    input: [z.number().positive()]
  }
});

// Implement handlers
userService.construct(getUser, async (id: number) => {
  const user = await userService.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
});

userService.construct(createUser, async (userData) => {
  return await userService.create(userData);
});

userService.construct(updateUser, async (id, userData) => {
  const user = await userService.update(id, userData);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
});

userService.construct(deleteUser, async (id) => {
  const success = await userService.delete(id);
  if (!success) {
    throw new Error('User not found');
  }
});
```

### Step 4: Update Client Code

#### Before: REST Client

```typescript
// services/api-client.ts
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/users/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/users/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

export const apiClient = new ApiClient('http://localhost:3000');
```

#### After: IRPC Client

```typescript
// services/user-client.ts
import { userService, getUser, createUser, updateUser, deleteUser } from './user-service';

// No additional client code needed!
// The IRPC functions are ready to use:

export { getUser, createUser, updateUser, deleteUser };

// Example usage:
export const userClient = {
  getUser: (id: number) => getUser(id),
  createUser: (userData: CreateUserDto) => createUser(userData),
  updateUser: (id: number, userData: UpdateUserDto) => updateUser(id, userData),
  deleteUser: (id: number) => deleteUser(id)
};
```

### Step 5: Update Server Routes

```typescript
// server.ts
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { userService, userTransport } from './services/user-service';

// Set up context provider
setContextProvider(new AsyncLocalStorage());

// Keep existing REST routes during migration
app.get('/api/users/:id', getUserHandler);
app.post('/api/users', createUserHandler);

// Add IRPC endpoint
app.post('/rpc', async (req, res) => {
  const response = await userTransport.respond(new Request(req.url, {
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
```

## Advanced Migration Patterns

### Batch Operations

#### REST: Multiple Requests

```typescript
// Multiple separate HTTP requests
const user = await apiClient.getUser(123);
const posts = await apiClient.getUserPosts(123);
const comments = await apiClient.getUserComments(123);
```

#### IRPC: Automatic Batching

```typescript
// Automatically batched into single HTTP request
const [user, posts, comments] = await Promise.all([
  getUser(123),
  getUserPosts(123),
  getUserComments(123)
]);
```

### Complex Workflows

#### REST: Chained Requests

```typescript
// Sequential requests with manual error handling
async function createUserWithProfile(userData: CreateUserDto, profileData: ProfileDto) {
  try {
    const user = await apiClient.createUser(userData);
    const profile = await apiClient.createProfile(user.id, profileData);
    return { user, profile };
  } catch (error) {
    // Manual rollback logic needed
    if (user) {
      await apiClient.deleteUser(user.id);
    }
    throw error;
  }
}
```

#### IRPC: Transactional Function

```typescript
// Single atomic operation
const createUserWithProfile = userService<{
  (userData: CreateUserDto, profileData: ProfileDto): Promise<{ user: User; profile: Profile }>;
}>({
  name: 'createUserWithProfile',
  schema: {
    input: [CreateUserSchema, ProfileSchema],
    output: z.object({
      user: UserSchema,
      profile: ProfileSchema
    })
  }
});

userService.construct(createUserWithProfile, async (userData, profileData) => {
  // Transactional implementation
  return await transaction(async (db) => {
    const user = await db.users.create(userData);
    const profile = await db.profiles.create({ ...profileData, userId: user.id });
    return { user, profile };
  });
});
```

### Authentication and Authorization

#### REST: Middleware-based

```typescript
// REST middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const payload = await verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected routes
app.get('/api/users/profile', authMiddleware, getUserProfileHandler);
```

#### IRPC: Context-based

```typescript
// IRPC middleware
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
      // Don't set context if token is invalid
    }
  }
};

// Apply to transport
userTransport.use(authMiddleware);

// Protected functions check context
userService.construct(getUserProfile, async () => {
  const userId = getContext<number>('userId');
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  return await userService.getProfile(userId);
});
```

## Migration Checklist

### Pre-Migration
- [ ] Identify APIs to migrate
- [ ] Define migration timeline
- [ ] Set up IRPC infrastructure
- [ ] Create shared type definitions
- [ ] Plan testing strategy

### During Migration
- [ ] Create IRPC functions for each REST endpoint
- [ ] Implement handlers with proper error handling
- [ ] Add input/output validation schemas
- [ ] Update client code gradually
- [ ] Maintain both REST and IRPC endpoints
- [ ] Add comprehensive tests

### Post-Migration
- [ ] Monitor performance improvements
- [ ] Remove deprecated REST endpoints
- [ ] Update documentation
- [ ] Train team on IRPC patterns
- [ ] Optimize for batching opportunities

## Common Migration Challenges

### 1. File Uploads

```typescript
// REST: multipart/form-data
app.post('/api/upload', upload.single('file'), (req, res) => {
  // Handle file upload
});

// IRPC: Base64 encoding or separate endpoint
const uploadFile = userService<{
  (filename: string, data: string, mimeType: string): Promise<FileMetadata>;
}>({
  name: 'uploadFile'
});

userService.construct(uploadFile, async (filename, data, mimeType) => {
  const buffer = Buffer.from(data, 'base64');
  // Handle file upload
});
```

### 2. Streaming Responses

```typescript
// REST: streaming
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const stream = getDataStream();
  stream.pipe(res);
});

// IRPC: chunked responses or WebSocket
const getStreamData = userService<{
  (query: string): Promise<string[]>;
}>({
  name: 'getStreamData'
});

userService.construct(getStreamData, async (query) => {
  // Process and return chunks
  return await processStream(query);
});
```

### 3. Complex Query Parameters

```typescript
// REST: complex query params
app.get('/api/users', (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = 'createdAt', 
    order = 'desc',
    filter,
    search 
  } = req.query;
  // Complex query logic
});

// IRPC: options object
const getUsers = userService<{
  (options?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: UserFilter;
    search?: string;
  }): Promise<PaginatedUsers>;
}>({
  name: 'getUsers'
});
```

## Testing Migration

### Before Migration (REST Tests)

```typescript
describe('User API (REST)', () => {
  it('should get user', async () => {
    const response = await request(app)
      .get('/api/users/123')
      .expect(200);
    
    expect(response.body).toHaveProperty('id', 123);
  });

  it('should create user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
    
    expect(response.body).toMatchObject(userData);
  });
});
```

### After Migration (IRPC Tests)

```typescript
describe('User Service (IRPC)', () => {
  it('should get user', async () => {
    const user = await getUser(123);
    expect(user).toHaveProperty('id', 123);
  });

  it('should create user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };
    const user = await createUser(userData);
    expect(user).toMatchObject(userData);
  });

  it('should batch requests', async () => {
    const [user1, user2, user3] = await Promise.all([
      getUser(1),
      getUser(2),
      getUser(3)
    ]);
    
    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
    expect(user3).toBeDefined();
  });
});
```

## Performance Comparison

### REST Overhead
- Multiple HTTP requests for related operations
- Manual request/response handling
- JSON parsing/stringification overhead
- Connection overhead per request

### IRPC Benefits
- Automatic request batching
- Single connection for multiple operations
- Optimized serialization
- Reduced network round-trips

### Benchmark Example

```typescript
// REST: 3 separate requests
console.time('REST');
await Promise.all([
  apiClient.getUser(1),
  apiClient.getUserPosts(1),
  apiClient.getUserComments(1)
]);
console.timeEnd('REST'); // ~150ms

// IRPC: 1 batched request
console.time('IRPC');
await Promise.all([
  getUser(1),
  getUserPosts(1),
  getUserComments(1)
]);
console.timeEnd('IRPC'); // ~50ms
```

## Conclusion

Migrating from REST to IRPC provides significant benefits:

1. **Reduced boilerplate**: No manual HTTP handling
2. **Better type safety**: End-to-end TypeScript support
3. **Improved performance**: Automatic batching and connection reuse
4. **Simplified error handling**: Promise-based error propagation
5. **Enhanced developer experience**: Function-based API design

Start with non-critical APIs to gain experience, then gradually migrate more complex endpoints. The incremental approach allows you to maintain system stability while benefiting from IRPC's advantages.