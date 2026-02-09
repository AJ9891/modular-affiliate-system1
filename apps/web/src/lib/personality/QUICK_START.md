# Cascade Pattern - Quick Start

## 🎯 The Pattern in 30 Seconds

```typescript
const personality = resolvePersonality(user.brand_mode)
const behavior = resolveHeroBehavior(personality)
const contract = resolveHeroCopyContract(behavior)
const aiProfile = resolveAIPrompt(personality)
const prompt = buildHeroPrompt(aiProfile, contract)
const heroCopy = await generateAI({ system: prompt })
```

**Single decision point. Everything downstream is obedient.**

---

## 🚀 Usage (Copy & Paste)

### Hero Section

```typescript
import { generateHeroCopy } from '@/lib/personality'

const heroCopy = await generateHeroCopy('anti_guru', {
  productName: 'FunnelForge',
  keyBenefit: 'Build funnels without BS'
})

// Returns: { headline, subcopy, cta }
```

### Feature Section

```typescript
import { generateFeatureCopy } from '@/lib/personality'

const featureCopy = await generateFeatureCopy('rocket_future', {
  featureName: 'AI Copy Generator',
  benefit: 'Saves hours of work'
})

// Returns: { headline, description }
```

### Error Message

```typescript
import { generateErrorCopy } from '@/lib/personality'

const errorCopy = await generateErrorCopy('anti_guru', {
  errorType: 'payment_failed',
  recoveryAction: 'Try different card'
})

// Returns: { title, message, action }
```

### Affiliate Page

```typescript
import { generateAffiliateCopy } from '@/lib/personality'

const affiliateCopy = await generateAffiliateCopy('rocket_future', {
  productName: 'ConvertKit',
  productCategory: 'email marketing'
})

// Returns: { headline, description, cta }
```

### Onboarding Step

```typescript
import { generateOnboardingCopy } from '@/lib/personality'

const onboardingCopy = await generateOnboardingCopy('anti_guru', {
  stepName: 'Choose niche',
  stepPurpose: 'Select your market'
})

// Returns: { title, instruction, nextAction }
```

### Complete Funnel

```typescript
import { generateCompleteFunnel } from '@/lib/personality'

const funnel = await generateCompleteFunnel('rocket_future', {
  productName: 'TaskFlow',
  niche: 'productivity',
  keyBenefit: 'Organize chaos',
  features: [
    { name: 'Smart Lists', description: 'AI task organization' },
    { name: 'Team Sync', description: 'Real-time collaboration' }
  ]
})

// Returns: { hero, features: [...] }
```

---

## 🔧 Debug Tools

### Preview Cascade (No AI call)

```typescript
import { previewCascade } from '@/lib/personality'

const preview = previewCascade('ai_meltdown', 'hero')

console.log(preview.personality)  // PersonalityProfile
console.log(preview.behavior)     // HeroBehavior
console.log(preview.contract)     // CopyContract
console.log(preview.prompt)       // PromptConfig
```

### Get Summary

```typescript
import { getCascadeSummary } from '@/lib/personality'

const summary = getCascadeSummary('anti_guru')

// Returns full cascade breakdown:
// {
//   brandMode: 'anti_guru',
//   personality: { ... },
//   behavior: { ... },
//   contract: { ... },
//   aiProfile: { ... }
// }
```

### Validate Copy

```typescript
import { validateCopy, resolveHeroCopyContract } from '@/lib/personality'

const { valid, violations } = validateCopy(
  'Your headline here',
  contract,
  'headline'
)

if (!valid) {
  console.error('Violations:', violations)
}
```

---

## 🎨 React Component Example

