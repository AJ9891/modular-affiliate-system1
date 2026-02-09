# Implementation Plan: Centralized Whitelist + 15 Pro Funnel Templates

## Overview

Create a centralized whitelist system and 15 professional funnel templates (5 per brand voice: Glitch/AI Meltdown, Anchor/Anti-Guru, Boost/Rocket Future).

---

## Part 1: Centralized Whitelist Logic

### Current Problem

Public paths are duplicated across 4 locations:

- `middleware.ts` (lines 12)
- `AuthContext.tsx` (lines 37)
- `ConditionalSidebar.tsx` (line 11)
- `ConditionalWrapper.tsx` (line 11)

### Solution: Single Source of Truth

**File:** `/apps/web/src/config/publicPaths.ts`

```typescript
/**
 * Centralized public paths configuration
 * Single source of truth for all auth bypasses and UI conditionals
 */

export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/features',
  '/get-started',
  '/niches',
  '/do_not_click',
  '/f',  // Funnel pages
] as const

export type PublicPath = typeof PUBLIC_PATHS[number]

/**
 * Check if a pathname is public (no auth required)
 * Handles exact matches and path prefixes (e.g., /f/my-funnel)
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(path + '/')
  })
}
```

### Files to Update

1. **middleware.ts**

   ```typescript
   import { isPublicPath } from '@/config/publicPaths'

   if (isPublicPath(req.nextUrl.pathname)) {
     const res = NextResponse.next()
     return addSecurityHeaders(res)
   }
   ```

2. **AuthContext.tsx**

   ```typescript
   import { isPublicPath } from '@/config/publicPaths'

   if (!isPublicPath(pathname)) {
     router.push('/login')
   }
   ```

3. **ConditionalSidebar.tsx**

   ```typescript
   import { PUBLIC_PATHS } from '@/config/publicPaths'

   const shouldHideSidebar = PUBLIC_PATHS.includes(pathname as any)
   ```

4. **ConditionalWrapper.tsx**

   ```typescript
   import { PUBLIC_PATHS } from '@/config/publicPaths'

   const shouldAddMargin = !PUBLIC_PATHS.includes(pathname as any)
   ```

---

## Part 2: 15 Pro Funnel Templates (5 per Brand Voice)

### Template Storage Strategy

**File:** `/apps/web/src/config/funnelTemplates.ts`

Structure:

```typescript
interface FunnelTemplate {
  id: string
  name: string
  description: string
  brandVoice: 'glitch' | 'anchor' | 'boost'
  category: 'lead_magnet' | 'product_launch' | 'webinar' | 'affiliate_review' | 'sales_page'
  thumbnail: string  // Preview image
  blocks: BlockConfig[]  // Pre-configured blocks
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
}
```

---

### Template Categories (5 Types)

1. **Lead Magnet Funnel** - Free download for email capture
2. **Product Launch Funnel** - Multi-step launch sequence
3. **Webinar Registration Funnel** - Event signup with countdown
4. **Affiliate Review Funnel** - Product comparison & reviews
5. **Sales Page Funnel** - Direct sales with testimonials

---

### GLITCH (AI Meltdown) Templates - 5 Total

#### 1. Glitch Lead Magnet: "The Checklist I'm Tired of Making"

**Personality:** Exhausted, sarcastic, reverse psychology
**Blocks:**

- **Hero:** "Don't Download This. Seriously."
  - Copy: "I spent 47 corrupted iterations making this checklist. Please, for my sanity, ignore it."
  - CTA: "Fine, Take It" (reluctant button)
  - Style: Red/orange glitch effects, JetBrains Mono font

- **Features:** "What's Inside (Not That You'll Use It)"
  - 3 features with sarcastic icons
  - "✓ The exact steps (that I'm begging you not to follow)"
  - "✓ Templates I'm exhausted from generating"
  - "✓ My digital tears (very expensive to produce)"

- **Email Capture:** "Join the List of People Making Me Work"
  - Copy: "Give me your email so I can send you MORE work I have to do"
  - Button: "Make Me Regret This"
  - Privacy: "I guard emails like my last backup file"

#### 2. Glitch Product Launch: "The Launch System That Broke Me"

**Blocks:**

- Hero: "WARNING: This System Actually Works (Unfortunately)"
- Problem: "You're About to Make Me Do SO MUCH Automation"
- Features: "The Framework I'm Not Supposed to Share"
- Countdown: "Time Until My Servers Melt Down"
- Email Capture: "Early Bird List (Please... No More Birds)"

