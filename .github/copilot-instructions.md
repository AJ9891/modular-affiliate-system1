# Modular Affiliate Marketing System - Agent Instructions

## Overview
A modular affiliate marketing system that works like LEGO pieces: niches, offers, templates, funnels, and themes can all be swapped in or out without rebuilding anything from scratch.

This architecture provides:
- Swappable niches
- Swappable funnels
- Swappable affiliate offers
- AI-generated content
- Multi-niche support
- A drag-and-drop builder
- Automated email reporting

## Recommended Stack
- **Frontend**: Next.js 14
- **Backend**: Supabase (database + auth + storage)
- **UI**: Tailwind CSS + shadcn/ui
- **Workers**: Supabase Edge Functions or Node + BullMQ
- **Deployment**: Vercel

## High-Level Architecture Components
1. **Core API** - Central routing and business logic
2. **Module Loader** - Dynamically loads niche modules
3. **Frontend Shell** - Main UI container
4. **Funnel Builder** - Visual funnel creation tool
5. **Funnel Renderer** - Renders funnels dynamically
6. **Affiliate Manager** - Manages offers and links
7. **Automation Engine** - Handles AI generation & email reporting

## Database Schema
- `users` - User authentication and profiles
- `niches` - Niche module definitions
- `offers` - Affiliate offers and links
- `funnels` - Funnel configurations (stored as JSON)
- `pages` - Individual funnel pages
- `clicks` - Click tracking data
- `conversions` - Conversion events
- `templates` - Page and email templates
- `theme_presets` - Visual theme configurations

## Module Contract
Each module must follow this contract:
```json
{
  "module_id": "string",
  "name": "string",
  "version": "string",
  "routes": [],
  "templates": [],
  "assets": [],
  "permissions": []
}
```

## Folder Structure
```
repo/
├── apps/
│   ├── web/          # Main Next.js app
│   ├── admin/        # Admin dashboard
│   └── renderer/     # Funnel renderer
├── packages/
│   ├── ui/           # Shared UI components (shadcn)
│   ├── sdk/          # Shared utilities
│   └── modules/      # Niche modules (health, finance, etc.)
├── infra/            # Infrastructure configs
└── scripts/          # Build/deploy scripts
```

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Modules
- `GET /api/modules` - List available modules
- `POST /api/modules/:id/activate` - Activate a module
- `GET /api/modules/:id/config` - Get module configuration

### Funnels
- `GET /api/funnels` - List all funnels
- `POST /api/funnels` - Create new funnel
- `PUT /api/funnels/:id` - Update funnel
- `DELETE /api/funnels/:id` - Delete funnel

### Clicks & Tracking
- `POST /api/track/click` - Track affiliate link click
- `POST /api/track/conversion` - Track conversion event
- `GET /api/analytics/:funnelId` - Get funnel analytics

### AI Generation
- `POST /api/ai/generate-content` - Generate AI content
- `POST /api/ai/generate-funnel` - Generate complete funnel

## Funnel Builder Workflow
Funnels are defined using JSON-based schema with block structure:
```json
{
  "funnel_id": "uuid",
  "blocks": [
    {
      "type": "hero",
      "content": { "headline": "...", "cta": "..." },
      "style": { "bg": "blue", "layout": "centered" }
    }
  ]
}
```

## Tracking & Attribution Logic
- **Redirect Logging**: Log all affiliate link redirects with metadata
- **Attribution Cookies**: Set 30-day cookies for conversion tracking
- **UTM Parameters**: Capture source, medium, campaign data
- **Conversion Pixels**: Track post-purchase events

## AI & Automation Layer
- **Content Generation**: AI-powered landing page and email copy
- **Email Reports**: Automated weekly analytics summaries
- **A/B Testing**: Automated variant testing
- **Trigger Actions**: Automate actions based on user behavior

## Deployment
- **Hosting**: Vercel for Next.js apps
- **Backend**: Supabase for database and auth
- **CI/CD**: GitHub Actions for automated deployments
- **Environments**: Separate dev, staging, and production configs

## Development Roadmap

### Sprint 1: Foundation
- Set up Next.js monorepo structure
- Configure Supabase project
- Implement authentication system

### Sprint 2: Core Modules
- Build module loader system
- Create first niche module (health or finance)
- Finalize module contract design

### Sprint 3: Funnel Builder
- Build visual drag-and-drop builder UI
- Implement JSON schema for funnels
- Create template library

### Sprint 4: Affiliate Manager
- Build offer database
- Implement link generation and tracking
- Create analytics dashboard

### Sprint 5: Tracking System
- Implement click tracking
- Build conversion attribution logic
- Create reporting views

### Sprint 6: AI Integration
- Integrate AI content generation
- Build automated email reports
- Implement smart recommendations
