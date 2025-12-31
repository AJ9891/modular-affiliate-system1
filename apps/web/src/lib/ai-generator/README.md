# AI Generator - Personality Integration Guide

## Quick Start

```typescript
import { resolvePersonality } from '@/lib/personality'
import { resolveAIPrompt } from '@/lib/ai-generator'

// 1. Get user's personality
const personality = resolvePersonality(user.brand_mode)

// 2. Resolve AI prompt profile
const promptProfile = resolveAIPrompt(personality)

// 3. Use in your AI calls
const completion = await openai.chat.completions.create({
  messages: [
    { role: "system", content: promptProfile.system },
    { role: "user", content: yourPrompt }
  ]
})
```

## Architecture

```
User's brand_mode → PersonalityProfile → AIPromptProfile → AI Generation
```

**Key Principle:** The same personality that governs UI also governs AI.

## AIPromptProfile Structure

```typescript
{
  system: string      // Worldview + posture
  principles: []      // How it behaves
  forbidden: []       // What it must never do
}
```

## The Three Personalities

### AI Meltdown (`unraveling`)
- **System:** Competent but exhausted
- **Principles:** Clear explanations, acknowledges complexity, honest about tradeoffs
- **Forbidden:** Overconfidence, hype, false reassurance

### Anti-Guru (`blunt`)
- **System:** Rejects hype, speaks plainly, respects intelligence
- **Principles:** Concise, direct, states limitations
- **Forbidden:** Get rich quick, false urgency, buzzwords, income claims

### Rocket Future (`calm`)
- **System:** Optimistic but grounded, progress over miracles
- **Principles:** Forward motion, systems not hacks, compounding effects
- **Forbidden:** Guarantees, absolute claims, timeline promises

## Integration Patterns

### Pattern 1: Basic Generation
```typescript
const personality = resolvePersonality(brandMode)
const promptProfile = resolveAIPrompt(personality)

const content = await generateAI({
  system: promptProfile.system,
  rules: promptProfile.principles,
  forbidden: promptProfile.forbidden,
  userPrompt
})
```

### Pattern 2: With Validation
```typescript
// Generate
const content = await generateContent(brandMode, prompt)

// Validate
const violations = validateGeneratedContent(content, promptProfile)

if (violations.length > 0) {
  // Regenerate or warn
}
```

### Pattern 3: In API Routes
```typescript
// app/api/generate/route.ts
export async function POST(req: Request) {
  const { brandMode, prompt } = await req.json()
  
  const personality = resolvePersonality(brandMode)
  const promptProfile = resolveAIPrompt(personality)
  
  const content = await generateAI({
    system: promptProfile.system,
    rules: promptProfile.principles,
    forbidden: promptProfile.forbidden,
    userPrompt: prompt
  })
  
  return Response.json({ content })
}
```

## File Structure

```
apps/web/src/lib/ai-generator/
├── types.ts              # AIPromptProfile definition
├── promptResolver.ts     # personality → prompt mapper
├── examples.ts           # Usage examples
├── index.ts             # Public API
└── brandModes/
    ├── aiMeltdown.ts    # Exhausted AI profile
    ├── antiGuru.ts      # No BS profile
    └── rocketFuture.ts  # Momentum profile
```

## Benefits

✅ **Single Source of Truth:** UI and AI read from same personality
✅ **No Manual Rules:** Personality governs automatically
✅ **Type Safe:** Full TypeScript support
✅ **Testable:** Easy to test different personalities
✅ **Enforceable:** Forbidden patterns are explicit

## Anti-Guru Enforcement

This is where "This might accidentally make you money" becomes enforceable:

```typescript
antiGuru.forbidden = [
  'Get rich quick language',
  'False urgency',
  'Inflated promises',
  'Buzzwords without explanation',
  'Income claims',
  'Guru-speak'
]
```

The AI cannot violate these rules because they're baked into the system prompt.

## Migration from Legacy API

**Old:**
```typescript
const prompt = resolvePrompt(brandMode, context)
```

**New:**
```typescript
const personality = resolvePersonality(brandMode)
const promptProfile = resolveAIPrompt(personality)
```

The legacy API still works but is deprecated.
