# Modular Affiliate Marketing System - Agent Instructions

## Overview

A production-ready affiliate marketing platform with visual funnel building, email marketing automation, and real-time analytics. Built as a **modular Next.js monorepo** using Turbo, Supabase, and Vercel.

**Key Architecture**: Multi-tenant with subdomain routing, shared UI components, BrandBrain AI system, team collaboration, and pluggable niche modules.

## Current Implementation Status

✅ **Production Ready**: Visual builder, dashboard, email integration, subdomain routing, Stripe payments
✅ **Email Marketing**: Full Sendshark integration with automated sequences and campaigns  
✅ **Analytics**: Real-time tracking, UTM attribution, conversion funnels, automated reports
✅ **Monorepo**: Turbo-powered with shared packages (`@modular-affiliate/ui`, `@modular-affiliate/sdk`)
✅ **BrandBrain AI**: Personality-driven content generation with cascade governance system
✅ **Team Collaboration**: Multi-user workspaces, role-based permissions (Agency plan)
✅ **Downloads System**: Lead magnets, file uploads, email-gated content delivery
✅ **AI Chat Support**: Interactive chat with action extraction and plan recommendations

## Critical Architecture Patterns

### 1. **Subdomain Routing** (`/src/proxy.ts`)

- Users get personal subdomains: `user.app.com`
- Proxy rewrites: `/page` → `/subdomain/user/page`
- Funnel pages (`/f/*`) bypass auth entirely
- Cookie domains handled automatically for auth

### 2. **Supabase Client Boundaries** (Critical Import Patterns)

```typescript
// ❌ NEVER in API routes - causes hydration errors
import { supabase } from '@/lib/supabase'

// ✅ Server API routes - ALWAYS use this pattern
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
const supabase = createRouteHandlerClient({ cookies })

// ✅ Client components - use explicit client
import { supabase } from '@/lib/supabase-client'

// ✅ Proxy (edge) - use subdomain helper
import { createSubdomainMiddlewareClient } from '@/lib/subdomain-auth'
const supabase = createSubdomainMiddlewareClient(req, res)

// ✅ Service role operations - lazy import pattern
const { createClient } = await import('@supabase/supabase-js')
const admin = createClient(url, serviceRoleKey)
```

### 3. **Database Schema** (`/infra/supabase-schema.sql`)

```sql
-- Multi-tenant with user subdomains
users (subdomain, custom_domain, stripe_*, plan, is_admin)
funnels (user_id, niche_id, blocks jsonb) -- JSON-based funnel configs
leads (funnel_id, email, source, utm_*) -- Email captures
clicks (offer_id, funnel_id, utm_*, ip_address) -- Tracking
affiliate_clicks (user_id, partner) -- Referral tracking
```

### 4. **Monorepo Structure**

