-- Add domain and subscription fields to users table
-- Run this migration to update existing tables

-- Add subdomain column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subdomain text unique;

-- Add custom_domain column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS custom_domain text unique;

-- Add sendshark_provisioned column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS sendshark_provisioned boolean default false;

-- Add Stripe customer ID
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add Stripe subscription ID
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add subscription plan
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS plan text check (plan in ('starter', 'pro', 'agency'));

-- Create index for subdomain lookups
CREATE INDEX IF NOT EXISTS idx_users_subdomain ON public.users(subdomain);

-- Create index for custom domain lookups
CREATE INDEX IF NOT EXISTS idx_users_custom_domain ON public.users(custom_domain);

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);

-- Update existing users to have a default plan if needed
-- UPDATE public.users SET plan = 'starter' WHERE plan IS NULL;

COMMENT ON COLUMN public.users.subdomain IS 'User subdomain: username.launchpad4success.com';
COMMENT ON COLUMN public.users.custom_domain IS 'Custom domain for Agency plan users';
COMMENT ON COLUMN public.users.sendshark_provisioned IS 'Whether Sendshark account has been provisioned';
COMMENT ON COLUMN public.users.plan IS 'Subscription tier: starter, pro, or agency';
