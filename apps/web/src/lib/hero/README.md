# Hero Copy Generation System

## Overview

This system resolves hero copy constraints from personality, ensuring AI-generated copy is coherent with brand behavior.

## Architecture

```
Personality Profile
       ↓
Hero Behavior ────→ Hero Copy Contract
       ↓                    ↓
AI Prompt Profile ──→ Complete Prompt
                           ↓
                    AI Generation
```

## Key Principle

**This is guardrails, not content.**

We don't store copy strings. We store rules that govern how copy should be written.

## Files

### `/lib/hero/types.ts`

Defines `HeroCopyContract` - the constraints for AI copy generation.

```typescript
export type HeroCopyContract = {
  headlineLength: 'short' | 'medium'
  subcopyDensity: 'minimal' | 'explained'
  allowSarcasm: boolean
  forbidPromises: boolean
}
```

### `/lib/hero/heroCopyResolver.ts`

Converts `HeroBehavior` → `HeroCopyContract`.

```typescript
export function resolveHeroCopyContract(
  behavior: HeroBehavior
): HeroCopyContract
```

**Key decisions:**

- Sarcasm comes from `behavior.allowGlitch`, not from brand name
- Promises are forbidden universally (core brand value)
- Headline length mapped from headline style
- Subcopy density mapped from subcopy style

### `/lib/ai-generator/generateHeroCopy.ts`

Assembles complete AI prompt from profile + contract.

```typescript
export function buildHeroPrompt(
  aiProfile: AIPromptProfile,
  contract: HeroCopyContract
): string
```

## Usage

### Full Chain

```typescript
import { resolvePersonality } from '@/lib/personality'
import { resolveHeroBehavior } from '@/lib/personality/heroBehavior'
import { resolveHeroCopyContract } from '@/lib/hero'
import { resolveAIPrompt, buildHeroPrompt } from '@/lib/ai-generator'

// 1. Start with personality
const personality = resolvePersonality(user.brand_mode)

// 2. Resolve hero behavior
const heroBehavior = resolveHeroBehavior(personality)

// 3. Convert to copy contract
const heroContract = resolveHeroCopyContract(heroBehavior)

// 4. Get AI profile
const aiProfile = resolveAIPrompt(personality)

// 5. Build prompt
const prompt = buildHeroPrompt(aiProfile, heroContract)

// 6. Generate
const heroCopy = await generateAI({ system: prompt })
```

### Simplified Usage

```typescript
import { generateHeroCopy } from '@/lib/hero/example'
import { usePersonality } from '@/contexts/PersonalityContext'

const personality = usePersonality()

const result = await generateHeroCopy(personality, myAIFunction)
console.log(result.copy.headline)
console.log(result.copy.subcopy)
```

## Resolution Logic

### Headline Length

- `fractured` headline style → `short`
- All other styles → `medium`

### Subcopy Density

- `explanatory` subcopy style → `explained`
- All other styles → `minimal`

### Sarcasm

- Enabled when `behavior.allowGlitch` is true
- Tied to glitch behavior, not brand identity

### Promises

- **Always forbidden**
- Universal constraint across all brand modes
- Core brand integrity rule

## Brand Mode Examples

### AI Meltdown

```typescript
{
  headlineLength: 'short',     // fractured style
  subcopyDensity: 'minimal',   // resistant style
  allowSarcasm: true,          // glitch enabled
  forbidPromises: true         // universal
}
```

### Anti-Guru

```typescript
{
  headlineLength: 'medium',    // flat style
  subcopyDensity: 'minimal',   // co-conspirator posture
  allowSarcasm: false,         // no glitch
  forbidPromises: true         // universal
}
```

### Rocket Future

```typescript
{
  headlineLength: 'medium',    // confident style
  subcopyDensity: 'explained', // mentor posture
  allowSarcasm: false,         // no glitch
  forbidPromises: true         // universal
}
```

## Why This Matters

### Before (magic strings)

```typescript
if (brandMode === 'ai_meltdown') {
  prompt = "Write a short, sarcastic headline..."
} else if (brandMode === 'anti_guru') {
  prompt = "Write a blunt headline without promises..."
}
```

### After (resolved behavior)

```typescript
const contract = resolveHeroCopyContract(behavior)
const prompt = buildHeroPrompt(aiProfile, contract)
// Guaranteed coherent with personality
```

## Testing

```typescript
import { resolvePersonality } from '@/lib/personality'
import { resolveHeroBehavior } from '@/lib/personality/heroBehavior'
import { resolveHeroCopyContract } from '@/lib/hero'

describe('Hero Copy Contract Resolution', () => {
  it('should forbid promises universally', () => {
    const modes = ['ai_meltdown', 'anti_guru', 'rocket_future']
    
    modes.forEach(mode => {
      const personality = resolvePersonality(mode)
      const behavior = resolveHeroBehavior(personality)
      const contract = resolveHeroCopyContract(behavior)
      
      expect(contract.forbidPromises).toBe(true)
    })
  })

  it('should enable sarcasm only for AI Meltdown', () => {
    const aiMeltdown = resolvePersonality('ai_meltdown')
    const behavior = resolveHeroBehavior(aiMeltdown)
    const contract = resolveHeroCopyContract(behavior)
    
    expect(contract.allowSarcasm).toBe(true)
  })
})
```

## Next Steps

1. **Integrate with hero components** - Use contract to validate copy inputs
2. **Add validation layer** - Ensure generated copy matches contract
3. **Extend to other sections** - Apply same pattern to benefits, CTAs
4. **Track effectiveness** - A/B test different contract configurations

## Anti-Patterns

❌ **Don't check brand_mode directly**

```typescript
if (user.brand_mode === 'ai_meltdown') { /* ... */ }
```

✅ **Do resolve from personality**

```typescript
const personality = resolvePersonality(user.brand_mode)
const behavior = resolveHeroBehavior(personality)
const contract = resolveHeroCopyContract(behavior)
```

❌ **Don't store copy strings in contracts**

```typescript
{ headline: "Get Results Fast" } // Wrong - this is content
```

✅ **Do store rules and constraints**

```typescript
{ headlineLength: 'short', allowSarcasm: true } // Right - these are guardrails
```

---

**Remember:** No part is guessing. Every rule is resolved.
