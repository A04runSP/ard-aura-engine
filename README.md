# ARD Workspace

**ARD Workspace** is the project and creative-work management platform developed under **ARD Creations**. This repository is the clean foundation for the next version of the application.

The goal is to build a dependable, modular workspace where creators can organise projects, manage resources, plan work, and connect the pieces of a project without sacrificing clarity, security, or maintainability.

> Build deliberately. Establish the foundation first, then add capabilities in verified stages.

---

## Product direction

ARD Workspace is intended to bring the core parts of a creative project into one structured environment:

- **Projects** — create, organise, open, and manage independent projects.
- **Workspace overview** — see project status, recent activity, and important resources.
- **Notes and tasks** — capture information and track work within a project.
- **Stories and scenes** — organise narrative content and its structure.
- **Files and folders** — upload, organise, preview, move, rename, and manage project files.
- **Media and assets** — manage reusable creative resources and connect them to relevant scenes or project content.
- **Search and commands** — find workspace information and perform validated workspace actions.
- **Activity and notifications** — understand what changed and what needs attention.
- **Collaboration and roles** — support controlled access for project members.
- **AI assistance** — provide contextual assistance through authorised application services, without bypassing permissions or directly mutating protected data.
- **Administration and creator access** — support platform-level administration, creator applications, and future subscription capabilities.

These are product goals, not claims that the features are already implemented in this repository.

## Engineering principles

1. **Modular monolith first.** Keep the application cohesive and deployable as one product. Split features into clear modules; do not introduce microservices without a demonstrated need.
2. **Clear boundaries.** Separate UI, feature logic, domain contracts, application orchestration, and infrastructure integrations.
3. **One source of truth.** Use canonical domain services and workspace state. Avoid competing local and persistent implementations of the same capability.
4. **Security by design.** Backend authorization and database Row Level Security (RLS) are authoritative. Frontend checks improve UX but are not security controls.
5. **Validated actions.** UI, workflows, and AI may request actions through a shared validation and authorization path. They must not bypass domain services.
6. **Data integrity.** Preserve project ownership, resource relationships, folder hierarchy, membership, and storage references when migration is eventually approved.
7. **Test before advancing.** Each implementation stage must have explicit acceptance criteria and verified results.
8. **Document the current system.** Keep architecture decisions, setup instructions, environment requirements, and operational procedures aligned with the code.

## Provisional technical direction

The existing ARD Workspace implementation provides a useful reference for product behaviour and domain concepts. The initial technical direction for the rebuild is:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS and an accessible component system
- React Query for server-state coordination where appropriate
- Supabase for authentication, PostgreSQL, Row Level Security, storage, and realtime capabilities
- Vitest for unit and integration tests
- Playwright for critical end-to-end workflows
- Vercel for preview and production hosting

This stack is a starting proposal based on the existing application, not an irreversible architecture lock. Confirm versions, dependencies, folder boundaries, database contracts, and deployment configuration during the foundation phase.

## Architecture outline

The intended structure separates responsibilities while keeping the product in a modular monolith:

- **Application shell** — bootstrap, providers, routing, layouts, error boundaries, and session handling.
- **Feature modules** — authentication, dashboard, projects, workspace, notes, tasks, stories, files, media, assets, collaboration, search, commands, AI, and administration.
- **Domain layer** — entities, identifiers, validation rules, permissions, and feature contracts.
- **Application layer** — use cases, orchestration, command handling, and state reconciliation.
- **Infrastructure layer** — Supabase clients, database access, storage, realtime subscriptions, and external integrations.
- **Shared system** — design tokens, accessible UI primitives, common hooks, utilities, and test helpers.

Feature modules should depend on explicit contracts rather than reaching into one another's internal implementation.

## Data and security principles

The existing application is the reference for domain discovery. Its current data model must be verified against the live schema before any migration or schema change is designed.

Principles to evaluate and preserve where they remain correct:

- Projects are the ownership boundary unless the architecture audit establishes a stronger requirement for a separate workspace entity.
- Keep domain-specific records typed and explicit rather than introducing a generic resource table by default.
- Model folder hierarchy explicitly and preserve logical folder placement independently from physical object-storage paths.
- Represent relationships between stories/scenes and assets explicitly.
- Enforce access through backend authorization and RLS policies.
- Treat realtime events as updates to canonical application state, not as a second independent state store.
- Keep AI and search operations subject to the same permission boundaries as ordinary application actions.

**No production database changes, data migration, storage migration, or destructive cleanup are part of repository setup.** Those require a separately reviewed mapping, backup/restore plan, and explicit approval.

## Rebuild roadmap

| Stage | Focus | Exit condition |
| --- | --- | --- |
| 0. Discovery and architecture lock | Audit the existing application, product requirements, data model, security rules, and deployment setup | Current-state report, agreed scope, architecture decisions, and acceptance criteria |
| 1. Independent foundation | Repository structure, tooling, design tokens, app shell, routing, error handling, and CI | Clean install, lint, type-check, tests, and preview build pass |
| 2. Identity and projects | Authentication, session lifecycle, access control, project creation, and project listing | Auth and project flows work across refresh, sign-in, sign-out, and access boundaries |
| 3. Core workspace | Project overview, workspace navigation, notes, tasks, and stories/scenes | Core project workflows persist and recover correctly |
| 4. Files and resources | Folders, uploads, previews, media, assets, and resource relationships | File lifecycle and relationships are tested without data loss |
| 5. Workspace intelligence | Search, commands, activity, notifications, and state reconciliation | Actions are validated, authorised, observable, and recoverable |
| 6. Collaboration and AI | Membership, roles, realtime collaboration, and permission-aware AI assistance | Cross-user permissions and AI boundaries are verified |
| 7. Hardening and release | Accessibility, responsive behaviour, performance, security review, E2E coverage, and deployment checks | Release checklist passes and rollout is explicitly approved |

Stages may be refined after discovery. Do not skip exit criteria to accelerate delivery.

## Design direction

The current visual direction is a restrained, desktop-first workspace:

- Obsidian/dark neutral foundations.
- Ember/orange as a controlled accent.
- Soft, readable light typography.
- Clear hierarchy, generous usable spacing, and consistent component behaviour.
- No decorative gradients, neon glow layers, or glass effects by default.

Treat these as the working direction until the design system is formally reviewed and locked.

## Repository status

This repository is the **new rebuild starting point**. The README defines product intent and working principles; it does not indicate that the application foundation or any product feature has been implemented.

The previous ARD Workspace repository and deployed application remain reference systems during discovery. They should remain available as a fallback until the replacement is independently verified and a migration or cutover is explicitly approved.

## Working agreement

- Audit before implementation.
- Propose changes and acceptance criteria before building substantial features.
- Keep the existing production application intact.
- Do not copy legacy code blindly; verify each behaviour and dependency before carrying it forward.
- Do not change production data, migrate users or files, merge, or deploy without explicit approval.
- Report what was inspected, what changed, and what was actually tested. Never describe an unverified result as complete.

---

**ARD Creations · ARD Workspace**  
A structured workspace for building creative work.
