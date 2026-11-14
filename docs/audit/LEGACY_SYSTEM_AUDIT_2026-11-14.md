# ARD Workspace — Legacy System Audit

**Audit date:** 2026-11-14  
**Scope:** Legacy GitHub repository, supplied source snapshot and roadmap, live Supabase project metadata/schema inventory/advisors, and Vercel deployment records.  
**Status:** Discovery evidence; no implementation or production changes made.

## 1. Executive summary

The legacy ARD Workspace is materially more advanced than the initial rebuild skeleton implies. It already contains a substantial project-centric workspace with resource CRUD foundations, folders, relationships, persistent search, command/action orchestration, activity, notifications, collaboration membership, realtime subscriptions, AI context/intent services, administration, and subscription scaffolding.

The rebuild should therefore be a **clean architectural implementation of an established product**, not a blank-slate product invention. Preserve verified product behaviour and data semantics while replacing fragile coupling and inconsistent boundaries.

The most important risks discovered in this pass are:

1. The legacy `main` branch contains only `src/hooks/useWorkspaceState.tsx`, not the complete application. Vercel's latest production-target deployment attempted to build that branch and failed because `vite` was not found. The full application is on `ard-independent-stack-main`.
2. In the full branch, `useWorkspaceState.tsx` calls `useEffect` at lines 184 and 192 while the `invalidateRelationships` callback is declared at line 492. The second effect includes that callback in its dependency array. This is a concrete temporal-dead-zone ordering defect consistent with the reported `Cannot access 'D' before initialization` class of error. The precise browser stack trace for the user's latest reproduction was not available in this audit, so this is a strongly supported source-level finding, not a confirmed runtime trace.
3. The local Supabase CLI config points at project ref `oltankzbofqhorqofvbd`, while the legacy README documents production ref `zbzngbyuqgderewcearr`. The latter exists as the active healthy `ard-engine-prod` project. This mismatch must be resolved before any CLI migration operation.
4. Live Supabase advisors report security and performance warnings that require review. RLS is enabled on all 16 inventoried public tables, but RLS-enabled does not by itself establish that every policy/function/exposure is correctly scoped.
5. Legacy architecture documentation is inconsistent and some files describe capabilities as deferred even though live schema and source now contain them.

## 2. Evidence and confidence

### Inspected

- Live GitHub tree for `A04runSP/aura-engine-sparkle`, branch `ard-independent-stack-main`: 252 tracked files; tree not truncated.
- Live GitHub tree for branch `main`: one tracked file, `src/hooks/useWorkspaceState.tsx`.
- Supplied `aura-engine-source.zip`: 153 files, dated 2026-09-22. This is an older snapshot and is not treated as the current source of truth.
- Supplied `Aura_Engine_Workspace_Architecture_Roadmap(1).pdf`: five pages, baseline references `ard-independent-stack-main`.
- Selected live source files: `package.json`, `src/App.tsx`, `src/pages/Index.tsx`, `src/hooks/useWorkspaceState.tsx`, `src/integrations/supabase/client.ts`, `supabase/config.toml`, README and architecture documents.
- Live Supabase project inventory, public table inventory, applied migration list, security/performance/health advisor outputs.
- Vercel team/project link, production-target deployment list, deployment metadata and build events.

### Not performed

- No production writes, schema changes, migrations, storage changes, or user-data queries.
- No live user sign-in or authenticated browser workflow test.
- No full visual walkthrough of every application screen.
- No clean local install/build/test of the current GitHub branch in this audit.
- No exhaustive review of all 252 source files or every SQL policy/function definition.

Treat this report as a high-value discovery baseline, not a formal penetration test or complete code review.

## 3. Legacy repository and deployment state

### GitHub

| Item | Finding |
|---|---|
| Full application branch | `ard-independent-stack-main` |
| Full branch commit observed | `7b55ecd84cf277aee53c2f38e1e447d6782c065c` |
| Tracked files | 252 |
| `main` branch commit observed | `f5fe0098cc22b4ca9469e378197f7fc204216555` |
| Files on `main` | 1 — `src/hooks/useWorkspaceState.tsx` |
| Full app manifest | Present on `ard-independent-stack-main` |
| Vercel Git-linked repo | `A04runSP/aura-engine-sparkle` |

**Operational consequence:** Do not treat `main` as the canonical legacy source branch. Use `ard-independent-stack-main` for source discovery unless a newer verified branch is deliberately selected.

### Vercel

The linked Vercel project is `aura-engine-sparkle` (`prj_l0f1EcqkAarTG950uIMCeG2G2mZY`).

The latest production-target deployment record observed was:

