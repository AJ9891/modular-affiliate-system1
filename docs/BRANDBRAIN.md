# BrandBrain: Comprehensive Brand Management System

## Overview

BrandBrain is a centralized brand personality and compliance management system that ensures consistent voice, tone, and messaging across all AI-generated content and user interfaces.

**Formula:**
```
BrandBrain = PersonalityProfile 
           + AI Prompt Rules 
           + UI Behavior Constraints 
           + Sound Policy 
           + Forbidden Claims
```

## Architecture

### Components

1. **PersonalityProfile** - Core brand identity, values, voice, and language preferences
2. **AI Prompt Rules** - System instructions, content generation rules, and accuracy requirements
3. **UI Behavior Constraints** - Visual design, copy, interaction, and accessibility rules
4. **UI Expression Profile** - Hero variants, typography, surfaces, micro-interactions, and sound settings
5. **Sound Policy** - Voice characteristics, word choice, messaging frameworks
6. **Forbidden Claims** - Legal compliance, regulatory requirements, ethical guidelines

### Database Schema

```sql
brand_profiles
├── id (UUID)
├── user_id (UUID, FK to auth.users)
├── is_active (boolean) - Only one active profile per user
├── brand_name (text)
├── PersonalityProfile fields
│   ├── mission, values, target_audience, archetype
│   ├── voice_tone, voice_traits, formality_level
│   ├── humor_level, emoji_usage
│   └── language preferences
├── AIPromptRules fields (JSONB)
│   ├── ai_system_instructions
│   ├── ai_content_generation
│   ├── ai_accuracy_rules
│   └── ai_custom_templates
├── UIBehaviorConstraints fields (JSONB)
│   ├── ui_visual
│   ├── ui_copy
│   ├── ui_interaction
│   └── ui_accessibility
├── UIExpressionProfile (JSONB)
│   └── ui_expression_profile
├── SoundPolicy fields (JSONB)
│   ├── sound_voice_characteristics
│   ├── sound_word_choice
│   ├── sound_messaging
│   └── sound_customer_communication
└── ForbiddenClaims fields (JSONB)
    ├── forbidden_legal
    ├── forbidden_regulatory
    ├── forbidden_ethics
    └── forbidden_content_restrictions

content_validations
├── id (UUID)
├── brand_profile_id (UUID, FK)
├── content_text (text)
├── violations (JSONB) - Array of validation issues
├── score (integer, 0-100) - Brand alignment score
└── approved (boolean)
```

## API Endpoints

### Brand Profiles

#### List All Brand Profiles
```http
GET /api/brand-brain
GET /api/brand-brain?active=true
```

#### Get Single Profile
```http
GET /api/brand-brain/:id
```

#### Create Brand Profile
```http
POST /api/brand-brain
Content-Type: application/json

{
  "brand_name": "Your Brand",
  "mission": "Your mission statement",
  "voice_tone": "professional",
  "formality_level": 3,
  "humor_level": "subtle",
  ...
}
```

#### Update Brand Profile
```http
PUT /api/brand-brain/:id
Content-Type: application/json

{
  "brand_name": "Updated Name",
  ...
}
```

#### Delete Brand Profile
```http
DELETE /api/brand-brain/:id
```

### Content Validation

#### Validate Content Against Brand Rules
```http
POST /api/brand-brain/validate
Content-Type: application/json

{
  "content": "Your content to validate",
  "brandProfileId": "optional-profile-id",
  "contentType": "landing-page",
  "funnelId": "optional-funnel-id"
}

Response:
{
  "validation": {
    "violations": [
      {
        "type": "forbidden-claim",
        "severity": "error",
        "message": "Contains forbidden phrase",
        "suggestion": "Rephrase to avoid..."
      }
    ],
    "score": 85,
    "approved": true,
    "validationId": "uuid"
  }
}
```

### AI System Prompt

#### Get AI System Prompt from BrandBrain
```http
POST /api/brand-brain/system-prompt
Content-Type: application/json

{
  "brandProfileId": "optional-profile-id"
}

Response:
{
  "systemPrompt": "You are an AI assistant for...",
  "brandProfileId": "uuid"
}
```

## React Hook Usage

### useBrandBrain Hook

```typescript
import { useBrandBrain } from '@/hooks/useBrandBrain';

function MyComponent() {
  const {
    brandProfiles,      // All brand profiles
    activeProfile,      // Currently active profile
    loading,            // Loading state
    error,              // Error message
    fetchProfiles,      // Refresh profiles
    createProfile,      // Create new profile
    updateProfile,      // Update existing profile
    deleteProfile,      // Delete profile
    validateContent,    // Validate content
    getSystemPrompt     // Get AI system prompt
  } = useBrandBrain();

  // Example: Validate content
  const handleValidate = async () => {
    const result = await validateContent(
      "Your content here",
      {
        contentType: "landing-page",
        brandProfileId: activeProfile?.id
      }
    );
    console.log("Validation score:", result.score);
    console.log("Violations:", result.violations);
  };

  // Example: Create profile
  const handleCreate = async () => {
    await createProfile({
      brand_name: "My Brand",
      mission: "Our mission",
      voice_tone: "professional",
      formality_level: 3
    });
  };

  return <div>...</div>;
}
```

