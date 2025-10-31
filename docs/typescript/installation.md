# Installation

This guide will help you install and set up IRPC in your project.

## Prerequisites

- Node.js version 16 or higher
- A package manager like npm, yarn, or pnpm

## Installing Core Package

To get started with IRPC, install the core package:

```bash
npm install @irpclib/irpc
```

Or with yarn:

```bash
yarn add @irpclib/irpc
```

Or with pnpm:

```bash
pnpm add @irpclib/irpc
```

## Installing Transport Packages

IRPC uses a pluggable transport system. Install the transport you want to use:

### HTTP Transport

Most applications will use the HTTP transport:

```bash
npm install @irpclib/http-transport
```

### Other Transports

Other transports may be available depending on your needs:
- WebSocket transport (coming soon)
- Message queue transports (coming soon)

## TypeScript Support

IRPC is written in TypeScript and comes with built-in type definitions. No additional setup is required for TypeScript support.

## Peer Dependencies

Depending on your setup, you might need to install peer dependencies:

```bash
npm install zod
```

[Zod](https://zod.dev/) is optionally used for schema validation in IRPC.

## Basic Setup

After installing, you can start using IRPC in your project:

```ts
import { irpc } from '@irpclib/irpc';

// Create your first IRPC function
const greet = irpc<(name: string) => Promise<string>>({
  name: 'greet',
  description: 'Greets a person by name'
});

// Export for use in other modules
export { greet };
```

Continue to the [Getting Started](/typescript/getting-started) guide to learn how to implement and use your IRPC functions.