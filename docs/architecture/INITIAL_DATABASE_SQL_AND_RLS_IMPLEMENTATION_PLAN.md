# ARD Workspace — Initial Database SQL & RLS Implementation Plan

**Status:** Prepared SQL blueprint for review only — NOT applied  
**Target:** `ard-workspace-db` (`zalfrtsjpiipijrltpyx`)  
**Branch:** `foundation/architecture-and-structure`  
**Companion:** `INITIAL_DATABASE_SCHEMA_PROPOSAL.md`

> This is a review artifact, not an executable migration. Do not paste it into the Supabase SQL editor yet. The database remains unchanged.

## 1. Final decisions encoded

- Lazy profile creation during authenticated onboarding; no Auth signup trigger.
- Soft archive only in v1; no client hard delete.
- All project members can read the full project member list.
- Admins can manage editor/viewer memberships only; owner alone manages admin memberships.
- Project settings start as `preferences = '{}'`; no speculative setting columns.

## 2. Implementation sequence

1. Confirm project Data API exposure and default grants; use explicit grants regardless of platform defaults.
2. Create the `private` schema and tightly scoped RLS helper functions.
3. Create the four tables, constraints, indexes, and a shared `updated_at` trigger function.
4. Enable RLS on every table.
5. Apply table and column grants, then RLS policies.
6. Add a SECURITY INVOKER project-creation RPC for atomic project + settings creation.
7. Add a separate owner-only archive RPC.
8. Run static SQL review, advisors, and the identity-based test matrix before any production-facing integration.

## 3. SQL blueprint — schema

```sql
-- Draft only. Target the new ard-workspace-db project after approval.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (display_name is null or char_length(btrim(display_name)) between 1 and 80)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint projects_name_length
    check (char_length(btrim(name)) between 1 and 120),
  constraint projects_description_length
    check (description is null or char_length(description) <= 2000)
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  constraint project_members_unique_user unique (project_id, user_id)
);

create table public.project_settings (
  project_id uuid primary key references public.projects(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb
    check (jsonb_typeof(preferences) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_updated_idx
  on public.projects (owner_id, updated_at desc);
create index project_members_user_project_idx
  on public.project_members (user_id, project_id);
create index project_members_project_role_idx
  on public.project_members (project_id, role);
```

## 4. Timestamp maintenance

Use one trigger strategy for all mutable tables. The trigger function must be owned by a trusted database role, have a fixed `search_path`, and be unavailable to client execution directly. Review ownership and function grants during migration authoring.

Draft function body:

```sql
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
```

Attach BEFORE UPDATE triggers to `profiles`, `projects`, and `project_settings`. The trigger function is invoked by the trigger; do not grant browser EXECUTE.

## 5. RLS helper functions

Directly querying `project_members` from its own RLS policy can cause recursive policy evaluation. Use small helper functions in the non-exposed `private` schema. These are intentionally SECURITY DEFINER because they need a narrow read path that does not recursively invoke the table's RLS policy.

The final migration must:
- Use a trusted owner for these functions.
- Pin `search_path = pg_catalog`.
- Fully qualify `auth.uid()` and `public.project_members`.
- Explicitly reject null `auth.uid()`.
- Accept only a project UUID; never accept a caller-supplied user UUID.
- Return only a boolean.
- Revoke EXECUTE from PUBLIC and anon; grant EXECUTE to authenticated.
- Keep the `private` schema unexposed.

Draft predicates:

```sql
create or replace function private.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.project_members pm
       where pm.project_id = p_project_id
         and pm.user_id = auth.uid()
     );
$$;

create or replace function private.has_project_role(
  p_project_id uuid,
  p_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.project_members pm
       where pm.project_id = p_project_id
         and pm.user_id = auth.uid()
         and pm.role = any (p_roles)
     );
$$;

create or replace function private.is_project_owner(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.projects p
       where p.id = p_project_id
         and p.owner_id = auth.uid()
     );
$$;

revoke all on function private.is_project_member(uuid) from public, anon, authenticated;
revoke all on function private.has_project_role(uuid, text[]) from public, anon, authenticated;
revoke all on function private.is_project_owner(uuid) from public, anon, authenticated;
grant execute on function private.is_project_member(uuid) to authenticated;
grant execute on function private.has_project_role(uuid, text[]) to authenticated;
grant execute on function private.is_project_owner(uuid) to authenticated;
```

