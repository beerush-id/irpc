---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'IRPC'
  text: 'An Isomorphic Remote Procedure Call'
  tagline: The best way to call remote procedures.
  image: /logo.svg
  actions:
    - theme: brand
      text: Get Started
      link: /typescript/getting-started
    - theme: alt
      text: Overview
      link: /overview
    - theme: alt
      text: Specification
      link: /specification

features:
  - title: Isomorphic Functions
    details: Write once, run anywhere. Call functions identically on client and server without thinking about network boundaries.
  - title: Zero Boilerplate
    details: Eliminate REST endpoints, GraphQL schemas, and complex serialization logic. Just call functions naturally.
  - title: Pluggable Transports
    details: Switch between HTTP, WebSockets, and other transports without changing your function signatures.
---