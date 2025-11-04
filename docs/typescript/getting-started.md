---
title: Getting Started with IRPC TypeScript
description: Learn how to create your first IRPC application with TypeScript, including modules, functions, transports, and server setup.
head:
  - - meta
    - property: og:title
      content: Getting Started with IRPC TypeScript
  - - meta
    - property: og:description
      content: Learn how to create your first IRPC application with TypeScript, including modules, functions, transports, and server setup.
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/typescript/getting-started
  - - meta
    - name: keywords
      content: irpc, typescript, getting started, tutorial, modules, functions, transport, server
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: Getting Started with IRPC TypeScript
  - - meta
    - name: twitter:description
      content: Learn how to create your first IRPC application with TypeScript, including modules, functions, transports, and server setup.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Getting Started with IRPC TypeScript", "description": "Learn how to create your first IRPC application with TypeScript, including modules, functions, transports, and server setup.", "url": "https://irpc.anchorlib.dev/typescript/getting-started" }'
---

# Getting Started

This guide will walk you through creating your first IRPC application with TypeScript.

## Understanding IRPC Modules

IRPC applications are organized around modules, which serve as containers for related RPC functions. Each module can be configured with its own transport mechanism, allowing for flexible communication patterns across different parts of your application.

You have two main architectural options:
- Create a single module to contain all your application's functions
- Create multiple modules to group functions by domain or service boundaries

## Creating Your First Module

To get started with IRPC, you'll need to create at least one module:

```ts
import { createModule } from '@irpclib/irpc';

export const irpc = createModule({ 
  name: 'math', 
  version: '1.0.0' 
});
```

The `createModule` function accepts a configuration object with:
- `name`: A unique identifier for your module
- `version`: The version of your module (useful for API management)

## Defining RPC Functions

Once you have a module, you can define RPC functions as stubs. These act as clients that will either execute locally (on the server) or remotely (on the client).

First, define your function types:

```ts
// Define the function types
type AddFunction = (a: number, b: number) => Promise<number>;
type MultiplyFunction = (a: number, b: number) => Promise<number>;
```

Then, create the function stubs using your module:

```ts
// Define functions with explicit types
export const add = irpc<AddFunction>({
  name: 'add',
  description: 'Adds two numbers together'
});

export const multiply = irpc<MultiplyFunction>({
  name: 'multiply'
});
```

## Setting Up Transport

Each module requires a transport mechanism to communicate between client and server. The transport handles the actual network communication.

```ts
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Create module
export const mathIrpc = createModule({
  name: 'math', 
  version: '1.0.0' 
});

// Configure transport
export const mathTransport = new HTTPTransport(
  {
    baseURL: 'http://localhost:3000',
    endpoint: '/rpc',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  mathIrpc
);
```

## Implementing Server-Side Handlers

On the server side, you need to implement the actual functionality for your RPC functions:

```ts
mathIrpc.construct(add, async (a: number, b: number) => {
  return a + b;
});

mathIrpc.construct(multiply, async (a: number, b: number) => {
  return a * b;
});
```

## Setting Up the Server

Configure your server to handle IRPC requests through the transport:

```ts
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { mathIrpc, mathTransport } from '../irpc/math';

// Set up context provider
setContextProvider(new AsyncLocalStorage());

// For Bun:
Bun.serve({
  routes: {
    [mathTransport.endpoint]: {
      GET: () => {
        return new Response('Ok!');
      },
      POST: (req) => mathTransport.respond(req),
    }
  },
});
```

## Making Client-Side Calls

On the client side, you can use your defined functions as if they were local:

```ts
import { add, multiply } from '../irpc/math';

// Make RPC calls
const sum = await add(2, 3);
console.log(sum); // 5

const product = await multiply(4, 5);
console.log(product); // 20
```

## Complete Example

Here's a complete example showing the proper structure:

**irpc/math.ts:**

```ts
import { createModule } from '@irpclib/irpc';
import { HTTPTransport } from '@irpclib/http';

// Define function types
type AddFunction = (a: number, b: number) => Promise<number>;
type MultiplyFunction = (a: number, b: number) => Promise<number>;

// Create module
export const mathIrpc = createModule({
  name: 'math',
  version: '1.0.0'
});

// Define functions
export const add = mathIrpc<AddFunction>({
  name: 'add'
});

export const multiply = mathIrpc<MultiplyFunction>({
  name: 'multiply'
});

// Configure transport
export const mathTransport = new HTTPTransport(
  {
    baseURL: 'http://localhost:3000',
    endpoint: '/rpc',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  mathIrpc
);
```

**server/math.ts:**
```ts
import { mathIrpc } from '../irpc/math';

// Implement handlers
mathIrpc.construct(add, async (a: number, b: number) => {
  console.log(`Adding ${a} + ${b}`);
  return a + b;
});

mathIrpc.construct(multiply, async (a: number, b: number) => {
  console.log(`Multiplying ${a} * ${b}`);
  return a * b;
});
```

**server/index.ts:**
```ts
import { setContextProvider } from '@irpclib/irpc';
import { AsyncLocalStorage } from 'async_hooks';
import { mathIrpc, mathTransport } from '../irpc/math';

// Set up context provider
setContextProvider(new AsyncLocalStorage());

// For Bun:
Bun.serve({
  routes: {
    [mathTransport.endpoint]: {
      GET: () => {
        return new Response('Ok!');
      },
      POST: (req) => mathTransport.respond(req),
    }
  },
});
```

**app/App.tsx:**
```ts
import { add, multiply } from '../irpc/math';

export default function App() {
  const handleCalculate = async () => {
    const sum = await add(2, 3);
    console.log(`Sum: ${sum}`);
    
    const multiplied = await multiply(4, 5);
    console.log(`Product: ${multiplied}`);
  };

  return (
    <div>
      <button onClick={handleCalculate}>Calculate</button>
    </div>
  );
}
```