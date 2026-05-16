-- Users table (handled by Supabase Auth, but we can extend it)
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  subdomain text unique,
  custom_domain text unique,
  sendshark_provisioned boolean default false,
  sendshark_email text,
  email_automation_provisioned boolean default false,
  email_automation_email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('starter', 'pro', 'agency')),
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for admin lookups
create index if not exists idx_users_is_admin on public.users(is_admin) where is_admin = true;

-- Niches (module definitions)
create table if not exists public.niches (
  id uuid default gen_random_uuid() primary key,
  module_id text unique not null,
  name text not null,
  version text not null,
  active boolean default false,
  config jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Offers (affiliate offers)
create table if not exists public.offers (
  id uuid default gen_random_uuid() primary key,
  niche_id uuid references public.niches(id),
  name text not null,
  description text,
  affiliate_link text not null,
  commission_rate decimal(5,2),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funnels
create table if not exists public.funnels (
  funnel_id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  niche_id uuid references public.niches(id),
  name text not null,
  blocks jsonb not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funnel generation lifecycle
create table if not exists public.funnel_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  source_url text not null,
  status text not null check (status in ('running', 'completed', 'failed')) default 'running',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  error_message text
);

-- Generated assets per generation run
create table if not exists public.generated_assets (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.funnel_generations(id) on delete cascade not null,
  asset_type text not null check (asset_type in ('landing', 'email_sequence', 'offer_signals', 'raw')),
  content_json jsonb,
  content_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pages (individual funnel pages)
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade,
  name text not null,
  path text not null,
  content jsonb not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clicks (tracking)
create table if not exists public.clicks (
  click_id uuid default gen_random_uuid() primary key,
  offer_id uuid references public.offers(id),
  funnel_id uuid references public.funnels(funnel_id),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  ip_address inet,
  clicked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversions
create table if not exists public.conversions (
  conversion_id uuid default gen_random_uuid() primary key,
  click_id uuid references public.clicks(click_id),
  offer_id uuid references public.offers(id),
  amount decimal(10,2),
  order_id text,
  converted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Affiliate Clicks (partner referral tracking)
create table if not exists public.affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  partner text not null,
  source text,
  metadata jsonb,
  clicked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_affiliate_clicks_partner on public.affiliate_clicks(partner);
create index if not exists idx_affiliate_clicks_user_id on public.affiliate_clicks(user_id);

-- Attribution Audit Events (immutable click/session/conversion/commission trail)
create table if not exists public.attribution_audit_events (
  event_id uuid default gen_random_uuid() primary key,
  event_type text not null check (
    event_type in (
      'session_started',
      'click_tracked',
      'conversion_tracked',
      'commission_pending',
      'commission_paid',
      'commission_failed'
    )
  ),
  click_id uuid references public.clicks(click_id),
  conversion_id uuid references public.conversions(conversion_id),
  payout_id uuid,
  attribution_session_id text,
  affiliate_user_id uuid references public.users(id),
  offer_id uuid references public.offers(id),
  funnel_id uuid references public.funnels(funnel_id),
  amount decimal(10,2),
  currency text,
  source text,
  metadata jsonb default '{}'::jsonb,
  occurred_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_attribution_audit_events_occurred_at
  on public.attribution_audit_events(occurred_at desc);
create index if not exists idx_attribution_audit_events_click_id
  on public.attribution_audit_events(click_id);
create index if not exists idx_attribution_audit_events_conversion_id
  on public.attribution_audit_events(conversion_id);
create index if not exists idx_attribution_audit_events_payout_id
  on public.attribution_audit_events(payout_id);
create index if not exists idx_attribution_audit_events_session_id
  on public.attribution_audit_events(attribution_session_id);

comment on table public.attribution_audit_events is 'Append-only audit trail for attribution and affiliate commission lifecycle';

-- Beta Testers (internal platform tester roster)
create table if not exists public.beta_testers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  full_name text,
  company text,
  status text not null default 'prospect' check (status in ('prospect', 'invited', 'active', 'paused')),
  notes text,
  invited_at timestamp with time zone,
  invite_token text unique,
  invite_sent_at timestamp with time zone,
  invite_accepted_at timestamp with time zone,
  accepted_user_id uuid references public.users(id),
  created_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_beta_testers_status on public.beta_testers(status);
create index if not exists idx_beta_testers_created_at on public.beta_testers(created_at desc);
create index if not exists idx_beta_testers_invite_token
  on public.beta_testers(invite_token)
  where invite_token is not null;

-- Templates
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  niche_id uuid references public.niches(id),
  name text not null,
  type text not null check (type in ('page', 'email', 'block')),
  content jsonb not null,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Theme presets
create table if not exists public.theme_presets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  colors jsonb not null,
  fonts jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Brand Modes
create table if not exists public.brand_modes (
  id text primary key,
  name text not null,
  description text not null,
  is_system boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.brand_modes is 'Stores brand mode configurations for different brand personalities and themes';

-- Leads (captured from funnels)
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  funnel_id uuid references public.funnels(funnel_id),
  source text,
  custom_fields jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Email Automations
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  sendshark_id text unique not null,
  name text not null,
  trigger text not null check (trigger in ('signup', 'purchase', 'abandoned_cart', 'funnel_entry', 'custom')),
  config jsonb not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Email Campaigns
create table if not exists public.email_campaigns (
  id uuid default gen_random_uuid() primary key,
  sendshark_id text unique not null,
  provider_campaign_id text unique,
  user_id uuid references public.users(id),
  name text not null,
  subject text not null,
  status text not null check (status in ('draft', 'scheduled', 'sending', 'sent', 'paused')),
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  stats jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Built-in autoresponder automations (user-scoped or global templates when user_id is null)
create table if not exists public.email_automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  trigger text not null check (trigger in ('signup', 'purchase', 'abandoned_cart', 'funnel_entry', 'custom')),
  config jsonb not null default '{}'::jsonb,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriber registry for autoresponder enrollments
create table if not exists public.email_subscribers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  name text,
  list_name text not null default 'Launchpad List',
  tags text[] not null default '{}'::text[],
  custom_fields jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, email, list_name)
);

-- Queue for delayed autoresponder messages
create table if not exists public.email_autoresponder_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  automation_id uuid references public.email_automations(id) on delete set null,
  recipient_email text not null,
  recipient_name text,
  from_email text not null,
  from_name text,
  subject text not null,
  html text not null,
  text text,
  scheduled_for timestamp with time zone not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Downloads (lead magnets, ebooks, digital products)
create table if not exists public.downloads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  title text not null,
  description text,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  storage_url text not null,
  download_count integer default 0,
  is_active boolean default true,
  require_email boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Download tracking (who downloaded what)
create table if not exists public.download_logs (
  id uuid default gen_random_uuid() primary key,
  download_id uuid references public.downloads(id),
  email text not null,
  ip_address text,
  user_agent text,
  funnel_id uuid references public.funnels(funnel_id),
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Google keyword projects
create table if not exists public.google_keyword_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  seed_query text,
  locale text default 'en-US',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Google keyword rows
create table if not exists public.google_keywords (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.google_keyword_projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  keyword text not null,
  source text not null default 'google_autocomplete',
  search_volume integer,
  difficulty numeric(5,2),
  cpc numeric(10,4),
  competition text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, keyword)
);

-- CMS integrations for publishing generated content
create table if not exists public.cms_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  provider text not null,
  target_url text not null,
  auth_type text not null default 'none',
  auth_value text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_test_status text,
  last_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Scheduled publishing queue for article and funnel posting
create table if not exists public.content_schedule (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  run_at timestamp with time zone not null,
  status text not null default 'queued' check (status in ('queued', 'published', 'failed', 'cancelled')),
  content_type text not null default 'article_and_funnel',
  content_payload jsonb not null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Publish attempt history
create table if not exists public.publish_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  schedule_id uuid references public.content_schedule(id) on delete cascade not null,
  cms_integration_id uuid references public.cms_integrations(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  attempt integer not null default 0,
  error_message text,
  response_payload jsonb,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.niches enable row level security;
alter table public.offers enable row level security;
alter table public.funnels enable row level security;
alter table public.funnel_generations enable row level security;
alter table public.generated_assets enable row level security;
alter table public.pages enable row level security;
alter table public.clicks enable row level security;
alter table public.conversions enable row level security;
alter table public.templates enable row level security;
alter table public.theme_presets enable row level security;
alter table public.leads enable row level security;
alter table public.automations enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_automations enable row level security;
alter table public.email_subscribers enable row level security;
alter table public.email_autoresponder_jobs enable row level security;
alter table public.downloads enable row level security;
alter table public.download_logs enable row level security;
alter table public.attribution_audit_events enable row level security;
alter table public.beta_testers enable row level security;

-- Create policies (basic examples - customize as needed)
do $$ 
begin
  if not exists (select 1 from pg_policies where tablename = 'users' and policyname = 'Users can view their own data') then
    create policy "Users can view their own data" on public.users for select using (auth.uid() = id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'niches' and policyname = 'Anyone can view active niches') then
    create policy "Anyone can view active niches" on public.niches for select using (active = true);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'funnels' and policyname = 'Users can manage their own funnels') then
    create policy "Users can manage their own funnels" on public.funnels for all using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'funnel_generations' and policyname = 'Users can manage their own funnel generations') then
    create policy "Users can manage their own funnel generations"
      on public.funnel_generations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'generated_assets' and policyname = 'Users can manage generated assets for own generations') then
    create policy "Users can manage generated assets for own generations"
      on public.generated_assets
      for all
      using (
        exists (
          select 1 from public.funnel_generations
          where funnel_generations.id = generated_assets.generation_id
            and funnel_generations.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.funnel_generations
          where funnel_generations.id = generated_assets.generation_id
            and funnel_generations.user_id = auth.uid()
        )
      );
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'offers' and policyname = 'Anyone can view active offers') then
    create policy "Anyone can view active offers" on public.offers for select using (active = true);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'downloads' and policyname = 'Users can manage their own downloads') then
    create policy "Users can manage their own downloads" on public.downloads for all using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'email_automations' and policyname = 'Users can manage their own email automations') then
    create policy "Users can manage their own email automations"
      on public.email_automations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'email_subscribers' and policyname = 'Users can manage their own email subscribers') then
    create policy "Users can manage their own email subscribers"
      on public.email_subscribers
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'email_autoresponder_jobs' and policyname = 'Users can view their own autoresponder jobs') then
    create policy "Users can view their own autoresponder jobs"
      on public.email_autoresponder_jobs
      for select
      using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'download_logs' and policyname = 'Users can view download logs for their downloads') then
    create policy "Users can view download logs for their downloads" on public.download_logs for select using (
      exists (select 1 from public.downloads where downloads.id = download_logs.download_id and downloads.user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'google_keyword_projects' and policyname = 'Users can manage their own keyword projects') then
    create policy "Users can manage their own keyword projects"
      on public.google_keyword_projects
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'google_keywords' and policyname = 'Users can manage their own keywords') then
    create policy "Users can manage their own keywords"
      on public.google_keywords
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'cms_integrations' and policyname = 'Users can manage their own cms integrations') then
    create policy "Users can manage their own cms integrations"
      on public.cms_integrations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'content_schedule' and policyname = 'Users can manage their own content schedule') then
    create policy "Users can manage their own content schedule"
      on public.content_schedule
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'publish_jobs' and policyname = 'Users can view their own publish jobs') then
    create policy "Users can view their own publish jobs"
      on public.publish_jobs
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