## BrandBrain Manager

### Server-Side Usage

```typescript
import { BrandBrainManager } from '@/lib/brand-brain/manager';

// Initialize with profile
const manager = new BrandBrainManager(brandProfile);

// Get brand configuration
const brain = manager.getBrandBrain();

// Validate brand profile
const validation = manager.validate(brandProfile);
console.log("Is valid:", validation.isValid);
console.log("Errors:", validation.errors);

// Validate content
const contentValidation = manager.validateContent(
  "Your content here",
  "brand-profile-id"
);
console.log("Score:", contentValidation.score);
console.log("Approved:", contentValidation.approved);

// Generate AI system prompt
const systemPrompt = manager.generateAISystemPrompt();

// Get UI theme
const theme = manager.getUITheme();
console.log("Primary color:", theme.colors.primary);

// Get messaging guidelines
const guidelines = manager.getMessagingGuidelines();

// Check if disclosure required
const needsDisclosure = manager.requiresDisclosure(content);

// Generate FTC disclosure
const disclosure = manager.generateDisclosure();
```

## AI Integration

BrandBrain automatically integrates with the AI content generation system:

```typescript
// In your AI generation code
import { generateContent } from '@/lib/openai';

// BrandBrain is automatically applied
const content = await generateContent({
  type: 'headline',
  niche: 'fitness',
  productName: 'Workout Program',
  audience: 'busy professionals',
  tone: 'motivational'
  // brandBrain is automatically fetched and applied
});

// Content is validated against brand rules
// System prompt includes brand guidelines
```

## Admin UI

Access the BrandBrain admin interface at:
```
/admin/brand-brain
```

Features:
- **Brand Profiles Tab**: View, create, edit, and delete brand profiles
- **Content Validator Tab**: Test content against brand guidelines in real-time
- **Profile Editor Tab**: Comprehensive form for editing all brand settings

## Key Features

### UIExpressionProfile

The `UIExpressionProfile` controls how the brand personality expresses itself through UI elements:

**Hero Section**
- `variants`: Which hero styles are allowed (`meltdown`, `anti-guru`, `rocket`)
- `motionIntensity`: How much animation (`none`, `low`, `medium`, `high`)
- `visualNoise`: Level of visual complexity (`none`, `controlled`, `expressive`)

**Typography**
- `tone`: Overall text personality (`flat`, `confident`, `playful`, `fractured`)
- `emphasisStyle`: How to emphasize text (`none`, `underline`, `highlight`, `strike`)

**Surfaces**
- `depth`: Card and surface styling (`flat`, `soft`, `layered`)
- `borderStyle`: Border treatment (`sharp`, `rounded`, `mixed`)

**Micro-interactions**
- `hoverAllowed`: Enable hover effects
- `glitchAllowed`: Allow glitch animations
- `pulseAllowed`: Enable pulse animations

**Sound**
- `ambientProfiles`: Allowed sound profiles (`checklist`, `hum`, `glitch`)
- `maxVolume`: Maximum sound volume (0-1)

```typescript
// Example UIExpressionProfile
{
  hero: {
    variants: ['rocket'],
    motionIntensity: 'medium',
    visualNoise: 'controlled'
  },
  typography: {
    tone: 'confident',
    emphasisStyle: 'underline'
  },
  surfaces: {
    depth: 'soft',
    borderStyle: 'rounded'
  },
  microInteractions: {
    hoverAllowed: true,
    glitchAllowed: false,
    pulseAllowed: true
  },
  sound: {
    ambientProfiles: ['checklist'],
    maxVolume: 0.3
  }
}
```

### 1. Automatic Enforcement
- Active brand profile is automatically applied to all AI generation
- Content is validated in real-time
- Violations are logged with suggestions

### 2. Multi-Brand Support
- Create multiple brand profiles
- Switch between brands easily
- Only one profile can be active at a time per user

### 3. Comprehensive Validation
- Checks for forbidden claims (financial guarantees, health claims, etc.)
- Validates tone and voice alignment
- Ensures word choice compliance
- Tracks content length constraints

### 4. Scoring System
- Content receives a 0-100 brand alignment score
- Violations reduce score based on severity
- Threshold for approval can be configured

### 5. Audit Trail
- All content validations are stored
- Track which content violated guidelines
- Monitor brand consistency over time

## Default Configuration

A default brand profile is included with sensible defaults:
- Professional, helpful tone
- Moderate formality (3/5)
- Subtle humor
- Rare emoji usage
- Focus on ethical marketing practices

## Migration

To set up BrandBrain in your database:

