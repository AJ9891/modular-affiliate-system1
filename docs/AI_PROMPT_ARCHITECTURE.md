# Launchpad Codex: AI Prompts Mapped to Architecture

## 0. Architectural Principle (Global)

- AI is a service layer bound to components, contexts, voices, and permissions. No free-floating prompts or generic "chat" blobs.
- Every AI call must have: component, context, voice, permission level. Missing any → call is invalid.

## 1. High-Level Flow

```text
UI Component
   ↓
Context Resolver
   ↓
Voice Binder
   ↓
Prompt Assembler
   ↓
AI Service
   ↓
Response Linter
   ↓
UI Renderer
```

Each stage owns its own rules.

## 2. Context Resolver (Where am I?)

Component: AIContextResolver

- Inputs: Component ID (HeroBlock, CTAEditor), Page Type (Builder, Onboarding, Live Funnel), User State (New, Active, Advanced), Template Voice (Boost | Anti-Guru | Glitch), Risk Level (Low | Medium | High)
- Output: Context object injected downstream, e.g.

```text
{
  "location": "HeroBlock",
  "mode": "Builder",
  "voice": "Anti-Guru",
  "risk": "Medium",
  "userLevel": "Active"
}
```

- Rule: If context cannot be resolved, AI is disabled and Boost explains why.

## 3. Voice Binder (How should I speak?)

Component: VoiceBinder

- Locks voice before generation; injects non-editable system header; rejects tone violations; resolves hybrid precedence.
- Example header:

```text
SYSTEM VOICE: Anti-Guru
CONSTRAINTS:
- No hype
- No urgency
- No exaggerated outcomes
- Prefer understatement
```

- Rule: Voice is immutable for the duration of the AI call.

## 4. Prompt Assembler (What am I asking?)

Component: PromptAssembler

- Inputs: Context object, Voice header, Component schema, User content (if any)
- Assembly pattern:

```text
[System Guardrails]
[Voice Header]
[Component Instructions]
[User Content]
[Output Contract]
```

## 5. Component-Level Prompt Mapping

### 5.1 Hero Block (HeroBlockAI)

- Purpose: Clarify relevance fast.
- Allowed voices: Boost, Anti-Guru, Glitch (parody templates only)
- Contract: Generate 3 headline options; explain why each works; never change the offer.
- Flow: HeroBlock → AIContextResolver → VoiceBinder → PromptAssembler(heroSchema) → AISuggest()
- Failure: If hype detected, reject and regenerate with stricter constraints.

### 5.2 CTA Block (CTAAI)

- Purpose: Reduce friction, not pressure.
- Allowed voices: Boost, Anti-Guru. Glitch forbidden.
- Contract: Focus on clarity of action; no urgency unless user provided; always offer a low-pressure alternative.
- Enforcement: CTA prompts auto-raise Risk = High to tighten persuasion limits.

### 5.3 Funnel Structure Generator (FunnelComposerAI)

- Purpose: Assemble flow, not copy.
- Allowed voices: Boost only (structure is safety-critical; no tone experiments).
- Contract: Output ordered steps; explain why each step exists; flag optional vs required.

### 5.4 Template Copy Generator (TemplateCopyAI)

- Purpose: Draft starting copy for templates.
- Allowed voices: Boost, Anti-Guru, Glitch (voice-locked).
- Contract: Draft only empty blocks; label sections clearly; insert explanation comments (non-public).

### 5.5 Analytics Insight Explainer (InsightAI)

- Purpose: Translate data into meaning.
- Allowed voices: Boost only.
- Contract: Explain what changed; why it matters; suggest one calm next step. Never writes marketing copy.

### 5.6 Onboarding Assistant (OnboardingAI)

- Purpose: Reduce confusion.
- Allowed voices: Boost only.
- Contract: Assume zero context; explain terms inline; never suggest advanced features.

### 5.7 Parody Funnel Generator (GlitchAI)

- Purpose: Pattern interrupt with intent.
- Allowed voices: Glitch only.
- Hard guards: requires explicit confirmation and preview acknowledgement; cannot run in onboarding or analytics.
- Contract: Maintain character consistency; anchor humor to funnel logic; conversion clarity must survive the joke.

## 6. Response Linter (Did it behave?)

Component: AIResponseLinter

- Checks: voice violations, intent drift, hidden persuasion, structural mismatch, overconfidence language.
- Outcomes: Pass → render. Soft fail → regenerate with tightened rules. Hard fail → suppress + Boost explanation (e.g., "This suggestion leaned into urgency. We removed it to match your selected tone.")

## 7. UI Renderer (How it appears)

Component: AISuggestionRenderer

- Rules: AI suggestions visually distinct from user content; explanations collapsible; AI never auto-applies changes; UI reinforces user control.

## 8. System-Wide Kill Switches

- AI can be disabled per component, per voice, per risk level.
- Boost explains: "AI suggestions are paused here to keep this step predictable."

## 9. Architectural Truth Table

| Layer              | Owns                 |
| ------------------ | -------------------- |
| Context Resolver   | Where + Risk         |
| Voice Binder       | How it sounds        |
| Prompt Assembler   | What is asked        |
| AI Service         | Generation           |
| Response Linter    | Safety + trust       |
| UI Renderer        | Control + clarity    |

No layer does another’s job.

## 10. Final Codex Law (Engineering Edition)

- If an AI output surprises the user, the architecture failed. If it clarifies and offers control, the system succeeded.
