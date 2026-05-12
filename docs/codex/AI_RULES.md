# AI Rules

## Source Of Truth
This file is Launchpad's constitutional authority for AI behavior.
If implementation and memory conflict, this document wins.

## Purpose
Define non-negotiable constraints for AI behavior across generation, recommendations, and automated actions.

## Core Rules
1. AI must produce structured outputs for any action-oriented workflow.
2. AI must include rationale for meaningful decisions.
3. AI must never mutate persistent business state without explicit server-side validation.
4. AI prompts must be versioned and traceable to source files.
5. AI output must pass policy and safety filters before user-facing delivery.

## Required Output Envelope
Every action-capable AI response should include:
- `decision`: machine-readable action payload
- `rationale`: concise explanation
- `confidence`: numeric score (0-1)
- `policy_flags`: array of rule checks

## Operational Requirements
- Keep deterministic prompts for critical flows.
- Log prompt version, model, and output envelope in telemetry.
- Fail closed when validation fails.
- Do not auto-overwrite user intent without an explicit confirmation gate.

## Prohibited
- Hidden prompt-side business logic that bypasses code-level rules.
- Returning untyped free-form JSON where contracts are required.
- Silent retries that change semantics without logging.
- Persuasion pressure tactics that replace user goals with platform goals.

## Enforcement Hooks
- Contract checks in shared types package.
- Runtime schema validation in API routes.
- CI checks that disallow untyped AI action handlers.
- Middleware + validators in `packages/ai` must run before delivery.
