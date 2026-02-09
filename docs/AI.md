# AI Content Generation Integration

## Overview

Complete OpenAI integration for generating high-converting affiliate marketing copy using GPT models.

## Features

- AI-powered content generation for headlines, CTAs, body copy, and more
- Full landing page copy generation
- Email copy creation
- Customizable tone and style
- Niche-specific content optimization

## Setup

### Step 1: Get OpenAI API Key

1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-`)

### Step 2: Add Environment Variable

Add to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Deploy

For production, add the environment variable in Vercel:

1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add `OPENAI_API_KEY` with your key
4. Select Production environment
5. Redeploy your application

## Content Types

### 1. Headline

Generates attention-grabbing headlines for landing pages.

**Example Request:**

```typescript
{
  type: 'headline',
  niche: 'Weight Loss',
  productName: '30-Day Transformation',
  audience: 'Busy moms',
  tone: 'friendly'
}
```

**Example Output:**

```
"Lose 15 Pounds in 30 Days - Even With a Busy Schedule!"
```

### 2. Subheadline

Creates supporting subheadlines that build desire.

**Example Output:**

```
"Join 10,000+ moms who transformed their bodies with just 15 minutes a day"
```

### 3. Call-to-Action (CTA)

Generates compelling button text.

**Example Output:**

```
"Start My Transformation"
```

### 4. Bullet Points

Creates benefit-focused bullet points.

**Example Output:**

```
- Burn fat in just 15 minutes per day
- No gym or equipment needed
- Meal plans designed for busy schedules
- See results in your first week
- Money-back guarantee
```

### 5. Full Landing Page

Generates complete landing page copy including headline, subheadline, benefits, and CTA.

**Example Output (JSON):**

```json
{
  "headline": "Transform Your Body in 30 Days",
  "subheadline": "Proven system for busy moms",
  "benefits": [
    {
      "title": "Quick Workouts",
      "description": "15-minute routines that fit your schedule"
    },
    {
      "title": "Simple Nutrition",
      "description": "Easy meal plans the whole family will love"
    },
    {
      "title": "Real Results",
      "description": "See changes in your first week"
    }
  ],
  "cta": "Start Your Transformation"
}
```

### 6. Email Copy

Creates complete email campaigns.

**Example Output (JSON):**

```json
{
  "subject": "Ready to lose those stubborn pounds?",
  "preview": "Discover the 15-minute secret...",
  "body": "Hi [Name],\n\nAs a busy mom, I know how hard it is to find time for yourself...",
  "cta": "Get Started Now"
}
```

## API Endpoints

### POST /api/ai/generate-content

Generates specific types of content.

**Request:**

```json
{
  "type": "headline" | "subheadline" | "cta" | "bullet-points" | "full-page" | "email",
  "niche": "string",
  "productName": "string",
  "audience": "string",
  "tone": "professional" | "casual" | "urgent" | "friendly",
  "context": "string (optional)"
}
```

**Response:**

```json
{
  "content": "Generated content string or JSON"
}
```

### POST /api/ai/generate-funnel

Generates complete funnel structure with AI content.

**Request:**

```json
{
  "niche": "Weight Loss",
  "productName": "30-Day Transformation",
  "audience": "Busy moms"
}
```

**Response:**

```json
{
  "funnel": {
    "name": "30-Day Transformation - Weight Loss Funnel",
    "blocks": [...]
  },
  "content": {
    "headline": "...",
    "subheadline": "...",
    "benefits": [...],
    "cta": "..."
  }
}
```

## Usage in UI

### AI Generator Page (`/ai-generator`)

The dedicated AI generator page provides a user-friendly interface for creating content:

1. Select content type
2. Fill in niche, product, and audience details
3. Choose tone (professional, casual, urgent, friendly)
4. Add optional context
5. Click "Generate Content"
6. Copy generated content to clipboard

### Programmatic Usage

```typescript
import { generateContent } from '@/lib/openai'

