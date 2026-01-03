# Personality-Driven AI Generation System

> **Single decision point. Everything downstream is obedient.**

## What This Is

A cascade pattern that transforms `brand_mode` into governed AI generation. No drift, no betrayal, no confusion.

## The Problem It Solves

Most platforms glue AI onto copy. This embeds AI into governance.

**Without this:**
- AI generates off-brand content
- Copy feels inconsistent
- Changing personality requires rewriting prompts
- No validation if copy matches intent
- Hand-editing breaks the system

**With this:**
- AI physically cannot betray brand personality
- One decision cascades perfectly
- Change personality → everything regenerates correctly
- Full validation at every layer
- Hand-edits maintain constraint knowledge

## The Cascade

```typescript
const personality = resolvePersonality(user.brand_mode)
// Single decision point

const behavior = resolveHeroBehavior(personality)
// How may the UI physically behave?

const contract = resolveHeroCopyContract(behavior)
// Translates posture → language constraints

const aiProfile = resolveAIPrompt(personality)
// What worldview is allowed?

const prompt = buildHeroPrompt(aiProfile, contract)
// Now we talk to AI

const heroCopy = await generateAI({ system: prompt })
// AI fills shape, not intent
```

## Quick Start

```typescript
import { generateHeroCopy } from '@/lib/personality'

const heroCopy = await generateHeroCopy('anti_guru', {
  productName: 'FunnelForge',
  keyBenefit: 'Build funnels without BS'
})

// Returns:
// {
//   headline: "Build funnels. Skip the guru nonsense.",
//   subcopy: "No upsells. No webinars. Just a tool that works.",
//   cta: "Start building"
// }
```

## Architecture

```
lib/personality/
├── types.ts                 # Core personality types
├── resolvePersonality.ts    # brand_mode → PersonalityProfile
├── heroBehavior.ts          # personality → HeroBehavior
├── copyContract.ts          # behavior → CopyContract
├── aiProfile.ts             # personality → AIProfile (ethics)
├── promptBuilder.ts         # profile + contract → PromptConfig
├── cascade.ts               # Complete cascade implementations
├── index.ts                 # Public API
├── QUICK_START.md           # 30-second guide
├── CASCADE_ARCHITECTURE.md  # Deep dive
├── EXAMPLES.tsx             # Working examples
└── INTEGRATION_GUIDE.md     # Step-by-step integration
```

## Available Generators

### Content Generation
- `generateHeroCopy()` - Hero sections
- `generateFeatureCopy()` - Feature descriptions
- `generateErrorCopy()` - Error messages
- `generateAffiliateCopy()` - Affiliate pages
- `generateOnboardingCopy()` - Onboarding flows
- `generateEmptyStateCopy()` - Empty states
- `generateCompleteFunnel()` - Complete funnels

### Debug Tools
- `previewCascade()` - Preview without AI call
- `getCascadeSummary()` - Get cascade breakdown

### Validation
- `validateCopy()` - Validate copy structure
- `validateAIOutput()` - Validate AI ethics

## Brand Modes

### `anti_guru`
- **Tone**: Blunt, direct, no BS
- **Trust**: Peer-to-peer
- **Copy**: Short, matter-of-fact, no hype

### `ai_meltdown`
- **Tone**: Chaotic, overwhelming, glitchy
- **Trust**: Co-conspirator
- **Copy**: Intense, fragmented, urgent

### `rocket_future`
- **Tone**: Confident, optimistic, forward-looking
- **Trust**: Mentor
- **Copy**: Clear, inspiring, action-oriented

## Why This Pattern is Powerful

### 1. Single Source of Truth
Change `brand_mode` and regenerate everything. No cascading edits.

### 2. Governance Before Generation
AI receives constraints, not freedom. It fills shapes, not makes decisions.

### 3. Reusable Everywhere
Same pattern works for: hero, features, errors, onboarding, affiliates, emails.

### 4. Fully Testable
Each layer validated independently.

### 5. Hand-Edit Safe
Always know what constraints were intended.

### 6. Model Agnostic
Swap AI models without changing structure.

## Examples

### Hero Section
```typescript
const heroCopy = await generateHeroCopy('anti_guru', {
  productName: 'TaskFlow',
  keyBenefit: 'Organize chaos'
})
```

