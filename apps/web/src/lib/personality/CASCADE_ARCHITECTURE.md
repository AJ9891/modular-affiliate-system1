# Cascade Pattern Architecture

## The Problem This Solves

Most platforms glue AI onto copy. This embeds AI into governance.

Without this pattern:

- ❌ AI generates off-brand content
- ❌ Copy feels inconsistent across pages
- ❌ Changing personality requires rewriting prompts
- ❌ No way to validate if copy matches intent
- ❌ Hand-editing breaks the system

With this pattern:

- ✅ AI physically cannot betray brand personality
- ✅ One decision cascades perfectly
- ✅ Change personality → everything regenerates correctly
- ✅ Full validation at every layer
- ✅ Hand-edits maintain constraint knowledge

## The Cascade

```typescript
const personality = resolvePersonality(user.brand_mode)
// Single decision point. Everything downstream is obedient.

const heroBehavior = resolveHeroBehavior(personality)
// How may the UI physically behave? Not what it says. How it stands.

const heroContract = resolveHeroCopyContract(heroBehavior)
// Translates posture → language constraints
// The bridge most systems skip

const aiProfile = resolveAIPrompt(personality)
// What worldview is allowed? Not style. Ethics.

const prompt = buildHeroPrompt(aiProfile, heroContract)
// Now — and only now — do we talk to AI

const heroCopy = await generateAI({ system: prompt })
// AI fills in shape, not intent
```

## Why This is Unusually Strong

### 1. Single Source of Truth

Change `brand_mode` and regenerate everything. No cascading edits. No missed spots.

### 2. Governance Before Generation

AI receives constraints, not freedom. It fills shapes, not makes decisions.

### 3. Behavior ≠ Copy ≠ Style

- **Personality**: How the system thinks
- **Behavior**: How the UI moves
- **Contract**: How language is constrained
- **Style**: How it looks (separate, not here)

### 4. Validation at Every Layer

```typescript
// Validate copy structure
const { valid, violations } = validateCopy(headline, contract, 'headline')

// Validate AI ethics
const { valid, violations } = validateAIOutput(output, aiProfile)
```

### 5. Hand-Edit Safe

Every piece of copy knows its governance chain. Edit manually and still track intent.

### 6. Model Agnostic

Swap OpenAI for Claude for Gemini. Prompt structure stays the same.

## Pattern Reuse

This exact flow works for:

- ✅ Hero sections
- ✅ Feature sections
- ✅ Onboarding copy
- ✅ Error messages
- ✅ Affiliate pages
- ✅ Empty states
- ✅ Email templates
- ✅ About pages

Just swap the behavior resolver:

```typescript
resolveHeroBehavior → resolveFeatureBehavior
resolveHeroCopyContract → resolveFeatureCopyContract
```

Everything else stays identical.

## File Structure

```text
lib/personality/
├── types.ts                 # Core personality types
├── resolvePersonality.ts    # brand_mode → PersonalityProfile
├── heroBehavior.ts          # personality → HeroBehavior
├── copyContract.ts          # behavior → CopyContract
├── aiProfile.ts             # personality → AIProfile (ethics)
├── promptBuilder.ts         # profile + contract → PromptConfig
├── cascade.ts               # Complete cascade implementations
├── index.ts                 # Public API
└── EXAMPLES.tsx             # Usage examples
```

## Implementation Examples

### Hero Section

```typescript
const heroCopy = await generateHeroCopy('anti_guru', {
  productName: 'FunnelForge',
  keyBenefit: 'Build funnels without the BS'
})

// Returns:
// {
//   headline: "Build funnels. Skip the guru nonsense.",
//   subcopy: "No upsells. No webinars. Just a tool that works.",
//   cta: "Start building"
// }
```

### Feature Section

```typescript
const featureCopy = await generateFeatureCopy('rocket_future', {
  featureName: 'AI Copy Generation',
  benefit: 'Saves hours of work'
})

// Returns:
// {
//   headline: "AI writes your copy",
//   description: "Generate landing pages in seconds, not hours"
// }
```

