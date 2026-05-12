# Onboarding Rules

## Source Of Truth
This file is Launchpad's constitutional authority for onboarding behavior.
Onboarding must prioritize momentum while preserving state integrity.

## Purpose
Ensure onboarding is consistent, stateful, and recoverable across all modules.

## Core Rules
1. Onboarding is a state machine, not a loose collection of screens.
2. Every step transition must be validated server-side.
3. Step completion must emit typed events.
4. Users must be able to resume from persisted state.
5. Onboarding copy can vary by voice, but outcomes and requirements cannot.

## State Model
Required fields:
- `user_id`
- `current_stage`
- `completed_steps[]`
- `updated_at`

Optional fields:
- `workspace_context`
- `last_error`
- `metadata`

## UX Rules
- Show clear current step and next action.
- Provide deterministic back/forward semantics.
- Never hide blocking requirements.
- Keep onboarding momentum-first, not tutorial-heavy.

## Flow Rules
Preflight flow should progress through:
- Welcome
- Destination selection
- Funnel type
- First launch
- Cockpit reveal

## Prohibited
- Client-only transitions without persistence.
- Skipping required steps without explicit override policy.
- Step completion inferred only from UI interaction.
- Feature-overload onboarding that delays first launch momentum.

## Enforcement Hooks
- Route guard checks against onboarding state.
- Integration tests for stage progression.
- Event assertions for Step completion.
- Flow contracts in `packages/onboarding/flows`.
