# Empty States & Errors System

**Governing Rule:** Empty states and errors must express personality without increasing cognitive load. They are not marketing. They are not jokes. They are reassurance, orientation, and containment.

## Architecture

```text
PersonalityProfile → Category → Bandwidth → Tone + Visuals → Contract
```

### The Four Semantic Classes

1. **empty-expected** - New project, no data yet, first-time builder
   - Personality bandwidth: **full**
   - Example: New funnel builder, empty dashboard

2. **empty-unexpected** - Data failed to load, API returned nothing
   - Personality bandwidth: **reduced**
   - Example: Failed data fetch, search with zero results

3. **recoverable-error** - Validation errors, rate limits, partial failures
   - Personality bandwidth: **minimal**
   - Example: Form validation, API rate limit, temporary failure

4. **hard-error** - Auth failure, 500s, corrupted state
   - Personality bandwidth: **none**
   - Example: Session expired, server error, data corruption

## Personality Rules by Brand Mode

### anti_guru (baseline safety)

- No metaphors
- No humor
- No animation
- One sentence of explanation
- One clear action

### rocket_future (default confidence)

- Light metaphor allowed in expected states
- Subtle motion allowed in expected states
- Forward motion verbs
- Never cute, never ironic

### ai_meltdown (expressive, but contained)

- Personality **only in headline**
- Body text must be **neutral**
- Never sarcastic during errors
- Never glitch motion on errors
- Glitch stays aesthetic, never semantic

## Critical Invariant

**Motion reduces under stress, not increases.**

```text
expected → unexpected → recoverable → hard
  ↓           ↓            ↓          ↓
medium      none         none       none
```

This inversion is a sign of maturity.

## Usage

### Basic Usage with Hook

```typescript
import { useEmptyState } from '@/hooks/useEmptyState'
import { EmptyState } from '@/components/empty-states'

function MyComponent() {
  const { contract, visuals } = useEmptyState({
    category: 'empty-expected',
    severity: 'info',
    primaryAction: {
      label: 'Create First Item',
      onClick: () => console.log('Create')
    }
  })
  
  return <EmptyState contract={contract} visuals={visuals} />
}
```

### Override Default Copy

```typescript
const { contract, visuals } = useEmptyState({
  category: 'empty-expected',
  severity: 'info',
  headline: 'Your custom headline',
  body: 'Your custom body text',
  primaryAction: {
    label: 'Custom Action',
    onClick: () => {}
  }
})
```

### Recoverable Errors

```typescript
import { RecoverableError } from '@/components/empty-states'

function MyComponent() {
  const { contract } = useEmptyState({
    category: 'recoverable-error',
    severity: 'warning',
    headline: 'Validation failed',
    body: 'Please check the highlighted fields.',
    primaryAction: {
      label: 'Try Again',
      onClick: () => {}
    }
  })
  
  return <RecoverableError contract={contract} />
}
```

### Hard Errors

```typescript
import { HardError } from '@/components/empty-states'

function MyComponent() {
  const { contract } = useEmptyState({
    category: 'hard-error',
    severity: 'error',
    headline: 'Session expired',
    body: 'Please sign in again to continue.',
    primaryAction: {
      label: 'Sign In',
      onClick: () => {}
    }
  })
  
  return <HardError contract={contract} />
}
```

## Component Separation of Concerns

### BrandBrain Decides

- Tone (neutral, encouraging, contained-chaos)
- Animation allowance
- Visual noise
- Iconography style

### Product Logic Decides

- Message truth
- Recovery path
- Action labels
- Specific copy

This separation prevents personality from lying.

## Files

| File | Purpose |
|------|---------|
| `lib/empty-states/types.ts` | Type contracts and interfaces |
| `lib/empty-states/emptyStateResolver.ts` | Resolve personality → tone + visuals |
| `components/empty-states/EmptyState.tsx` | For expected/unexpected empty states |
| `components/empty-states/RecoverableError.tsx` | For recoverable errors |
| `components/empty-states/HardError.tsx` | For hard errors |
| `hooks/useEmptyState.ts` | Wire to BrandBrain |

## Testing

The test suite validates:

- Personality bandwidth by category
- Motion reduction under stress
- Tone degradation for errors
- Visual expression rules
- Copy template fallbacks

Run tests:

```bash
npm test -- empty-states
```

## Examples

See complete usage examples in:

- `components/empty-states/examples/BuilderExamples.tsx`
- `components/empty-states/examples/DashboardExamples.tsx`
- `components/empty-states/examples/IntegrationsExamples.tsx`
