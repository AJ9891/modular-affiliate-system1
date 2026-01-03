# Personality Context System - Quick Reference

## Overview

The **Personality Context System** provides route-aware personality modulation. Components ask "How should I behave right now?" and get answers that respect both the user's brand personality and their current location in the app.

**Key Principle:** Context modulates personality, it doesn't replace it.

## Quick Start

### 1. Basic Usage (Recommended)

```tsx
import { usePersonalityExpression } from '@/lib/personality';

function MyComponent() {
  const { visual, motion, sound, context } = usePersonalityExpression();
  
  return (
    <motion.div 
      className={`${visual.spacing.content} ${visual.borders.radius}`}
      {...motion.enter}
    >
      <Card className={visual.depth.card}>
        {content}
      </Card>
    </motion.div>
  );
}
```

### 2. Manual Control

```tsx
import { usePersonality, getPersonalityContext } from '@/lib/personality';
import { usePathname } from 'next/navigation';

function ManualComponent() {
  const { personality } = usePersonality();
  const pathname = usePathname();
  const context = getPersonalityContext(pathname);
  
  const { resolveVisualTokens } = require('@/lib/personality/resolvers');
  const visual = resolveVisualTokens(personality, context.visualWeight);
  
  // Use visual tokens...
}
```

## Route Rules

| Route | Visual Weight | Motion | Sound | Force Mode | Rationale |
|-------|--------------|--------|-------|------------|-----------|
| `/launchpad` | `high` | ✓ | ✓ | `rocket_future` | Sacred rocket zone 🚀 |
| `/builder` | `medium` | ✓ | ✗ | - | Expressive but focused |
| `/dashboard` | `low` | ✗ | ✗ | - | Tool mode, respectful |
| `/admin` | `low` | ✗ | ✗ | - | Tool mode, respectful |
| `/settings` | `low` | ✗ | ✗ | - | Tool mode, respectful |
| `/analytics` | `low` | ✗ | ✗ | - | Tool mode, respectful |
| Default | `medium` | ✓ | ✗ | - | Balanced expression |

## PersonalityContext Type

```typescript
type PersonalityContext = {
  visualWeight: 'none' | 'low' | 'medium' | 'high';
  motionAllowed: boolean;
  soundAllowed: boolean;
  forceBrandMode?: BrandMode; // Only for special cases
};
```

### Visual Weight Effects

- **none**: Zero decoration, flat, no shadows
- **low**: Minimal hints, subtle borders, reduced shadows
- **medium**: Balanced expression, moderate effects
- **high**: Full personality range, all effects enabled

### Motion Allowed

- `true`: Animations play based on personality profile
- `false`: Zero-duration animations, instant state changes

### Sound Allowed

- `true`: Sound effects enabled (if personality supports it)
- `false`: All sounds disabled regardless of personality

## Hooks

### usePersonalityExpression()

**Best for:** Most components that need visual/motion/sound tokens.

```tsx
const { visual, motion, sound, context } = usePersonalityExpression();
```

Returns:
- `visual` - Context-aware visual tokens (spacing, borders, depth, effects)
- `motion` - Context-aware motion tokens (timing, enter, hover, budget)
- `sound` - Context-aware sound config (enabled, profile, volume)
- `context` - Current PersonalityContext object

### usePersonality()

**Best for:** Accessing raw personality profile or brand mode.

```tsx
const { personality, brandMode, isRouteOverride, context } = usePersonality();
```

Returns:
- `personality` - Full PersonalityProfile object
- `brandMode` - Current brand mode (rocket_future | anti_guru | ai_meltdown)
- `isRouteOverride` - Whether route forced a different mode
- `context` - Current PersonalityContext object

## Visual Tokens

```typescript
interface VisualTokens {
  spacing: {
    section: string;   // e.g., 'space-y-16'
    content: string;   // e.g., 'space-y-6'
    inline: string;    // e.g., 'gap-4'
  };
  
  borders: {
    radius: string;    // e.g., 'rounded-lg'
    width: string;     // e.g., 'border'
    style: string;     // e.g., 'border-gray-200'
  };
  
  depth: {
    card: string;      // e.g., 'shadow-sm'
    hover: string;     // e.g., 'hover:shadow-md'
    focus: string;     // e.g., 'focus:ring-2 focus:ring-blue-500'
  };
  
  effects: {
    backdrop: string;  // e.g., 'backdrop-blur-sm'
    gradient: boolean; // Allow gradients?
    glow: boolean;     // Allow glows?
  };
}
```

## Motion Tokens

```typescript
interface MotionTokens {
  timing: {
    duration: number;  // milliseconds
    easing: string;    // CSS easing function
    delay: number;     // Stagger delay
  };
  
  enter: {
    initial: object;   // Initial state
    animate: object;   // Final state
    transition: object; // Transition config
  };
  
  hover: {
    scale: number;
    y: number;
    transition: object;
  };
  
  allowStagger: boolean;
  allowPageTransitions: boolean;
  allowMicroInteractions: boolean;
}
```

## Examples

### Context-Aware Card