```typescript
'use client'

import { useState } from 'react'
import { generateHeroCopy } from '@/lib/personality'
import type { BrandMode, HeroContent } from '@/lib/personality'

export function HeroGenerator() {
  const [brandMode, setBrandMode] = useState<BrandMode>('anti_guru')
  const [copy, setCopy] = useState<HeroContent | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateHeroCopy(brandMode, {
        productName: 'My Product',
        keyBenefit: 'Solves real problem'
      })
      setCopy(result)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <select 
        value={brandMode} 
        onChange={(e) => setBrandMode(e.target.value as BrandMode)}
      >
        <option value="anti_guru">Anti-Guru</option>
        <option value="ai_meltdown">AI Meltdown</option>
        <option value="rocket_future">Rocket Future</option>
      </select>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {copy && (
        <div>
          <h1>{copy.headline}</h1>
          <p>{copy.subcopy}</p>
          <button>{copy.cta}</button>
        </div>
      )}
    </div>
  )
}
```

---

## 🌐 API Route Example

```typescript
// app/api/generate/hero/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateHeroCopy } from '@/lib/personality'

export async function POST(request: NextRequest) {
  const { brandMode, productName } = await request.json()

  try {
    const heroCopy = await generateHeroCopy(brandMode, {
      productName,
      keyBenefit: 'Generated benefit'
    })

    return NextResponse.json({ success: true, copy: heroCopy })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Generation failed' },
      { status: 500 }
    )
  }
}
```

---

## ⚡ Performance Tips

### 1. Generate in Parallel

```typescript
const [hero, feature1, feature2] = await Promise.all([
  generateHeroCopy(brandMode, heroContext),
  generateFeatureCopy(brandMode, feature1Context),
  generateFeatureCopy(brandMode, feature2Context)
])
```

### 2. Use Server Components

```typescript
async function HeroSection({ brandMode }: { brandMode: BrandMode }) {
  // Generate on server, send HTML to client
  const copy = await generateHeroCopy(brandMode, {
    productName: 'Product'
  })
  
  return <Hero copy={copy} />
}
```

### 3. Cache Results

```typescript
import { cache } from 'react'

export const getCachedHero = cache(async (brandMode: BrandMode) => {
  return await generateHeroCopy(brandMode, { productName: 'Product' })
})
```

---

## 🚨 Common Mistakes

### ❌ Don't branch on brand_mode

```typescript
// BAD
if (brandMode === 'anti_guru') {
  headline = 'Direct headline'
} else {
  headline = 'Exciting headline!!!'
}

// GOOD
const copy = await generateHeroCopy(brandMode, { productName })
```

### ❌ Don't call OpenAI directly

```typescript
// BAD
const response = await openai.createCompletion({
  prompt: 'Write a headline...'
})

// GOOD
const heroCopy = await generateHeroCopy(brandMode, { productName })
```

### ❌ Don't mix behavior with style

```typescript
// BAD
const personality = {
  tone: 'professional',
  color: 'blue',  // ← This is style
  fontSize: 24    // ← This is style
}

// GOOD
const personality = resolvePersonality(brandMode) // Behavior only
const theme = getTheme() // Style separately
```

---

## 📚 Full Documentation

- **CASCADE_ARCHITECTURE.md** - Deep dive into the pattern
- **EXAMPLES.tsx** - Working code examples
- **INTEGRATION_GUIDE.md** - Step-by-step integration
- **types.ts** - Full type definitions

---

## 🎯 Key Concept

**The cascade is governance-first.**

AI fills shapes, it doesn't make decisions.

Change `brand_mode` → everything regenerates correctly.

No drift. No betrayal. No confusion.

---

## 🔥 Why This is Powerful

✅ **Single source of truth**: Change brand_mode, regenerate everything

✅ **No AI drift**: Constraints are enforced at prompt level

✅ **Fully testable**: Each layer validated independently

✅ **Reusable everywhere**: Same pattern for all content types

✅ **Hand-edit safe**: Always know what constraints were intended

✅ **Model agnostic**: Swap AI models without changing structure

✅ **Designer friendly**: Preview cascade before generating

✅ **Audit trail**: Every piece knows its governance chain

---

That's it. Start using it.