### Error Message

```typescript
const errorCopy = await generateErrorCopy('anti_guru', {
  errorType: 'payment_failed',
  recoveryAction: 'Try a different payment method'
})

// Returns:
// {
//   title: "Payment didn't go through",
//   message: "Your card was declined. Try another one.",
//   action: "Update payment"
// }
```

## Debug Tools

### Preview Cascade

```typescript
const preview = previewCascade('ai_meltdown', 'hero')

console.log(preview.personality)  // PersonalityProfile
console.log(preview.behavior)     // HeroBehavior
console.log(preview.contract)     // CopyContract
console.log(preview.aiProfile)    // AIProfile
console.log(preview.prompt)       // PromptConfig
```

### Get Summary

```typescript
const summary = getCascadeSummary('anti_guru')

// Returns:
// {
//   brandMode: 'anti_guru',
//   personality: { name: 'Anti-Guru', authorityTone: 'blunt', ... },
//   behavior: { headlineStyle: 'flat', visualTension: 0.1, ... },
//   contract: { maxWords: { headline: 6, subcopy: 15, cta: 4 }, ... },
//   aiProfile: { perspective: 'clinical', coreValues: [...], ... }
// }
```

## Integration Points

### React Components

```typescript
import { generateHeroCopy } from '@/lib/personality'

function HeroGenerator() {
  const [brandMode, setBrandMode] = useState<BrandMode>('anti_guru')
  
  const handleGenerate = async () => {
    const copy = await generateHeroCopy(brandMode, {
      productName: 'My Product'
    })
    setCopy(copy)
  }
  
  // ...
}
```

### API Routes

```typescript
import { generateHeroCopy } from '@/lib/personality'

export async function POST(request: NextRequest) {
  const { brandMode, productName } = await request.json()
  
  const heroCopy = await generateHeroCopy(brandMode, { productName })
  
  return NextResponse.json({ copy: heroCopy })
}
```

### Server Components

```typescript
import { generateHeroCopy } from '@/lib/personality'

async function HeroSection({ brandMode }: { brandMode: BrandMode }) {
  const copy = await generateHeroCopy(brandMode, {
    productName: 'TaskFlow Pro'
  })
  
  return (
    <section>
      <h1>{copy.headline}</h1>
      <p>{copy.subcopy}</p>
      <button>{copy.cta}</button>
    </section>
  )
}
```

## Extending the Pattern

### Add New Content Type

1. Create behavior resolver (if needed):

```typescript
export function resolveFooterBehavior(personality: PersonalityProfile) {
  // Define footer-specific behavior
}
```

1. Create copy contract:

```typescript
export function resolveFooterCopyContract(personality: PersonalityProfile) {
  // Define footer language constraints
}
```

1. Create prompt builder:

```typescript
export function buildFooterPrompt(
  aiProfile: AIProfile,
  copyContract: CopyContract,
  context: FooterContext
): PromptConfig {
  // Build footer-specific prompt
}
```

1. Create generator:

```typescript
export async function generateFooterCopy(
  brandMode: BrandMode,
  context: FooterContext
) {
  const personality = resolvePersonality(brandMode)
  const contract = resolveFooterCopyContract(personality)
  const aiProfile = resolveAIPrompt(personality)
  const prompt = buildFooterPrompt(aiProfile, contract, context)
  
  return await generateAI<FooterContent>(prompt)
}
```

Done. Same pattern, new content type.

## Anti-Patterns

### ❌ Don't Call OpenAI Directly

```typescript
// BAD
const response = await openai.createCompletion({
  prompt: "Write a hero headline for..."
})
```

```typescript
// GOOD
const heroCopy = await generateHeroCopy(brandMode, { productName })
```

### ❌ Don't Branch on Brand Mode