```tsx
export function AdaptiveCard({ children }) {
  const { visual, motion } = usePersonalityExpression();
  
  return (
    <motion.div
      className={`
        p-6 
        ${visual.borders.radius} 
        ${visual.depth.card}
        ${visual.depth.hover}
      `}
      {...motion.enter}
      whileHover={motion.allowMicroInteractions ? motion.hover : undefined}
    >
      {children}
    </motion.div>
  );
}
```

### Context-Aware Button

```tsx
export function AdaptiveButton({ children, onClick }) {
  const { visual, motion } = usePersonalityExpression();
  
  return (
    <motion.button
      className={`
        px-6 py-2.5 font-medium
        ${visual.borders.radius}
        ${visual.depth.focus}
        bg-blue-600 text-white
      `}
      onClick={onClick}
      whileHover={motion.allowMicroInteractions ? motion.hover : undefined}
      whileTap={motion.allowMicroInteractions ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.button>
  );
}
```

### Route-Aware Container

```tsx
export function AdaptiveContainer({ children }) {
  const { visual, context } = usePersonalityExpression();
  
  return (
    <div className={`
      max-w-7xl mx-auto px-4
      ${visual.spacing.section}
    `}>
      {/* Show indicator on launchpad only */}
      {context.forceBrandMode === 'rocket_future' && (
        <div className="mb-8 text-center">
          <span className="text-2xl">🚀</span>
        </div>
      )}
      {children}
    </div>
  );
}
```

## Design Philosophy

### Components Ask "How?" Not "Why?"

**DON'T:**
```tsx
// ❌ Component knows WHY it's different
if (brandMode === 'rocket_future') {
  return <div className="rounded-lg shadow-md">{content}</div>;
}
```

**DO:**
```tsx
// ✓ Component asks HOW to behave
const { visual } = usePersonalityExpression();
return (
  <div className={`${visual.borders.radius} ${visual.depth.card}`}>
    {content}
  </div>
);
```

### Personality is Felt, Not Noticed

Visual expression should be:
- **Peripheral** - In the edges, not the center
- **Tasteful** - Refined, not loud
- **Consistent** - Predictable within context
- **Respectful** - Quiet in tool areas, expressive in marketing

### Route Context Rules

1. **Launchpad gets special treatment** - It's the only hard override (rocket_future)
2. **Tool areas stay calm** - Dashboard, settings, admin = low visual weight
3. **Marketing can express** - Home, about, features = medium-high
4. **Builder is balanced** - User-controlled but not distracting

## Integration with BrandBrain

The personality context system integrates with BrandBrain:

1. User selects brand mode in BrandBrain settings
2. PersonalityProvider resolves personality from brand mode
3. Route context modulates expression based on pathname
4. Components consume context-aware tokens via hooks

```
User Brand Mode → Personality Profile → Route Context → Visual/Motion/Sound Tokens → Components
```

## Troubleshooting

### Personality Not Changing Between Routes

- Verify `PersonalityProvider` is at app root
- Check that `usePathname()` is working (Next.js client component)
- Ensure `getPersonalityContext` is imported correctly

### Motion Not Working on Dashboard

- This is **intentional** - dashboard has `motionAllowed: false`
- Check route rules in `getPersonalityContext()` function

### Launchpad Not Forcing Rocket Future

- Verify pathname starts with `/launchpad`
- Check `forceBrandMode` is being respected in PersonalityProvider
- Ensure no route overrides are interfering

### Components Still Using Old Pattern

- Update imports from `usePersonality()` to `usePersonalityExpression()`
- Replace direct resolver calls with hook consumption
- Remove manual `resolveVisualTokens()` calls where possible

## Migration Guide

### From Old Pattern

```tsx
// OLD
const { personality } = usePersonality();
const visual = resolveVisualTokens(personality);
const motion = resolveMotionTokens(personality);
```

### To New Pattern

```tsx
// NEW
const { visual, motion, sound } = usePersonalityExpression();
```

The new hook:
- ✓ Respects route context automatically
- ✓ Cleaner, less imports
- ✓ Better TypeScript inference
- ✓ Consistent behavior across app

## Best Practices

1. **Use `usePersonalityExpression()` by default** - It handles context automatically
2. **Don't force brand modes** - Only launchpad does this, and it's intentional
3. **Respect motion constraints** - Don't override `motionAllowed: false`
4. **Keep decorations peripheral** - Personality in edges, content in center
5. **Test across routes** - Verify behavior in launchpad, builder, dashboard

## Advanced: Custom Context Logic

If you need custom context rules for a specific component:

```tsx
function SpecialComponent() {
  const { personality, context } = usePersonality();
  const pathname = usePathname();
  
  // Custom override logic
  const customContext = useMemo(() => {
    if (pathname === '/special-page') {
      return { ...context, visualWeight: 'high' as const };
    }
    return context;
  }, [context, pathname]);
  
  const visual = resolveVisualTokens(personality, customContext.visualWeight);
  
  // ...
}
```

**Use sparingly** - The default context rules should work for 95% of cases.
