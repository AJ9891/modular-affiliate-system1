# Architecture Rules

## Purpose
Maintain one coherent modular cognitive operating system instead of siloed feature logic.

## Core Rules
1. Domain laws are centralized and shared.
2. Cross-module interactions use explicit contracts.
3. UI composes domain services; it does not duplicate domain policy.
4. All critical decisions are evented and observable.
5. Breaking changes require versioning and migration.

## Boundaries
- `app`: presentation and route orchestration
- `domain/services`: policy and behavior
- `contracts`: shared cross-module types
- `infra`: persistence, providers, integrations

## Dependency Rules
- App code may depend on contracts and services.
- Services may depend on contracts and infra abstractions.
- Contracts depend on nothing application-specific.

## State Rules
- Identity, plan, stage, and capabilities must be canonical.
- Derived state should be computed, not persisted when avoidable.

## Prohibited
- Circular dependencies between modules.
- Hard-coded plan/capability logic in components.
- Hidden side effects in utility helpers.

## Enforcement Hooks
- CI law checks and type checks.
- Static dependency checks.
- Mandatory migration notes for schema/contract changes.
