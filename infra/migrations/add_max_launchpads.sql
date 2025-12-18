-- Add max_launchpads column to users table
-- This limits how many launchpads a user can have active simultaneously

alter table public.users
add column if not exists max_launchpads int default 1;

-- Update existing plans with appropriate limits
-- Free: 0 launchpads
-- Starter: 1 launchpad (default)
-- Pro: 20 launchpads
-- Agency: 60 launchpads

-- Update free users
update public.users
set max_launchpads = 0
where plan = 'free' or plan is null;

-- Starter users already have default of 1

-- Update pro users
update public.users
set max_launchpads = 20
where plan = 'pro';

-- Update agency users
update public.users
set max_launchpads = 60
where plan = 'agency';

-- Comment for documentation
comment on column public.users.max_launchpads is 'Maximum number of active launchpads allowed for this user based on their subscription plan (Free: 0, Starter: 1, Pro: 20, Agency: 60)';
