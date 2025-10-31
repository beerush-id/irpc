# IRPC - Isomorphic Remote Procedure Call

## Spec

### Module

Module is where your function lives.

```ts
const irpc = createModule({ name: 'fs', version: '1.0.0' });
```

### Function

Function is the stub of your function.

```ts
export const readFile = irpc<(path: string) => Promise<string>>('readFile');
```

### Transport

Transport is the communication channel between your function and your handler.

```ts
export const transport = new IRPCHttpTransport(
  {
    baseURL: 'http://localhost:3000',
    endpoint: irpc.name,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  irpc
);
irpc.use(transport);
```

## Usage

### Client

```ts
import { readFile } from './fs';

console.log(await readFile('/path/to/file'));
```

### Server

```ts
import { transport } from './fs';
import { setContextStore } from '@irpclib/irpc';

setContextStore(new AsyncLocalStorage());

Bun.serve({
  routes: {
    ...transport.serve(),
  },
});
```

#### Handler

Handler is the implementation of your function.

```ts
irpc.construct(readFile, async (path) => {});
```
