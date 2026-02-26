# Domain Management Setup Checklist

## ✅ Completed

- [x] Domain management API created (`/api/domains`)
- [x] Domain settings UI page created (`/domains`)
- [x] Database schema updated with domain fields
- [x] Migration script created
- [x] Dashboard link added
- [x] Pricing page updated with domain options
- [x] Documentation created (`docs/DOMAINS.md`)
- [x] Code committed and pushed to GitHub

## 🔲 Required Next Steps

### 1. Run Database Migration

### Priority: HIGH

Execute in Supabase SQL Editor (<https://supabase.com/dashboard/project/urwrbjejcozbzgknbuhn/sql/new>):

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

### 2. Add Vercel Environment Variables

### Priority: HIGH (Required for custom domains)

#### Get VERCEL_API_TOKEN

1. Visit: <https://vercel.com/account/tokens>
2. Click "Create Token"
3. Name: "Launchpad4Success Domain Management"
4. Copy the token
5. Add to Vercel: `vercel env add VERCEL_API_TOKEN`

#### Get VERCEL_PROJECT_ID

1. Go to: <https://vercel.com/aj9891s-projects/modular-affiliate-system1/settings>
2. Copy Project ID from General tab
3. Add to Vercel: `vercel env add VERCEL_PROJECT_ID`

#### Get VERCEL_TEAM_ID (if using team)

1. Go to team settings
2. Copy Team ID
3. Add to Vercel: `vercel env add VERCEL_TEAM_ID`

**Or add via Vercel Dashboard:**

1. Go to: <https://vercel.com/aj9891s-projects/modular-affiliate-system1/settings/environment-variables>
2. Add each variable (Production, Preview, Development)

### 3. Configure Wildcard Subdomain DNS

### Priority: MEDIUM (Required for subdomains to work)

In your DNS provider for `launchpad4success.com`:

Add CNAME record:

- **Type:** CNAME
- **Name:** * (wildcard)
- **Value:** cname.vercel-dns.com
- **TTL:** 3600 (or automatic)

Then in Vercel, add the domain:

```bash
vercel domains add *.launchpad4success.com
```

Or via dashboard:

1. Go to: <https://vercel.com/aj9891s-projects/modular-affiliate-system1/settings/domains>
2. Click "Add Domain"
3. Enter: `*.launchpad4success.com`

### 4. Deploy to Production

### Priority: MEDIUM

After completing steps 1-3:

```bash
npm run build
npx vercel --prod --yes
```

### 5. Test the System

### Priority: LOW

1. Visit: https://[your-production-url]/domains
2. Set a subdomain (e.g., "test123")
3. Verify it saves successfully
4. If Agency plan: Try adding custom domain
5. Check DNS propagation: `dig test123.launchpad4success.com`

## 📝 Optional Enhancements

- [ ] Add subdomain routing proxy to serve user funnels at their subdomain
- [ ] Add custom domain verification status checking
- [ ] Add rate limiting to domain API endpoints
- [ ] Add admin panel to view all domains
- [ ] Add domain analytics/usage tracking
- [ ] Add domain blacklist to prevent abuse
- [ ] Add automatic SSL certificate provisioning status

## 🎯 Features Summary

### What Users Get by Plan

**Starter ($29/mo):**

- Free subdomain: `username.launchpad4success.com`
- Instant setup, no DNS configuration needed

**Pro ($79/mo):**

- Free subdomain: `username.launchpad4success.com`
- All Pro features

**Agency ($199/mo):**

- Free subdomain: `username.launchpad4success.com`
- Custom domain setup: `yourdomain.com`
- Automatic SSL certificates
- DNS configuration help
- API access for domain management

## 🔗 Important Links

- **Production Site:** <https://modular-affiliate-system1-7itb5fj9f-aj9891s-projects.vercel.app>
- **Vercel Dashboard:** <https://vercel.com/aj9891s-projects/modular-affiliate-system1>
- **Supabase Dashboard:** <https://supabase.com/dashboard/project/urwrbjejcozbzgknbuhn>
- **Domain Settings Page:** /domains
- **Documentation:** docs/DOMAINS.md
- **Migration File:** infra/migrations/add_domain_fields.sql

## ❓ Questions to Consider

1. Do you want to enable domain management immediately, or wait until after more testing?
2. Should we add a domain preview/verification step before finalizing?
3. Do you want email notifications when domains are successfully configured?
4. Should there be a limit on how many times users can change their subdomain?