- Deployment: `dpl_4S32a59VxevAhjMXm1Qw9GdFqMH6`
- Branch: `main`
- Commit: `f5fe0098cc22b4ca9469e378197f7fc204216555`
- State: `ERROR`
- Build error: `sh: line 1: vite: command not found`
- Vercel error: `Command "vite build" exited with 127`

The deployment cloned the `main` branch, which currently has only one tracked source file and no root `package.json`. This explains why the build cannot find Vite.

A previous production-target deployment from `feat/canonical-resource-open-action` was reported `READY` and marked a rollback candidate. A further ready deployment from `ard-independent-stack-main` was also present in history.

**Recommendation:** Keep the old project and its last known ready deployment as a fallback. Do not repoint domains, change the production branch, or redeploy as part of the new-repository discovery phase. Confirm the actual production domain-to-deployment mapping in Vercel before any later cutover.

Runtime error aggregation returned no runtime error clusters for the last seven days. This does not disprove the reported client-side error: browser exceptions may not be captured by the runtime error service.

## 4. Legacy frontend architecture

### Verified stack

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS and Radix/shadcn-style components
- TanStack React Query is installed and provided at the app root
- Supabase JavaScript client
- Vitest and Testing Library dependencies
- Vercel hosting and GitHub Actions validation

The current manifest is named `vite_react_shadcn_ts`; that is generic scaffold metadata and should be replaced in the new application.

### Current routing and workspace composition

- `src/App.tsx` owns providers and routes.
- The `/` route renders `src/pages/Index.tsx`.
- `Index.tsx` combines project dashboard and active project workspace using local `view` and `activeProject` state.
- The same page directly queries Supabase for project listing, access checks, creation, and opening.
- Workspace sections are rendered from the active section state.
- `WorkspaceStateProvider` wraps the workspace content and centralises a large amount of cross-resource state.

### Architectural strengths

- Project access is rechecked against the readable project row before opening.
- Supabase RLS is treated as the authoritative boundary in the source comments and data services.
- Resource reads and mutations have a central service layer in `src/lib/workspace`.
- Confirmed mutation results are reconciled into workspace state rather than assuming optimistic persistence.
- Request IDs protect workspace loads against stale responses.
- Resource relationships and search are represented as explicit services.
- Several important service/state behaviours have Vitest coverage.

### Architectural weaknesses to address in the rebuild

1. **Page orchestration is overloaded.** Dashboard, project navigation, project persistence, active workspace navigation, dialogs, and section rendering are combined in `Index.tsx`.
2. **Workspace state is too broad.** `useWorkspaceState.tsx` is a 555-line orchestration hook combining resource loading, folders, activity, membership, notifications, realtime, actions, commands, workflows, AI intent, and reconciliation.
3. **Persistence boundaries are inconsistent.** Some sections use domain services, while project operations in `Index.tsx` call Supabase directly.
4. **React Query is present but not the universal server-state contract.** The app also maintains a custom workspace snapshot. New architecture must explicitly decide which state is query-cache-owned and which is workspace-session coordination state; avoid duplicate cache/state ownership.
5. **Import-order/TDZ risk is real.** The callback ordering defect below demonstrates why dependency direction and hook declaration order need lint/test guardrails.
6. **Visual tokens are not fully centralised.** Legacy styles include inline gradients and injected CSS, so the new design system should start from tokens and components rather than copying old styles.

## 5. Reported project-opening crash — source-level finding

The current full application branch contains the following order in `src/hooks/useWorkspaceState.tsx`:

- First `useEffect`: line 184.
- Realtime `useEffect`: line 192.
- `invalidateRelationships` callback declaration: line 492.

The realtime effect references `invalidateRelationships` in its callback and dependency list before the `const invalidateRelationships = useCallback(...)` declaration has executed.

Because `const` bindings are in the temporal dead zone until initialized, this ordering can throw a `ReferenceError` during hook execution. A production minifier can shorten the variable name, explaining an error message that refers to a single-letter identifier such as `D`.

This is a strong source-level explanation for the reported error when the project workspace mounts. It should be reproduced and corrected in a dedicated legacy diagnostic branch only if the user chooses to keep patching the old application. The new rebuild should prevent this class of defect through smaller hooks, pure modules, import-cycle checks, and focused mount tests.

## 6. Product capabilities inventory

The following are present in the live source tree and/or live database schema. Presence does not mean every workflow is complete or verified end-to-end.

