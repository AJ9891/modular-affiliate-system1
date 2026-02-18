-- Dedicated onboarding progress table

create table if not exists public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intent text,
  campaign_name text,
  funnel_type text,
  traffic_goal text,
  checklist jsonb default '{}',
  current_step int default 1,
  completed boolean default false,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create unique index if not exists onboarding_progress_user_idx on public.onboarding_progress(user_id);

comment on table public.onboarding_progress is 'Launchpad onboarding state per user';
comment on column public.onboarding_progress.intent is 'Intent selection (create-funnel, import-traffic, setup-email)';
comment on column public.onboarding_progress.campaign_name is 'Campaign name entered during onboarding';
comment on column public.onboarding_progress.funnel_type is 'Funnel type selection during onboarding';
comment on column public.onboarding_progress.traffic_goal is 'Traffic goal selection during onboarding';
comment on column public.onboarding_progress.checklist is 'JSON for step completion flags';
comment on column public.onboarding_progress.current_step is 'Current onboarding step in launchpad flow';
