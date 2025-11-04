# Installation

This guide will help you install and set up IRPC in your TypeScript project.

## Installing Core Package

::: code-group
```bash [NPM]
npm install @irpclib/irpc
```

```bash [Yarn]
yarn add @irpclib/irpc
```

```bash [PNPM]
pnpm add @irpclib/irpc
```

```bash [Bun]
bun add @irpclib/irpc
```
:::

## Installing Transport Package

IRPC requires a transport mechanism to communicate between client and server. The HTTP transport is the most commonly used:

::: code-group
```bash [NPM]
npm install @irpclib/http
```

```bash [Yarn]
yarn add @irpclib/http
```

```bash [PNPM]
pnpm add @irpclib/http
```

```bash [Bun]
bun add @irpclib/http
```
:::

## Peer Dependencies

IRPC uses Zod for schema validation. If you plan to use schema validation features, you'll need to install Zod:

::: code-group
```bash [NPM]
npm install zod
```

```bash [Yarn]
yarn add zod
```

```bash [PNPM]
pnpm add zod
```

```bash [Bun]
bun add zod
```
:::