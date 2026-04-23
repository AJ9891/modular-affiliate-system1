# Database Migrations

This directory contains SQL migrations for the Supabase database.

## 🔒 NEW: RLS Warnings Fixed

**All Row Level Security warnings have been identified and completely fixed!**

### Quick Links

- 📖 **[RLS_FIX_COMPLETE.md](RLS_FIX_COMPLETE.md)** - Start here! Complete overview
- 📋 **[RLS_FIX_CHECKLIST.md](RLS_FIX_CHECKLIST.md)** - Step-by-step guide
- 📚 **[RLS_FIX_SUMMARY.md](RLS_FIX_SUMMARY.md)** - Detailed technical docs

### Apply the RLS Fix

```bash
# See instructions and quick links
node apply-rls-fix.js

# Then copy migrations/fix_rls_warnings.sql to Supabase SQL Editor
```

**What's Fixed**: 25 tables, 54 policies, comprehensive data protection ✅

---

## Quick Start

### Option 1: Manual (Recommended for First Time)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Open each migration file in order (see below)
5. Copy and paste the SQL
6. Click **Run**

### Option 2: Shell Script (Requires psql)

```bash
# Set your database connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Make script executable
chmod +x apply-migrations.sh

# Run migrations
./apply-migrations.sh
```

Get your `DATABASE_URL` from:

- Supabase Dashboard → Settings → Database → Connection String (URI)

### Option 3: Node.js Script (Simulation Mode)

```bash
# Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment
node apply-migrations.js
```

⚠️ **Note**: The Node.js script currently only validates and simulates migrations. For actual application, use Option 1 or 2.

## Migration Order

Migration runners now build the execution plan automatically:

1. Run the legacy core migrations in fixed dependency order:
   `add_admin_flag.sql` → `add_domain_fields.sql` → `add_onboarding_fields.sql` → `add_slug_fields.sql` → `add_max_launchpads.sql` → `add_affiliate_clicks.sql` → `add_stripe_connect.sql` → `add_team_collaboration.sql` → `add_downloads_tables.sql` → `add_ai_chat_only.sql` → `add_ai_support_chat.sql` → `add_brand_modes.sql` → `001_add_brand_brain_tables.sql` → `optimize_rls_and_performance.sql` → `add_funnel_rls_policies.sql` → `update_brand_modes_voice_tone.sql` → `fix_rls_warnings.sql`
2. Append all remaining `infra/migrations/*.sql` files in lexicographic order.

This allows timestamped files such as `20260211_*` and `20260419_*` to be picked up automatically without editing runner scripts each time.

If you apply manually in SQL Editor, follow the same rule: legacy core first, then the remaining files by filename order.

## What Each Migration Does

### Core Schema

- `supabase-schema.sql` - Base schema (run first if starting fresh)

### Feature Additions

- **Admin Flag**: Adds `is_admin` boolean for admin users
- **Domain Fields**: Subdomain/custom domain support + Stripe customer tracking
- **Onboarding**: Tracks user onboarding progress and selected niche
- **Slugs**: SEO-friendly URLs for funnels and pages
- **Launchpads**: Max launchpad limits per plan
- **Affiliate Tracking**: Partner referral click tracking
- **Stripe Connect**: Affiliate payout infrastructure
- **Team Collaboration**: Multi-user accounts with roles (Agency plan)
- **Downloads**: Lead magnets and digital product delivery
- **AI Chat**: Support chat with AI assistant

### Optimization

- **RLS & Performance**: Comprehensive security and performance tuning
  - Adds missing RLS policies
  - Creates strategic indexes
  - Materialized view for analytics
  - Helper functions for team access

## Troubleshooting

### "relation already exists"

This is normal - migrations use `IF NOT EXISTS` to be idempotent. Safe to continue.

### "permission denied"

Use your `SERVICE_ROLE_KEY` (not anon key) or database password.

### "could not connect to server"

1. Check your connection string
2. Verify your IP is allowed (Supabase → Settings → Database → Connection Pooling)
3. Try connecting through the Supabase dashboard first

### RLS Blocking Access

After running migrations, your app should have proper RLS policies. If you're getting permission errors:

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
```

## Performance Notes

After running all migrations:

1. **Refresh Analytics**: The optimization migration creates a materialized view

   ```sql
   SELECT refresh_funnel_analytics();
   ```

2. **Schedule Refresh**: Set up a cron job to refresh analytics periodically
   - Via Supabase Dashboard → Database → Cron Jobs
   - Run `SELECT refresh_funnel_analytics();` daily

3. **Monitor Indexes**: Check index usage after a few days

   ```sql
   SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
   ```

## Reset (Danger Zone)

To start fresh (⚠️ **DESTROYS ALL DATA**):

```sql
-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run: supabase-schema.sql followed by all migrations
```

## Support

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- Check `../docs/` for architecture documentation
