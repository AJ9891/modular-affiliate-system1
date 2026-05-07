# Modular Cognitive Operating System Laws

These laws are the non-negotiable platform constraints for UX, AI, onboarding, templates, analytics, and voices.

## 1. Identity Law
Every workflow must resolve to one canonical identity tuple:
- `user_id`
- `workspace_id` (or explicit single-user fallback)
- `session_id` (for interaction traceability)

No module may mint its own identity shape.

## 2. State Law
All module-visible state must be representable as a single typed state graph:
- profile
- plan
- lifecycle stage
- capabilities
- usage counters

State transitions must be explicit and testable.

## 3. Capability Law
Feature access is capability-driven, not UI-conditional.

A capability decision must derive from:
- identity
- plan
- policy
- current lifecycle state

## 4. Contract Law
Cross-module data exchange must use versioned contracts from `@modular-affiliate/contracts`.

Any module boundary (API, AI workflow, template runtime, analytics event) must depend on shared contract types.

## 5. Event Law
All meaningful actions must emit typed domain events.

Analytics pipelines consume domain events, not ad hoc page-level tracking payloads.

## 6. Decision Law
AI decisions must include:
- structured decision payload
- rationale
- confidence
- policy flags

No silent AI mutation of business-critical state.

## 7. Composition Law
UX surfaces compose domain modules; they do not re-implement domain policy.

UI should orchestrate, not redefine plan/capability rules.

## 8. Evolution Law
Schema and contracts must evolve with explicit versioning and compatibility windows.

Breaking changes require:
- migration path
- deprecation notice
- version bump

## Enforcement
Current automated enforcement is implemented by `npm run law:check`:
- verifies this law document exists
- verifies shared contracts package exists
- verifies core plan API paths import contract constants
- blocks hard-coded plan arrays in guarded files

Additional guards should be added as module coverage increases.
