# Repository Architecture V2

This repository now uses a feature-oriented architecture in `apps/web/src/features` while keeping backward-compatible adapters in legacy paths (`src/lib`, `src/components`, `src/app/api`).

## Target Structure

```text
apps/web/src/
  app/                        # Next.js pages + route entrypoints (thin)
  features/
    analytics/
      client/                 # Browser-facing API clients/selectors
      server/                 # Server domain services
      types.ts
    team/
      server/
    shared/
      api/                    # Route wrappers, request/response contracts
      ui/                     # Reusable, feature-agnostic UI primitives
  components/                 # Existing UI (gradually migrated by feature)
  lib/                        # Legacy adapters + cross-cutting infra
```

## Modular Rules

1. `app/api/*` routes should be thin and delegate to `features/*/server`.
2. Feature clients should live in `features/*/client`.
3. `lib/api/*` should only be compatibility re-exports during migration.
4. Shared UI primitives belong in `features/shared/ui`.
5. Cross-cutting route concerns (auth, validation, error mapping) belong in `features/shared/api`.

## Migration Pattern

1. Add feature module (`features/<domain>`).
2. Move business logic from route/component into feature module.
3. Keep old import path as adapter/re-export.
4. Update route/component to use feature module.
5. Remove adapter only when all call sites are migrated.
