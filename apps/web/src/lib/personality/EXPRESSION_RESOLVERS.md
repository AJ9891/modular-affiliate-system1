# Expression Resolvers: Clean Component Behavior

## The Pattern

Components don't know **why** they behave differently.  
They just ask: **"How should I behave right now?"**

```tsx
const { personality } = usePersonality();
const visual = resolveVisualProfile(personality);
const motion = resolveMotionProfile(personality);
const tone = resolveToneProfile(personality);
const sound = resolveSoundProfile(personality);
```

That's it. That's the entire pattern.

## Architecture

```
PersonalityProfile = {
  mode: 'ai_meltdown' | 'anti_guru' | 'rocket_future'
  authorityTone: 'calm' | 'blunt' | 'unraveling'
  motionStyle: 'minimal' | 'procedural' | 'unstable'
  soundProfile: 'none' | 'ambient_checklist' | 'glitch_comm'
  
  visuals: {                    // ← NEW
    noise: VisualNoise
    density: SpatialDensity
    rhythm: VisualRhythm
    borderStyle: 'sharp' | 'soft' | 'none'
    layerDepth: 'flat' | 'subtle' | 'pronounced'
    contrastPreference: 'high' | 'moderate' | 'low'
  }
}
```

### Visual Behavior is Descriptive, Not Prescriptive

❌ **Wrong**: `primaryColor: '#FF0000'`  
✅ **Right**: `contrastPreference: 'high'`

❌ **Wrong**: `fontSize: '32px'`  
✅ **Right**: `density: 'sparse'`

The personality describes **behavior rules**.  
Resolvers turn those into **concrete decisions**.

## Expression Resolvers

### 1. Visual Profile

```tsx
const visual = resolveVisualProfile(personality);

// Returns:
{
  // Spacing
  containerPadding: 'p-8 md:p-12',   // Based on density
  contentGap: 'gap-8',
  sectionSpacing: 'space-y-12',
  
  // Borders
  borderRadius: 'rounded-none',      // Based on borderStyle
  borderWidth: 'border-2',
  borderStyle: 'border-solid',
  
  // Depth
  cardShadow: 'shadow-none',         // Based on layerDepth
  hoverShadow: 'hover:shadow-sm',
  
  // Effects
  backdropBlur: 'backdrop-blur-none', // Based on noise
  overlayOpacity: 'bg-opacity-0',
  
  // Composed classes
  cardClass: '...',
  buttonClass: '...',
  inputClass: '...',
}
```

### 2. Motion Profile

```tsx
const motion = resolveMotionProfile(personality);

// Returns:
{
  transitionSpeed: 'fast',
  transitionTiming: 'ease',
  
  // Framer Motion presets
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2 }
  },
  
  scaleIn: { ... },
  slideIn: { ... },
  
  // Hover behavior
  hoverScale: 1.0,      // 1.0 = no scale, 1.05 = grow
  hoverRotate: 0,       // degrees
  
  staggerChildren: 0    // animation delay between list items
}
```

### 3. Tone Profile

```tsx
const tone = resolveToneProfile(personality);

// Returns:
{
  headingSizes: {
    h1: 'text-4xl md:text-5xl',
    h2: 'text-3xl md:text-4xl',
    ...
  },
  
  headingWeight: 'font-bold',
  bodyWeight: 'font-medium',
  
  headingLeading: 'leading-tight',
  bodyLeading: 'leading-normal',
  
  uppercase: false,
  italic: false,
  letterSpacing: 'tracking-tight'
}
```

### 4. Sound Profile

```tsx
const sound = resolveSoundProfile(personality);

// Returns:
{
  enabled: true,
  profile: 'ambient_checklist',
  volume: 0.3,
  
  events: {
    click: 'click.wav',
    success: 'success.wav',
    error: null,
    ambient: null
  }
}
```

## Component Usage

### Simple Card

```tsx
function MyCard({ children }) {
  const { personality } = usePersonality();
  const visual = resolveVisualProfile(personality);
  const motion = resolveMotionProfile(personality);
  
  return (
    <motion.div
      className={visual.cardClass}
      {...motion.fadeIn}
    >
      {children}
    </motion.div>
  );
}
```

### Interactive Button

