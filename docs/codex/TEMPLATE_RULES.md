# Template Rules

Status: Operating Constitution
Scope: Funnel templates, UI templates, content blocks, and reusable campaign structures.

## Mission
Templates must be reusable, safe, measurable, and easy to adapt without structural breakage.

## Composition Rules
1. Templates must use modular blocks with stable identifiers.
2. Required blocks and optional blocks must be explicitly labeled.
3. Defaults must be valid and render-safe without manual edits.
4. All template variants must pass the same baseline validations.

## Governance Rules
1. Every template requires owner, version, and changelog metadata.
2. Breaking template changes require version increment and migration notes.
3. Deprecated templates remain readable until migration window closes.
4. Unauthorized direct edits to generated templates are prohibited.

## Risk Rules
1. Risk indicators are mandatory for compliance-sensitive templates.
2. High-risk templates must include rationale and mitigation hints.
3. Template scoring logic must be deterministic for the same input state.
4. Unknown risk state defaults to "high" until classified.

## Content and UX Rules
1. Placeholders must be explicit and unambiguous.
2. CTA text must align with target action and destination.
3. Accessibility requirements apply to all template blocks.
4. Locale-sensitive text must support override paths.

## Validation Rules
1. Templates must validate schema before publish.
2. Publish is blocked on failed validation or missing mandatory metadata.
3. Runtime rendering errors must fail gracefully with recovery guidance.
