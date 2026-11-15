# ARD Workspace — Initial Database Schema Proposal

**Status:** Decisions finalized; SQL/RLS design prepared for review; not applied to Supabase  
**Target:** `ard-workspace-db` (Mumbai, `ap-south-1`)  
**Repository:** `A04runSP/ard-aura-engine`  
**Branch:** `foundation/architecture-and-structure`  
**Scope:** Identity, projects, project membership, and project settings only

## 1. Finalized design decisions

1. A project is the primary ownership and access boundary.
2. Supabase Auth (`auth.users`) is the identity authority. Do not duplicate passwords or authentication credentials.
3. `public.profiles` stores application-facing profile attributes; its primary key is the Auth user UUID. **Profile creation is lazy:** create the profile during the first authenticated onboarding flow, not through an automatic Auth signup trigger.
4. `public.projects.owner_id` is the canonical owner reference. The owner is not duplicated in `project_members`.
5. `public.project_members` stores additional collaborators. Roles are `admin`, `editor`, and `viewer`; ownership is represented only by `projects.owner_id`.
6. **Member visibility:** every project member, including the owner, can read the complete member list for that project.
7. **Limited admin authority:** admins can manage editor/viewer memberships only. They cannot create, promote, demote, modify, or remove admin memberships. Only the project owner can manage admin memberships.
8. **Project deletion:** the initial product supports owner-controlled soft archive through `archived_at`. No client hard-delete operation or permanent-delete UI is included in v1.
9. **Initial settings:** `project_settings.preferences` starts as an empty JSON object. Do not predefine theme/layout/visibility settings until a concrete product requirement exists.
10. Every exposed public table must have RLS enabled and least-privilege grants. Frontend checks are not authorization.

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

No email copy: Auth remains the source of truth. The onboarding use case creates the profile lazily and handles the existing-row case safely. No Auth signup trigger in this phase.

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

No globally unique slug. Project names need not be globally unique. Owner transfer is out of scope and must not be possible through ordinary client updates.

### 3.3 `public.project_members`

| Column | Type | Rules |
|---|---|---|
| `id` | uuid | Primary key, default `gen_random_uuid()` |
| `project_id` | uuid | Not null, FK to `projects(id)`, cascade on project deletion |
| `user_id` | uuid | Not null, FK to `auth.users(id)`, cascade on user deletion |
| `role` | text | Not null; check: `admin`, `editor`, `viewer` |
| `invited_by` | uuid | Nullable FK to `auth.users(id)`, set null on deletion |
| `joined_at` | timestamptz | Not null, default `now()` |

Constraints and indexes:
- Unique `(project_id, user_id)`.
- Index `(user_id, project_id)` for listing a user's projects.
- Index `(project_id, role)` for project member/role lookups.
- The owner is not inserted as a member.
- No self-join or arbitrary project-ID membership insertion. Membership creation is restricted to owner/admin authority and the limited role rules above.

### 3.4 `public.project_settings`

| Column | Type | Rules |
|---|---|---|
| `project_id` | uuid | Primary key and FK to `projects(id)`, cascade on project deletion |
| `preferences` | jsonb | Not null, default empty JSON object; must remain a JSON object |
| `created_at` | timestamptz | Not null, default `now()` |
| `updated_at` | timestamptz | Not null, default `now()` |

JSONB is only for low-risk, evolving presentation preferences. Never store roles, permissions, ownership, or access grants in it.

## 4. Final authorization matrix

| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| Profile | Own row | Own row, lazily in onboarding | Own row | No client delete |
| Project | Owner and all project members | Authenticated user creates as owner | Owner/admin for ordinary project fields; owner ID immutable | No hard delete; owner may soft archive |
| Project member | Owner and every project member see all rows for that project | Owner may add admin/editor/viewer; admin may add editor/viewer only | Owner may manage all membership roles; admin may manage editor/viewer rows and keep them editor/viewer | Owner may remove any member; admin may remove editor/viewer only |
| Project settings | Owner and all project members | Owner/admin during project creation | Owner/admin | No direct client delete |

Additional constraints:
- Admins cannot modify or remove other admins.
- Admins cannot promote an editor/viewer to admin.
- No member can modify their own role unless they also have owner authority (the owner is not represented as a membership row).
- Only the owner can set or clear `archived_at`.
- No browser operation can change `owner_id` or hard-delete a project.

## 5. SQL/RLS implementation design

The companion document `INITIAL_DATABASE_SQL_AND_RLS_IMPLEMENTATION_PLAN.md` contains the staged SQL blueprint, policy predicates, helper-function security boundaries, transaction design, and verification matrix.

Key implementation rules:
- Enable RLS on all four tables.
- Use explicit grants; do not rely on project-wide default grants.
- Use `TO authenticated` plus ownership/membership predicates. Authentication alone is not authorization.
- Use both `USING` and `WITH CHECK` for UPDATE policies.
- Use narrowly scoped, non-exposed `private` helper functions for membership/role predicates where needed to avoid recursive RLS evaluation. Any SECURITY DEFINER helper must validate `auth.uid()`, pin `search_path`, fully qualify referenced objects, and have EXECUTE revoked from PUBLIC/anon.
- Keep project creation atomic: a narrowly scoped SECURITY INVOKER RPC inserts the project and its default settings in one transaction, with RLS still enforced.
- Keep archive as a separate owner-checked operation; do not grant direct client update access to `archived_at`.
- Do not add a permanent-delete endpoint.
- Timestamp maintenance must use one consistent database trigger pattern or one consistent application strategy.

## 6. Index and integrity plan

Required indexes beyond primary/unique constraints:
- `projects(owner_id, updated_at desc)`
- `project_members(user_id, project_id)`
- `project_members(project_id, role)`

Review all foreign-key columns used by joins and policy checks. Avoid speculative indexes. Use consistent `updated_at` maintenance.

## 7. Deliberately excluded from this first domain

Do not create these tables yet:
- Notes, tasks, stories, scenes, scripts.
- Files, folders, media, assets, scene-to-asset relationships.
- Invitations, notifications, activity, search documents.
- Subscriptions, billing, creator access, AI memory/context, audit-event pipeline.

Each domain requires its own workflow and access review. This first schema is not a generic catch-all.

## 8. Onboarding and project lifecycle

1. User signs in through Supabase Auth.
2. On first authenticated onboarding, app loads or creates the user's profile row (lazy profile creation; safe to retry).
3. User submits project name and optional description.
4. A controlled project-creation RPC inserts the project with `owner_id = auth.uid()` and inserts the empty default settings row atomically.
5. Project list queries return only projects owned by the user or where the user has a membership row, excluding archived projects from the normal active list.
6. Owner/admin collaborator workflows enforce the limited admin role rules at the database boundary.
7. Owner archives a project by setting `archived_at`; permanent deletion is not exposed in v1.

## 9. Migration gate

This document and its companion SQL plan are design artifacts only. Before implementation:
- Review the complete SQL draft and role matrix.
- Verify Data API exposure and default privilege settings for the new Supabase project.
- Create a migration using the Supabase CLI migration workflow only after explicit implementation approval.
- Apply only to `ard-workspace-db`, never the legacy database.
- Run Supabase security/performance advisors after DDL.
- Test with separate owner, admin, editor, viewer, unrelated authenticated user, and unauthenticated request contexts.
- Verify both allowed and denied operations, including role escalation, owner-ID tampering, archive attempts, and hard-delete attempts.

**Current state:** No migration has been applied; no tables, policies, functions, or schema objects have been created in Supabase.