```tsx
function MyButton({ onClick, children }) {
  const { personality } = usePersonality();
  const visual = resolveVisualProfile(personality);
  const motion = resolveMotionProfile(personality);
  
  return (
    <motion.button
      className={visual.buttonClass}
      onClick={onClick}
      whileHover={{ scale: motion.hoverScale }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}
```

### Heading with Authority

```tsx
function MyHeading({ level, children }) {
  const { personality } = usePersonality();
  const tone = resolveToneProfile(personality);
  
  const Component = level; // h1, h2, h3, h4
  
  return (
    <Component 
      className={`${tone.headingWeight} ${tone.headingSizes[level]}`}
      style={{ textTransform: tone.uppercase ? 'uppercase' : 'none' }}
    >
      {children}
    </Component>
  );
}
```

### Animated List

```tsx
function MyList({ items }) {
  const { personality } = usePersonality();
  const visual = resolveVisualProfile(personality);
  const motion = resolveMotionProfile(personality);
  
  return (
    <motion.ul
      className={visual.sectionSpacing}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: motion.staggerChildren }
        }
      }}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          variants={{
            hidden: motion.fadeIn.initial,
            visible: motion.fadeIn.animate
          }}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

## Personality Comparison

### AI Meltdown

```
visuals: {
  noise: 'chaotic',           // Max visual chaos
  density: 'packed',          // High information density
  rhythm: 'erratic',          // Unpredictable flow
  borderStyle: 'none',        // No containment
  layerDepth: 'pronounced',   // Heavy shadows
  contrastPreference: 'high'  // Sharp separation
}

Result: Overwhelming, glitchy, maximum stimulation
```

### Anti-Guru

```
visuals: {
  noise: 'clean',             // Minimal chaos
  density: 'sparse',          // Generous whitespace
  rhythm: 'steady',           // Predictable patterns
  borderStyle: 'sharp',       // Clear containment
  layerDepth: 'flat',         // No depth tricks
  contrastPreference: 'high'  // Clear hierarchy
}

Result: Direct, no-nonsense, easy to scan
```

### Rocket Future

```
visuals: {
  noise: 'ambient',           // Subtle textures
  density: 'balanced',        // Standard spacing
  rhythm: 'syncopated',       // Intentional breaks
  borderStyle: 'soft',        // Rounded edges
  layerDepth: 'subtle',       // Gentle shadows
  contrastPreference: 'moderate' // Smooth gradients
}

Result: Optimistic, polished, forward-thinking
```

## Why This Stays Tasteful

1. **Components don't decide** - They ask
2. **Personality decides once** - At the root
3. **No branching chaos** - One source of truth
4. **Easy to reason about** - Change personality, everything updates
5. **Testable** - Mock the personality, test behavior

## Anti-Patterns to Avoid

❌ Component makes its own decisions:

```tsx
// DON'T DO THIS
function BadCard() {
  const mode = usePersonality().brandMode;
  
  if (mode === 'ai_meltdown') {
    return <div className="p-2 shadow-xl border-0">...</div>
  } else if (mode === 'anti_guru') {
    return <div className="p-8 shadow-none border-2">...</div>
  }
  // ...branches everywhere
}
```

✅ Component asks for behavior:

```tsx
// DO THIS
function GoodCard() {
  const { personality } = usePersonality();
  const visual = resolveVisualProfile(personality);
  
  return <div className={visual.cardClass}>...</div>
}
```

## Extending the System

Want to add a new behavior dimension?

1. Add type to `types.ts`
2. Add field to `PersonalityProfile.visuals`
3. Update resolver in `resolvers.ts`
4. Components automatically benefit

Example: Add `iconStyle`

```typescript
// types.ts
export type IconStyle = 'outline' | 'solid' | 'duotone';

export interface VisualBehaviorRules {
  // ...existing fields
  iconStyle: IconStyle;
}

// resolvers.ts
export function resolveVisualProfile(personality) {
  const iconClass = {
    outline: 'stroke-2',
    solid: 'fill-current',
    duotone: 'opacity-50'
  }[visuals.iconStyle];
  
  return {
    // ...existing fields
    iconClass
  };
}

// Component
function MyIcon() {
  const visual = resolveVisualProfile(personality);
  return <Icon className={visual.iconClass} />;
}
```

That's the entire pattern. Clean. Scalable. Tasteful.
