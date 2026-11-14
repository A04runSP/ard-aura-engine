# ARD Workspace — Architecture Decision Log

Record decisions that materially affect system structure. Each decision should include context, the selected option, alternatives, consequences, status, and date.

## ADR-001 — Use a modular monolith for the rebuild

- **Status:** Proposed
- **Date:** 2026-11-14
- **Context:** The product needs clear feature boundaries, but there is no verified requirement for independently deployed services.
- **Decision:** Start with one deployable application organised into explicit feature and architectural layers.
- **Alternatives considered:** Microservices from day one; a flat component-and-hook structure.
- **Consequences:** Simpler deployment and local development, with enforceable internal boundaries. Requires discipline around imports and module contracts.

## ADR-002 — Retain the existing stack provisionally

- **Status:** Proposed
- **Date:** 2026-11-14
- **Context:** The legacy application already uses React, TypeScript, Vite, and Supabase. The known issues do not yet prove that the framework or database is the root cause.
- **Decision:** Evaluate the same stack for the new foundation, then lock exact versions after dependency and environment review.
- **Alternatives considered:** Replacing the frontend framework or backend before discovery.
- **Consequences:** Reuses team knowledge and reduces migration variables. Must not blindly copy legacy implementation patterns.

## ADR-003 — Keep the legacy production system separate

- **Status:** Accepted as a project guardrail
- **Date:** 2026-11-14
- **Context:** The existing app contains working capabilities and production data, while the rebuild is a clean-start effort.
- **Decision:** Build in this repository independently. Treat the legacy repo and deployment as read-only references until explicit migration/cutover approval.
- **Alternatives considered:** Rebuilding in place or modifying production while developing.
- **Consequences:** Safer comparison and rollback path; requires deliberate migration planning later.

## ADR-004 — Centralise persistence and mutation paths

- **Status:** Proposed
- **Date:** 2026-11-14
- **Context:** Direct database access from many components makes authorization, error handling, and state reconciliation harder to reason about.
- **Decision:** Route domain persistence through infrastructure adapters and application use cases, with typed contracts.
- **Alternatives considered:** Allow each component to call Supabase directly.
- **Consequences:** More upfront structure, improved testability and consistent security boundaries.

## Decision review rule

Proposed decisions are not irreversible. Update their status only after review and evidence. Never silently convert a proposal into an approved production or data decision.