const content = await generateContent({
  type: 'headline',
  niche: 'Fitness',
  productName: 'Home Workout Program',
  audience: 'Beginners',
  tone: 'friendly',
  context: 'Focus on quick results'
})
```

## Tone Options

### Professional

- Formal language
- Expert positioning
- Credibility-focused
- Best for: B2B, high-ticket offers

### Casual

- Conversational tone
- Approachable language
- Friend-to-friend feel
- Best for: Lifestyle products, courses

### Urgent

- Time-sensitive language
- Scarcity messaging
- Action-focused
- Best for: Limited offers, flash sales

### Friendly

- Warm and welcoming
- Empathetic language
- Supportive tone
- Best for: Community-focused, transformation products

## Best Practices

### 1. Be Specific

Provide detailed information about:

- Exact niche and sub-niche
- Target audience demographics
- Key product benefits
- Unique selling propositions

### 2. Use Context Field

Add specific angles or requirements:

- "Focus on time savings"
- "Emphasize scientific backing"
- "Highlight money-back guarantee"

### 3. Generate Multiple Versions

- Create 3-5 versions of each piece
- A/B test different headlines
- Mix and match the best elements

### 4. Edit and Refine

- AI provides a strong foundation
- Add your brand voice
- Verify claims and promises
- Ensure compliance

### 5. Optimize for Conversion

- Test different CTAs
- Vary benefit order
- Adjust tone based on audience response

## Cost Management

### Token Usage

- Headline: ~50-100 tokens
- Subheadline: ~100-150 tokens
- Full Page: ~500-1000 tokens
- Email: ~400-800 tokens

### Model Selection

- **GPT-3.5 Turbo**: Fast, cost-effective (default)
- **GPT-4**: Higher quality, more expensive (optional upgrade)

Edit `/apps/web/src/lib/openai.ts` to change model:

```typescript
model: AI_MODELS.GPT4  // Use GPT-4 for premium content
```

## Error Handling

The system handles common errors:

1. **Missing API Key**: Clear error message prompting setup
2. **Rate Limits**: Automatic retry with exponential backoff
3. **Invalid Requests**: Validation before API call
4. **Network Errors**: User-friendly error messages

## Security

- API key stored server-side only (never exposed to client)
- Environment variable validation on startup
- Rate limiting (implement per user/IP if needed)
- Content filtering for compliance

## Customization

### Add New Content Types

Edit `/apps/web/src/lib/openai.ts`:

```typescript
export interface GenerateContentParams {
  type: 'headline' | 'subheadline' | 'cta' | 'bullet-points' | 'full-page' | 'email' | 'testimonial' // Add new type
  // ...
}

function buildPrompt(params: GenerateContentParams): string {
  switch (type) {
    case 'testimonial':
      return `Generate a realistic customer testimonial...`
    // ...
  }
}
```

### Adjust Temperature

Control creativity vs. consistency:

```typescript
temperature: 0.8  // Default: Creative but controlled
temperature: 1.2  // More creative, less predictable
temperature: 0.3  // More consistent, less creative
```

### Custom System Prompts

Modify the system message for different styles:

```typescript
{
  role: 'system',
  content: 'You are a [specific type] copywriter with expertise in [area]...'
}
```

## Examples

### Generate Headline for Fitness Product

```typescript
const headline = await generateContent({
  type: 'headline',
  niche: 'Fitness',
  productName: 'Beach Body Blueprint',
  audience: 'Men 35-50',
  tone: 'urgent',
  context: 'Summer is coming, emphasize fast results'
})
// "Get Beach-Ready in 6 Weeks - Before Summer!"
```

### Generate Complete Email Campaign

```typescript
const email = await generateContent({
  type: 'email',
  niche: 'Personal Finance',
  productName: 'Investment Masterclass',
  audience: 'Beginner investors',
  tone: 'professional',
  context: 'Focus on building wealth slowly and safely'
})
```

### Generate Full Landing Page

```typescript
const page = await generateContent({
  type: 'full-page',
  niche: 'Digital Marketing',
  productName: 'SEO Academy',
  audience: 'Small business owners',
  tone: 'professional',
  context: 'Emphasize ROI and measurable results'
})
```

## Monitoring

Track AI usage:

1. Log API calls and costs
2. Monitor token usage per user
3. Track conversion rates of AI-generated vs. manual copy
4. A/B test AI variations

## Troubleshooting

**"OpenAI API not configured" error:**

- Verify `OPENAI_API_KEY` is set in environment
- Check .env.local file exists
- Restart development server after adding key

**Rate limit errors:**

- Implement request queuing
- Add user-level rate limiting
- Upgrade OpenAI plan if needed

**Poor quality output:**

- Provide more specific context
- Try different tone settings
- Generate multiple versions
- Consider upgrading to GPT-4

## Future Enhancements

- Image generation with DALL-E
- Voice-based content with Whisper
- Multilingual content generation
- A/B test automation
- Performance tracking and optimization