### Feature Grid
```typescript
const features = await Promise.all([
  generateFeatureCopy(brandMode, { featureName: 'Smart Lists' }),
  generateFeatureCopy(brandMode, { featureName: 'Team Sync' })
])
```

### Error Message
```typescript
const errorCopy = await generateErrorCopy('anti_guru', {
  errorType: 'payment_failed',
  recoveryAction: 'Try different card'
})
```

### Complete Funnel
```typescript
const funnel = await generateCompleteFunnel('rocket_future', {
  productName: 'TaskFlow',
  niche: 'productivity',
  keyBenefit: 'Organize chaos',
  features: [
    { name: 'Smart Lists', description: 'AI organization' },
    { name: 'Team Sync', description: 'Real-time collab' }
  ]
})
```

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 30 seconds
- **[CASCADE_ARCHITECTURE.md](./CASCADE_ARCHITECTURE.md)** - Deep dive into the pattern
- **[EXAMPLES.tsx](./EXAMPLES.tsx)** - Working code examples for every use case
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Step-by-step integration
- **[types.ts](./types.ts)** - Full type definitions

## Anti-Patterns

### ❌ Don't branch on brand_mode
```typescript
// BAD
if (brandMode === 'anti_guru') {
  return <AntiGuruHero />
}

// GOOD
const copy = await generateHeroCopy(brandMode, context)
return <Hero copy={copy} />
```

### ❌ Don't call OpenAI directly
```typescript
// BAD
const response = await openai.createCompletion({ prompt })

// GOOD
const heroCopy = await generateHeroCopy(brandMode, context)
```

### ❌ Don't mix behavior with style
```typescript
// BAD
const personality = { tone: 'professional', color: 'blue' }

// GOOD
const personality = resolvePersonality(brandMode) // Behavior
const theme = getTheme() // Style (separate)
```

## Testing

```typescript
describe('Cascade Pattern', () => {
  it('resolves personality from brand_mode', () => {
    const personality = resolvePersonality('anti_guru')
    expect(personality.authorityTone).toBe('blunt')
  })
  
  it('validates copy against contract', () => {
    const { valid, violations } = validateCopy(
      'Too long headline that exceeds maximum',
      contract,
      'headline'
    )
    expect(valid).toBe(false)
  })
})
```

## Performance

### Parallel Generation
```typescript
const [hero, feature1, feature2] = await Promise.all([
  generateHeroCopy(brandMode, heroContext),
  generateFeatureCopy(brandMode, feature1Context),
  generateFeatureCopy(brandMode, feature2Context)
])
```

### Caching
```typescript
import { cache } from 'react'

export const getCachedPersonality = cache((brandMode: BrandMode) => {
  return resolvePersonality(brandMode)
})
```

### Server Components
```typescript
async function HeroSection({ brandMode }: { brandMode: BrandMode }) {
  // Generate on server, send HTML to client
  const copy = await generateHeroCopy(brandMode, { productName })
  return <Hero copy={copy} />
}
```

## Integration

### React Component
```typescript
import { generateHeroCopy } from '@/lib/personality'

function HeroGenerator() {
  const [copy, setCopy] = useState(null)
  
  const handleGenerate = async () => {
    const result = await generateHeroCopy(brandMode, { productName })
    setCopy(result)
  }
  
  return <div>...</div>
}
```

### API Route
```typescript
import { generateHeroCopy } from '@/lib/personality'

export async function POST(request: NextRequest) {
  const { brandMode, productName } = await request.json()
  const heroCopy = await generateHeroCopy(brandMode, { productName })
  return NextResponse.json({ copy: heroCopy })
}
```

## Extending the Pattern

### Add New Content Type

1. Create behavior resolver (if needed)
2. Create copy contract resolver
3. Create prompt builder
4. Create generator function

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

## License

Part of the Modular Affiliate System.

---

**Single decision point. Everything downstream is obedient.**

Read [QUICK_START.md](./QUICK_START.md) to get started in 30 seconds.

Read [CASCADE_ARCHITECTURE.md](./CASCADE_ARCHITECTURE.md) for the full deep dive.
