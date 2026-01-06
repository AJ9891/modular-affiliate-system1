# Admin to Agency Tier Auto-Assignment

## Overview
This feature ensures that all admin users are automatically assigned the **Agency tier** when they are marked as admins (`is_admin = true`).

## Implementation

### Database Trigger
A PostgreSQL trigger has been created in the migration file [`infra/migrations/auto_agency_for_admins.sql`](infra/migrations/auto_agency_for_admins.sql) that:

1. **Automatically sets `plan = 'agency'`** whenever:
   - A user is **inserted** with `is_admin = true`
   - A user's `is_admin` flag is **updated** from false to true

2. **Updates existing admins** that don't have the agency plan assigned

### How It Works

**Trigger Function**: `public.set_admin_to_agency()`
- Checks if `is_admin` is being set to `true` for the first time
- If so, automatically sets `plan = 'agency'`
- Executes before INSERT or UPDATE operations

**Trigger**: `admin_to_agency_trigger`
- Fires on INSERT or UPDATE of the `users` table
- Ensures every admin automatically gets Agency tier

### Benefits

✅ **Automatic**: No manual intervention needed  
✅ **Consistent**: All admins get Agency tier regardless of how they're created  
✅ **Safe**: Only triggers when `is_admin` changes from false to true  
✅ **Backward Compatible**: Existing admins are updated on migration run  

### Application Logic

The trigger handles all admin creation paths:
- Direct admin user creation via database
- Admin promotions in future admin management UI
- API endpoints that set `is_admin = true`

The existing application code that checks for admin status will automatically grant Agency plan features without any code changes needed.

### How to Apply the Migration

Run the migration script to apply the trigger to your Supabase database:

```bash
# Run in your Supabase project
psql -U postgres -h your-supabase-host -d postgres -f infra/migrations/auto_agency_for_admins.sql
```

Or use the Supabase dashboard to execute the SQL directly.

## Testing

After applying the migration, you can test it:

```sql
-- Test: Create an admin user
INSERT INTO public.users (id, email, is_admin)
VALUES ('test-uuid', 'admin@example.com', true);

-- Verify: Check that plan was set to 'agency'
SELECT id, email, is_admin, plan FROM public.users WHERE id = 'test-uuid';
-- Should show: plan = 'agency'
```

## Related Code

- **Signup flow**: [`apps/web/src/app/api/auth/signup/route.ts`](apps/web/src/app/api/auth/signup/route.ts)
- **User table schema**: [`infra/supabase-schema.sql`](infra/supabase-schema.sql)
- **Admin checks**: Throughout the codebase, `is_admin` and `plan === 'agency'` are used to determine feature access
