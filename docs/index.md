---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
title: IRPC - Isomorphic Remote Procedure Call
description: IRPC (Isomorphic Remote Procedure Call) allows you to call remote functions as naturally as local ones. Write once, run anywhere with zero-boilerplate remote procedure calls.
head:
  - - meta
    - property: og:title
      content: IRPC - Isomorphic Remote Procedure Call
  - - meta
    - property: og:description
      content: Write once, run anywhere. Truly isomorphic, zero-boilerplate remote procedure calls.
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:image
      content: https://irpc.anchorlib.dev/hero.png
  - - meta
    - property: og:url
      content: https://irpc.anchorlib.dev/
  - - meta
    - name: keywords
      content: rpc, remote procedure call, isomorphic, typescript, javascript, web development, api
  - - meta
    - name: twitter:card
      content: summary_large_image
  - - meta
    - name: twitter:title
      content: IRPC - Isomorphic Remote Procedure Call
  - - meta
    - name: twitter:description
      content: Write once, run anywhere. Truly isomorphic, zero-boilerplate remote procedure calls.
  - - meta
    - name: twitter:image
      content: https://irpc.anchorlib.dev/hero.svg
  - - script
    - type: application/ld+json
      innerHTML: '{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "IRPC", "description": "Isomorphic Remote Procedure Call - Write once, run anywhere. Truly isomorphic, zero-boilerplate remote procedure calls.", "url": "https://irpc.anchorlib.dev/" }'

hero:
  name: 'IRPC'
  text: 'Isomorphic Remote Procedure Call'
  tagline: Write once, run anywhere. Truly isomorphic, zero-boilerplate remote procedure calls.
  image: /hero.svg
  actions:
    - theme: brand
      text: Get Started
      link: /typescript/getting-started
    - theme: alt
      text: Specification
      link: /specification
---

<div class="card-grid">
<div class="card-grid-col comparison-card">

#### /irpc/fs.ts

```typescript
import { irpc } from './irpc';

type ReadFile = (path: string) => Promise<string>;

export const readFile = irpc<ReadFile>({
  name: 'readFile',
});
```

</div>
<div class="card-grid-col comparison-card">

#### /api/fs.ts

```typescript
import { fs } from 'node:fs/promises';
import { irpc } from '../irpc/irpc';
import { readFile } from '../irpc/fs';

irpc.construct(readFile, async (path) => {
  return await fs.readFile(path, 'utf8');
});
```

</div>
<div class="card-grid-col full comparison-card">

#### /app/App.tsx

```tsx
import { readFile } from '../irpc/fs';

export default function App() {
  const [content, setContent] = useState('');

  useEffect(() => {
    readFile('file.txt').then(setContent);
  }, []);

  return (
    <div>
      <h1>File Content</h1>
      <pre>{content}</pre>
    </div>
  );
}
```

</div>
</div>

<div class="comparison-grid">
  <div class="feature-card">
    <div class="feature-icon">✨</div>
    <h4>Isomorphic Design</h4>
    <p>Call functions identically on client and server. IRPC abstracts network boundaries so you can focus on logic.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🚀</div>
    <h4>Zero Boilerplate</h4>
    <p>No REST endpoints, no GraphQL schemas, no complex serialization. Just write functions and call them.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🔌</div>
    <h4>Transport Agnostic</h4>
    <p>Switch between HTTP, WebSockets, and other transports without changing a single line of your business logic.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🧠</div>
    <h4>Reduced Cognitive Load</h4>
    <p>A single mental model for local and remote functions. No more context switching between your business logic and the transport domain.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🔒</div>
    <h4>End-to-End Type Safety</h4>
    <p>Compile-time validation from client to server, with IDE support for cross-boundary refactoring and self-documenting APIs.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">⚡️</div>
    <h4>Optimized Performance</h4>
    <p>Intelligent batching, connection reuse, and tree-shakable imports for optimal network efficiency and minimal bundle size.</p>
  </div>
</div>
