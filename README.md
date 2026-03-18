# Modular Affiliate Marketing System

A complete, production-ready affiliate marketing platform combining powerful funnel building, professional email marketing, and real-time analytics.

## 🚀 Features

### Funnel Building

- **Visual Drag-and-Drop Builder** - Intuitive interface with pre-built blocks
- **Code-Based Builder** - Full programmatic control with JSON configuration
- **7 Block Types** - Hero, Features, CTA, Testimonials, Pricing, FAQ, Email Capture
- **Theme Customization** - Real-time color and font adjustments
- **AI Content Generation** - Powered by OpenAI for headlines, copy, and full pages
- **Lead Magnets** - Upload ebooks, PDFs, and digital downloads with email capture

### Email Marketing (Sendshark Integration)

- **Automated Sequences** - Welcome series, abandoned cart recovery
- **Campaign Management** - One-off broadcasts and scheduled campaigns
- **Subscriber Management** - Tagging, segmentation, custom fields
- **Analytics** - Track opens, clicks, conversions
- **Weekly Reports** - Automated performance summaries via email

### Analytics & Tracking

- **Real-time Dashboard** - Leads, clicks, conversions, revenue
- **Traffic Attribution** - UTM parameter tracking
- **Conversion Funnels** - Step-by-step performance analysis
- **Email Metrics** - Open rates, click rates, engagement
- **Export Reports** - Email yourself detailed analytics

### Enterprise Features

- **Multi-niche Support** - Health, Finance, Tech, and more
- **Stripe Integration** - Subscriptions and one-time payments
- **Supabase Backend** - Auth, database, and storage
- **Modular Architecture** - Swap niches, offers, themes, funnels
- **API-First Design** - Extensible and scalable

## 📁 Quick Links

- **[Downloads Setup](./DOWNLOADS_SETUP.md)** - Set up lead magnets and file uploads
- **[Downloads Documentation](./docs/DOWNLOADS.md)** - Complete downloads guide
- **[Integration Summary](./INTEGRATION_SUMMARY.md)** - What's new and how to use it
- **[Full Documentation](./docs/INTEGRATION.md)** - Complete feature guide
- **[Sendshark Setup](./docs/SENDSHARK.md)** - Email integration instructions
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment steps

## 🏃 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Configure your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# Sendshark (NEW!)
SENDSHARK_API_KEY=your_sendshark_api_key
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
cat infra/supabase-schema.sql
```

### 4. Start Development

```bash
npm run dev
```

Visit:

- **Main App**: <http://localhost:3000>
- **Visual Builder**: <http://localhost:3000/visual-builder>
- **Dashboard**: <http://localhost:3000/dashboard>
- **AI Generator**: <http://localhost:3000/ai-generator>
- **Downloads**: <http://localhost:3000/downloads>

## 🎯 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | `/` | Landing page with features |
| Dashboard | `/dashboard` | Analytics and performance metrics |
| Visual Builder | `/visual-builder` | Drag-and-drop funnel creator |
| Code Builder | `/builder` | JSON-based funnel editor |
| Downloads | `/downloads` | Upload and manage lead magnets |
| Offers | `/offers` | Manage affiliate offers |
| Analytics | `/analytics` | Deep-dive analytics |
| AI Generator | `/ai-generator` | AI-powered content creation |

## 🔧 API Endpoints

### Email Marketing

- `POST /api/email/send` - Send emails or campaigns
- `GET /api/email/templates` - List email templates
- `POST /api/email/automation` - Create automation sequences
- `POST /api/email/reports` - Send analytics reports

### Lead Management

- `POST /api/leads/capture` - Capture new leads
- `GET /api/leads/capture?funnelId=X` - Get leads by funnel

### Analytics

- `GET /api/analytics?range=7d` - Get performance stats
- `GET /api/analytics?funnelId=X` - Funnel-specific analytics

### Funnels

- `GET /api/funnels` - List all funnels
- `POST /api/funnels` - Create new funnel
- `PUT /api/funnels/:id` - Update funnel

## 📊 Tech Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe
- **Email**: Sendshark
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## 🎨 Architecture

```text
┌─────────────────┐
│   Next.js App   │
├─────────────────┤
│  Visual Builder │  ←→  Supabase DB
│  Code Builder   │  ←→  Sendshark API
│  Dashboard      │  ←→  Stripe API
│  Analytics      │  ←→  OpenAI API
└─────────────────┘
```

## 📚 Documentation

- **AI Features**: [docs/AI.md](./docs/AI.md)
- **Tracking**: [docs/TRACKING.md](./docs/TRACKING.md)
- **Email Setup**: [docs/SENDSHARK.md](./docs/SENDSHARK.md)
- **Integration**: [docs/INTEGRATION.md](./docs/INTEGRATION.md)

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm run deploy
```

Set environment variables in Vercel dashboard before deploying.

### Manual Deploy

```bash
npm run build
npm run start
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Stripe webhook signature verification
- API key encryption
- CORS configuration

## 📈 Roadmap

- [x] Visual funnel builder
- [x] Sendshark email integration
- [x] Lead capture automation
- [x] Analytics dashboard
- [x] AI content generation
- [ ] A/B testing framework
- [ ] Advanced segmentation
- [ ] White-label options
- [ ] Mobile app

## 🤝 Contributing

See [INTEGRATION.md](./docs/INTEGRATION.md) for development guidelines.

## 📝 License

Proprietary - All rights reserved