```typescript
// BAD
if (brandMode === 'anti_guru') {
  headline = generateAntiGuruHeadline()
} else if (brandMode === 'ai_meltdown') {
  headline = generateMeltdownHeadline()
}
```

```typescript
// GOOD
const copy = await generateHeroCopy(brandMode, { productName })
```

### ❌ Don't Mix Style with Behavior

```typescript
// BAD
const personality = {
  color: 'blue',
  fontSize: '24px',
  tone: 'professional'
}
```

```typescript
// GOOD
const personality = {
  authorityTone: 'blunt',
  trustPosture: 'peer',
  humorDensity: 'dry'
}

// Visual style lives elsewhere
const theme = {
  colors: { primary: 'blue' },
  typography: { hero: '24px' }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('Cascade Pattern', () => {
  it('resolves personality from brand_mode', () => {
    const personality = resolvePersonality('anti_guru')
    expect(personality.authorityTone).toBe('blunt')
  })
  
  it('derives behavior from personality', () => {
    const personality = resolvePersonality('ai_meltdown')
    const behavior = resolveHeroBehavior(personality)
    expect(behavior.allowGlitch).toBe(true)
  })
  
  it('validates copy against contract', () => {
    const contract = resolveHeroCopyContract(behavior, personality)
    const { valid, violations } = validateCopy(
      'This is a very long headline that exceeds maximum',
      contract,
      'headline'
    )
    expect(valid).toBe(false)
    expect(violations).toContain('Exceeds maximum')
  })
})
```

### Integration Tests

```typescript
describe('Generation Flow', () => {
  it('generates hero copy for anti_guru', async () => {
    const copy = await generateHeroCopy('anti_guru', {
      productName: 'TestProduct'
    })
    
    expect(copy.headline).toBeDefined()
    expect(copy.subcopy).toBeDefined()
    expect(copy.cta).toBeDefined()
  })
  
  it('enforces copy contract constraints', async () => {
    const copy = await generateHeroCopy('anti_guru', {
      productName: 'TestProduct'
    })
    
    const personality = resolvePersonality('anti_guru')
    const behavior = resolveHeroBehavior(personality)
    const contract = resolveHeroCopyContract(behavior, personality)
    
    const { valid } = validateCopy(copy.headline, contract, 'headline')
    expect(valid).toBe(true)
  })
})
```

## Performance Considerations

### Caching

```typescript
import { cache } from 'react'

export const cachedResolvePersonality = cache((brandMode: BrandMode) => {
  return resolvePersonality(brandMode)
})
```

### Batch Generation

```typescript
// Generate multiple content types in parallel
const [hero, feature1, feature2] = await Promise.all([
  generateHeroCopy(brandMode, heroContext),
  generateFeatureCopy(brandMode, feature1Context),
  generateFeatureCopy(brandMode, feature2Context)
])
```

### Memoization

```typescript
import { useMemo } from 'react'

function useCascade(brandMode: BrandMode) {
  return useMemo(() => {
    const personality = resolvePersonality(brandMode)
    const behavior = resolveHeroBehavior(personality)
    const contract = resolveHeroCopyContract(behavior, personality)
    const aiProfile = resolveAIPrompt(personality)
    
    return { personality, behavior, contract, aiProfile }
  }, [brandMode])
}
```

## Migration Guide

If you have existing AI generation code:

### Before

```typescript
const prompt = `You are a ${brandMode} brand. Write a hero headline for ${productName}.`
const response = await openai.createCompletion({ prompt })
```

### After

```typescript
const heroCopy = await generateHeroCopy(brandMode, { productName })
```

That's it. The cascade handles everything else.

## Future Extensions

This pattern enables:

- 🔮 Multi-language generation (same constraints, different languages)
- 🔮 A/B test variants (same personality, different emphasis)
- 🔮 Accessibility text generation (same intent, WCAG compliance)
- 🔮 Email template generation (same brand, email-specific constraints)
- 🔮 Social media copy (same personality, platform-specific limits)

All using the same cascade architecture.
