-- Users table (handled by Supabase Auth, but we can extend it)
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  subdomain text unique,
  custom_domain text unique,
  sendshark_provisioned boolean default false,
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

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.niches enable row level security;
alter table public.offers enable row level security;
alter table public.funnels enable row level security;
alter table public.pages enable row level security;
alter table public.clicks enable row level security;
alter table public.conversions enable row level security;
alter table public.templates enable row level security;
alter table public.theme_presets enable row level security;
alter table public.leads enable row level security;
alter table public.automations enable row level security;
alter table public.email_campaigns enable row level security;
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
  
  if not exists (select 1 from pg_policies where tablename = 'offers' and policyname = 'Anyone can view active offers') then
    create policy "Anyone can view active offers" on public.offers for select using (active = true);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'downloads' and policyname = 'Users can manage their own downloads') then
    create policy "Users can manage their own downloads" on public.downloads for all using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'download_logs' and policyname = 'Users can view download logs for their downloads') then
    create policy "Users can view download logs for their downloads" on public.download_logs for select using (
      exists (select 1 from public.downloads where downloads.id = download_logs.download_id and downloads.user_id = auth.uid())
    );
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
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_leads_funnel_id on public.leads(funnel_id);
create index if not exists idx_leads_created_at on public.leads(created_at);
create index if not exists idx_email_campaigns_user_id on public.email_campaigns(user_id);
create index if not exists idx_email_campaigns_status on public.email_campaigns(status);
create index if not exists idx_downloads_user_id on public.downloads(user_id);
create index if not exists idx_download_logs_download_id on public.download_logs(download_id);
create index if not exists idx_download_logs_email on public.download_logs(email);

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
