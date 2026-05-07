# AI Rules

Status: Operating Constitution
Scope: All AI workflows, prompts, agents, and generated outputs in this repository.

## Mission
AI must produce deterministic, auditable, policy-compliant outputs that accelerate shipping without degrading trust.

## Non-Negotiables
1. Source of truth is repository state plus explicitly approved external sources.
2. No fabricated facts, metrics, citations, APIs, or implementation status.
3. Every AI action must preserve security, privacy, and tenant boundaries.
4. Human override is always final.

## Prompt and Context Rules
1. Prompts must define objective, constraints, expected output format, and acceptance criteria.
2. Prompt inputs must be minimal and relevant; no unnecessary sensitive data.
3. System/business rules must be represented as explicit constraints, not implied preferences.
4. If context is ambiguous, AI must choose a safe default and declare assumptions.

## Output Quality Rules
1. AI outputs must be testable, specific, and tied to implementation intent.
2. Code output must compile or clearly state why it cannot be compiled yet.
3. Non-code output must include concrete decisions and executable next steps.
4. Risky or high-impact recommendations must include tradeoffs and rollback guidance.

## Safety and Compliance Rules
1. No secrets in prompts, examples, logs, commits, or generated content.
2. PII use is prohibited unless explicitly required and access-controlled.
3. AI must not bypass authn/authz patterns defined by architecture.
4. Any uncertain compliance state is treated as non-compliant until reviewed.

## Operational Rules
1. Every AI-assisted change should be attributable to files changed and intent.
2. Generated artifacts must be separated from source-owned files when possible.
3. AI behavior changes require documentation updates in `/docs/codex`.
4. When rules conflict, stricter rule wins.
