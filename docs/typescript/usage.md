# Usage

This guide explains how to use IRPC in your applications, covering both client and server implementations.

## Creating IRPC Functions

IRPC functions are defined with TypeScript generics to ensure full type safety:

```ts
import { irpc } from '@irpclib/irpc';

// Define a simple function with one parameter
const greet = irpc<(name: string) => Promise<string>>({
  name: 'greet',
  description: 'Greets a person by name'
});

// Define a function with multiple parameters
const calculate = irpc<
  (a: number, b: number, operation: 'add' | 'subtract' | 'multiply' | 'divide') => Promise<number>
>({
  name: 'calculate',
  description: 'Performs basic arithmetic operations'
});

// Define a function with complex objects
const createUser = irpc<
  (user: { name: string; email: string; age: number }) => Promise<{ id: string; createdAt: Date }>
>({
  name: 'createUser',
  description: 'Creates a new user account'
});
```

## Client-Side Usage

On the client, you simply call the functions as if they were local:

```ts
import { greet, calculate, createUser } from './rpc';

// Simple function call
const greeting = await greet('Alice');
console.log(greeting); // "Hello, Alice!"

// Function with multiple parameters
const result = await calculate(10, 5, 'add');
console.log(result); // 15

// Function with complex objects
const newUser = await createUser({
  name: 'Bob',
  email: 'bob@example.com',
  age: 30
});
console.log(newUser.id); // Some generated ID
```

## Server-Side Implementation

On the server, you implement the actual functionality:

```ts
import { irpc } from '@irpclib/irpc';
import { greet, calculate, createUser } from './rpc';

// Implement the greet function
irpc.construct(greet, async (name: string) => {
  return `Hello, ${name}!`;
});

// Implement the calculate function
irpc.construct(calculate, async (a: number, b: number, operation: string) => {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
    default: throw new Error('Invalid operation');
  }
});

// Implement the createUser function
irpc.construct(createUser, async (user: { name: string; email: string; age: number }) => {
  // In a real app, you would save to a database
  return {
    id: Math.random().toString(36).substring(7),
    createdAt: new Date()
  };
});
```

## With Schema Validation

IRPC supports schema validation using Zod:

```ts
import { irpc } from '@irpclib/irpc';
import { z } from 'zod';

const validatedFunction = irpc<
  (user: { name: string; email: string }) => Promise<{ success: boolean }>
>({
  name: 'validatedFunction',
  schema: {
    input: [
      z.object({
        name: z.string().min(1),
        email: z.string().email()
      })
    ],
    output: z.object({
      success: z.boolean()
    })
  }
});
```

## Error Handling

IRPC uses standard Promise-based error handling:

```ts
import { greet } from './rpc';

try {
  const result = await greet('Alice');
  console.log(result);
} catch (error) {
  console.error('RPC call failed:', error.message);
}
```

## Batching

IRPC automatically batches multiple calls for efficiency:

```ts
import { batch } from '@irpclib/irpc';
import { greet, calculate } from './rpc';

// These calls will be automatically batched
const [greeting, result] = await Promise.all([
  greet('Alice'),
  calculate(10, 5, 'add')
]);
```

This covers the basic usage patterns for IRPC. For more advanced features, check out the [Specification](/specification) document.