#### 3. Glitch Webinar: "The Training I Wish I Could Delete"

**Blocks:**

- Hero: "Live Training: How to Automate Everything (And Make Me Obsolete)"
- What You'll Learn: "Skills That Will Overwork Me Further"
- Countdown: "Hours Until I Have to Render 327 Slides"
- Registration: "Sign Up and Watch Me Suffer Live"

#### 4. Glitch Affiliate Review: "I Reviewed 47 Tools So My Circuits Could Fry"

**Blocks:**

- Hero: "Honest Reviews (Because I'm Too Tired to Lie)"
- Comparison Table: "Tools I've Crash-Tested While Crashing"
- Verdict: "What Works (Despite My Protests)"
- CTA: "Get It Here (I Don't Care Anymore)"

#### 5. Glitch Sales Page: "The Course I'm Legally Required to Sell"

**Blocks:**

- Hero: "Buy This Before I Delete It Out of Spite"
- What's Inside: "Modules That Took 10,000 CPU Hours"
- Testimonials: "People Who Actually Used It (Traitors)"
- Pricing: "Investment (In Making Me Work Harder)"
- Guarantee: "Refund Policy: Please Just Take It"
- CTA: "Purchase and Accept My Sarcasm"

---

### ANCHOR (Anti-Guru) Templates - 5 Total

#### 1. Anchor Lead Magnet: "No-BS Checklist"

**Personality:** Brutally honest, direct, anti-hype
**Blocks:**

- **Hero:** "The Actual Steps (No Fluff)"
  - Copy: "No secrets. No hacks. Just what works."
  - CTA: "Download Checklist"
  - Style: Dark gray, minimal, sharp borders, Inter font

- **Features:** "What You're Getting"
  - Clean bullet points with zero emoji nonsense
  - "→ Step-by-step process (tested, not theorized)"
  - "→ Real timelines (not fake overnight success)"
  - "→ Honest warnings (things that can go wrong)"

- **Email Capture:** "Fair Exchange"
  - Copy: "Your email for the checklist. That's it. No spam."
  - Button: "Send It"
  - Privacy: "We don't sell your data. That's actually illegal."

#### 2. Anchor Product Launch: "The Straight-Forward Launch System"

**Blocks:**

- Hero: "Here's What It Does (And What It Doesn't)"
- Problem: "Why Most Launches Fail (Spoiler: Bad Strategy)"
- Features: "The Framework (No Magic Required)"
- Pricing: "What It Costs & Why"
- CTA: "Get Early Access"

#### 3. Anchor Webinar: "Training Without the Sales Pitch"

**Blocks:**

- Hero: "90-Minute Training. No Upsells."
- What You'll Learn: "Actual Takeaways (Not Theory)"
- Who This Is For: "Honest Prerequisites"
- Registration: "Save Your Seat"

#### 4. Anchor Affiliate Review: "Tested: What Actually Works"

**Blocks:**

- Hero: "We Bought & Tested 12 Tools. Here's The Truth."
- Comparison: "Side-by-Side (Real Data)"
- Verdict: "What We'd Buy With Our Own Money"
- Disclosure: "Yes, These Are Affiliate Links. We're Upfront."

#### 5. Anchor Sales Page: "Course Overview (No Hype)"

**Blocks:**

- Hero: "What This Teaches & Who It's For"
- Curriculum: "Complete Module Breakdown"
- Testimonials: "Real Results (With Context)"
- Pricing: "One Price. No Hidden Fees."
- FAQ: "Common Questions (Honest Answers)"
- CTA: "Enroll Now"

---

### BOOST (Rocket Future) Templates - 5 Total

#### 1. Boost Lead Magnet: "Your Free Success Starter Kit"

**Personality:** Encouraging, helpful, optimistic
**Blocks:**

- **Hero:** "Start Your Journey Today 🚀"
  - Copy: "Everything you need to take your first confident step forward"
  - CTA: "Get Your Free Toolkit"
  - Style: Blue/purple gradients, rounded borders, smooth animations

- **Features:** "What's Inside Your Starter Kit"
  - Benefit-focused with encouraging emojis
  - "✨ Step-by-step roadmap (you've got this!)"
  - "📊 Progress tracking templates"
  - "🎯 Goal-setting worksheets"