| Domain | Evidence in current system | Rebuild treatment |
|---|---|---|
| Authentication | Auth page/callback, `useAuth`, Supabase Auth client | Preserve flow requirements; redesign boundaries |
| Profiles and roles | `profiles`, `user_roles`, role hook | Preserve semantics; reverify policies |
| Projects | Project CRUD/dashboard in `Index.tsx` | First-class core feature |
| Workspace overview | Overview section and resource cards | Preserve user workflow; redesign UI |
| Notes | `project_notes`, Notes section and service utilities | Core resource |
| Tasks | `project_tasks`, Tasks section | Core resource |
| Stories/scenes | `project_stories`, Story section | Core resource |
| Files/media | `project_files`, folders, upload/viewer/media components | Core resource and storage lifecycle |
| Assets | File category `asset`, asset picker, scene links | Reusable resource capability |
| Folders | `project_folders`, parent relationship and folder UI | Preserve hierarchy and ownership rules |
| Relationships | `scene_assets`, `workspace_resource_relationships` | Preserve explicit relationship semantics |
| Search | Persistent search service and `project_search_documents` | Core after resource model |
| Commands/workflows | Command registry/service, action and workflow services | Later intelligence layer |
| Activity | Project/workspace activity services and event table | Later intelligence layer |
| Notifications | Notification service and table | Later intelligence layer |
| Collaboration | Membership service, `project_members`, collaborators UI | Later collaboration layer |
| Realtime | Workspace realtime service and migration | Add only where product requirements justify it |
| AI | Intent, context, retrieval and assistant services; edge function | Defer until permissions/resources are stable |
| Admin/creator access | Admin pages, creator applications, profiles/roles | Separate platform administration scope |
| Subscription | Subscription page/table and edge function | Later monetization scope |
| Code workspace | Code workspace and repository browser components | Confirm first-release priority before rebuilding |

## 7. Live Supabase audit

### Project identity

The live Supabase project list contains:

- Name: `ard-engine-prod`
- Ref: `zbzngbyuqgderewcearr`
- Region: `ap-northeast-2`
- Status: `ACTIVE_HEALTHY`
- PostgreSQL: 17.11

The legacy README identifies this as production. The repository's `supabase/config.toml` instead sets `project_id = "oltankzbofqhorqofvbd"`.

**Action required:** Resolve whether this config is stale or intentionally points to a different project. Never run Supabase CLI migrations until the target ref is explicitly verified.

### Schema inventory

The live public schema returned 16 tables; RLS was enabled on all 16:

- `profiles`
- `projects`
- `project_notes`
- `project_tasks`
- `project_stories`
- `project_files`
- `project_folders`
- `scene_assets`
- `workspace_resource_relationships`
- `project_search_documents`
- `project_activity_events`
- `project_notifications`
- `project_members`
- `creator_applications`
- `subscriptions`
- `user_roles`

The live schema confirms that folders, persistent search documents, general resource relationships, activity, notifications, and membership are not merely future concepts. They exist in production schema.

The project had 43 applied migrations at the time of inspection. The latest listed migration was `20261029102238_fix_project_search_document_trigger_row_fields`.

### Important modelling confirmation

- Project is the primary resource container and access boundary.
- Notes, tasks, stories, and files have dedicated tables.
- Assets are represented in `project_files` with a category.
- Folder hierarchy is represented by `project_folders.parent_id`.
- Files and notes can reference folders through `folder_id`.
- `scene_assets` links story/scene records to file assets.
- `workspace_resource_relationships` supports broader typed relationships.
- `project_search_documents` provides a persistent search projection.

Do not introduce a generic resources table or first-class workspace table in the rebuild unless a documented requirement proves it necessary.

### Supabase advisor findings

The live advisor scan returned no health lints, but did return security and performance warnings.

Security warnings observed:

- 16 public tables are discoverable in the GraphQL schema to authenticated users. This is a schema-exposure warning; it is not by itself proof that RLS can be bypassed.
- 8 `SECURITY DEFINER` functions are executable by the authenticated role, including `get_user_emails()`, role/membership helpers, and search functions. Their intended caller scope and authorization logic need direct SQL review.
- Leaked-password protection is disabled in Supabase Auth.

Performance warnings observed:

- 57 RLS auth-initplan findings (auth/current-setting expressions may be re-evaluated per row).
- 31 multiple-permissive-policy findings.
- 14 foreign keys without covering indexes.
- 18 indexes reported unused by the advisor snapshot.

These are findings to triage, not instructions to blindly change production. Unused-index advice must be evaluated against workload history and expected future queries. Policy consolidation must preserve intended owner/member/editor access semantics. Any fix requires a separate reviewed migration and approval.


### Targeted SQL policy/function review

Read-only queries inspected the live `pg_policies` catalog and definitions/ACLs for the advisor-flagged `SECURITY DEFINER` helpers.

