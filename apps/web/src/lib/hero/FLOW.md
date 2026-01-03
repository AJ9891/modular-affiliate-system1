# Hero Copy Generation System - Visual Flow

## The Complete Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BRAND MODE                            │
│                    (ai_meltdown, etc.)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSONALITY PROFILE                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ authorityTone: 'unraveling' | 'blunt' | 'calm'           │ │
│  │ trustPosture: 'mentor' | 'co-conspirator'                │ │
│  │ humorDensity: 'glitchy' | 'dry' | 'minimal'              │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────┬─────────────────────────────┬────────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────────┐  ┌───────────────────────────────┐
│      HERO BEHAVIOR           │  │    AI PROMPT PROFILE          │
│  ┌────────────────────────┐  │  │  ┌─────────────────────────┐ │
│  │ headlineStyle          │  │  │  │ system: string          │ │
│  │ subcopyStyle           │  │  │  │ principles: string[]    │ │
│  │ visualTension          │  │  │  │ forbidden: string[]     │ │
│  │ allowGlitch            │  │  │  └─────────────────────────┘ │
│  │ animationIntensity     │  │  │                               │
│  └────────────────────────┘  │  └───────────────┬───────────────┘
└──────────────┬───────────────┘                  │
               │                                  │
               ▼                                  │
┌──────────────────────────────┐                  │
│    HERO COPY CONTRACT        │                  │
│  ┌────────────────────────┐  │                  │
│  │ headlineLength         │  │                  │
│  │ subcopyDensity         │  │                  │
│  │ allowSarcasm           │  │                  │
│  │ forbidPromises: true   │  │                  │
│  └────────────────────────┘  │                  │
└──────────────┬───────────────┘                  │
               │                                  │
               └──────────────┬───────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │   COMPLETE AI PROMPT   │
                 │                        │
                 │  System + Rules +      │
                 │  Constraints           │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │   AI GENERATION        │
                 │                        │
                 │  ┌──────────────────┐  │
                 │  │ headline         │  │
                 │  │ subcopy          │  │
                 │  └──────────────────┘  │
                 └────────────────────────┘
```

## Resolution Examples

### AI Meltdown Flow

```
brand_mode: 'ai_meltdown'
    ↓
PersonalityProfile {
  authorityTone: 'unraveling',
  trustPosture: 'co-conspirator',
  humorDensity: 'glitchy'
}
    ↓                              ↓
HeroBehavior {                AIPromptProfile {
  headlineStyle: 'fractured',    system: "You are...",
  subcopyStyle: 'resistant',     principles: [...],
  allowGlitch: true              forbidden: [...]
}                              }
    ↓                              ↓
HeroCopyContract {                │
  headlineLength: 'short',        │
  subcopyDensity: 'minimal',      │
  allowSarcasm: true,             │
  forbidPromises: true            │
}                                 │
    └─────────────┬───────────────┘
                  ↓
        Complete AI Prompt
        (ready for generation)
```

### Anti-Guru Flow

```
brand_mode: 'anti_guru'
    ↓
PersonalityProfile {
  authorityTone: 'blunt',
  trustPosture: 'co-conspirator',
  humorDensity: 'dry'
}
    ↓                              ↓
HeroBehavior {                AIPromptProfile {
  headlineStyle: 'flat',         system: "You are...",
  subcopyStyle: 'resistant',     principles: [...],
  allowGlitch: false             forbidden: [...]
}                              }
    ↓                              ↓
HeroCopyContract {                │
  headlineLength: 'medium',       │
  subcopyDensity: 'minimal',      │
  allowSarcasm: false,            │
  forbidPromises: true            │
}                                 │
    └─────────────┬───────────────┘
                  ↓
        Complete AI Prompt
```

### Rocket Future Flow

```
brand_mode: 'rocket_future'
    ↓
PersonalityProfile {
  authorityTone: 'calm',
  trustPosture: 'mentor',
  humorDensity: 'minimal'
}
    ↓                              ↓
HeroBehavior {                AIPromptProfile {
  headlineStyle: 'confident',    system: "You are...",
  subcopyStyle: 'explanatory',   principles: [...],
  allowGlitch: false             forbidden: [...]
}                              }
    ↓                              ↓
HeroCopyContract {                │
  headlineLength: 'medium',       │
  subcopyDensity: 'explained',    │
  allowSarcasm: false,            │
  forbidPromises: true            │
}                                 │
    └─────────────┬───────────────┘
                  ↓
        Complete AI Prompt
```

## Key Observations

### Universal Constraint
```
forbidPromises: true
```
This appears in **every** contract, regardless of brand mode.
It's a core brand value, not a behavior toggle.

### Derived Constraints
```
allowSarcasm: behavior.allowGlitch
```
Sarcasm is derived from behavior, not from brand name.
This ensures coherence across the system.

### Type Safety
```typescript
// Every step is typed
PersonalityProfile → HeroBehavior → HeroCopyContract → string
```
No magic strings. No guessing. Complete type safety.

## Files

| File | Purpose |
|------|---------|
| `lib/hero/types.ts` | Define `HeroCopyContract` |
| `lib/hero/heroCopyResolver.ts` | Resolve behavior → contract |
| `lib/ai-generator/generateHeroCopy.ts` | Build AI prompt |
| `lib/ai-generator/promptResolver.ts` | Resolve personality → AI profile |
| `lib/personality/heroBehavior.ts` | Resolve personality → behavior |

## Usage

```typescript
// Single-line resolution chain
const prompt = buildHeroPrompt(
  resolveAIPrompt(personality),
  resolveHeroCopyContract(resolveHeroBehavior(personality))
)

// Or step-by-step for clarity
const behavior = resolveHeroBehavior(personality)
const contract = resolveHeroCopyContract(behavior)
const aiProfile = resolveAIPrompt(personality)
const prompt = buildHeroPrompt(aiProfile, contract)
```

---

**The Payoff:** No component needs to know about brand modes. They just consume contracts.
