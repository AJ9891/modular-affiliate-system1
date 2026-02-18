-- Launchpad onboarding metadata

alter table public.users
  add column if not exists launchpad_intent text,
  add column if not exists launchpad_campaign_name text,
  add column if not exists launchpad_traffic_goal text;

comment on column public.users.launchpad_intent is 'Launchpad onboarding intent selection (create-funnel, import-traffic, setup-email)';
comment on column public.users.launchpad_campaign_name is 'Launchpad onboarding campaign name';
comment on column public.users.launchpad_traffic_goal is 'Launchpad onboarding traffic goal (grow-email, paid-traffic, organic)';