- **apps/web/**: Main Next.js app with all routes and API endpoints
- **packages/ui/**: Shared shadcn/ui components (`@modular-affiliate/ui`)
- **packages/sdk/**: Shared utilities (`@modular-affiliate/sdk`)
- **packages/modules/**: Pluggable niche modules (planned)
- **infra/**: Database schema and deployment scripts

### 5. **BrandBrain AI System** (`/src/lib/brand-brain/`, `/src/lib/personality/`)

- **Cascade Governance**: Single `brand_mode` decision drives all AI generation
- **Personality Profiles**: 4 modes (anchor, glitch, boost, rocket) with behavioral constraints
- **AI Profile Resolution**: Transforms personality → prompts → generated content
- **Content Validation**: Ensures AI output matches brand personality constraints

```typescript
// BrandBrain workflow pattern
const personality = resolvePersonality(user.brand_mode)
const behavior = resolveHeroBehavior(personality)
const contract = resolveHeroCopyContract(behavior)
const aiProfile = resolveAIPrompt(personality)
const prompt = buildHeroPrompt(aiProfile, contract)
const heroCopy = await generateAI({ system: prompt })
```

### 6. **Team Collaboration** (Agency Plan)

- **Multi-user Workspaces**: Account owners invite team members
- **Role-based Access**: Owner, Admin, Editor, Viewer permissions
- **Resource Sharing**: Funnels and offers can be team-accessible
- **Activity Logging**: Track team actions across resources

```sql
-- Key team tables
team_members (account_owner_id, member_user_id, role, status)
team_activity_log (team_id, user_id, action, resource_type)
-- Resources get team_id columns for sharing
```

## Key Development Workflows

### Environment Setup

```bash
cp apps/web/.env.example apps/web/.env.local
# Configure: SUPABASE_*, STRIPE_*, OPENAI_API_KEY, SENDSHARK_API_KEY
npm run dev  # Turbo handles all packages
```

### Database Migrations

```bash
cat infra/supabase-schema.sql  # Copy to Supabase SQL Editor
node infra/apply-migrations.js  # Apply individual migrations
# Key migrations: brand_brain_tables, team_collaboration, downloads_tables
```

### AI Content Generation Patterns

```typescript
// BrandBrain-aware generation (recommended)
import { generateHeroCopy } from '@/lib/ai-generator'
const copy = await generateHeroCopy(user.brand_mode, { productName, niche })

// Direct AI calls (use sparingly)
import { generateAIContent } from '@/lib/ai'
const content = await generateAIContent(prompt, { personality: user.brand_mode })
```

### Funnel Builder Architecture

- **Visual Builder**: `/visual-builder` - Drag-and-drop with 7 block types
- **Code Builder**: `/builder` - Direct JSON editing  
- **Renderer**: `/f/[...slug]` - Public funnel pages (no auth)

### Funnel JSON Schema Structure

```typescript
// funnels.blocks column stores this JSON structure:
{
  "blocks": [
    {
      "id": "hero-1",
      "type": "hero", // hero|features|cta|testimonial|pricing|faq|email-capture
      "content": {
        "headline": "Your Headline",
        "subheadline": "Supporting text",
        "cta": "Click Here"
      },
      "style": {
        "backgroundColor": "#ffffff",
        "textColor": "#000000"
      }
    }
  ]
}
```

### Email Integration Patterns

```typescript
// Always capture leads first, then trigger email
await fetch('/api/leads/capture', { email, funnel_id, source })
// Sendshark automatically handles welcome sequences
```

## Critical API Patterns

### Lead Capture Flow

```typescript
POST /api/leads/capture → saves to database → triggers Sendshark automation
GET /api/analytics → real-time dashboard stats with date ranges
```

### Authentication Patterns

```typescript
// API routes - check auth first
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}

// Subdomain middleware - automatic rewrites
if (isSubdomain && subdomain) {
  const url = req.nextUrl.clone()
  url.pathname = `/subdomain/${subdomain}${req.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

// Protected routes in middleware
const protectedPaths = ['/launchpad', '/dashboard', '/admin']
if (isProtectedPath && !session) {
  return NextResponse.redirect('/login')
}
```

## Essential URLs & Pages

### User-facing

- `/` - Homepage with features
- `/f/[...slug]` - Public funnel pages (no auth required)
- `/launchpad` - User dashboard with analytics
- `/visual-builder` - Drag-and-drop funnel creator
- `/builder` - JSON-based funnel editor
- `/downloads` - Lead magnets and file uploads

### Admin

- `/admin` - Admin dashboard (requires `is_admin = true`)
- `/admin/users` - User management
- `/domains` - Custom domain management

## Key API Endpoints

### Core Features

- `POST /api/leads/capture` - Lead capture with Sendshark integration
- `GET /api/analytics` - Dashboard stats (leads, clicks, conversions)
- `POST /api/email/send` - Campaign management via Sendshark
- `POST /api/ai/generate-content` - OpenAI content generation
- `POST /api/ai/chat` - Interactive AI chat with action extraction

### Team & Collaboration

- `GET /api/team/members` - Team member management (Agency plan)
- `POST /api/team/invite` - Invite team members with role-based access
- `GET /api/team/activity` - Activity logging and audit trails

### Downloads & Lead Magnets

- `POST /api/downloads/upload` - File upload for lead magnets
- `GET /api/downloads/[id]` - Email-gated content delivery
- `POST /api/leads/capture-download` - Combined lead capture + file access

### Tracking

- `POST /api/track/click` - Affiliate link tracking
- `GET /api/analytics/[funnelId]` - Funnel-specific analytics

## Deployment & Environment

### Vercel Configuration

- **Build**: `cd apps/web && npm run build` (monorepo-aware)
- **Environment**: All vars in `apps/web/.env.local`
- **Domains**: Supports custom domains + subdomain routing

### Required Environment Variables

```bash
# Supabase (database + auth) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (payments) - OPTIONAL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx  
STRIPE_AGENCY_PRICE_ID=price_xxx

# AI & Email - RECOMMENDED
OPENAI_API_KEY=sk-xxx
SENDSHARK_API_KEY=your_sendshark_key
SENDSHARK_API_URL=https://api.sendshark.com/v1
```

## Common Development Patterns

### Error Handling Patterns

```typescript
// Environment validation in API routes
function validateEnv() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('[API/ROUTE] SUPABASE_SERVICE_ROLE_KEY required')
  }
}

// User authentication check
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
}

// Multi-tenant data access (always filter by user)
const { data } = await supabase
  .from('funnels') 
  .select('*')
  .eq('user_id', user.id) // Critical: prevent data leaks
```

## Testing & Development

- `npm run test` - Vitest with global setup and node environment
- `npm run dev` - Turbo dev across all packages  
- Debug via `/debug` routes and admin dashboard
- Test with: `apps/web/vitest.config.ts` (aliases configured for `@/` imports)

## File Organization Patterns

```
apps/web/src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes (use createRouteHandlerClient)
│   ├── f/[...slug]/       # Public funnels (no auth)
│   ├── subdomain/[user]/  # Multi-tenant pages
│   └── (auth)/           # Protected routes
├── components/           # Shared React components
├── lib/
│   ├── supabase.ts      # Lazy proxy client (legacy compat)
│   ├── supabase-client.ts # Explicit client components
│   └── subdomain-auth.ts # Subdomain helpers
└── proxy.ts            # Handles routing + auth (Next.js proxy convention)
```

## Database Query Patterns

```typescript
// Multi-tenant queries - always filter by user
const { data: funnels } = await supabase
  .from('funnels')
  .select('*')
  .eq('user_id', user.id)

// Lead capture with attribution
const { data: lead } = await supabase
  .from('leads')
  .insert({
    email,
    funnel_id,
    source: 'landing_page',
    utm_source,
    utm_campaign
  })
```
