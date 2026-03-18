# Cascade Pattern - Visual Flow

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         SINGLE DECISION POINT                            │
│                                                                          │
│                        user.brand_mode                                   │
│                             │                                            │
│                             ▼                                            │
│                   ┌─────────────────┐                                    │
│                   │ resolvePersonality │                                 │
│                   └─────────────────┘                                    │
│                             │                                            │
│              ┌──────────────┴──────────────┐                            │
│              ▼                              ▼                            │
│     ┌──────────────────┐           ┌──────────────┐                     │
│     │ resolveBehavior  │           │ resolveAI    │                     │
│     │                  │           │ Profile      │                     │
│     │ (UI Posture)     │           │ (Ethics)     │                     │
│     └──────────────────┘           └──────────────┘                     │
│              │                              │                            │
│              ▼                              │                            │
│     ┌──────────────────┐                   │                            │
│     │ resolveCopy      │                   │                            │
│     │ Contract         │                   │                            │
│     │                  │                   │                            │
│     │ (Language Rules) │                   │                            │
│     └──────────────────┘                   │                            │
│              │                              │                            │
│              └──────────────┬───────────────┘                            │
│                             ▼                                            │
│                   ┌─────────────────┐                                    │
│                   │  buildPrompt    │                                    │
│                   │                 │                                    │
│                   │ Combines:       │                                    │
│                   │ • AI Profile    │                                    │
│                   │ • Copy Contract │                                    │
│                   │ • Context       │                                    │
│                   └─────────────────┘                                    │
│                             │                                            │
│                             ▼                                            │
│                   ┌─────────────────┐                                    │
│                   │   generateAI    │                                    │
│                   │                 │                                    │
│                   │ AI fills shape, │                                    │
│                   │ not intent      │                                    │
│                   └─────────────────┘                                    │
│                             │                                            │
│                             ▼                                            │
│                      Generated Copy                                      │
│                                                                          │
│           Everything downstream is obedient                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Layer 1: Personality Resolution

```text
INPUT:  brand_mode (string)
OUTPUT: PersonalityProfile (object)
ROLE:   Single source of truth for behavioral rules
```

### Layer 2a: Behavior Resolution

```text
INPUT:  PersonalityProfile
OUTPUT: HeroBehavior (or FeatureBehavior, etc.)
ROLE:   Defines HOW the UI physically behaves
```

### Layer 2b: AI Profile Resolution

```text
INPUT:  PersonalityProfile
OUTPUT: AIProfile
ROLE:   Defines worldview, ethics, forbidden patterns
```

### Layer 3: Copy Contract Resolution

```text
INPUT:  Behavior + Personality
OUTPUT: CopyContract
ROLE:   Translates posture → language constraints
```

### Layer 4: Prompt Building

```text
INPUT:  AIProfile + CopyContract + Context
OUTPUT: PromptConfig
ROLE:   Combines all constraints into final prompt
```

### Layer 5: AI Generation

```text
INPUT:  PromptConfig
OUTPUT: Generated Copy
ROLE:   AI fills shapes defined by constraints
```

## Example Flow: Anti-Guru Hero

```text
brand_mode: 'anti_guru'
    │
    ▼
Personality:
  ├─ authorityTone: 'blunt'
  ├─ trustPosture: 'peer'
  ├─ humorDensity: 'dry'
  └─ vocabulary: { forbiddenPhrases: ['game-changing', ...] }
    │
    ├──────────────────┬─────────────────
    ▼                  ▼
HeroBehavior:        AIProfile:
  ├─ headlineStyle:    ├─ perspective: 'clinical'
  │  'flat'            ├─ knowledgePosture: 'confident'
  ├─ visualTension:    ├─ neverClaim: ['guaranteed results', ...]
  │  0.1               └─ relationshipToUser: 'peer'
  └─ emphasizeUrgency:
     false
    │
    ▼
CopyContract:
  ├─ maxHeadlineWords: 6
  ├─ requiredTone: 'matter-of-fact'
  ├─ allowExclamation: false
  └─ forbiddenPhrases: ['game-changing', 'click here', ...]
    │
    └──────────────────┬─────────────────
                       ▼
                 PromptConfig:
                   ├─ system: "You are anti_guru. Core values: honesty..."
                   ├─ temperature: 0.6
                   └─ maxTokens: 50
                       │
                       ▼
                  Generated Copy:
                    ├─ headline: "Build funnels. Skip the guru nonsense."
                    ├─ subcopy: "No upsells. No webinars. Just a tool."
                    └─ cta: "Start building"
```

## Cascade Properties

### 1. Deterministic

Same `brand_mode` → Same constraints → Consistent output

### 2. Traceable

Every piece of copy knows its governance chain

### 3. Testable

Each layer can be validated independently

### 4. Composable

New content types reuse existing layers

### 5. Immutable

Change personality → Everything regenerates correctly

## Validation Flow

```text
Generated Copy
    │
    ├─────────────────┬──────────────────
    ▼                 ▼
validateCopy      validateAIOutput
    │                 │
    ▼                 ▼
CopyContract      AIProfile
    │                 │
    ▼                 ▼
{ valid, violations }
```

## Reusability Pattern

```text
Content Type = Behavior Resolver + Contract Resolver + Prompt Builder

Hero Section:
  ├─ resolveHeroBehavior
  ├─ resolveHeroCopyContract
  └─ buildHeroPrompt

Feature Section:
  ├─ (reuse personality behavior)
  ├─ resolveFeatureCopyContract
  └─ buildFeaturePrompt

Error Message:
  ├─ (reuse personality behavior)
  ├─ resolveErrorCopyContract
  └─ buildErrorPrompt

Everything else stays identical.
```

## Why This Works

### Traditional Approach (Broken)

```text
brand_mode → [MAGIC BLACK BOX] → copy
              ↑
         Hope for the best
```

### Cascade Approach (Governed)

```text
brand_mode → personality → behavior → contract → profile → prompt → copy
              ↓              ↓          ↓          ↓         ↓
            testable     testable   testable   testable  testable
```

## Key Insight

**Most systems skip the middle layers.**

They go straight from `brand_mode` to `prompt`.

The middle layers are where governance happens.

Without them, AI drifts.

With them, AI obeys.

## Pattern Benefits

```text
✓ Single source of truth
✓ No branching chaos
✓ Fully testable
✓ Hand-edit safe
✓ Model agnostic
✓ Reusable everywhere
✓ Designer friendly
✓ Audit trail
```

## Anti-Pattern Detection

```text
❌ if (brandMode === 'anti_guru') { ... }
   └─ Branching logic

❌ await openai.createCompletion({ prompt: '...' })
   └─ Direct AI calls

❌ const personality = { tone: 'pro', color: 'blue' }
   └─ Mixed concerns

✅ await generateHeroCopy(brandMode, context)
   └─ Cascade pattern
```

## The Bridge Most Systems Skip

```text
     Behavior
        │
        ▼
  Copy Contract ←── This bridge
        │
        ▼
    AI Prompt
```

Without this bridge, AI gets confused about **why** copy feels off.

With this bridge, AI knows exactly what **posture** to maintain.

This is the secret.
