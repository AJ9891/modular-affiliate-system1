# Quick Reference Guide

## Common Commands

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy

# Run setup check
./setup-check.sh
```

### Database Operations
```bash
# Connect to Supabase
# Use the Supabase dashboard SQL editor

# Run migrations
# Paste contents of infra/supabase-schema.sql
```

## API Quick Reference

### Lead Capture
```javascript
// Capture a new lead
fetch('/api/leads/capture', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    funnelId: 'funnel-123',
    source: 'facebook-ads'
  })
})
```

### Send Email
```javascript
// Send single email
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome</h1>'
  })
})

// Send campaign
fetch('/api/email/send', {
  method: 'POST',
  body: JSON.stringify({
    type: 'campaign',
    name: 'Newsletter',
    subject: 'Weekly Update',
    html: '<p>Content...</p>',
    recipients: [
      { email: 'user1@example.com' },
      { email: 'user2@example.com' }
    ]
  })
})
```

### Get Analytics
```javascript
// Get 7-day stats
fetch('/api/analytics?range=7d')
  .then(res => res.json())
  .then(data => console.log(data.stats))

// Get funnel-specific stats
fetch('/api/analytics?funnelId=funnel-123&range=30d')
```

### Create Funnel
```javascript
fetch('/api/funnels', {
  method: 'POST',
  body: JSON.stringify({
    name: 'My Funnel',
    blocks: [
      {
        type: 'hero',
        content: {
          headline: 'Welcome',
          cta: 'Get Started'
        }
      }
    ]
  })
})
```

### Trigger Automation
```javascript
fetch('/api/email/automation', {
  method: 'POST',
  body: JSON.stringify({
    action: 'trigger',
    automationId: 'auto-123',
    recipient: {
      email: 'user@example.com',
      name: 'John'
    }
  })
})
```

### Send Weekly Report
```javascript
fetch('/api/email/reports', {
  method: 'POST',
  body: JSON.stringify({
    recipientEmail: 'admin@example.com',
    funnelId: 'funnel-123',
    dateRange: {
      start: '2025-01-01',
      end: '2025-01-07'
    }
  })
})
```

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### Payments (Optional)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Email (Recommended)
```env
SENDSHARK_API_KEY=
SENDSHARK_API_URL=https://api.sendshark.com/v1
```

## Page Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Analytics dashboard |
| `/builder` | Code-based funnel builder |
| `/visual-builder` | Drag-and-drop builder |
| `/ai-generator` | AI content generator |
| `/analytics` | Detailed analytics |
| `/offers` | Manage affiliate offers |
| `/pricing` | Pricing page |
| `/login` | User login |
| `/signup` | User registration |

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts |
| `funnels` | Funnel configurations |
| `leads` | Email captures |
| `clicks` | Click tracking |
| `conversions` | Conversion events |
| `offers` | Affiliate offers |
| `niches` | Niche modules |
| `automations` | Email automations |
| `email_campaigns` | Campaign tracking |
| `templates` | Content templates |

## Component Imports

```typescript
// Visual funnel builder
import EnhancedFunnelBuilder from '@/components/EnhancedFunnelBuilder'

// Dashboard
import UnifiedDashboard from '@/components/UnifiedDashboard'

// Services
import { sendshark } from '@/lib/sendshark'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { openai } from '@/lib/openai'
```

## Funnel Block Types

- `hero` - Hero section with headline and CTA
- `features` - Feature grid with icons
- `cta` - Call-to-action button
- `testimonial` - Customer testimonial
- `pricing` - Pricing table
- `faq` - Frequently asked questions
- `email-capture` - Email opt-in form

## Automation Triggers

- `signup` - New user registration
- `purchase` - Successful purchase
- `abandoned_cart` - Cart abandoned
- `funnel_entry` - User enters funnel
- `custom` - Custom trigger

## Email Template Structure

```javascript
{
  name: 'Template Name',
  subject: 'Email Subject',
  html: '<html>...</html>',
  text: 'Plain text version',
  preheader: 'Preview text'
}
```

## Common Debugging

### Email not sending?
- Check `SENDSHARK_API_KEY`
- Verify API quota
- Check Sendshark logs

### Database errors?
- Verify Supabase connection
- Check RLS policies
- Review table permissions

### Analytics not loading?
- Ensure data exists
- Check date range
- Verify funnel ID

### Build errors?
- Run `npm install`
- Check TypeScript errors
- Verify env variables

## Support Links

- [Full Documentation](./docs/INTEGRATION.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Sendshark Setup](./docs/SENDSHARK.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)

## Deployment Checklist

- [ ] Configure all environment variables
- [ ] Run database migrations
- [ ] Test Stripe webhooks
- [ ] Verify Sendshark connection
- [ ] Test funnel builder
- [ ] Check analytics tracking
- [ ] Review RLS policies
- [ ] Test email delivery
- [ ] Configure custom domain
- [ ] Set up monitoring

## Performance Tips

1. Use CDN for static assets
2. Enable Vercel Edge Functions
3. Optimize images with Next.js Image
4. Use React.memo for expensive components
5. Implement database indexes
6. Cache API responses
7. Lazy load components
8. Monitor bundle size

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Validate all API inputs
- [ ] Sanitize user content
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly
- [ ] Verify Stripe webhooks
- [ ] Rate limit API endpoints
- [ ] Implement CSRF protection