Security review note: verify function ownership and schema CREATE privileges during migration review. Do not add any other SECURITY DEFINER function without a separate threat review.

## 6. RLS policy matrix and predicates

Enable RLS on all four tables:

```sql
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_settings enable row level security;
```

### Profiles

- SELECT: `id = (select auth.uid())`
- INSERT: same identity predicate in `WITH CHECK`
- UPDATE: identity predicate in both `USING` and `WITH CHECK`
- No DELETE policy.

### Projects

- SELECT: `owner_id = (select auth.uid()) OR private.is_project_member(id)`
- INSERT: `owner_id = (select auth.uid())`
- UPDATE: owner or project admin, with the same predicate in `USING` and `WITH CHECK`.
- No DELETE policy.
- Column grants must exclude `owner_id` from browser UPDATE.
- Direct browser UPDATE must not include `archived_at`; archive is performed only by the owner-only RPC below.
- Normal active-project reads should filter `archived_at IS NULL` in the application query. If archived rows must be hidden at the security boundary, add that condition to the SELECT policy as a separately reviewed policy decision.

### Project members

- SELECT: `private.is_project_owner(project_id) OR private.is_project_member(project_id)`. This makes the full list visible to all project members.
- INSERT:
  - Owner may add `admin`, `editor`, or `viewer`.
  - Admin may add `editor` or `viewer` only.
  - No caller may insert a membership for the project owner.
- UPDATE:
  - Owner may update any membership row and may set any allowed role.
  - Admin may update only a current `editor`/`viewer` row and the new role must remain `editor`/`viewer`.
  - Both `USING` and `WITH CHECK` must enforce these conditions.
  - Prevent changes to `project_id` and `user_id` through column-level grants; membership identity is immutable in v1.
- DELETE:
  - Owner may remove any membership row.
  - Admin may remove only editor/viewer rows.
  - No member may remove the owner because the owner has no membership row.

### Project settings

- SELECT: owner or any project member.
- INSERT: owner/admin only; normally performed by the atomic project-creation RPC.
- UPDATE: owner/admin only, with both `USING` and `WITH CHECK`.
- No direct DELETE policy.

## 7. Explicit grants (principle of least privilege)

The final SQL should revoke broad defaults before granting exact operations. Suggested intent:

- Revoke all table privileges on these four tables from `anon`, `authenticated`, and `public`.
- Grant authenticated SELECT/INSERT/UPDATE on profiles; no DELETE.
- Grant authenticated SELECT/INSERT on projects; grant UPDATE only on `name`, `description`, and `updated_at` (not `owner_id` or `archived_at`); no DELETE.
- Grant authenticated SELECT/INSERT/UPDATE/DELETE on project_members only as needed by its policies; grant UPDATE only on `role` and perhaps `invited_by`, not on `project_id` or `user_id`. Prefer making `invited_by` immutable after insert.
- Grant authenticated SELECT/INSERT/UPDATE on project_settings; no DELETE.
- No privileges to `anon`.
- Confirm the project's default privileges do not silently re-grant broad access to future public objects.

RLS remains mandatory: grants determine whether an operation is reachable; policies determine which rows and values are allowed.

## 8. Atomic project creation and soft archive

Use SECURITY INVOKER RPCs so table grants and RLS still apply. Both operations are one database transaction per RPC call.

Project creation draft:

```sql
create or replace function public.create_project(
  p_name text,
  p_description text default null
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  v_project_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_name is null or char_length(btrim(p_name)) not between 1 and 120 then
    raise exception 'Project name must be between 1 and 120 characters';
  end if;

  if p_description is not null and char_length(p_description) > 2000 then
    raise exception 'Project description is too long';
  end if;

  insert into public.projects (owner_id, name, description)
  values (auth.uid(), btrim(p_name), p_description)
  returning id into v_project_id;

  insert into public.project_settings (project_id, preferences)
  values (v_project_id, '{}'::jsonb);

  return v_project_id;
end;
$$;

revoke all on function public.create_project(text, text) from public, anon;
grant execute on function public.create_project(text, text) to authenticated;
```

