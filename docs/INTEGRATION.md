# Modular Affiliate System - Feature Integration

## Overview

This system combines the best features from:

1. **Original Affiliate Launchpad** - Simple, effective funnel building with localStorage
2. **Modular Affiliate System** - Enterprise-grade architecture with Supabase, Stripe, and AI
3. **Sendshark Integration** - Professional email marketing and automation

## 🎯 Key Features

### 1. Enhanced Funnel Builder

- **Visual Drag-and-Drop Editor** (`/visual-builder`)
  - Real-time block manipulation
  - Live preview mode
  - Theme customization
  - Pre-built templates for hero, features, CTA, testimonials, pricing, FAQ, and email capture

- **Traditional Code-Based Builder** (`/builder`)
  - JSON-based funnel configuration
  - Full programmatic control
  - Advanced customization options

### 2. Email Marketing with Sendshark

#### Automated Sequences

- **Welcome Series**: 3-email onboarding sequence
- **Abandoned Cart Recovery**: 2-email re-engagement campaign
- **Custom Triggers**: Build your own automation workflows

#### Campaign Management

- One-off email broadcasts
- Scheduled campaigns
- A/B testing capabilities
- Subscriber segmentation with tags

#### Analytics & Reporting

- Email open rates
- Click-through rates
- Conversion tracking
- Automated weekly performance reports

### 3. Lead Capture & Management

- Integrated email capture forms
- Automatic list segmentation
- Custom field tracking
- Source/funnel attribution
- Automated welcome email triggers

### 4. Comprehensive Analytics Dashboard

- **Real-time Metrics**
  - Total leads captured
  - Click-through rates
  - Conversion rates
  - Revenue tracking
  - Email performance

- **Visual Reports**
  - Traffic sources breakdown
  - Offer performance comparison
  - Recent activity feed
  - Date range filtering (7d, 30d, 90d)

### 5. Modular Architecture

- **Swappable Niches**: Health, Finance, Tech, etc.
- **Swappable Offers**: Easy affiliate link management
- **Swappable Themes**: Pre-configured color schemes
- **Swappable Funnels**: Import/export templates

### 6. AI-Powered Content Generation

- Headline creation
- Product descriptions
- Email copy
- Full landing pages
- Bullet points and CTAs

### 7. Stripe Integration

- Subscription management
- One-time payments
- Customer portal
- Webhook handling

## 📁 Project Structure

```
apps/
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── email/           # Email API endpoints
│   │   │   │   │   ├── send/
│   │   │   │   │   ├── templates/
│   │   │   │   │   ├── automation/
│   │   │   │   │   └── reports/
│   │   │   │   ├── leads/           # Lead capture
│   │   │   │   ├── analytics/       # Enhanced analytics
│   │   │   │   ├── funnels/
│   │   │   │   └── ...
│   │   │   ├── builder/             # Code-based builder
│   │   │   ├── visual-builder/      # Visual drag-drop builder
│   │   │   ├── dashboard/           # Unified dashboard
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── EnhancedFunnelBuilder.tsx
│   │   │   └── UnifiedDashboard.tsx
│   │   └── lib/
│   │       ├── sendshark.ts         # Email service
│   │       ├── supabase.ts
│   │       ├── stripe.ts
│   │       ├── openai.ts
│   │       └── tracking.ts
docs/
├── SENDSHARK.md                      # Email integration guide
├── AI.md
└── TRACKING.md
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Sendshark
SENDSHARK_API_KEY=your_sendshark_key
SENDSHARK_API_URL=https://api.sendshark.com/v1
```

### 3. Database Setup

Run the SQL schema:

```bash
# In Supabase SQL Editor
cat infra/supabase-schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Visit:

- Main app: <http://localhost:3000>
- Visual Builder: <http://localhost:3000/visual-builder>
- Dashboard: <http://localhost:3000/dashboard>

## 📊 Database Schema

### New Tables Added

- `leads` - Email captures from funnels
- `automations` - Email automation configurations
- `email_campaigns` - Campaign tracking and stats

### Enhanced Tables

- `clicks` - Now includes lead attribution
- `conversions` - Enhanced with funnel tracking
- `funnels` - Extended with email capture config

## 🔄 Workflow Examples

### Lead Capture Flow

1. User submits email on funnel page
2. Lead saved to `leads` table
3. Added to Sendshark subscriber list
4. Welcome automation triggered
5. Tagged with funnel ID and source

### Email Campaign Flow

1. Create campaign via `/api/email/send`
2. Upload recipient list
3. Schedule or send immediately
4. Track opens and clicks
5. View stats in dashboard

### Weekly Report Flow

1. Cron job triggers `/api/email/reports`
2. System fetches analytics for date range
3. Generates HTML report email
4. Sends via Sendshark
5. Tracks email engagement

## 🎨 UI Components

### EnhancedFunnelBuilder

- Left sidebar: Block library
- Center canvas: Drag-drop workspace
- Right sidebar: Block editor
- Top bar: Theme settings and save

### UnifiedDashboard

- Stat cards: Key metrics at a glance
- Performance grid: Detailed breakdowns
- Recent activity: Real-time feed
- Quick actions: Common tasks

## 📈 Best Practices

### Email Marketing

1. Segment subscribers by funnel/source
2. Test subject lines with A/B tests
3. Monitor deliverability rates
4. Clean lists regularly
5. Respect unsubscribe requests

### Funnel Optimization

1. Use AI to generate multiple variants
2. A/B test headlines and CTAs
3. Track conversion at each step
4. Optimize for mobile devices
5. Keep load times fast

### Analytics

1. Set up UTM parameters
2. Track all traffic sources
3. Monitor conversion funnels
4. Review weekly reports
5. Act on data insights

## 🔧 API Reference

### Email Endpoints

- `POST /api/email/send` - Send email or campaign
- `GET /api/email/templates` - List templates
- `POST /api/email/templates` - Create template
- `POST /api/email/automation` - Create automation
- `POST /api/email/reports` - Send analytics report

### Lead Endpoints

- `POST /api/leads/capture` - Capture new lead
- `GET /api/leads/capture?funnelId=X` - Get leads

### Analytics Endpoints

- `GET /api/analytics?range=7d` - Get stats
- `GET /api/analytics?funnelId=X` - Funnel-specific stats

## 🚢 Deployment

### Vercel Deployment

```bash
npm run deploy
```

### Environment Variables

Set all required env vars in Vercel dashboard before deploying.

### Post-Deployment

1. Set up Stripe webhooks
2. Configure Sendshark automations
3. Test email deliverability
4. Verify database connections

## 🆘 Troubleshooting

### Email Not Sending

- Check `SENDSHARK_API_KEY` is valid
- Verify API quota limits
- Review Sendshark dashboard logs

### Funnel Not Saving

- Check Supabase connection
- Verify user authentication
- Review browser console errors

### Analytics Not Loading

- Confirm database has data
- Check date range parameters
- Verify RLS policies

## 📚 Additional Resources

- [Sendshark Integration Guide](./docs/SENDSHARK.md)
- [AI Content Generation](./docs/AI.md)
- [Tracking Implementation](./docs/TRACKING.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

When adding features:

1. Follow existing code patterns
2. Update documentation
3. Add API tests
4. Update database schema if needed
5. Test email deliverability

## 📝 License

Proprietary - All rights reserved
