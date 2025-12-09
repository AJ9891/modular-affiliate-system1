# Domain Management Setup Guide

## Overview
The domain management system allows users to:
- Set up free subdomains (all plans): `username.launchpad4success.com`
- Add custom domains (Agency plan only): `yourdomain.com`

## Environment Variables Required

Add these to your Vercel project environment variables:

### 1. VERCEL_API_TOKEN
**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "Launchpad4Success Domain Management"
4. Copy the token

**Add to Vercel:**
```bash
vercel env add VERCEL_API_TOKEN
```

### 2. VERCEL_PROJECT_ID
**How to get it:**
1. Go to your project settings: https://vercel.com/[team]/[project]/settings
2. Copy the Project ID from the General tab

**Add to Vercel:**
```bash
vercel env add VERCEL_PROJECT_ID
```

### 3. VERCEL_TEAM_ID (Optional - only if using a team)
**How to get it:**
1. Go to your team settings: https://vercel.com/teams/[team]/settings
2. Copy the Team ID

**Add to Vercel:**
```bash
vercel env add VERCEL_TEAM_ID
```

## Database Migration

Run this migration in your Supabase SQL Editor:

```sql
-- Add domain and subscription fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subdomain text unique;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS custom_domain text unique;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS sendshark_provisioned boolean default false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan text check (plan in ('starter', 'pro', 'agency'));

CREATE INDEX IF NOT EXISTS idx_users_subdomain ON public.users(subdomain);
CREATE INDEX IF NOT EXISTS idx_users_custom_domain ON public.users(custom_domain);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
```

Or run the migration file:
```bash
psql [your-supabase-connection-string] < infra/migrations/add_domain_fields.sql
```

## DNS Configuration for launchpad4success.com

### Wildcard Subdomain Setup
To enable `*.launchpad4success.com` subdomains:

1. Add a wildcard CNAME record in your DNS provider:
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

2. Add the wildcard domain to your Vercel project:
```bash
vercel domains add *.launchpad4success.com
```

Or via Vercel dashboard:
- Go to Project Settings → Domains
- Add `*.launchpad4success.com`

## User Flow

### Setting Up a Subdomain (All Plans)
1. User goes to `/domains`
2. Enters their desired subdomain (e.g., "johnsmith")
3. System validates:
   - Format: lowercase, numbers, hyphens only
   - Availability: Not already taken
4. Saves to database: `users.subdomain = "johnsmith"`
5. User's site is immediately available at: `https://johnsmith.launchpad4success.com`

### Adding a Custom Domain (Agency Plan Only)
1. User goes to `/domains`
2. Enters their custom domain (e.g., "mycoolbusiness.com")
3. System checks:
   - User has Agency plan
   - Domain format is valid
4. Calls Vercel API to add domain
5. Returns DNS instructions:
   - A record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
6. User adds DNS records to their domain provider
7. Domain becomes active (within 48 hours)

## API Endpoints

### GET /api/domains
Returns user's current domain configuration:
```json
{
  "subdomain": "johnsmith",
  "customDomain": "mycoolbusiness.com",
  "plan": "agency",
  "canAddCustomDomain": true
}
```

### POST /api/domains
Add or update a domain:

**Subdomain:**
```json
{
  "domain": "johnsmith",
  "type": "subdomain"
}
```

**Custom Domain:**
```json
{
  "domain": "mycoolbusiness.com",
  "type": "custom"
}
```

## Testing

1. Create a test user
2. Assign them a plan: `UPDATE users SET plan = 'agency' WHERE email = 'test@example.com'`
3. Visit `/domains` while logged in
4. Try adding a subdomain
5. If Agency: Try adding a custom domain
6. Verify DNS propagation with: `dig johnsmith.launchpad4success.com`

## Troubleshooting

### "This subdomain is already taken"
- Another user is using that subdomain
- Try a different one

### "Custom domains require Agency plan"
- User needs to upgrade to Agency tier
- Check Stripe subscription status

### "Failed to add domain to Vercel"
- Verify VERCEL_API_TOKEN is correct
- Check VERCEL_PROJECT_ID matches your project
- Ensure Vercel API token has domain management permissions

### Domain not resolving
- DNS propagation can take up to 48 hours
- Verify DNS records are correctly added
- Use `nslookup` or `dig` to check DNS resolution

## Security Notes

- Service role key is used to bypass RLS for domain operations
- Subdomain validation prevents injection attacks
- Custom domain additions are logged for audit trails
- Rate limiting should be added to prevent abuse
