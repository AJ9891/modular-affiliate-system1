# Template Rules

## Source Of Truth
This file is Launchpad's constitutional authority for template behavior.
Template metadata and rendering must align to this document.

## Purpose
Keep templates reusable, safe, and aligned with platform capabilities.

## Core Rules
1. Templates must be data-driven and contract-backed.
2. Templates cannot embed environment-specific secrets or IDs.
3. Template behavior must respect plan and capability gating.
4. Template rendering must be deterministic for identical inputs.

## Template Contract
Each template must define:
- `template_id`
- `category`
- `required_inputs`
- `optional_inputs`
- `output_shape`
- `version`
- `voice`
- `risk`
- `audience`
- `goal`
- `experienceLevel`

## Authoring Rules
- Separate content structure from visual theme tokens.
- Prefer placeholders and schema fields over inline hard-coded copy.
- Provide fallback values for non-critical fields.

## Prohibited
- Inline business logic in template payloads.
- References to deprecated schema fields.
- Template-side capability checks that conflict with server policy.

## Enforcement Hooks
- Schema validation at load and publish time.
- Snapshot tests for output stability.
- CI check for contract version and required fields.
- Metadata validation in `packages/templates/contracts`.
