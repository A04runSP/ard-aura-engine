# ARD Workspace — Repository Structure

This is the intended structure for the modular monolith. Directories are staged placeholders; a folder does not mean its feature is implemented.

```text
ard-aura-engine/
├── docs/
│   ├── architecture/
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── DATA_AND_SECURITY.md
│   │   └── DECISION_LOG.md
│   ├── roadmap/
│   │   └── IMPLEMENTATION_ROADMAP.md
│   └── PROJECT_STRUCTURE.md
├── public/                         # Static public assets
├── src/
│   ├── app/                        # Bootstrap, providers, router, layouts
│   ├── application/                # Use cases and orchestration
│   ├── domain/                     # Entities, invariants, contracts
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── workspace/
│   │   ├── notes/
│   │   ├── tasks/
│   │   ├── stories/
│   │   ├── files/
│   │   ├── media/
│   │   ├── assets/
│   │   ├── search/
│   │   ├── commands/
│   │   ├── activity/
│   │   ├── collaboration/
│   │   ├── ai/
│   │   └── admin/
│   ├── infrastructure/
│   │   ├── supabase/
│   │   ├── storage/
│   │   └── realtime/
│   └── shared/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── styles/
│       └── types/
├── supabase/
│   ├── functions/
│   └── migrations/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Placement rules

- Route definitions and global providers belong in `src/app`.
- Feature-specific UI and feature-level logic belong in the matching `src/features/<feature>` directory.
- Framework-independent business rules belong in `src/domain`.
- Multi-step application workflows belong in `src/application`.
- Supabase, storage, and realtime implementations belong in `src/infrastructure`.
- Reusable, feature-agnostic UI and utilities belong in `src/shared`.
- Tests should sit near the code when useful; cross-feature and user-flow tests belong under `tests/`.
- Supabase migrations and edge functions are infrastructure artifacts, not frontend feature code.

## Naming and module conventions

- Use clear, domain-oriented names.
- Prefer named exports for application modules.
- Avoid barrel files that create hidden circular dependencies.
- Keep feature public APIs explicit (for example, a feature-level `index.ts` only when it improves boundaries).
- Do not create generic `utils`, `misc`, or `common` modules for unrelated code.
- Add directories and files when their first real implementation is ready; remove unused placeholders during the foundation phase.
