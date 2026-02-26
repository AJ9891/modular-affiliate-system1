# Governed Sound System

Sound is now **governed, not sprinkled**. The personality system controls when and how sounds play.

## Architecture

```text
PersonalityProfile (soundProfile) 
    ↓
resolveSoundBehavior() → SoundBehavior
    ↓
AmbientSoundController → plays sound
```

## Sound Profiles

### `none`

- **Who**: Anti-Guru
- **Behavior**: Silent, no audio at all
- **Philosophy**: Focus, no distractions

### `ambient_checklist`

- **Who**: Anti-Guru (when enabled)
- **Behavior**: Subtle completion sounds
- **Volume**: 0.15 (quiet)
- **Triggers**: `step_complete`, `success`

### `glitch_comm`

- **Who**: AI Meltdown
- **Behavior**: Digital glitch/interference
- **Volume**: 0.2 (medium)
- **Triggers**: All events (chaotic)

### `procedural_hum`

- **Who**: Rocket Future
- **Behavior**: Algorithmic ambient hum
- **Volume**: 0.12 (very quiet)
- **Triggers**: `system_ready`, `step_unlocked`

## Usage Patterns

### Pattern 1: Declarative (Component-based)

```tsx
import { AmbientSoundController } from '@/components/sound'

function ChecklistItem() {
  const [completed, setCompleted] = useState(false)
  
  return (
    <>
      <button onClick={() => setCompleted(true)}>
        Complete Step
      </button>
      
      {completed && (
        <AmbientSoundController trigger="step_complete" />
      )}
    </>
  )
}
```

### Pattern 2: Imperative (Hook-based)

```tsx
import { useAmbientSound } from '@/components/sound'

function FormSubmit() {
  const { play } = useAmbientSound()
  
  const handleSubmit = async () => {
    try {
      await submitForm()
      play('success')  // Plays if personality allows
    } catch (error) {
      play('error')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Pattern 3: Conditional Rendering

```tsx
import { usePersonality, resolveSoundBehavior } from '@/lib/personality'
import { AmbientSoundController } from '@/components/sound'

function Hero() {
  const { personality } = usePersonality()
  const soundBehavior = resolveSoundBehavior(personality)
  
  return (
    <section>
      <h1>Welcome</h1>
      
      {soundBehavior.enabled && (
        <AmbientSoundController trigger="system_ready" />
      )}
    </section>
  )
}
```

## Sound Triggers

```typescript
type SoundTrigger = 
  | 'step_complete'   // User completes a checklist step
  | 'step_unlocked'   // New content becomes available
  | 'system_ready'    // Page/feature loaded
  | 'error'           // Something went wrong
  | 'success'         // Action succeeded
```

## Key Design Decisions

### ✅ Silent Failure

Sounds fail silently if:

- Browser blocks autoplay
- Audio file not found
- Personality disables sound

**Why**: User trust. No error messages, no console spam.

### ✅ No Looping

Sounds play once per trigger, then stop.

**Why**: Prevents audio fatigue, respects attention.

### ✅ No Persistence

Sounds don't persist across page loads.

**Why**: Fresh start each session, no stale audio.

### ✅ Governed by Personality

Can't override personality rules.

**Why**: Consistency. The brand controls audio policy.

## Sound Files

Place sound files in `/public/sounds/`:

```text
/public/sounds/
  ├── checklist.mp3  (subtle click)
  ├── glitch.mp3     (digital interference)
  └── hum.mp3        (ambient procedural)
```

Recommended specs:

- Format: MP3
- Length: < 2 seconds
- Size: < 50KB
- Volume: Pre-normalized to -18dB

## Integration Checklist

- [ ] Add sound files to `/public/sounds/`
- [ ] Identify sound trigger points in your UI
- [ ] Add `<AmbientSoundController>` where appropriate
- [ ] Test with each personality mode
- [ ] Verify silent failure (no console errors)
- [ ] Check volume levels (not too loud)

## Example: Launchpad Checklist

```tsx
import { AmbientSoundController } from '@/components/sound'

function LaunchpadStep({ step, onComplete }) {
  const [completed, setCompleted] = useState(false)
  
  const handleComplete = () => {
    setCompleted(true)
    onComplete(step.id)
  }
  
  return (
    <div className="step">
      <input
        type="checkbox"
        checked={completed}
        onChange={handleComplete}
      />
      <span>{step.title}</span>
      
      {/* Sound plays when completed, if personality allows */}
      {completed && (
        <AmbientSoundController 
          trigger="step_complete"
          onPlayStart={() => console.log('Sound started')}
          onPlayEnd={() => console.log('Sound ended')}
        />
      )}
    </div>
  )
}
```

## Personality Behavior Matrix

| Personality   | Sound Profile       | Triggers                  | Volume | Philosophy           |
|---------------|---------------------|---------------------------|--------|----------------------|
| AI Meltdown   | glitch_comm         | All                       | 0.20   | Chaotic sensory      |
| Anti-Guru     | ambient_checklist   | Complete/Success          | 0.15   | Minimal feedback     |
| Rocket Future | procedural_hum      | System/Unlock             | 0.12   | Ambient atmosphere   |

## Advanced: Custom Sound Behavior

Want to add custom sound logic? Extend `shouldPlaySound`:

```typescript
// In soundBehavior.ts
export function shouldPlaySound(
  personality: PersonalityProfile,
  trigger: SoundTrigger
): boolean {
  const behavior = resolveSoundBehavior(personality)
  
  if (!behavior.enabled) return false

  // Add custom rules here
  if (personality.mode === 'ai_meltdown' && trigger === 'error') {
    return Math.random() > 0.5 // 50% chance on errors
  }

  // ... rest of logic
}
```

## Testing

Test each personality mode:

```bash
# In your browser console
localStorage.setItem('brand_mode', 'ai_meltdown')
# Reload → should hear glitch sounds

localStorage.setItem('brand_mode', 'anti_guru')
# Reload → should hear subtle clicks

localStorage.setItem('brand_mode', 'rocket_future')
# Reload → should hear ambient hum
```

---

**Remember**: Sound is governed. You ask permission, you don't take control.
