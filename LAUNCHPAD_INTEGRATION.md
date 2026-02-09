# Affiliate Launchpad Integration - Complete Guide

## 🎯 Overview

The **Affiliate Launchpad** is now fully integrated with the modular affiliate system, combining the best features from both platforms:

### Best Features Combined

#### From Original Launchpad ✅

- ✨ Simple, intuitive onboarding flow
- 🎨 Visual drag-and-drop funnel builder
- 📝 Pre-built funnel templates
- 🚀 Quick-start workflow
- 💡 User-friendly interface

#### From Modular System ✅

- 🏗️ Enterprise-grade architecture
- 🔐 Supabase authentication & database
- 💳 Stripe payment integration
- 🤖 AI-powered content generation
- 📊 Comprehensive analytics
- 📧 Sendshark email automation
- 🔄 Multi-niche support
- 📈 Advanced tracking & attribution

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in `apps/web/`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI for AI Features (Recommended)
OPENAI_API_KEY=your_openai_key

# Sendshark for Email (Recommended)
SENDSHARK_API_KEY=your_sendshark_key
SENDSHARK_API_URL=https://api.sendshark.com/v1

# Stripe for Payments (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Setup Database

1. Go to your Supabase project
2. Open SQL Editor
3. Copy contents from `infra/supabase-schema.sql`
4. Execute the SQL

### 4. Run Development Server

```bash
npm run dev
```

Visit: <http://localhost:3000/launchpad>

## 📁 Key Files & Components

### Main Launchpad Component

- **Location**: `/AffiliateLaunchpad.jsx` (root)
- **Next.js Page**: `/apps/web/src/app/launchpad/page.tsx`
- **Features**:
  - Guided onboarding for new users
  - Dashboard view for returning users
  - Quick funnel templates
  - Stats overview
  - Quick action buttons

### Visual Funnel Builder

- **Component**: `/apps/web/src/components/EnhancedFunnelBuilder.tsx`
- **Page**: `/apps/web/src/app/visual-builder/page.tsx`
- **Features**:
  - Drag-and-drop interface
  - 7 pre-built block types
  - Real-time preview
  - Theme customization
  - Export to JSON

### Unified Dashboard

- **Component**: `/apps/web/src/components/UnifiedDashboard.tsx`
- **Page**: `/apps/web/src/app/dashboard/page.tsx`
- **Features**:
  - Real-time stats
  - Performance metrics
  - Recent activity feed
  - Export reports
  - Date range filtering

## 🎨 Funnel Templates

### 1. Lead Magnet Funnel

- **Purpose**: Capture emails with free downloads
- **Blocks**: Hero, Email Capture, Features
- **Avg Conversion**: 18-25%
- **Best For**: List building, eBooks, checklists

### 2. Product Review Funnel

- **Purpose**: Review and recommend affiliate products
- **Blocks**: Hero, Features, Testimonial, CTA, FAQ
- **Avg Conversion**: 8-15%
- **Best For**: Product reviews, comparisons, recommendations

### 3. Video Sales Letter (VSL)

- **Purpose**: Video-first landing page
- **Blocks**: Hero (video), Features, CTA, Testimonial
- **Avg Conversion**: 12-20%
- **Best For**: Course launches, high-ticket products

### 4. Webinar Registration

- **Purpose**: Collect registrations for live training
- **Blocks**: Hero, Features, Email Capture, FAQ
- **Avg Conversion**: 25-35%
- **Best For**: Webinars, workshops, masterclasses

## 🔧 Customization Guide

### Adding New Templates

Edit `/apps/web/src/app/launchpad/page.tsx`:

```typescript
const funnelTemplates = [
  {
    name: 'Your Template Name',
    description: 'Template description',
    blocks: 4, // Number of blocks
    conversions: '10-15%', // Expected conversion rate
    category: 'template-type' // Unique identifier
  },
  // ... more templates
]
```

### Customizing Block Types

Edit `/apps/web/src/components/EnhancedFunnelBuilder.tsx`:

```typescript
const blockTemplates = {
  'your-block': {
    type: 'your-block',
    content: {
      // Default content
    },
    style: {
      // Default styling
    }
  }
}
```

### Modifying Onboarding Steps

Edit launch steps in `page.tsx`:

```typescript
const launchSteps = [
  {
    id: 'step-id',
    title: 'Step Title',
    description: 'Step description',
    icon: YourIcon,
    action: 'Button Text'
  }
]
```

## 📊 Analytics & Tracking

### Track Funnel Performance