drop policy if exists "Service insert attribution audit events" on public.attribution_audit_events;
create policy "Service insert attribution audit events"
  on public.attribution_audit_events for insert
  to service_role
  with check (true);

drop policy if exists "Service read attribution audit events" on public.attribution_audit_events;
create policy "Service read attribution audit events"
  on public.attribution_audit_events for select
  to service_role
  using (true);

drop policy if exists "Service manage beta testers" on public.beta_testers;
create policy "Service manage beta testers"
  on public.beta_testers for all
  to service_role
  using (true)
  with check (true);

create or replace function public.prevent_attribution_audit_events_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'attribution_audit_events is append-only';
end;
$$;

drop trigger if exists prevent_attribution_audit_events_update on public.attribution_audit_events;
create trigger prevent_attribution_audit_events_update
  before update on public.attribution_audit_events
  for each row execute function public.prevent_attribution_audit_events_mutation();

drop trigger if exists prevent_attribution_audit_events_delete on public.attribution_audit_events;
create trigger prevent_attribution_audit_events_delete
  before delete on public.attribution_audit_events
  for each row execute function public.prevent_attribution_audit_events_mutation();

-- Create indexes for performance
create index if not exists idx_clicks_funnel_id on public.clicks(funnel_id);
create index if not exists idx_clicks_offer_id on public.clicks(offer_id);
create index if not exists idx_clicks_clicked_at on public.clicks(clicked_at);
create index if not exists idx_conversions_click_id on public.conversions(click_id);
create index if not exists idx_conversions_converted_at on public.conversions(converted_at);
create index if not exists idx_funnels_user_id on public.funnels(user_id);
create index if not exists idx_funnels_niche_id on public.funnels(niche_id);
create index if not exists idx_funnel_generations_user_id on public.funnel_generations(user_id);
create index if not exists idx_funnel_generations_funnel_id on public.funnel_generations(funnel_id);
create index if not exists idx_funnel_generations_status on public.funnel_generations(status);
create index if not exists idx_funnel_generations_started_at on public.funnel_generations(started_at desc);
create index if not exists idx_generated_assets_generation_id on public.generated_assets(generation_id);
create index if not exists idx_generated_assets_type on public.generated_assets(asset_type);
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_funnel_id on public.leads(funnel_id);
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_email_campaigns_user_id on public.email_campaigns(user_id);
create index if not exists idx_email_campaigns_status on public.email_campaigns(status);
create index if not exists idx_email_automations_user_trigger on public.email_automations(user_id, trigger) where active = true;
create index if not exists idx_email_subscribers_user_email on public.email_subscribers(user_id, email);
create index if not exists idx_email_subscribers_list on public.email_subscribers(list_name);
create index if not exists idx_email_autoresponder_jobs_due on public.email_autoresponder_jobs(status, scheduled_for);
create index if not exists idx_email_autoresponder_jobs_user on public.email_autoresponder_jobs(user_id);
create index if not exists idx_email_autoresponder_jobs_automation on public.email_autoresponder_jobs(automation_id);
create index if not exists idx_downloads_user_id on public.downloads(user_id);
create index if not exists idx_download_logs_download_id on public.download_logs(download_id);
create index if not exists idx_download_logs_email on public.download_logs(email);
create index if not exists idx_google_keyword_projects_user_id on public.google_keyword_projects(user_id);
create index if not exists idx_google_keywords_project_id on public.google_keywords(project_id);
create index if not exists idx_google_keywords_user_id on public.google_keywords(user_id);
create index if not exists idx_cms_integrations_user_id on public.cms_integrations(user_id);
create index if not exists idx_content_schedule_user_id on public.content_schedule(user_id);
create index if not exists idx_content_schedule_run_at on public.content_schedule(run_at);
create index if not exists idx_content_schedule_status on public.content_schedule(status);
create index if not exists idx_publish_jobs_schedule_id on public.publish_jobs(schedule_id);
create index if not exists idx_publish_jobs_user_id on public.publish_jobs(user_id);

