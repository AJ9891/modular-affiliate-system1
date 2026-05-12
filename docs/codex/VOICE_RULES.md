# Voice Rules

## Source Of Truth
This file is Launchpad's constitutional authority for voice behavior.
Voice is an enforced architecture layer, not a stylistic preference.

## Purpose
Ensure all voice/personality systems remain consistent, composable, and policy-safe.

## Core Rules
1. Voice modifies expression, not facts or policy.
2. Voice cannot override capability, pricing, legal, or safety constraints.
3. Voice profiles must be deterministic configuration objects, not ad hoc prompt fragments.
4. System and product truth always outrank stylistic tone.

## Voice Contract
Each voice profile must define:
- `id`
- `tone`
- `lexicon_constraints`
- `forbidden_patterns`
- `fallback_style`

## Compatibility Rules
- Every generation surface must declare allowed voices.
- Incompatible voice/surface pairs must fail closed.
- Fallback voice selection must be deterministic and logged.

## Content Rules
- Preserve factual parity across voice variants.
- Avoid manipulative, deceptive, or coercive language.
- Keep user-action instructions explicit and testable.

## Prohibited
- Voice-specific pricing or capability claims.
- Personality branches that alter compliance behavior.
- Undefined voice IDs in production code paths.

## Enforcement Hooks
- Type-level voice profile registry.
- Prompt builder tests for factual parity.
- Lint rule for forbidden voice strings/patterns.
- Compatibility checks in `packages/voices/contracts`.
