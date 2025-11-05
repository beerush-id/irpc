---
title: createModule
description: API reference for the createModule function - creates a new IRPC module for organizing RPC functions.
head:
  - - meta
    - property: og:title
    - content: createModule API Reference
  - - meta
    - property: og:description
    - content: API reference for the createModule function - creates a new IRPC module for organizing RPC functions.
  - - meta
    - property: og:type
    - content: article
  - - meta
    - property: og:image
    - content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
    - content: https://irpc.anchorlib.dev/api/core/create-module
  - - meta
    - name: keywords
    - content: irpc, createModule, api, reference, module, factory, typescript
  - - meta
    - name: twitter:card
    - content: summary_large_image
  - - meta
    - name: twitter:title
    - content: createModule API Reference
  - - meta
    - name: twitter:description
    - content: API reference for the createModule function - creates a new IRPC module for organizing RPC functions.
  - - meta
    - name: twitter:image
    - content: https://irpc.anchorlib.dev/hero.svg
---

# createModule

Creates a new IRPC module that serves as a container for organizing and managing RPC functions.

## Signature

```typescript
import { createModule } from '@irpclib/irpc';

const irpc = createModule(config?: Partial<Omit<IRPCModule, 'submit' | 'transport'>>);
```

## Parameters

### `config` (Optional)

A partial configuration object for the module. The following properties are supported:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | `'global'` | The name of the module namespace |
| `version` | `string` | `'1.0.0'` | The version of the module |
| `timeout` | `number` | `20000` | Default timeout for RPC calls in milliseconds |
| `description` | `string` | `undefined` | Optional description of the module |

**Note**: The `submit` and `transport` properties are automatically managed by the module and cannot be provided in the configuration.

## Returns

Returns an [`IRPCFactory`](../types/irpc-factory.md) instance that can be used to:

- Create RPC function definitions
- Register handler implementations
- Configure transport mechanisms
- Manage module settings

## Examples

### Basic Module Creation

```typescript
import { createModule } from '@irpclib/irpc';

// Create a module with default configuration
const irpc = createModule();

console.log(irpc.namespace);
// Output: { name: 'global', version: '1.0.0' }
```

### Custom Module Configuration

```typescript
import { createModule } from '@irpclib/irpc';

// Create a module with custom configuration
const userModule = createModule({
  name: 'user-service',
  version: '2.1.0',
  timeout: 30000,
  description: 'User management RPC functions'
});

console.log(userModule.namespace);
// Output: { name: 'user-service', version: '2.1.0' }
```

### Creating RPC Functions

```typescript
import { createModule } from '@irpclib/irpc';

const mathModule = createModule({
  name: 'math',
  version: '1.0.0'
});

// Define function types
type AddFunction = (a: number, b: number) => Promise<number>;
type MultiplyFunction = (a: number, b: number) => Promise<number>;

// Create function definitions
export const add = mathModule<AddFunction>({
  name: 'add',
  description: 'Adds two numbers together'
});

export const multiply = mathModule<MultiplyFunction>({
  name: 'multiply',
  description: 'Multiplies two numbers'
});
```

### Configuring Transport

```typescript
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

const apiModule = createModule({
  name: 'api',
  version: '1.0.0'
});

// Configure HTTP transport
const transport = new HTTPTransport({
  baseURL: 'https://api.example.com',
  endpoint: apiModule.endpoint('/rpc'),
  headers: {
    'Authorization': 'Bearer token123'
  }
}, apiModule);

// The transport is automatically attached to the module
apiModule.use(transport);
```

### Implementing Handlers

```typescript
import { createModule } from '@irpclib/irpc';

const dbModule = createModule({
  name: 'database',
  version: '1.0.0'
});

// Define a function
const getUser = dbModule<(id: number) => Promise<User>>({
  name: 'getUser'
});

// Implement the handler
dbModule.construct(getUser, async (id: number) => {
  // Database query logic here
  const user = await userRepository.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
});
```

### Module Reconfiguration

```typescript
import { createModule } from '@irpclib/irpc';

const module = createModule({
  name: 'service',
  version: '1.0.0',
  timeout: 10000
});

// Later, update configuration
module.configure({
  version: '1.1.0',
  timeout: 15000
});

console.log(module.namespace);
// Output: { name: 'service', version: '1.1.0' }
```

## Module Organization Patterns

### Single Module Architecture

```typescript
// All functions in one module
const appModule = createModule({
  name: 'app',
  version: '1.0.0'
});

export const userFunctions = {
  getUser: appModule<(id: number) => Promise<User>>({ name: 'getUser' }),
  createUser: appModule<(data: CreateUserDto) => Promise<User>>({ name: 'createUser' }),
  updateUser: appModule<(id: number, data: UpdateUserDto) => Promise<User>>({ name: 'updateUser' })
};

export const productFunctions = {
  getProduct: appModule<(id: number) => Promise<Product>>({ name: 'getProduct' }),
  listProducts: appModule<(filters: ProductFilters) => Promise<Product[]>>({ name: 'listProducts' })
};
```

### Multi-Module Architecture

```typescript
// Separate modules by domain
const userModule = createModule({
  name: 'users',
  version: '1.0.0'
});

const productModule = createModule({
  name: 'products',
  version: '1.0.0'
});

export const userFunctions = {
  getUser: userModule<(id: number) => Promise<User>>({ name: 'getUser' }),
  createUser: userModule<(data: CreateUserDto) => Promise<User>>({ name: 'createUser' })
};

export const productFunctions = {
  getProduct: productModule<(id: number) => Promise<Product>>({ name: 'getProduct' }),
  listProducts: productModule<(filters: ProductFilters) => Promise<Product[]>>({ name: 'listProducts' })
};
```

## Best Practices

1. **Naming Conventions**: Use descriptive names that reflect the module's purpose
2. **Version Management**: Follow semantic versioning for your modules
3. **Timeout Configuration**: Set appropriate timeouts based on your use case
4. **Module Organization**: Group related functions in the same module
5. **Documentation**: Always provide descriptions for modules and functions

## Common Pitfalls

- **Duplicate Names**: Function names must be unique within a module
- **Missing Transport**: Calls will fail without a configured transport for remote execution
- **Timeout Issues**: Set appropriate timeouts to avoid hanging requests
- **Version Conflicts**: Ensure client and server use compatible module versions

## Related APIs

- [`IRPCFactory`](../types/irpc-factory.md) - Interface returned by createModule
- [`IRPCModule`](../types/irpc-module.md) - Configuration interface
- [`HTTPTransport`](../http/http-transport.md) - HTTP transport implementation
- [`IRPCTransport`](../classes/irpc-transport.md) - Base transport class