-- ============================================
-- AI SUPPORT CHAT TABLES
-- ============================================

-- Chat conversations
create table if not exists public.chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text,
  status text check (status in ('active', 'resolved', 'archived')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for chat performance
create index if not exists idx_chat_conversations_user on public.chat_conversations(user_id);
create index if not exists idx_chat_conversations_status on public.chat_conversations(status);
create index if not exists idx_chat_messages_conversation on public.chat_messages(conversation_id);
create index if not exists idx_chat_messages_created on public.chat_messages(created_at);

-- RLS for chat conversations
alter table public.chat_conversations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can view their own conversations') then
    create policy "Users can view their own conversations" on public.chat_conversations for select using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can create their own conversations') then
    create policy "Users can create their own conversations" on public.chat_conversations for insert with check (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can update their own conversations') then
    create policy "Users can update their own conversations" on public.chat_conversations for update using (auth.uid() = user_id);
  end if;
end $$;

-- RLS for chat messages
alter table public.chat_messages enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can view messages in their conversations') then
    create policy "Users can view messages in their conversations" on public.chat_messages for select using (
      conversation_id in (select id from chat_conversations where user_id = auth.uid())
    );
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can create messages in their conversations') then
    create policy "Users can create messages in their conversations" on public.chat_messages for insert with check (
      conversation_id in (select id from chat_conversations where user_id = auth.uid())
    );
  end if;
end $$;

-- Function to automatically update conversation's updated_at
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update chat_conversations 
  set updated_at = now() 
  where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to update conversation timestamp on new message
drop trigger if exists update_conversation_on_message on chat_messages;
create trigger update_conversation_on_message
  after insert on chat_messages
  for each row execute function update_conversation_timestamp();

-- Function to auto-generate conversation title from first message
create or replace function generate_conversation_title()
returns trigger as $$
begin
  if NEW.role = 'user' and (
    select count(*) from chat_messages 
    where conversation_id = NEW.conversation_id and role = 'user'
  ) = 1 then
    update chat_conversations
    set title = substring(NEW.content from 1 for 50) || 
                case when length(NEW.content) > 50 then '...' else '' end
    where id = NEW.conversation_id and title is null;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to generate title from first user message
drop trigger if exists generate_title_on_first_message on chat_messages;
create trigger generate_title_on_first_message
  after insert on chat_messages
  for each row execute function generate_conversation_title();
