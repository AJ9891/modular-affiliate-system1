# Route-Based Personality Overrides

## ⚠️ Warning: Use Sparingly

Route-based personality overrides are an **exception to the cascade pattern**, not the rule.

**Default behavior (preferred):**

```typescript
// Personality comes from user preference
const personality = resolvePersonality(user.brand_mode)
```

**Route override (exception):**

```typescript
// Personality forced by route
if (pathname === '/onboarding') {
  personality = resolvePersonality('rocket_future')
}
```

## When to Use Route Overrides

### ✅ Valid Use Cases

1. **Onboarding flows** - Always optimistic (`rocket_future`)
2. **Admin tools** - Always direct (`anti_guru`)
3. **Marketing campaigns** - Specific campaign personality
4. **Public landing pages** - Brand-specific experience

### ❌ Invalid Use Cases

1. User dashboard (should respect user preference)
2. Content creation (should respect user preference)
3. Settings pages (should respect user preference)
4. Most authenticated pages (should respect user preference)

## Implementation

### Step 1: Define Route Overrides

Edit [routePersonality.ts](./routePersonality.ts):

```typescript
const ROUTE_PERSONALITY_MAP: Record<string, BrandMode> = {
  '/onboarding': 'rocket_future',
  '/admin': 'anti_guru',
  '/marketing/chaos': 'ai_meltdown',
}
```

### Step 2: Enable in Provider

```tsx
// app/layout.tsx
import { PersonalityProvider } from '@/lib/personality'

export default function RootLayout({ children }) {
  return (
    <PersonalityProvider 
      brandMode={user?.brand_mode}
      enableRouteOverrides={true}  // ← Enable route overrides
    >
      {children}
    </PersonalityProvider>
  )
}
```

### Step 3: Check Override Status

```tsx
'use client'

import { usePersonality } from '@/lib/personality'

function MyComponent() {
  const { personality, brandMode, isRouteOverride } = usePersonality()
  
  if (isRouteOverride) {
    console.log('Using route-specific personality:', brandMode)
  } else {
    console.log('Using user preference:', brandMode)
  }
}
```

## How It Works

```text
User visits /onboarding
       ↓
PersonalityProvider checks route
       ↓
Route override found: 'rocket_future'
       ↓
resolvePersonality('rocket_future')
       ↓
All downstream components use rocket_future
       ↓
User navigates to /dashboard
       ↓
No route override
       ↓
resolvePersonality(user.brand_mode)
       ↓
Back to user preference
```

## API

### `getRoutePersonality(pathname, userBrandMode)`

Get personality for a specific route.

```typescript
import { getRoutePersonality } from '@/lib/personality'

const personality = getRoutePersonality('/onboarding', user.brand_mode)
// Returns: 'rocket_future'

const personality = getRoutePersonality('/dashboard', user.brand_mode)
// Returns: user.brand_mode (no override)
```

### `hasRouteOverride(pathname)`

Check if route has an override.

```typescript
import { hasRouteOverride } from '@/lib/personality'

hasRouteOverride('/onboarding')  // true
hasRouteOverride('/dashboard')   // false
```

### `getRouteOverrides()`

Get all defined overrides (for debugging).

```typescript
import { getRouteOverrides } from '@/lib/personality'

const overrides = getRouteOverrides()
// Returns: { '/onboarding': 'rocket_future', ... }
```

## Examples

### Example 1: Onboarding Always Optimistic

```typescript
// routePersonality.ts
const ROUTE_PERSONALITY_MAP = {
  '/onboarding': 'rocket_future'
}

// Any user visiting /onboarding gets optimistic personality
// Regardless of their preferred brand_mode
```

### Example 2: Admin Always Direct

```typescript
const ROUTE_PERSONALITY_MAP = {
  '/admin': 'anti_guru'
}

// Admin tools are always direct and no-nonsense
```

### Example 3: Marketing Campaign

```typescript
const ROUTE_PERSONALITY_MAP = {
  '/marketing/chaos-launch': 'ai_meltdown'
}

// Specific marketing page uses chaos personality
```

## Testing

```typescript
import { getRoutePersonality, hasRouteOverride } from '@/lib/personality'

describe('Route Personality Overrides', () => {
  it('returns override for onboarding', () => {
    expect(getRoutePersonality('/onboarding', 'anti_guru')).toBe('rocket_future')
  })
  
  it('returns user preference when no override', () => {
    expect(getRoutePersonality('/dashboard', 'anti_guru')).toBe('anti_guru')
  })
  
  it('detects route override', () => {
    expect(hasRouteOverride('/onboarding')).toBe(true)
    expect(hasRouteOverride('/dashboard')).toBe(false)
  })
})
```

## Performance

Route overrides are:

- ✅ Memoized in PersonalityProvider
- ✅ Only checked once per route change
- ✅ No re-renders if route hasn't changed
- ✅ No API calls

## Debug Tools

```tsx
import { usePersonality, getRouteOverrides } from '@/lib/personality'

function DebugPanel() {
  const { personality, brandMode, isRouteOverride } = usePersonality()
  const allOverrides = getRouteOverrides()
  
  return (
    <div className="debug">
      <h3>Current Personality</h3>
      <p>Mode: {brandMode}</p>
      <p>Name: {personality.name}</p>
      <p>Route Override: {isRouteOverride ? 'Yes' : 'No'}</p>
      
      <h3>All Overrides</h3>
      <pre>{JSON.stringify(allOverrides, null, 2)}</pre>
    </div>
  )
}
```

## Best Practices

### ✅ Do This

```typescript
// Define overrides in central config
const ROUTE_PERSONALITY_MAP = {
  '/onboarding': 'rocket_future'
}

// Enable globally in root layout
<PersonalityProvider enableRouteOverrides>
```

### ❌ Don't Do This

```typescript
// DON'T check routes in components
if (pathname.startsWith('/onboarding')) {
  personality = 'rocket_future'
}

// DON'T override in multiple places
if (isOnboarding) personality = 'rocket'
if (isAdmin) personality = 'anti_guru'
```

## Migration from if/else

### Before (Anti-Pattern)

```typescript
let personality = user.brand_mode

if (route.startsWith('/onboarding')) {
  personality = 'rocket'
} else if (route.startsWith('/admin')) {
  personality = 'anti_guru'
}
```

### After (Cascade Pattern)

```typescript
// 1. Define overrides once
const ROUTE_PERSONALITY_MAP = {
  '/onboarding': 'rocket_future',
  '/admin': 'anti_guru'
}

// 2. Enable in provider
<PersonalityProvider brandMode={user.brand_mode} enableRouteOverrides>
  <App />
</PersonalityProvider>

// 3. Use personality anywhere
const { personality } = usePersonality()
```

## When to Disable Overrides

Disable route overrides when:

- Building multi-tenant apps
- Respecting user agency is critical
- Every page should reflect user preference
- Testing different personalities

```tsx
<PersonalityProvider 
  brandMode={user.brand_mode}
  enableRouteOverrides={false}  // ← Disable overrides
>
  <App />
</PersonalityProvider>
```

## Summary

Route overrides are:

- ⚠️ **Exception**, not the rule
- ✅ **Governed** through central config
- ✅ **Memoized** for performance
- ✅ **Debuggable** with built-in tools
- ❌ **Not a replacement** for user preference

Default to user preference. Override only when necessary.
