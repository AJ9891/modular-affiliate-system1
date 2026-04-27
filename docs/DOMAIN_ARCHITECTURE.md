# Domain Management Architecture

## System Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   User Login │
│ /dashboard   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Click "Domain    │
│ Settings" 🌐     │
└──────┬───────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────────┐
│                      /domains Page                              │
├────────────────────────────────────────────────────────────────┤
│  GET /api/domains                                               │
│  ↓                                                              │
│  Returns: {subdomain, customDomain, plan, canAddCustomDomain}  │
└────────────────────────────────────────────────────────────────┘
       │
       ├──────────────────┬──────────────────┐
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌──────────────┐
│ All Plans   │    │ All Plans   │    │ Agency Only  │
│             │    │             │    │              │
│ Set         │    │ View        │    │ Add Custom   │
│ Subdomain   │    │ Current     │    │ Domain       │
└─────┬───────┘    │ Domains     │    └──────┬───────┘
      │            └─────────────┘           │
      │                                      │
      ▼                                      ▼
┌────────────────────────────────────────────────────────────────┐
│              POST /api/domains                                  │
├────────────────────────────────────────────────────────────────┤
│  Subdomain Request           │  Custom Domain Request          │
│  {                           │  {                              │
│    domain: "johnsmith",      │    domain: "mybusiness.com",   │
│    type: "subdomain"         │    type: "custom"              │
│  }                           │  }                              │
└────────────────────────────────────────────────────────────────┘
      │                                      │
      ▼                                      ▼
┌─────────────────────┐          ┌──────────────────────────┐
│ Validate Format     │          │ Check Agency Plan        │
│ ^[a-z0-9-]+$        │          │ plan === 'agency'        │
└─────┬───────────────┘          └──────┬───────────────────┘
      │                                 │
      ▼                                 ▼
┌─────────────────────┐          ┌──────────────────────────┐
│ Check Availability  │          │ Call Vercel API          │
│ Query DB for        │          │ POST /v9/projects/       │
│ existing subdomain  │          │ {id}/domains             │
└─────┬───────────────┘          └──────┬───────────────────┘
      │                                 │
      ▼                                 ▼
┌─────────────────────┐          ┌──────────────────────────┐
│ Save to Database    │          │ Return DNS Instructions  │
│ UPDATE users SET    │          │ A @ 76.76.21.21         │
│ subdomain = 'name'  │          │ CNAME www               │
└─────┬───────────────┘          │   cname.vercel-dns.com  │
      │                          └──────┬───────────────────┘
      │                                 │
      ▼                                 ▼
┌─────────────────────┐          ┌──────────────────────────┐
│ Return Success      │          │ Save to Database         │
│ URL:                │          │ UPDATE users SET         │
│ johnsmith.          │          │ custom_domain = 'domain' │
│ launchpad4success   │          └──────┬───────────────────┘
│ .com                │                 │
└─────────────────────┘                 ▼
                                ┌──────────────────────────┐
                                │ User Configures DNS      │
                                │ (Manual Step)            │
                                └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     TECHNICAL ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

Frontend (/domains page)
    ↓
Next.js API Route (/api/domains)
    ↓
    ├─→ Supabase (users table)
    │   ├─ subdomain: text unique
    │   ├─ custom_domain: text unique
    │   └─ plan: text (starter/pro/agency)
    │
    └─→ Vercel API (custom domains only)
        └─ POST /v9/projects/{id}/domains

┌─────────────────────────────────────────────────────────────────┐
│                         DNS FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

Subdomain:
    *.launchpad4success.com → cname.vercel-dns.com → Vercel Edge

Custom Domain:
    yourdomain.com → User's DNS Provider
        ↓
    A @ → 76.76.21.21 (Vercel IP)
    CNAME www → cname.vercel-dns.com
        ↓
    Vercel Edge → Your App

┌─────────────────────────────────────────────────────────────────┐
│                    PRICING TIERS                                 │
└─────────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬──────────────────────────────┐
│   Tier    │     Price      │      Domain Features         │
├───────────┼────────────────┼──────────────────────────────┤
│  Starter  │   $29/mo       │  ✅ Free Subdomain           │
│           │                │  username.launchpad4success  │
├───────────┼────────────────┼──────────────────────────────┤
│   Pro     │   $79/mo       │  ✅ Free Subdomain           │
│           │                │  username.launchpad4success  │
├───────────┼────────────────┼──────────────────────────────┤
│  Agency   │   $199/mo      │  ✅ Free Subdomain           │
│           │                │  ✅ Custom Domain Setup      │
│           │                │  ✅ SSL Certificates         │
│           │                │  ✅ API Access               │
└───────────┴────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────┘

Table: public.users
┌──────────────────────┬──────────┬────────────────────────┐
│      Column          │   Type   │      Constraints       │
├──────────────────────┼──────────┼────────────────────────┤
│ id                   │ uuid     │ PRIMARY KEY            │
│ email                │ text     │ UNIQUE, NOT NULL       │
│ subdomain            │ text     │ UNIQUE                 │
│ custom_domain        │ text     │ UNIQUE                 │
│ email_automation_provisioned │ boolean │ DEFAULT false   │
│ stripe_customer_id   │ text     │                        │
│ stripe_subscription  │ text     │                        │
│ plan                 │ text     │ CHECK (starter/pro/    │
│                      │          │       agency)          │
│ created_at           │ timestamp│ DEFAULT now()          │
│ updated_at           │ timestamp│ DEFAULT now()          │
└──────────────────────┴──────────┴────────────────────────┘

Indexes:
  - idx_users_subdomain ON users(subdomain)
  - idx_users_custom_domain ON users(custom_domain)
  - idx_users_plan ON users(plan)

┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VARIABLES                         │
└─────────────────────────────────────────────────────────────────┘

Required for Custom Domains:
  ✅ VERCEL_API_TOKEN      - From vercel.com/account/tokens
  ✅ VERCEL_PROJECT_ID     - From project settings
  ✅ VERCEL_TEAM_ID        - From team settings (optional)

Already Configured:
  ✅ NEXT_PUBLIC_SUPABASE_URL
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✅ SUPABASE_SERVICE_ROLE_KEY
  ✅ EMAIL_PROVIDER
  ✅ AUTORESPONDER_CRON_SECRET
  ✅ STRIPE_SECRET_KEY

┌─────────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE                                │
└─────────────────────────────────────────────────────────────────┘

apps/web/src/app/
  ├── api/
  │   └── domains/
  │       └── route.ts              ← API handler (GET/POST)
  ├── domains/
  │   └── page.tsx                  ← UI for domain settings
  ├── dashboard/
  │   └── page.tsx                  ← Link to domain settings
  └── pricing/
      └── page.tsx                  ← Shows domain features by tier

docs/
  └── DOMAINS.md                    ← Full documentation

infra/
  ├── supabase-schema.sql           ← Updated schema
  └── migrations/
      └── add_domain_fields.sql     ← Migration script

DOMAIN_SETUP_CHECKLIST.md            ← Setup steps
```
