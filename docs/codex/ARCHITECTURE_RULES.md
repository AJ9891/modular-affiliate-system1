# Architecture Rules

Status: Operating Constitution
Scope: Repository-wide service boundaries, module contracts, UI system contracts, and integration behavior.

## Mission
Architecture must maximize delivery speed through explicit boundaries, stable contracts, and predictable operations.

## Boundary Rules
1. Domain boundaries are explicit and enforced by module interfaces.
2. Cross-domain dependencies require documented contract surfaces.
3. Circular dependencies across modules are prohibited.
4. Internal implementation details are not imported across boundaries.

## Contract Rules
1. Shared contracts are versioned and treated as public APIs.
2. Contract changes require compatibility review.
3. Additive changes are preferred; breaking changes require migration plans.
4. Contract docs and implementation must evolve together.

## Reliability Rules
1. Critical paths must define timeout, retry, and fallback behavior.
2. Failures must degrade gracefully where business-safe.
3. Observability is required for major domain interactions.
4. Silent failure paths are prohibited.

## Security Rules
1. Principle of least privilege applies to all services and modules.
2. Tenant isolation is mandatory in data, caches, and logs.
3. Secrets are injected via approved runtime configuration only.
4. Security-critical flows require explicit threat assumptions.

## Delivery Rules
1. Architectural decisions with repo-wide impact require written ADR or equivalent.
2. Generated outputs must not obscure source-of-truth logic.
3. Build and test boundaries should mirror architecture boundaries.
4. When architecture and local optimization conflict, architecture wins unless formally revised.
