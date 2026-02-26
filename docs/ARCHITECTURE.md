# System Architecture Diagram

## Component Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Landing     │  │   Visual     │  │  Dashboard   │          │
│  │  Pages       │  │   Builder    │  │  Analytics   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API ROUTES                             │  │
│  │                                                            │  │
│  │  /api/funnels    /api/offers     /api/analytics          │  │
│  │  /api/email      /api/leads      /api/track              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SERVICES LAYER                          │  │
│  │                                                            │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │  │
│  │  │ Supabase   │ │ Sendshark  │ │  Stripe    │           │  │
│  │  │  Service   │ │  Service   │ │  Service   │           │  │
│  │  └────────────┘ └────────────┘ └────────────┘           │  │
│  │  ┌────────────┐ ┌────────────┐                           │  │
│  │  │  OpenAI    │ │  Tracking  │                           │  │
│  │  │  Service   │ │  Service   │                           │  │
│  │  └────────────┘ └────────────┘                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────┬───────────┬───────────┬───────────┬─────────────┘
                │           │           │           │
                ▼           ▼           ▼           ▼
     ┌──────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
     │   Supabase   │ │Sendshark│ │ Stripe  │ │ OpenAI  │
     │  (Database)  │ │  (Email)│ │(Payment)│ │  (AI)   │
     └──────────────┘ └─────────┘ └─────────┘ └─────────┘
```

## Data Flow: Lead Capture to Email Automation

```text
┌─────────────┐
│   Visitor   │
│ Lands on    │
│  Funnel     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Email Capture   │
│ Form Submitted  │
└──────┬──────────┘
       │
       ▼
┌──────────────────────────────────────┐
│   POST /api/leads/capture            │
│                                      │
│   1. Save to 'leads' table           │
│   2. Add to Sendshark subscribers    │
│   3. Tag with funnel & source        │
│   4. Trigger welcome automation      │
└──────┬───────────────────────────────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────┐
│  Supabase   │  │  Sendshark   │
│   Database  │  │              │
│             │  │  • Subscriber│
│  • Lead     │  │    Added     │
│    Saved    │  │  • Tagged    │
│  • Tracked  │  │  • Automation│
│             │  │    Triggered │
└─────────────┘  └──────┬───────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Email Sequence  │
              │                  │
              │  • Day 0: Welcome│
              │  • Day 1: Value  │
              │  • Day 3: Follow │
              └──────────────────┘
```

## Funnel Builder Architecture

```text
┌──────────────────────────────────────────────────────────┐
│               VISUAL FUNNEL BUILDER                      │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Block     │  │    Canvas    │  │  Block Editor  │ │
│  │  Library    │  │   Workspace  │  │   (Props)      │ │
│  │             │  │              │  │                │ │
│  │ • Hero      │  │  [Block 1]   │  │  Headline: ___ │ │
│  │ • Features  │  │  [Block 2]   │  │  CTA Text: ___ │ │
│  │ • CTA       │  │  [Block 3]   │  │  Color:    ___ │ │
│  │ • Pricing   │  │              │  │                │ │
│  │ • Email     │  │  Drag & Drop │  │  [Update]      │ │
│  │   Capture   │  │              │  │                │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Theme Settings                           │   │
│  │  Primary Color: [____]  Font: [____]             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│                    [Save Funnel] ───────────────────┐    │
└─────────────────────────────────────────────────────┼────┘
                                                       │
                                                       ▼
                                            ┌─────────────────┐
                                            │ POST /api/      │
                                            │    funnels      │
                                            │                 │
                                            │ Store as JSON   │
                                            │ in Supabase     │
                                            └─────────────────┘
```

## Analytics & Reporting Flow

```text
┌────────────────┐
│   Dashboard    │
│   Page Loads   │
└───────┬────────┘
        │
        ▼
