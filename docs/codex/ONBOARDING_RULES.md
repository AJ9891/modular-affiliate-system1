# Onboarding Rules

Status: Operating Constitution
Scope: First-run flows, setup checklists, guided activation, and onboarding automation.

## Mission
Onboarding must reduce time-to-value, remove ambiguity, and make next actions obvious.

## Core Principles
1. Sequence from essential to advanced; no premature complexity.
2. One screen/step, one primary decision.
3. Every step must either unlock capability or validate prerequisites.
4. Friction is acceptable only when protecting integrity, security, or compliance.

## Flow Rules
1. Each onboarding flow must define entry condition, completion condition, and abort behavior.
2. Mandatory steps require explicit rationale.
3. Skip options are allowed only where safe and reversible.
4. Progress indicators must match true backend state.

## Motion and Interaction Rules
1. Motion should orient users, not distract them.
2. Animation duration should prioritize responsiveness over flourish.
3. Interactive controls must preserve keyboard and screen-reader accessibility.
4. Async states must always display loading, success, and failure paths.

## Data and State Rules
1. Onboarding state must be recoverable after refresh/session interruption.
2. Partial completion must be persisted with clear resume behavior.
3. Collected data must map directly to downstream use.
4. Duplicate data requests across steps are prohibited.

## Measurement Rules
1. Track start rate, completion rate, drop-off by step, and time-to-completion.
2. Any drop-off spike requires issue triage and copy/UX review.
3. Experiments must preserve baseline completion path.
