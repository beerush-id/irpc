# IRPC - Isomorphic Remote Procedure Call

**Design Specification — Version 1.0**

![IRPC](/diagrams/schema.svg)

## 1. Scope

This specification defines IRPC as a minimal, isomorphic function contract for remote execution. It standardizes the function semantics, provider interface, and transport message format to enable interoperable implementations across languages and environments. Implementation details, policies, and infrastructure are explicitly out of scope unless stated as normative requirements.

---

## 2. Definitions

- **IRPC function:** A named, asynchronous function with a fixed signature. Arguments in; value or error out.
- **Stub:** A callable client‑side function with the same signature as its corresponding handler. It performs no local business logic.
- **Handler:** A server‑side function with the exact same signature as its corresponding stub. It contains the business logic.
- **Provider:** A callable factory that defines IRPC functions and exposes lifecycle methods to configure runtime behavior without altering function signatures.
- **Transport:** A pluggable mechanism that carries serialized IRPC requests and responses. Transport does not change function signatures.
- **Router:** A dispatcher that maps incoming requests by name to registered handlers.

## 3. Normative requirements

## 4. Metadata and validation

- Function metadata (e.g., input/output validators) is OPTIONAL and **MUST NOT** affect the function signature.
- Validation errors arising from metadata **SHOULD** be surfaced as transport `error` .
- Metadata **MAY** assist documentation, discovery, linting, and conformance but **MUST** remain non‑invasive to signatures.

## 5. Security

- Authentication and authorization are out‑of‑band concerns and **MUST NOT** modify function signatures.
- Providers **MAY** enforce authorization via lifecycle hooks before handler invocation.
- Transports **MAY** attach or derive security context; such context **MUST NOT** be exposed as function parameters.

---

## 6. Invariants

- **Async‑only**: all IRPC functions return Promises.
- **Isomorphic**: stub and handler share identical type.
- **Array always**: transports always accept arrays of Requests.
- **Per‑call resolution**: each Call resolves independently.
- **Minimal wire**: Request = `{ id, name, args }` ; Response = `{ id, data, error }` .
- **Schema‑aware**: input/output schemas guide transformation, not the function signature.

---

## 7. Non‑goals

- Defining a query language, endpoint semantics, or schema DSL.
- Prescribing deployment topologies, scaling strategies, or infrastructure.
- Mandating specific authentication/authorization mechanisms.
- Embedding context into function signatures.

---

## 8. Change control

This document is Version 1.0. Future revisions **MUST** maintain the invariants defined in §3 unless superseded by a major version of the specification with explicit migration guidance.