┌────────────────────────────┐
│ GET /api/analytics         │
│   ?range=7d&funnelId=X     │
└────────┬───────────────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
    ┌────────┐    ┌─────────┐    ┌──────────┐  ┌─────────┐
    │ Leads  │    │ Clicks  │    │Conversions│  │ Revenue │
    │ Table  │    │ Table   │    │  Table    │  │  Calc   │
    └────┬───┘    └────┬────┘    └────┬─────┘  └────┬────┘
         │             │              │             │
         └─────────────┴──────────────┴─────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Calculate:     │
              │  • Total Leads  │
              │  • Conv. Rate   │
              │  • Revenue      │
              │  • Avg/Lead     │
              │  • Email Stats  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Return JSON     │
              │ to Dashboard    │
              └─────────────────┘
```

## Email Campaign Flow

```text
┌─────────────────┐
│ Create Campaign │
│  in Dashboard   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│ POST /api/email/send         │
│                              │
│ {                            │
│   type: "campaign",          │
│   subject: "...",            │
│   html: "...",               │
│   recipients: [...]          │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Sendshark Service           │
│                              │
│  1. Create campaign          │
│  2. Upload recipients        │
│  3. Schedule/Send            │
│  4. Return campaign ID       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Save to email_campaigns     │
│  table with:                 │
│  • Campaign ID               │
│  • Status                    │
│  • Stats (opens, clicks)     │
└──────────────────────────────┘
```

## Database Schema Relationships

```text
        ┌─────────┐
        │  users  │
        └────┬────┘
             │
       ┌─────┴─────────────────┐
       │                       │
       ▼                       ▼
  ┌─────────┐          ┌──────────────┐
  │ funnels │          │email_campaigns│
  └────┬────┘          └──────────────┘
       │
       ├───────┬──────────┬─────────┐
       │       │          │         │
       ▼       ▼          ▼         ▼
  ┌──────┐ ┌─────┐  ┌───────┐  ┌──────────┐
  │ leads│ │pages│  │clicks │  │automations│
  └──────┘ └─────┘  └───┬───┘  └──────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │ conversions │
                 └─────────────┘
                        │
                        ▼
                  ┌─────────┐
                  │ offers  │
                  └────┬────┘
                       │
                       ▼
                  ┌─────────┐
                  │ niches  │
                  └─────────┘
```

## Module System

```text
┌────────────────────────────────────────┐
│        Module Loader                   │
│                                        │
│  Dynamically loads niche modules       │
└────────────┬───────────────────────────┘
             │
       ┌─────┴─────┬─────────┬──────────┐
       │           │         │          │
       ▼           ▼         ▼          ▼
┌───────────┐ ┌────────┐ ┌──────┐ ┌─────────┐
│  Health   │ │Finance │ │ Tech │ │  Other  │
│  Module   │ │ Module │ │Module│ │ Modules │
└─────┬─────┘ └────┬───┘ └───┬──┘ └────┬────┘
      │            │         │         │
      ├────────────┴─────────┴─────────┘
      │
      ▼
┌──────────────────┐
│ Each module has: │
│ • Routes         │
│ • Templates      │
│ • Offers         │
│ • Assets         │
└──────────────────┘
```

## Deployment Architecture

```text
┌──────────────────┐
│   GitHub Repo    │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│   GitHub Actions CI/CD     │
│   • Lint                   │
│   • Build                  │
│   • Test                   │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│      Vercel                │
│   • Edge Functions         │
│   • Global CDN             │
│   • Auto Scaling           │
└────────────────────────────┘
         │
         └───────────────────────────────────┐
                                             │
    ┌──────────────┬──────────────┬─────────┴────────┐
    │              │              │                  │
    ▼              ▼              ▼                  ▼
┌─────────┐  ┌──────────┐  ┌─────────┐      ┌──────────┐
│Supabase │  │Sendshark │  │ Stripe  │      │  OpenAI  │
│(Database│  │  (Email) │  │(Payment)│      │   (AI)   │
└─────────┘  └──────────┘  └─────────┘      └──────────┘
```

## Integration Points Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 14 | UI & Routing |
| Database | Supabase | Data Storage & Auth |
| Email | Sendshark | Campaigns & Automation |
| Payments | Stripe | Subscriptions |
| AI | OpenAI | Content Generation |
| Hosting | Vercel | Deployment |
| Analytics | Custom | Tracking & Reporting |
