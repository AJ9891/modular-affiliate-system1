-- Add onboarding and launchpad fields to users table

-- Onboarding tracking
alter table public.users
add column if not exists niche text;

alter table public.users
add column if not exists funnel_type text;

alter table public.users
add column if not exists onboarding_step int default 1;

alter table public.users
add column if not exists onboarding_complete boolean default false;

alter table public.users
add column if not exists onboarding_seen boolean default false;

-- Launchpad staging
alter table public.users
add column if not exists launchpad_stage int default 1;

-- Comments for documentation
comment on column public.users.niche is 'Selected niche during onboarding (Technology & Software, Health & Wellness, etc.)';
comment on column public.users.funnel_type is 'Selected funnel type during onboarding (Lead Magnet, Product Review, etc.)';
comment on column public.users.onboarding_step is 'Current onboarding step (1=Welcome, 2=Niche, 3=Offers, 4=Email, 5=Complete)';
comment on column public.users.onboarding_complete is 'Whether user has completed initial onboarding';
comment on column public.users.onboarding_seen is 'Whether user has seen the introductory onboarding slides';
comment on column public.users.launchpad_stage is 'Launchpad progression stage (1=Ground Control, 2=Pre-Flight, 3=Ignition, 4=Lift-Off)';