The function must be SECURITY INVOKER, not SECURITY DEFINER. Its caller needs the corresponding table privileges and must pass the INSERT policies for both tables. A failure inserting settings rolls back the project insert.

Owner-only archive draft:

```sql
create or replace function public.archive_project(p_project_id uuid)
returns void
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.projects
     set archived_at = now()
   where id = p_project_id
     and owner_id = auth.uid()
     and archived_at is null;

  if not found then
    raise exception 'Project not found or archive not permitted';
  end if;
end;
$$;

revoke all on function public.archive_project(uuid) from public, anon;
grant execute on function public.archive_project(uuid) to authenticated;
```

Because the archive RPC updates a column not granted for direct browser updates, verify PostgreSQL's column privilege behavior for function-invoker execution before approving this exact split. If the function cannot safely perform the restricted column update as invoker, redesign with a narrowly scoped owner-checked function and document the security-definer exception explicitly; do not silently elevate it.

## 9. Important pre-apply review findings

1. **Member identity immutability:** column grants and policy checks must prevent moving a membership row to another project/user.
2. **Admin boundary:** test current-row role and new-row role separately; an admin must not promote a viewer to admin or edit/remove an admin.
3. **Project owner immutability:** no client update grant on `owner_id`; ownership transfer is a future dedicated workflow.
4. **Archive authorization:** only owner; archive is not hard delete. Confirm invoker RPC privileges as noted above.
5. **Atomicity:** project + settings are created in one RPC transaction.
6. **Function exposure:** revoke default PUBLIC/anon EXECUTE on RPCs and helpers. Keep internal helpers in non-exposed `private`.
7. **Profile creation race:** use an idempotent onboarding upsert for the authenticated user's own UUID; do not rely on a trigger.
8. **Data API:** table grants and RLS are separate controls. Verify Data API exposure settings and default privileges before applying.
9. **Archived project semantics:** decide before UI integration whether archived projects remain visible to collaborators in a dedicated archive view. RLS should not accidentally hide them from owners.

## 10. Required verification matrix

Use isolated authenticated test identities and verify both positive and negative cases:

| Actor | Expected allowed | Must be denied |
|---|---|---|
| Owner | Read all project data; update project fields; manage all member roles; update settings; archive | Change owner_id directly; hard-delete project |
| Admin | Read project and full member list; update ordinary project fields/settings; add/edit/remove editors/viewers | Add/promote/edit/remove admins; archive project; change owner_id |
| Editor | Read project and full member list | Update project/settings; manage members; archive |
| Viewer | Read project and full member list | Update project/settings; manage members; archive |
| Unrelated authenticated user | Own profile and own projects | Read or mutate this project's rows |
| Unauthenticated | No access to these tables/functions | All profile/project/member/settings access |

Additional adversarial tests:
- Insert a project with another user's owner_id.
- Attempt owner_id mutation and membership project_id/user_id mutation.
- Attempt admin self-promotion and admin-to-admin changes.
- Attempt a member-list read from a non-member.
- Attempt project hard DELETE.
- Attempt archive as admin/editor/viewer.
- Force project_settings insert failure and confirm project creation rolls back.
- Verify archived project appears only in intended archive views and cannot be modified by non-owners.
- Verify no helper/RPC is executable by anon or PUBLIC.

## 11. Apply gate

No SQL in this document has been executed. No tables, functions, policies, grants, triggers, or migrations have been created. Before applying:
- Resolve the archive RPC column-privilege review point.
- Finalize exact grants and RLS policy SQL (especially membership UPDATE/DELETE).
- Run a static SQL review and test against a disposable local Supabase/Postgres environment.
- Obtain explicit user approval to create the migration and apply it to `ard-workspace-db`.
- After application, run Supabase security and performance advisors and execute the full actor matrix.