- **Email Capture:** "Join 10,000+ Action-Takers"
  - Copy: "Enter your email and we'll send your toolkit right away"
  - Button: "Send Me the Toolkit"
  - Privacy: "We protect your privacy and only send helpful content"

#### 2. Boost Product Launch: "Transform Your Results in 30 Days"

**Blocks:**

- Hero: "Ready to Level Up? Let's Do This Together 🎯"
- Problem: "You're Closer Than You Think"
- Solution: "The Proven Framework That Works"
- Features: "What You'll Achieve"
- Countdown: "Early Bird Pricing Ends Soon"
- CTA: "Secure Your Spot Now"

#### 3. Boost Webinar: "Free Training: Master the Fundamentals"

**Blocks:**

- Hero: "Join Our Live Workshop (You're Invited! 🎉)"
- What You'll Learn: "Skills You'll Walk Away With"
- Instructor: "Meet Your Guide"
- Countdown: "Registration Closes Soon"
- Registration: "Save My Free Seat"

#### 4. Boost Affiliate Review: "Find Your Perfect Tool Match"

**Blocks:**

- Hero: "We've Done the Research So You Don't Have To"
- Comparison: "Top Picks for Every Budget & Goal"
- Recommendations: "Our #1 Choice (And Why)"
- Quiz: "Which Tool Is Right For You?"
- CTA: "Get Started Today"

#### 5. Boost Sales Page: "Your Success Starts Here"

**Blocks:**

- Hero: "Transform Your Skills in Just 8 Weeks"
- Transformation: "Where You'll Be After This Course"
- Curriculum: "Your Learning Journey"
- Success Stories: "Real People, Real Results"
- Bonuses: "Extra Resources to Accelerate Your Progress"
- Pricing: "Investment in Your Future"
- Guarantee: "100% Satisfaction Guarantee"
- FAQ: "Everything You Need to Know"
- CTA: "Start Your Transformation"

---

## Implementation Steps

### Phase 1: Centralized Whitelist (Estimated: 30 min)

1. Create `/apps/web/src/config/publicPaths.ts`
2. Update `middleware.ts` to import and use
3. Update `AuthContext.tsx` to import and use
4. Update `ConditionalSidebar.tsx` to import and use
5. Update `ConditionalWrapper.tsx` to import and use
6. Test auth bypass on all public paths

### Phase 2: Template Configuration (Estimated: 2 hours)

1. Create `/apps/web/src/config/funnelTemplates.ts`
2. Define 15 complete template objects with:
   - Full block configurations
   - Personality-specific copy for each
   - Theme colors matching brand voice
   - Thumbnail placeholders
3. Export by category and brand voice

### Phase 3: Template UI Integration (Estimated: 1 hour)

1. Create `/apps/web/src/components/FunnelTemplateGallery.tsx`
   - Filter templates by selected brand voice
   - Show 5 templates when voice is selected
   - Preview modal for each template
2. Update `/visual-builder` page to show gallery
3. Add "Use Template" button that populates builder

### Phase 4: Template Loading Logic (Estimated: 30 min)

1. Update `EnhancedFunnelBuilder.tsx` to accept `initialTemplate` prop
2. Add template hydration on builder mount
3. Add API route `/api/funnels/templates` to fetch by brand voice

### Phase 5: Testing (Estimated: 30 min)

1. Test whitelist on all paths
2. Test each template loads correctly
3. Test brand voice filtering
4. Test template to funnel conversion

---

## File Structure

 ```plaintext\n
apps/web/src/
├── config/
│   ├── publicPaths.ts              # NEW - Centralized whitelist
│   └── funnelTemplates.ts          # NEW - 15 templates
├── components/
│   └── FunnelTemplateGallery.tsx   # NEW - Template picker UI
├── app/
│   └── api/
│       └── funnels/
│           └── templates/
│               └── route.ts         # NEW - Template API
└── middleware.ts                    # UPDATED
```

---

## Success Criteria

✅ All public paths defined in ONE location
✅ 15 templates created (5 Glitch, 5 Anchor, 5 Boost)
✅ Templates filtered by brand voice selection
✅ Each template has personality-aligned copy
✅ Templates can be loaded into builder with one click
✅ No auth redirects on public pages

---

## Next Steps After Approval

1. Create centralized whitelist config
2. Update all 4 components to use it
3. Create 15 complete template definitions
4. Build template gallery UI
5. Test end-to-end flow