- Policies are explicitly scoped to the `authenticated` role.
- Owner and project-member/editor policies coexist on several resource tables. PostgreSQL permissive policies combine with OR semantics, so the combined effective access must be reasoned about as a whole—not policy-by-policy.
- Project member/editor policies call `is_project_member`, `is_project_editor`, and `project_member_role`.
- The helpers `is_project_member`, `is_project_editor`, `project_member_role`, and `user_owns_project_folder` accept a caller-supplied user ID and are executable by `authenticated`. Their bodies return membership/role/ownership facts for the supplied IDs. This creates a potential cross-user/project metadata-oracle surface even though the policies themselves pass `auth.uid()`. Confirm whether public RPC invocation is needed; if not, redesign execution exposure without breaking RLS helper calls.
- `has_role` rejects a supplied user ID that differs from `auth.uid()`.
- `search_project_workspace` checks membership for `auth.uid()` and constrains the query to the supplied project ID.
- `get_user_emails` returns email rows only when `has_role(auth.uid(), 'admin')` succeeds. This is a high-sensitivity function and should remain strictly admin-gated; verify the admin-role assignment and invocation path.
- The reviewed functions set `search_path` to `public` and qualify sensitive table/function references. Keep this property in any future replacement.

This review does not establish an exploitable data breach. It identifies callable function surfaces and policy combinations that deserve explicit threat-model review and tests using at least owner, editor, viewer, non-member, and admin identities.

## 8. Existing documentation drift

The supplied roadmap PDF describes folders, persistent search, activity, collaboration, and parts of intelligence as future work. The current live schema and source now contain those systems.

The live `docs/RESOURCE_MODEL.md` also says first-class folders, persistent search, activity, and collaboration are deferred, while newer source and migrations implement them. The documentation should be versioned as historical where appropriate and replaced with a single current-state architecture reference.

The PDF remains useful for product intent and sequencing:
- Project-centric workspace.
- Notes, stories, files, and assets are connected resources.
- Core persistence and storage should precede search/AI.
- AI should sit above structured workspace context.
- Build incrementally and retain RLS as the security boundary.

## 9. Rebuild decisions recommended

### Preserve

- Project-centric ownership and access boundary.
- Typed domain tables and resource-specific semantics.
- Asset categorisation on file records unless new requirements disprove it.
- Explicit scene/asset and general resource relationships.
- Recursive folder model.
- Persistent search projection concept.
- RLS as authoritative security boundary.
- Confirmed-write/reconciliation semantics.
- Permission-aware membership and AI constraints.
- Existing product workflows that are verified and valued.

### Redesign

- App shell and routing boundaries.
- Dashboard/project/workspace separation.
- Workspace state orchestration into smaller feature-level hooks/use cases.
- Data access so UI components do not call Supabase directly.
- Central environment validation and Supabase project configuration.
- Error handling, telemetry, and import-cycle prevention.
- Design system and responsive layouts.

### Defer until foundation is stable

- AI semantic retrieval and automation.
- Realtime collaboration enhancements.
- Subscription billing and entitlement enforcement.
- Advanced admin analytics.
- Nonessential code/repository workspace features until first-release scope is agreed.

## 10. Recommended rebuild architecture adjustments

Use a modular monolith, but keep the first implementation smaller than the full planned feature tree:

1. `app`: bootstrap, providers, routes, error boundaries.
2. `domain`: project, membership, resource and permission contracts.
3. `application`: project and resource use cases.
4. `infrastructure/supabase`: typed client and adapters.
5. `features/auth`: identity/session UI.
6. `features/projects`: project list/create/open.
7. `features/workspace`: workspace shell and overview.
8. `features/resources`: notes/tasks/stories/files/assets, introduced in coherent slices.
9. `shared`: design tokens and accessible primitives.

Do not create every advanced feature at once. Add search, commands, activity, collaboration, and AI only after the core resource lifecycle has acceptance tests.

## 11. Stage 0 exit checklist

- [x] Inspect live legacy GitHub branch and repository tree.
- [x] Compare the supplied source snapshot and roadmap PDF.
- [x] Inspect selected routing, project, workspace-state, Supabase client/config files.
- [x] Inspect live Supabase project identity, public table inventory, applied migration list, and advisors.
- [x] Inspect Vercel linked project and production-target deployment history/build error.
- [ ] Verify production domain alias and intended Vercel production branch with the owner.
- [ ] Reconcile the stale Supabase local project ref without changing production.
- [ ] Complete targeted review of SQL RLS policies and SECURITY DEFINER functions.
- [ ] Agree first-release feature scope and code workspace inclusion.
- [ ] Approve final architecture and design tokens.

## 12. Explicit safety boundary

This audit is read-only. No Supabase schema, policy, data, storage, environment, Vercel configuration, deployment, or legacy source was modified. The new repository contains only the separate documentation/skeleton work on its draft branch.

No migration or cutover should begin until the open Stage 0 items are resolved and explicitly approved.
