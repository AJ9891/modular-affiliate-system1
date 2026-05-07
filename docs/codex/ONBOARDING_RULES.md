# Onboarding Rules

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

## Prohibited
- Client-only transitions without persistence.
- Skipping required steps without explicit override policy.
- Step completion inferred only from UI interaction.

## Enforcement Hooks
- Route guard checks against onboarding state.
- Integration tests for stage progression.
- Event assertions for step completion.
