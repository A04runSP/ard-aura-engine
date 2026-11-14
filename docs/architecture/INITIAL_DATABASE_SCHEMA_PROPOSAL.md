# ARD Workspace — Initial Database Schema Proposal

**Status:** Proposed for review; not applied to Supabase  
**Target:** `ard-workspace-db` (Mumbai, `ap-south-1`)  
**Repository:** `A04runSP/ard-aura-engine`  
**Branch:** `foundation/architecture-and-structure`  
**Scope:** Identity, projects, project membership, and project settings only

## 1. Design decisions

1. A project is the primary ownership and access boundary.
2. Supabase Auth (`auth.users`) is the identity authority. Do not duplicate passwords or authentication credentials.
3. `public.profiles` stores application-facing profile attributes; its primary key is the Auth user UUID.
4. `public.projects.owner_id` is the canonical owner reference.
5. `public.project_members` stores additional collaborators. The project owner is not duplicated as a membership row.
6. Membership roles are deliberately limited to `admin`, `editor`, and `viewer`. Ownership is represented by `projects.owner_id`, not a client-editable role.
7. `public.project_settings` is a one-to-one extension of a project. Keep only project-level preferences here; do not turn it into a generic resource store.
8. Every exposed public table must have RLS enabled and least-privilege grants. Frontend checks are not authorization.

## 2. Entity relationship

```text
auth.users
    │ 1:1
    ▼
profiles

profiles (user)
    │ 1:N owner_id
    ▼
projects ────────────── 1:1 ───────────── project_settings
    │
    │ 1:N
    ▼
project_members
    ▲
    │ N:1
profiles (member user)
```

## 3. Proposed tables

### 3.1 `public.profiles`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key; FK to `auth.users(id)`, cascade on Auth-user deletion |
| `display_name` | text | Nullable; trimmed, max 80 characters |
| `avatar_path` | text | Nullable Storage object path, not a public URL |
| `created_at` | timestamptz | Not null, default `now()` |
| `updated_at` | timestamptz | Not null, default `now()` |

No email copy in this first profile table: Auth remains the source of truth for email. A profile row may be created during the first authenticated onboarding flow; an automatic Auth trigger is a separate implementation decision.

### 3.2 `public.projects`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `owner_id` | uuid | Not null, FK to `auth.users(id)`, restrict deletion while owned projects exist |
| `name` | text | Not null, trimmed, 1–120 characters |
| `description` | text | Nullable, max 2,000 characters |
| `created_at` | timestamptz | Not null, default `now()` |
| `updated_at` | timestamptz | Not null, default `now()` |
| `archived_at` | timestamptz | Nullable; soft archive, not deletion |

Do not add a globally unique slug yet. There is no confirmed routing or product requirement for it. Project names need not be globally unique.

### 3.3 `public.project_members`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `project_id` | uuid | Not null, FK to `projects(id)`, cascade on project deletion |
| `user_id` | uuid | Not null, FK to `auth.users(id)`, cascade on user deletion |
| `role` | text | Not null; check: `admin`, `editor`, `viewer` |
| `invited_by` | uuid | Nullable FK to `auth.users(id)`, set null on deletion |
| `joined_at` | timestamptz | Not null, default `now()` |

Constraints:
- Unique `(project_id, user_id)`.
- Index `(user_id, project_id)` for listing a user's projects.
- Index `(project_id, role)` for project member/role lookups.
- Do not allow a user to add themselves as a member by directly submitting an arbitrary project ID. Membership creation must be authorized by the project owner/admin or a later invitation-acceptance workflow.

### 3.4 `public.project_settings`

| Column | Type | Rules |
|---|---|---|
| `project_id` | uuid | Primary key and FK to `projects(id)`, cascade on project deletion |
| `preferences` | jsonb | Not null, default empty JSON object; must remain a JSON object |
| `created_at` | timestamptz | Not null, default `now()` |
| `updated_at` | timestamptz | Not null, default `now()` |

Use typed columns for settings that become queryable or security-sensitive. JSONB is only for low-risk, evolving presentation preferences; never store authorization roles or access grants in this JSON.

## 4. Authorization model

All policies use the authenticated identity from `auth.uid()`. Do not use user-editable `raw_user_meta_data` as an authorization source.

| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| Profile | Own row | Own row | Own row | No client delete in v1 |
| Project | Owner or project member | Authenticated user sets own `owner_id` | Owner or admin; owner transfer handled separately | Owner only; soft archive preferred |
| Project member | Project owner/admin and project members, subject to member-list visibility decision | Owner/admin only | Owner/admin only | Owner/admin only |
| Project settings | Owner or project member | Owner/admin | Owner/admin | Owner only |

RLS implementation requirements:
- Enable RLS on all four tables.
- Add explicit grants only for the operations the browser app needs.
- Every project-scoped policy must verify ownership or a row in `project_members`.
- Project UPDATE policies require both `USING` and `WITH CHECK`.
- A member must not be able to change `projects.owner_id`.
- A member must not be able to elevate their own role or alter another user's membership.
- Avoid recursive RLS policy dependencies. If policy helpers are required, review their execution context and grants; do not casually introduce `SECURITY DEFINER`.
- Keep Auth-user deletion, ownership transfer, and last-owner protection as explicit lifecycle workflows.

## 5. Index and integrity plan

Required indexes beyond primary/unique constraints:
- `projects(owner_id, updated_at desc)`
- `project_members(user_id, project_id)`
- `project_members(project_id, role)`

Foreign-key columns used for joins or policy checks should be indexed. Add only indexes supported by actual query paths; review query plans as usage develops.

Timestamp maintenance should be consistent. Choose either application-supplied `updated_at` values or a shared database trigger pattern; do not mix inconsistent approaches across tables.

## 6. Deliberately excluded from this first domain

Do not create these tables yet:
- Notes, tasks, stories, scenes, scripts.
- Files, folders, media, assets, scene-to-asset relationships.
- Invitations, notifications, activity, search documents.
- Subscriptions, billing, creator access, AI memory/context, audit-event pipeline.

Those domains require their own workflow and access review. This first schema is not a generic catch-all.

## 7. Creation and onboarding flow

1. User signs in through Supabase Auth.
2. App loads or creates the user's profile row.
3. User submits project name and optional description.
4. A controlled project-creation use case inserts a project with `owner_id = auth.uid()`.
5. It creates the default `project_settings` row.
6. Project list queries return only projects owned by the user or where the user has a membership row.
7. Collaborators are added only through an authorized owner/admin workflow.

The project and default settings should be created atomically. Prefer a narrowly scoped database function or a trusted application transaction path after its security design is reviewed; do not rely on two unrelated browser requests that can leave a half-created project.

## 8. Decisions requiring confirmation before migration

1. **Profile creation:** create profile lazily during onboarding, or automatically after Auth signup?
2. **Project deletion:** soft archive only in the UI, with hard deletion reserved for a later owner-only workflow?
3. **Member visibility:** can every project member see the full member list, or only owners/admins?
4. **Admin permissions:** may project admins manage other admins, or only editors/viewers?
5. **Settings:** are any project settings needed in the first persisted-project release beyond an empty preferences object?

## 9. Migration gate

This document is a proposal, not a migration. Before implementation:
- Review the entity model and role matrix.
- Finalize the five decisions above.
- Write and review SQL, constraints, indexes, grants, and RLS policies together.
- Run Supabase security and performance advisors after applying to the new database.
- Verify policies using separate authenticated test identities and unauthorized-access tests.
- Generate and commit a proper migration file to the development branch.

No legacy database, production schema, or production deployment is part of this proposal.