```javascript
// Get funnel stats
const response = await fetch('/api/analytics?funnelId=your-funnel-id&range=30d')
const data = await response.json()

console.log(data.stats) // totalLeads, conversions, revenue, etc.
```

### Track User Actions

```javascript
// Track lead capture
await fetch('/api/leads/capture', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    funnelId: 'funnel-123',
    source: 'facebook-ads'
  })
})

// Track conversion
await fetch('/api/track/conversion', {
  method: 'POST',
  body: JSON.stringify({
    funnelId: 'funnel-123',
    clickId: 'click-456',
    amount: 47.00
  })
})
```

## 🤖 AI Features

### Generate Funnel Content

```javascript
const response = await fetch('/api/ai/generate-content', {
  method: 'POST',
  body: JSON.stringify({
    type: 'landing-page',
    niche: 'health',
    product: 'Weight Loss Program',
    tone: 'professional'
  })
})

const { content } = await response.json()
```

### Generate Complete Funnel

```javascript
const response = await fetch('/api/ai/generate-funnel', {
  method: 'POST',
  body: JSON.stringify({
    niche: 'finance',
    goal: 'lead-generation',
    targetAudience: 'young professionals'
  })
})

const { funnel } = await response.json()
```

## 📧 Email Automation

### Send Welcome Email

```javascript
await fetch('/api/email/automation', {
  method: 'POST',
  body: JSON.stringify({
    action: 'trigger',
    automationId: 'welcome-sequence',
    recipient: {
      email: 'user@example.com',
      name: 'John Doe'
    }
  })
})
```

### Send Weekly Report

```javascript
await fetch('/api/email/reports', {
  method: 'POST',
  body: JSON.stringify({
    recipientEmail: 'admin@example.com',
    funnelId: 'all',
    dateRange: {
      start: '2025-01-01',
      end: '2025-01-07'
    }
  })
})
```

## 🎯 User Flows

### New User Flow

1. Visit `/launchpad`
2. See onboarding wizard
3. Progress through 6 steps:
   - Welcome
   - Choose Niche
   - Build Funnel
   - Add Offers
   - Setup Email
   - Launch
4. Redirected to dashboard

### Returning User Flow

1. Visit `/launchpad`
2. See dashboard with stats
3. Quick actions for:
   - Create new funnel
   - Use AI generator
   - View analytics
   - Manage offers
4. Access funnel templates

## 🔐 Authentication Flow

The system uses Supabase Auth:

```typescript
// Check if user is authenticated
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  // Redirect to login
  router.push('/login')
}
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Environment Setup

1. Add all environment variables in Vercel dashboard
2. Configure custom domain
3. Set up Stripe webhooks
4. Verify Sendshark integration

## 📈 Performance Optimization

### Implemented Optimizations

- ✅ Server-side rendering (SSR)
- ✅ API route caching
- ✅ Image optimization
- ✅ Code splitting
- ✅ Database indexing
- ✅ Edge functions ready

### Monitoring

- Track Core Web Vitals
- Monitor API response times
- Set up error logging
- Track conversion rates

## 🐛 Troubleshooting

### Launchpad Not Loading?

1. Check if user is authenticated
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Verify environment variables

### Stats Not Showing?

1. Ensure database has data
2. Check date range filter
3. Verify funnel IDs are correct
4. Check API response in Network tab

### Templates Not Creating Funnels?

1. Check `/api/funnels` endpoint
2. Verify database permissions
3. Check Supabase RLS policies
4. Review server logs

## 📚 Additional Resources

- [Full Integration Guide](./INTEGRATION_SUMMARY.md)
- [Architecture Docs](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/INTEGRATION.md)
- [Sendshark Setup](./docs/SENDSHARK.md)
- [Quick Reference](./QUICK_REFERENCE.md)

## 🎉 What's Next?

### Recommended Next Steps

1. ✅ Complete database setup
2. ✅ Configure all integrations
3. 🔲 Create your first funnel
4. 🔲 Add affiliate offers
5. 🔲 Setup email automation
6. 🔲 Launch and start tracking
7. 🔲 Monitor and optimize

### Future Enhancements

- A/B testing dashboard
- Advanced email segmentation
- Custom domain mapping
- White-label options
- Mobile app
- Zapier integration
- More funnel templates
- Advanced AI features

## 💬 Support

Need help? Reach out:

- Check documentation first
- Review code comments
- Check GitHub issues
- Contact support team

---

**Built with ❤️ combining the best of both worlds!**
