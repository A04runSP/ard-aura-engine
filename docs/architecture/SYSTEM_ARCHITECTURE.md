# ARD Workspace — System Architecture

**Status:** Proposed baseline for review  
**Repository:** `A04runSP/ard-aura-engine`  
**Product:** ARD Workspace by ARD Creations

## 1. Purpose

This document defines the intended architecture for the ARD Workspace rebuild. It is a design baseline, not evidence that application code or infrastructure already exists.

The rebuild will use a **modular monolith**: one deployable application with explicit internal boundaries. Microservices are out of scope unless measurable operational or scaling needs justify them.

## 2. Product boundaries

The application is organised around projects. A project is the primary ownership and access boundary for its resources.

Product capabilities are grouped into these domains:

- Identity and access: authentication, profiles, creator access, roles.
- Projects: project lifecycle, dashboard, project settings.
- Workspace: overview, navigation, workspace state.
- Content: notes, tasks, stories, scenes, scripts.
- Resources: folders, files, media, assets, resource relationships.
- Intelligence: search, commands, workflows, activity, notifications.
- Collaboration: memberships, permissions, realtime updates.
- AI assistance: contextual retrieval and validated action requests.
- Platform administration: admin tools and future subscription capabilities.

These are intended domains. Their exact boundaries and data contracts must be confirmed during discovery.

## 3. Layer model

### Application shell — `src/app`

Owns application startup, providers, routing, layouts, global error handling, and session-aware route composition. It must not contain feature-specific business rules.

### Feature modules — `src/features`

Each feature owns its UI, feature-level hooks, schemas, and use-case adapters. Features communicate through published contracts, not by importing another feature's private internals.

Initial feature areas:

`auth`, `dashboard`, `projects`, `workspace`, `notes`, `tasks`, `stories`, `files`, `media`, `assets`, `search`, `commands`, `activity`, `collaboration`, `ai`, `admin`.

Create a feature only when implementation begins; empty feature folders are placeholders, not completed modules.

### Domain — `src/domain`

Contains business entities, identifiers, invariants, permission concepts, validation rules, and framework-independent contracts. Domain code must not import React, Supabase, or browser UI components.

### Application — `src/application`

Contains use-case orchestration and application workflows. It coordinates domain rules and infrastructure ports; it does not own persistence implementations.

### Infrastructure — `src/infrastructure`

Contains Supabase adapters, database access, object storage, realtime transport, and external service integrations. Infrastructure implements contracts consumed by application and feature layers.

### Shared system — `src/shared`

Contains design tokens, accessible UI primitives, generic hooks, formatting, and utilities. Shared code must remain genuinely cross-feature; do not use it as a dumping ground.

## 4. Dependency rules

Allowed dependency direction:

```text
app ───────────────> features
features ──────────> application contracts / domain / shared
application ───────> domain / infrastructure ports
infrastructure ───> domain / application ports
shared ────────────> no feature-specific modules
domain ────────────> no framework or infrastructure
```

Rules:

1. Domain is the innermost layer and remains framework-independent.
2. UI components do not issue arbitrary database queries.
3. Features use application services or explicitly approved query adapters.
4. Supabase access is centralised behind infrastructure adapters.
5. Cross-feature communication uses typed contracts or application orchestration.
6. Avoid circular imports. Import direction is checked during implementation and CI.
7. No feature may bypass authorization by calling a lower-level persistence adapter directly.

## 5. State and data access

Separate state by responsibility:

- **Server state:** persisted records and remote query results. Use TanStack Query where it provides clear cache, invalidation, and lifecycle benefits.
- **Session state:** authenticated identity and session lifecycle, managed centrally.
- **Ephemeral UI state:** open panels, selected tabs, transient dialogs, and local interaction state.
- **Workspace coordination state:** only the minimum cross-feature state needed to coordinate a project view.

There must be one canonical persistence path per domain. Do not maintain parallel local and remote versions of the same resource as competing sources of truth.

Realtime messages invalidate or reconcile canonical queries/state. Realtime must not become a second persistence layer.

## 6. Command and AI action path

Any user, workflow, or AI-requested mutation must use the same controlled path:

```text
Intent / UI action
    → parse and validate
    → resolve command
    → authenticate and authorize
    → execute domain use case
    → persist through infrastructure
    → reconcile canonical state
    → emit activity / notification where applicable
```

AI may propose or request an action. It must not receive unrestricted database credentials, bypass RLS, or directly mutate protected records. Read access must be scoped to the current user's authorised project context.

## 7. Technology baseline

Provisional choices, subject to foundation validation:

- React + TypeScript + Vite
- React Router
- Tailwind CSS and accessible UI primitives
- TanStack Query for server-state coordination
- Supabase Auth, PostgreSQL, RLS, Storage, and Realtime
- Vitest for unit/integration tests
- Playwright for critical end-to-end tests
- Vercel for preview and production hosting

Do not add libraries merely because they were present in the legacy application. Verify maintenance status, compatibility, security, bundle impact, and actual need.

## 8. Runtime and error boundaries

The app shell should provide:

- A deterministic bootstrap sequence.
- Explicit loading, unauthenticated, authenticated, and error states.
- Route-level and feature-level error boundaries where appropriate.
- No access to variables before initialization; avoid module-level cyclic dependencies.
- Observable, non-sensitive diagnostics.
- Recovery paths for failed data loads and expired sessions.

## 9. Quality gates

A phase cannot be marked complete until applicable checks pass:

- Formatting and lint.
- TypeScript type-check.
- Unit and integration tests.
- Critical user-flow E2E tests.
- Build succeeds from a clean install.
- Authorization and RLS checks for affected data paths.
- Responsive and accessibility review.
- Manual preview verification on target devices.

A passing build alone does not establish runtime correctness.

## 10. Open decisions

The following remain unapproved until discovery and explicit review:

- Exact dependency versions and package scripts.
- Final feature boundaries and public contracts.
- Whether any domain requires a dedicated store beyond query cache.
- Production Supabase project and environment mapping.
- Database schema changes, if any.
- Migration strategy and cutover timing.
- AI provider and model integration.
- Subscription/payment provider.
- Production deployment configuration.
