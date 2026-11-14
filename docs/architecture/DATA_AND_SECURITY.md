# ARD Workspace — Data and Security Principles

**Status:** Proposed baseline; live schema verification required.

## 1. Source of truth

The existing ARD Workspace repository and its deployed application are reference systems for domain discovery. Their migrations, generated types, documentation, and frontend assumptions must be compared with the actual Supabase schema before finalising contracts.

Do not assume generated types or historical documentation are the production truth.

## 2. Data modelling principles

Evaluate and preserve these established concepts where they remain correct:

- Projects are the primary ownership boundary.
- Keep domain-specific records explicit and typed; do not introduce a generic resources table by default.
- Notes, tasks, stories/scenes, and files have distinct domain semantics.
- Reusable assets may be represented through file records with a category, if the verified schema and workflows support that model.
- Model scene/story-to-asset relationships explicitly.
- Model folders as a recursive hierarchy where supported by the verified schema.
- Keep logical folder placement separate from physical object-storage paths.
- Preserve stable identifiers and relationship integrity during any future migration.

These are audit hypotheses, not permission to alter the database.

## 3. Authorization

- Supabase Row Level Security (RLS) and trusted backend authorization are authoritative.
- Frontend role checks are presentation logic only.
- Every read, write, update, delete, upload, download, and relationship mutation must be checked against the authenticated user and project membership.
- Never trust a client-supplied project ID, role, owner ID, or resource ID without server-side authorization.
- Administrative privileges must be explicit and narrowly scoped.

## 4. Storage

- Verify bucket names, object path conventions, file metadata, size limits, MIME handling, and signed URL policies before implementing upload flows.
- A database record and storage object must not be allowed to drift silently.
- Define cleanup and recovery behaviour for failed or interrupted uploads.
- Do not move, rename, or delete production objects during repository setup.

## 5. Realtime and activity

- Realtime events are signals to refresh or reconcile canonical state.
- Activity history is a product record, not a substitute for current domain state.
- Ensure subscriptions are scoped to authorised project data and are cleaned up when views or sessions change.
- Avoid duplicate activity events when retries or realtime reconnects occur.

## 6. Migration safety

No migration is authorised by this document.

Before any production migration, prepare and review:

1. Source and target schema inventory.
2. Stable-ID and foreign-key mapping.
3. RLS and role-policy mapping.
4. Storage bucket and object mapping.
5. Data volume and consistency checks.
6. Backup and tested restore procedure.
7. Dry-run results and reconciliation report.
8. Rollback/cutover plan.
9. Explicit approval.

Until then, the legacy production system remains untouched and available as a reference/fallback.
