/**

* Integration Guide: Wiring Personality into Your App
*
* Step-by-step guide to integrate the personality system
 */

## Step 1: Update Layout (Root Level)

In `apps/web/src/app/layout.tsx`, add PersonalityProvider:

```tsx
import { PersonalityProvider } from "@/lib/personality"
import { AuthProvider } from "@/contexts/AuthContext"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Wrap with PersonalityProvider, passing user's brand_mode */}
          <PersonalityProvider brandMode={user?.brand_mode}>
            <BrandModeProvider>
              {/* Rest of your app */}
              {children}
            </BrandModeProvider>
          </PersonalityProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Important**: The PersonalityProvider needs access to the user's `brand_mode` from Supabase.
You may need to fetch this from AuthContext or pass it down.

## Step 2: Consume Personality in Components

### Example 1: Dynamic Button Text

```tsx
'use client'

import { usePersonality } from "@/lib/personality"

export function CTAButton() {
  const { personality } = usePersonality()
  
  const buttonText = personality.contentGeneration.callToActionStyle === 'urgent'
    ? 'ACT NOW' 
    : personality.contentGeneration.callToActionStyle === 'soft'
    ? 'Learn More'
    : 'Get Started'
  
  return <button>{buttonText}</button>
}
```

### Example 2: Personality-Aware Motion

```tsx
'use client'

import { motion } from "framer-motion"
import { usePersonalityMotion } from "@/lib/personality"

export function Card() {
  const motion = usePersonalityMotion()
  
  if (!motion.enabled) {
    return <div>No animations</div>
  }
  
  return (
    <motion.div
      whileHover={{ scale: motion.scale }}
      transition={{ duration: motion.duration }}
    >
      Card content
    </motion.div>
  )
}
```

### Example 3: Content Validation

```tsx
'use client'

import { usePersonalityValidation } from "@/lib/personality"

export function ContentEditor() {
  const { validate } = usePersonalityValidation()
  
  const handleSubmit = (content: string) => {
    const { isValid, violations } = validate(content)
    
    if (!isValid) {
      alert(`Personality violations: ${violations.join(', ')}`)
      return
    }
    
    // Content is personality-compliant
    saveContent(content)
  }
  
  return <textarea onBlur={(e) => handleSubmit(e.target.value)} />
}
```

## Step 3: Wire into AI Generation

In your AI generation code, use `getSystemPrompt`:

```tsx
import { getSystemPrompt, resolvePersonality } from "@/lib/personality"

async function generateContent(userBrandMode: string, prompt: string) {
  const personality = resolvePersonality(userBrandMode)
  const systemPrompt = getSystemPrompt(personality)
  
  const response = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ]
  })
  
  return response.choices[0].message.content
}
```

## Step 4: Validate Against Personality

Before saving AI-generated content:

```tsx
import { validateContent, resolvePersonality } from "@/lib/personality"

async function saveGeneratedContent(content: string, brandMode: string) {
  const personality = resolvePersonality(brandMode)
  const violations = validateContent(content, personality)
  
  if (violations.length > 0) {
    console.warn('Content violations:', violations)
    // Optionally regenerate or warn user
  }
  
  await database.saveContent(content)
}
```

## Step 5: Migration from Old BrandModeContext

The existing `BrandModeContext` uses these keys:

* `rocket` → should map to `rocket_future`
* `antiguru` → should map to `anti_guru`  
* `meltdown` → should map to `ai_meltdown`

You have two options:

### Option A: Keep Both (Recommended for gradual migration)

1. Keep `BrandModeContext` for existing components
2. Add `PersonalityProvider` for new features
3. Gradually migrate components to use `usePersonality()`

### Option B: Full Replacement

1. Update all references from `BrandModeContext` to `PersonalityProvider`
2. Update database column `brand_mode` to use new keys
3. Run migration script to update user data

## Architecture Benefits

✅ **Single Source of Truth**: All behavior rules in one place
✅ **Type Safety**: TypeScript enforces personality constraints  
✅ **Immutability**: Profiles are frozen, preventing drift
✅ **Testability**: Easy to test different personalities
✅ **Consistency**: UI, AI, motion, sound all follow same rules

## File Structure

```
apps/web/src/lib/personality/
├── types.ts                 # Type definitions
├── resolvePersonality.ts    # Personality database & resolver
├── PersonalityContext.tsx   # React integration
└── index.ts                 # Public API
```

## Next Steps

1. Wire PersonalityProvider into root layout
2. Update AI generation to use `getSystemPrompt()`
3. Add personality validation to content forms
4. Create motion components using `usePersonalityMotion()`
5. (Optional) Add sound effects using `usePersonalitySound()`

## Example: Full Integration

```tsx
// app/layout.tsx
import { PersonalityProvider } from "@/lib/personality"
import { useAuth } from "@/contexts/AuthContext"

export default function RootLayout({ children }) {
  const { user } = useAuth()
  
  return (
    <PersonalityProvider brandMode={user?.brand_mode}>
      {children}
    </PersonalityProvider>
  )
}

// components/Hero.tsx
'use client'

import { usePersonality, usePersonalityMotion } from "@/lib/personality"
import { motion } from "framer-motion"

export function Hero() {
  const { personality } = usePersonality()
  const motionConfig = usePersonalityMotion()
  
  // Personality-aware text
  const headline = personality.tone === 'urgent' 
    ? 'STOP WASTING TIME'
    : personality.tone === 'playful'
    ? '🚀 Ready to Launch?'
    : 'Build Your Future'
  
  const Wrapper = motionConfig.enabled ? motion.div : 'div'
  
  return (
    <Wrapper 
      className="hero"
      {...(motionConfig.enabled && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: motionConfig.duration }
      })}
    >
      <h1>{headline}</h1>
    </Wrapper>
  )
}

// lib/ai/generate.ts
import { getSystemPrompt, resolvePersonality } from "@/lib/personality"

export async function generateFunnelCopy(brandMode: string, niche: string) {
  const personality = resolvePersonality(brandMode)
  const systemPrompt = getSystemPrompt(personality)
  
  const response = await openai.chat.completions.create({
    messages: [
      { 
        role: "system", 
        content: systemPrompt 
      },
      { 
        role: "user", 
        content: `Generate a landing page headline for ${niche}` 
      }
    ]
  })
  
  return response.choices[0].message.content
}
```

This architecture ensures your entire platform speaks with one voice, moves with one rhythm, and behaves with one set of rules.
