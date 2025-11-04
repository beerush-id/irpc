---
title: IRPC Installation Guide
description: Learn how to install and set up IRPC in your TypeScript project with NPM, Yarn, PNPM, or Bun.
head:
  - - meta
    - property: og:title
      content: IRPC Installation Guide
  - - meta
    - property: og:description
      content: Learn how to install and set up IRPC in your TypeScript project with NPM, Yarn, PNPM, or Bun.
  - - meta
    - property: og:type
      content: article
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/typescript/installation
  - - meta
    - name: keywords
      content: irpc, installation, setup, typescript, npm, yarn, pnpm, bun, package manager
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: IRPC Installation Guide
  - - meta
    - name: twitter:description
      content: Learn how to install and set up IRPC in your TypeScript project with NPM, Yarn, PNPM, or Bun.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "IRPC Installation Guide", "description": "Learn how to install and set up IRPC in your TypeScript project with NPM, Yarn, PNPM, or Bun.", "url": "https://irpc.anchorlib.dev/typescript/installation" }'
---

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