# ARD Workspace — Implementation Roadmap

**Status:** Proposed staged plan  
**Rule:** Each stage has a reviewable scope and exit criteria. Do not advance by assumption.

## Stage 0 — Discovery and architecture lock

**Scope**
- Audit the legacy repository and deployed application.
- Reconcile current code, architecture documents, Supabase migrations, generated types, and actual schema.
- Inventory user-facing workflows and identify which capabilities are required for the first release.
- Define roles, permissions, environments, and operational constraints.
- Confirm design tokens and responsive behaviour.

**Deliverables**
- Current-state audit.
- Feature inventory and priority map.
- Approved system architecture and decision log.
- Verified data/security model.
- First-release scope and acceptance criteria.

**Exit criteria**
- No unresolved critical ambiguity about project ownership, access control, or core workflows.
- Architecture and first-release scope explicitly approved.

## Stage 1 — Independent foundation

**Scope**
- Package manifest, scripts, dependency lockfile, TypeScript, Vite, lint/format, test configuration.
- App bootstrap, router, providers, error boundaries, environment validation.
- Design tokens and accessible base components.
- CI checks and preview deployment configuration (preview only).

**Exit criteria**
- Clean install and reproducible build.
- Lint, type-check, tests, and build pass.
- No production secrets in source control.
- Preview verified on mobile and desktop.

## Stage 2 — Identity and projects

**Scope**
- Supabase client and environment handling.
- Authentication and session lifecycle.
- Profile bootstrap and protected routes.
- Project list, create, open, and project-level access control.

**Exit criteria**
- Sign-in, sign-out, refresh, expired-session, and protected-route flows verified.
- Project ownership and access policies tested against RLS.

## Stage 3 — Core workspace

**Scope**
- Project overview and navigation.
- Notes, tasks, stories/scenes, and scripts where confirmed in scope.
- Loading, empty, error, and recovery states.

**Exit criteria**
- Core create/read/update/delete workflows persist and recover.
- No cross-project data leakage.
- Critical flows covered by automated tests.

## Stage 4 — Files and resources

**Scope**
- Folder hierarchy.
- Upload, preview, download, move, rename, and delete.
- Media and asset categorisation.
- Story/scene-to-asset relationships.

**Exit criteria**
- File lifecycle tested, including failures and interrupted uploads.
- Database metadata and storage objects remain consistent.
- Authorization and file limits verified.

## Stage 5 — Workspace intelligence

**Scope**
- Search.
- Validated command/action pipeline.
- Activity and notifications.
- Canonical state reconciliation and realtime refresh.

**Exit criteria**
- Search respects access boundaries.
- Commands validate and authorize before mutation.
- Realtime does not duplicate or corrupt canonical state.

## Stage 6 — Collaboration and AI

**Scope**
- Project membership and role management.
- Realtime collaboration where required.
- Permission-aware AI context and action requests.

**Exit criteria**
- Multi-user permissions tested.
- AI cannot bypass domain services or RLS.
- Sensitive data is not exposed across project boundaries.

## Stage 7 — Hardening and release

**Scope**
- Accessibility and responsive audit.
- Performance and security review.
- E2E coverage, observability, backup/restore and operational runbooks.
- Release and migration readiness.

**Exit criteria**
- Release checklist passes.
- Restore and rollback procedures are tested.
- Production cutover is separately approved.

## Out of scope until separately approved

- Production database/schema changes.
- User, project, file, or storage migration.
- Destructive cleanup of the legacy system.
- Production deployment or domain cutover.
- Subscription/payment activation.
