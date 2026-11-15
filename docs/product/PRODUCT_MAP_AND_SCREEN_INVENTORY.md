# ARD Workspace — Product Map & Screen Inventory

Status: Discovery draft — not an implementation specification  
Source of truth reviewed: legacy repository branch `ard-independent-stack-main` at audited source snapshot; the September 2026 ZIP and legacy architecture documents are historical supporting references.  
Rule: feature presence in source is not proof of end-to-end runtime quality. Items below are classified as source-confirmed, proposed organisation, or requiring verification.

## 1. Product model

The product is organised around a project as the primary ownership and access boundary.

```text
ARD Workspace
├── Account & Identity
│   ├── Authentication
│   ├── Profile / role
│   └── Subscription / access
├── Project Hub
│   ├── Project discovery
│   ├── Create project
│   ├── Search / sort projects
│   └── Project settings
└── Project Workspace
    ├── Overview
    ├── Story
    ├── Workspace
    │   ├── Notes
    │   └── Tasks
    ├── Code Workspace
    ├── Files & Folders
    │   └── Repository tree (separate source-tree concept)
    ├── Media
    └── Assets
```

Cross-cutting capabilities found in the current source include workspace search, command palette, AI assistant, activity, notifications, resource relationships, collaboration/membership and realtime. Their exact entry points and completion status must be verified screen-by-screen before final navigation is locked.

## 2. Proposed information architecture

This is an organisation proposal, not a claim about the current UI.

### Global application shell
- Brand / product identity
- Primary navigation: Project Hub
- Account area: profile, subscription, settings, sign out
- Admin area: users, applications, normal users, subscriptions (role-gated)
- Global overlays: command palette, notifications, assistant (only where supported)

### Project Hub
- Page header and create-project action
- Search and sorting
- Project cards/list with clear project identity and last-updated context
- Project-level actions: rename, settings
- Empty, loading, error and access-revoked states

### Project Workspace
- Persistent project identity and project-level navigation
- Clear route/back behaviour to Project Hub
- Overview as the project landing page
- Resource destinations grouped by user task, not by implementation detail
- Contextual actions and search scoped to the active project
- Explicit loading, empty, error and permission states

### Resource organisation
- Notes and Tasks remain distinct resource types inside Workspace.
- Stories/scenes remain distinct and can reference assets.
- Files & Folders is the logical file manager with recursive folder navigation.
- Repository is a separate code/source-tree representation; do not conflate it with ordinary project folders.
- Media and Assets remain distinct user-facing destinations until workflow overlap is reviewed.

## 3. Source-confirmed screen inventory

| Screen / surface | Evidence in source | Design status |
|---|---|---|
| Authenticated application shell | App providers, routing, auth, sidebar visibility, error boundary | Redesign reference needed |
| Project Hub / Dashboard | Project listing, create/open, search, sorting | Redesign reference needed |
| Project create dialog | Create project fields and flow in Index | Review states |
| Project rename dialog | ProjectRenameDialog | Review states |
| Project settings dialog | ProjectSettingsDialog | Review states |
| Project Overview | OverviewSection | Inspect component and sub-navigation |
| Story | StorySection | Inspect full workflow |
| Workspace | WorkspaceSection | Inspect Notes and Tasks composition |
| Code Workspace | LazyCodeWorkspaceSection | Scope and workflow review |
| Files & Folders | FilesFoldersSection / FolderBrowser | Inspect folder navigation and file actions |
| Repository tree | Architecture audit describes separate repository representation | Verify current entry point and behaviour |
| Media | MediaSection | Inspect upload, preview and organisation |
| Assets | FileUploadSection with category=asset; scene_assets links stories to assets | Inspect asset lifecycle |
| Workspace Search | WorkspaceSearch and resource search service | Determine global vs project scope |
| Command Palette | WorkspaceCommandPalette | Verify command catalogue and placement |
| AI Assistant | WorkspaceAiAssistant and AI intent edge function | Verify availability, permission and entry points |
| Activity / Notifications | Current schema and service/component inventory | Verify screens and interaction model |
| Collaboration / Membership | Current schema and architecture docs | Verify user flows and role visibility |
| Subscription | Route and sidebar entry | Review purchase/access states |
| Settings | Route and sidebar entry | Inventory subsections |
| Admin — Users | Role-gated route | Admin-only design |
| Admin — Applications | Role-gated route | Admin-only design |
| Admin — Normal Users | Role-gated route | Admin-only design |
| Admin — Subscriptions | Role-gated route | Admin-only design |

## 4. Screen design sequence

Design and approve in this order:

1. Global application shell — navigation, content frame, account area, responsive behaviour.
2. Project Hub — project discovery, cards/list, create flow, empty/loading/error states.
3. Project Workspace shell — project header, navigation hierarchy, back behaviour, responsive layout.
4. Project Overview — summary, recent resources, project actions and contextual navigation.
5. Workspace — Notes and Tasks information hierarchy.
6. Story — story/scene editor and asset relationships.
7. Files & Folders — recursive folder browser, breadcrumbs, file actions and upload states.
8. Media and Assets — clarify distinct jobs before designing their surfaces.
9. Code Workspace — separate technical workspace and repository tree.
10. Cross-cutting surfaces — search, commands, activity, notifications, assistant.
11. Account, subscription, settings and admin surfaces.

## 5. Visual reference workflow

For each screen:
1. Collect visual references and identify the specific patterns worth borrowing (layout, density, hierarchy, interaction).
2. Create a reference board with desktop-first composition and mobile adaptation.
3. Produce a high-fidelity screen design using the approved ARD design tokens.
4. Review hierarchy, spacing, typography, density, contrast, empty/loading/error states and responsive behaviour.
5. Record approval and freeze the screen specification.
6. Only then implement that screen.

Reference imagery is directional only. It must not be treated as an approved screen or copied as a complete product design.

## 6. Design-system decisions to resolve

- Confirm product visual identity and colour palette; do not automatically reuse the legacy glass/gradient styling.
- Confirm typography and type scale.
- Define spacing and layout grid.
- Define surfaces, borders, elevation and focus states.
- Define component sizes and density.
- Define desktop-first breakpoints and mobile navigation.
- Define accessibility contrast, keyboard and reduced-motion behaviour.

## 7. Open verification items

- Inspect OverviewSection, WorkspaceSection, StorySection, FilesFoldersSection, MediaSection, FileUploadSection and CodeWorkspaceSection in detail.
- Verify actual entry points for activity, notifications, collaboration, search, commands and AI.
- Distinguish implemented, partially implemented, scaffolded and historical capabilities.
- Confirm whether Media and Assets deserve separate primary navigation.
- Confirm whether Code Workspace belongs in the primary project navigation or a secondary tools group.
- Inspect current deployed UI screenshots before locking visual direction.

## 8. Non-goals at this stage

- No application code changes.
- No database or storage changes.
- No production deployment or domain changes.
- No migration or data transfer.
- No PR merge.