```bash
# Apply the migration
psql $DATABASE_URL -f infra/migrations/add_brand_brain_tables.sql

# Or use Supabase migration tool
supabase db push
```

## Best Practices

1. **Start with Default**: Review the default configuration before creating custom profiles
2. **Test Content**: Use the validator tab to test content before publishing
3. **Review Violations**: Regularly check validation logs for patterns
4. **Update Regularly**: Review and update brand profiles quarterly
5. **Train Team**: Ensure team understands brand guidelines
6. **Document Rationale**: Use the notes field to explain brand decisions

## Compliance Features

### Legal Protection
- Prevents forbidden financial guarantees
- Blocks problematic health claims
- Enforces FTC disclosure requirements
- Ensures GDPR compliance reminders

### Ethical Marketing
- Prevents exploitative tactics
- Limits fear-based messaging
- Requires transparency
- Promotes inclusive language

### Regulatory Compliance
- CAN-SPAM compliance for email
- Platform advertising policy adherence
- Industry-specific regulations support

## Future Enhancements

- [ ] A/B testing integration
- [ ] Brand consistency analytics dashboard
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] AI-powered brand guideline suggestions
- [ ] Integration with design tools
- [ ] Automated brand audit reports

## Troubleshooting

### Content Keeps Failing Validation
- Review your forbidden claims list - it may be too restrictive
- Check if humor level matches your content style
- Adjust formality level if tone seems off

### AI Not Following Brand Guidelines
- Verify active profile is set correctly
- Check system prompt generation
- Ensure brand rules are specific and clear

### Multiple Active Profiles
- Database trigger ensures only one active profile per user
- If issues persist, check trigger function is working

## Context-Aware Personality System

### Overview

The personality system now includes **route-based context awareness** that modulates visual expression, motion, and sound based on where the user is in the app.

**Key Principle:** Context modulates personality, it doesn't replace it.

### PersonalityContext Type

```typescript
type PersonalityContext = {
  visualWeight: 'none' | 'low' | 'medium' | 'high';
  motionAllowed: boolean;
  soundAllowed: boolean;
  forceBrandMode?: BrandMode; // Only for special cases like /launchpad
};
```

### Route-Based Rules

The `getPersonalityContext(pathname)` function implements these rules:

1. **Launchpad** (`/launchpad`) - Sacred rocket zone 🚀
   - `visualWeight: 'high'` - Full personality expression
   - `motionAllowed: true` - Smooth animations enabled
   - `soundAllowed: true` - Sound effects allowed
   - `forceBrandMode: 'rocket_future'` - **Only hard override in system**

2. **Builder** (`/builder`) - User-controlled workspace
   - `visualWeight: 'medium'` - Balanced expression
   - `motionAllowed: true` - Subtle animations
   - `soundAllowed: false` - Sound would distract

3. **Dashboard/Admin/Settings** - Tool mode
   - `visualWeight: 'low'` - Minimal decoration
   - `motionAllowed: false` - No animations
   - `soundAllowed: false` - Silent, respectful

4. **Marketing/Default** - Tasteful flair
   - `visualWeight: 'medium'` - Balanced expression
   - `motionAllowed: true` - Smooth animations
   - `soundAllowed: false` - Silent by default

### Usage

#### Basic Usage

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

#### Manual Context Usage

```tsx
import { getPersonalityContext, resolveVisualTokens } from '@/lib/personality';
import { usePathname } from 'next/navigation';

function ManualExample() {
  const pathname = usePathname();
  const context = getPersonalityContext(pathname);
  const personality = resolvePersonality(context.forceBrandMode ?? user.brand_mode);
  const visual = resolveVisualTokens(personality, context.visualWeight);
  
  // ...use visual tokens
}
```

### What Gets Modulated

#### Visual Weight Effects

- **none**: Zero decoration, flat appearance, no shadows
- **low**: Minimal hints, reduced borders, subtle focus rings
- **medium**: Balanced expression, moderate shadows
- **high**: Full personality range, all effects enabled

#### Motion Allowed Effects

- `true`: Animations play based on personality (calm, flat, unstable)
- `false`: Zero-duration animations, instant state changes

#### Sound Allowed Effects

- `true`: Sound effects play based on personality profile
- `false`: All sounds disabled regardless of profile

### Design Philosophy

**Components ask "How should I behave?" not "Which color am I?"**

This distinction keeps the system:
- **Elegant** - No branching logic in components
- **Scalable** - Add new routes without changing components
- **Tasteful** - Personality is felt, not noticed
- **Respectful** - Tool areas stay calm, marketing areas can express

### Integration Points

The context-aware system integrates with:

1. **BrandBrain**: User's selected brand mode feeds into context resolution
2. **PersonalityProvider**: Automatically fetches context based on current route
3. **Expression Resolvers**: All visual/motion/sound resolvers accept context parameters
4. **Component Library**: All personality-aware components use `usePersonalityExpression`

