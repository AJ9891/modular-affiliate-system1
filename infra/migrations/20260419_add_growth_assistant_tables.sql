-- Growth Assistant data model
-- Adds event tracking, daily aggregates, scores, insights, recommendations, and alerts.

-- Unified analytics events (page views + funnel interaction events)
create table if not exists public.analytics_events (
  event_id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  page_id uuid,
  session_id text,
  event_type text not null check (event_type in ('page_view', 'cta_click', 'lead_submit', 'conversion')),
  variant_id text,
  path text,
  referrer text,
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_analytics_events_user_time on public.analytics_events(user_id, occurred_at desc);
create index if not exists idx_analytics_events_funnel_time on public.analytics_events(funnel_id, occurred_at desc);
create index if not exists idx_analytics_events_page_time on public.analytics_events(page_id, occurred_at desc);
create index if not exists idx_analytics_events_type_time on public.analytics_events(event_type, occurred_at desc);
create index if not exists idx_analytics_events_session on public.analytics_events(session_id);

-- Daily funnel-level metrics
create table if not exists public.funnel_metrics_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade not null,
  metric_date date not null,
  total_views integer default 0 not null,
  total_clicks integer default 0 not null,
  total_leads integer default 0 not null,
  total_conversions integer default 0 not null,
  total_revenue numeric(12, 2) default 0 not null,
  conversion_rate numeric(8, 4) default 0 not null,
  engagement_rate numeric(8, 4) default 0 not null,
  ctr numeric(8, 4) default 0 not null,
  bounce_rate numeric(8, 4) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (funnel_id, metric_date)
);

create index if not exists idx_funnel_metrics_daily_user_date on public.funnel_metrics_daily(user_id, metric_date desc);
create index if not exists idx_funnel_metrics_daily_funnel_date on public.funnel_metrics_daily(funnel_id, metric_date desc);

-- Daily page-level metrics
create table if not exists public.page_metrics_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade not null,
  page_key text not null,
  page_id uuid,
  page_slug text,
  metric_date date not null,
  total_views integer default 0 not null,
  total_lead_submits integer default 0 not null,
  total_cta_clicks integer default 0 not null,
  conversion_rate numeric(8, 4) default 0 not null,
  ctr numeric(8, 4) default 0 not null,
  bounce_rate numeric(8, 4) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (funnel_id, page_key, metric_date)
);

create index if not exists idx_page_metrics_daily_user_date on public.page_metrics_daily(user_id, metric_date desc);
create index if not exists idx_page_metrics_daily_funnel_date on public.page_metrics_daily(funnel_id, metric_date desc);
create index if not exists idx_page_metrics_daily_page_key on public.page_metrics_daily(page_key);

-- Funnel score snapshots
create table if not exists public.funnel_scores_daily (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade not null,
  score_date date not null,
  score numeric(8, 2) not null,
  conversion_rate numeric(8, 4) default 0 not null,
  engagement_rate numeric(8, 4) default 0 not null,
  ctr numeric(8, 4) default 0 not null,
  total_views integer default 0 not null,
  total_clicks integer default 0 not null,
  total_conversions integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (funnel_id, score_date)
);

create index if not exists idx_funnel_scores_daily_user_date on public.funnel_scores_daily(user_id, score_date desc);
create index if not exists idx_funnel_scores_daily_funnel_date on public.funnel_scores_daily(funnel_id, score_date desc);

-- Generated insights
create table if not exists public.growth_insights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade,
  insight_type text not null,
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  confidence numeric(4, 3) default 0.5 not null,
  metrics jsonb default '{}'::jsonb,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  status text not null check (status in ('active', 'resolved', 'archived')) default 'active',
  source text not null default 'rule_engine',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_growth_insights_user_created on public.growth_insights(user_id, created_at desc);
create index if not exists idx_growth_insights_funnel_created on public.growth_insights(funnel_id, created_at desc);
create index if not exists idx_growth_insights_status on public.growth_insights(status);

-- Generated recommendations
create table if not exists public.growth_recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade,
  recommendation_type text not null,
  title text not null,
  description text not null,
  rationale text,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
  confidence numeric(4, 3) default 0.5 not null,
  expected_lift_min numeric(8, 2),
  expected_lift_max numeric(8, 2),
  effort text check (effort in ('low', 'medium', 'high')) default 'medium',
  metadata jsonb default '{}'::jsonb,
  status text not null check (status in ('open', 'applied', 'dismissed', 'archived')) default 'open',
  source text not null default 'rule_engine',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_growth_reco_user_created on public.growth_recommendations(user_id, created_at desc);
create index if not exists idx_growth_reco_funnel_created on public.growth_recommendations(funnel_id, created_at desc);
create index if not exists idx_growth_reco_status on public.growth_recommendations(status);

-- Alerts
create table if not exists public.growth_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade,
  alert_type text not null,
  title text not null,
  message text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
  state text not null check (state in ('active', 'resolved', 'ignored')) default 'active',
  payload jsonb default '{}'::jsonb,
  triggered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_growth_alerts_user_triggered on public.growth_alerts(user_id, triggered_at desc);
create index if not exists idx_growth_alerts_funnel_triggered on public.growth_alerts(funnel_id, triggered_at desc);
create index if not exists idx_growth_alerts_state on public.growth_alerts(state);

-- Enable RLS
alter table public.analytics_events enable row level security;
alter table public.funnel_metrics_daily enable row level security;
alter table public.page_metrics_daily enable row level security;
alter table public.funnel_scores_daily enable row level security;
alter table public.growth_insights enable row level security;
alter table public.growth_recommendations enable row level security;
alter table public.growth_alerts enable row level security;

-- Policies
drop policy if exists "analytics_events_select_own" on public.analytics_events;
create policy "analytics_events_select_own"
  on public.analytics_events for select
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "analytics_events_insert_open" on public.analytics_events;
create policy "analytics_events_insert_open"
  on public.analytics_events for insert
  with check (true);

drop policy if exists "funnel_metrics_daily_all_own" on public.funnel_metrics_daily;
create policy "funnel_metrics_daily_all_own"
  on public.funnel_metrics_daily for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "page_metrics_daily_all_own" on public.page_metrics_daily;
create policy "page_metrics_daily_all_own"
  on public.page_metrics_daily for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "funnel_scores_daily_all_own" on public.funnel_scores_daily;
create policy "funnel_scores_daily_all_own"
  on public.funnel_scores_daily for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "growth_insights_all_own" on public.growth_insights;
create policy "growth_insights_all_own"
  on public.growth_insights for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "growth_recommendations_all_own" on public.growth_recommendations;
create policy "growth_recommendations_all_own"
  on public.growth_recommendations for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

drop policy if exists "growth_alerts_all_own" on public.growth_alerts;
create policy "growth_alerts_all_own"
  on public.growth_alerts for all
  using (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role')
  with check (user_id = auth.uid() or auth.jwt() ->> 'role' = 'service_role');

comment on table public.analytics_events is 'Unified event stream for growth analytics (views, clicks, lead submissions, conversions).';
comment on table public.growth_insights is 'Generated funnel/page insights from analytics rules and models.';
comment on table public.growth_recommendations is 'Actionable optimization recommendations generated from performance signals.';
comment on table public.growth_alerts is 'Operational alerts for sudden performance changes and funnel breaks.';
