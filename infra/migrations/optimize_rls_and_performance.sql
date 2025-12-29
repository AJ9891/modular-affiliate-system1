-- ============================================
-- RLS AND PERFORMANCE OPTIMIZATION
-- ============================================
-- This migration consolidates and optimizes all RLS policies and indexes
-- Run this AFTER the main schema and all other migrations

-- ============================================
-- MISSING RLS POLICIES
-- ============================================

-- Affiliate clicks: protect user data
alter table public.affiliate_clicks enable row level security;

drop policy if exists "Users can view their own affiliate clicks" on public.affiliate_clicks;
create policy "Users can view their own affiliate clicks"
  on public.affiliate_clicks for select
  using (auth.uid() = user_id);

drop policy if exists "System can insert affiliate clicks" on public.affiliate_clicks;
create policy "System can insert affiliate clicks"
  on public.affiliate_clicks for insert
  with check (true);

-- Affiliate payouts: strict user isolation
alter table public.affiliate_payouts enable row level security;

drop policy if exists "Users can view their own payouts" on public.affiliate_payouts;
create policy "Users can view their own payouts"
  on public.affiliate_payouts for select
  using (auth.uid() = user_id);

drop policy if exists "System can manage payouts" on public.affiliate_payouts;
create policy "System can manage payouts"
  on public.affiliate_payouts for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Pages: inherit funnel permissions
alter table public.pages enable row level security;

drop policy if exists "Users can view pages of their funnels" on public.pages;
create policy "Users can view pages of their funnels"
  on public.pages for select
  using (
    funnel_id in (
      select funnel_id from funnels where user_id = auth.uid()
    )
  );

drop policy if exists "Users can manage pages of their funnels" on public.pages;
create policy "Users can manage pages of their funnels"
  on public.pages for all
  using (
    funnel_id in (
      select funnel_id from funnels where user_id = auth.uid()
    )
  );

-- Templates: public read for active, owner write
drop policy if exists "Anyone can view active templates" on public.templates;
create policy "Anyone can view active templates"
  on public.templates for select
  using (true);

drop policy if exists "Service role can manage templates" on public.templates;
create policy "Service role can manage templates"
  on public.templates for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Theme presets: public read
drop policy if exists "Anyone can view theme presets" on public.theme_presets;
create policy "Anyone can view theme presets"
  on public.theme_presets for select
  using (true);

drop policy if exists "Service role can manage theme presets" on public.theme_presets;
create policy "Service role can manage theme presets"
  on public.theme_presets for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- Leads: user isolation with funnel context (skip if table doesn't exist)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then
    alter table public.leads enable row level security;
    
    drop policy if exists "Users can view leads from their funnels" on public.leads;
    create policy "Users can view leads from their funnels"
      on public.leads for select
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
      );

    drop policy if exists "System can insert leads" on public.leads;
    create policy "System can insert leads"
      on public.leads for insert
      with check (true);
  end if;
end $$;

-- Automations: user isolation (skip if table doesn't exist)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'automations') then
    alter table public.automations enable row level security;
    
    drop policy if exists "Users can view their automations" on public.automations;
    create policy "Users can view their automations"
      on public.automations for select
      using (
        sendshark_id in (
          select sendshark_id from email_campaigns where user_id = auth.uid()
        )
      );

    drop policy if exists "Service role can manage automations" on public.automations;
    create policy "Service role can manage automations"
      on public.automations for all
      using (auth.jwt() ->> 'role' = 'service_role');
  end if;
end $$;

-- Email campaigns: already has policy, but optimize it (skip if table doesn't exist)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'email_campaigns') then
    alter table public.email_campaigns enable row level security;
    
    drop policy if exists "Users can manage their own campaigns" on public.email_campaigns;
    create policy "Users can manage their own campaigns"
      on public.email_campaigns for all
      using (auth.uid() = user_id);
  end if;
end $$;

-- ============================================
-- OPTIMIZE EXISTING POLICIES
-- ============================================

-- Funnels: Remove duplicate policies and optimize
drop policy if exists "Users can manage their own funnels" on public.funnels;
drop policy if exists "Team members can view team funnels" on public.funnels;
drop policy if exists "Team owners and editors can create funnels" on public.funnels;
drop policy if exists "Team owners and editors can update funnels" on public.funnels;
drop policy if exists "Team owners and admins can delete funnels" on public.funnels;

-- Consolidated funnel policies with team support
create policy "Users can view their own and team funnels"
  on public.funnels for select
  using (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    ))
  );

create policy "Users can create funnels"
  on public.funnels for insert
  with check (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    ))
  );

create policy "Users can update their own and team funnels"
  on public.funnels for update
  using (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    ))
  );

create policy "Users can delete their own funnels or team admins can delete"
  on public.funnels for delete
  using (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin')
    ))
  );

-- Offers: optimize team policies
drop policy if exists "Anyone can view active offers" on public.offers;
drop policy if exists "Team members can view team offers" on public.offers;
drop policy if exists "Team owners and editors can manage offers" on public.offers;

create policy "Anyone can view active offers"
  on public.offers for select
  using (
    active = true
    or auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    ))
  );

create policy "Users can manage their own and team offers"
  on public.offers for all
  using (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    ))
  );

-- Users: tighten security
drop policy if exists "Users can view their own data" on public.users;

create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- Niches: Already optimized, keep as is
-- Clicks: Open for tracking, but add index optimization
-- Conversions: Open for tracking

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Users table optimizations
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_subdomain on public.users(subdomain) where subdomain is not null;
create index if not exists idx_users_custom_domain on public.users(custom_domain) where custom_domain is not null;
create index if not exists idx_users_plan on public.users(plan);
create index if not exists idx_users_stripe_customer on public.users(stripe_customer_id) where stripe_customer_id is not null;

-- Funnels table optimizations (composite indexes for team queries)
create index if not exists idx_funnels_user_active on public.funnels(user_id, active) where active = true;
create index if not exists idx_funnels_team_active on public.funnels(team_id, active) where team_id is not null and active = true;

-- Pages table optimization
create index if not exists idx_pages_funnel_order on public.pages(funnel_id, order_index);

-- Leads table optimization (for email lookups and analytics) - skip if doesn't exist
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then
    create index if not exists idx_leads_email_funnel on public.leads(email, funnel_id);
    create index if not exists idx_leads_funnel_created on public.leads(funnel_id, created_at desc);
  end if;
end $$;

-- Clicks and conversions (for analytics queries)
create index if not exists idx_clicks_funnel_date on public.clicks(funnel_id, clicked_at desc);
create index if not exists idx_clicks_offer_date on public.clicks(offer_id, clicked_at desc);
create index if not exists idx_conversions_offer_date on public.conversions(offer_id, converted_at desc);

-- Team members optimization
create index if not exists idx_team_members_user_status on public.team_members(member_user_id, status) where status = 'active';
create index if not exists idx_team_members_email_status on public.team_members(member_email, status);

-- Activity log optimization (recent activity queries)
create index if not exists idx_team_activity_team_date on public.team_activity_log(team_id, created_at desc);
create index if not exists idx_team_activity_resource on public.team_activity_log(resource_type, resource_id);

-- Chat optimization
create index if not exists idx_chat_conversations_user_status on public.chat_conversations(user_id, status) where status = 'active';
create index if not exists idx_chat_messages_conversation_created on public.chat_messages(conversation_id, created_at asc);

-- Downloads optimization
create index if not exists idx_downloads_user_active on public.downloads(user_id, is_active) where is_active = true;
create index if not exists idx_download_logs_download_date on public.download_logs(download_id, downloaded_at desc);
create index if not exists idx_download_logs_email_date on public.download_logs(email, downloaded_at desc);

-- ============================================
-- MATERIALIZED VIEW FOR ANALYTICS
-- ============================================

-- Drop existing view if exists
drop materialized view if exists public.funnel_analytics_summary;

-- Create materialized view for funnel performance
create materialized view public.funnel_analytics_summary as
select 
  f.funnel_id,
  f.user_id,
  f.name as funnel_name,
  count(distinct c.click_id) as total_clicks,
  count(distinct cv.conversion_id) as total_conversions,
  coalesce(sum(cv.amount), 0) as total_revenue,
  case 
    when count(distinct c.click_id) > 0 
    then (count(distinct cv.conversion_id)::float / count(distinct c.click_id)::float) * 100 
    else 0 
  end as conversion_rate,
  max(c.clicked_at) as last_click_at
from public.funnels f
left join public.clicks c on c.funnel_id = f.funnel_id
left join public.conversions cv on cv.click_id = c.click_id
where f.active = true
group by f.funnel_id, f.user_id, f.name;

-- Index on materialized view
create unique index if not exists idx_funnel_analytics_funnel_id on public.funnel_analytics_summary(funnel_id);
create index if not exists idx_funnel_analytics_user_id on public.funnel_analytics_summary(user_id);

-- RLS for materialized view
alter materialized view public.funnel_analytics_summary owner to postgres;
grant select on public.funnel_analytics_summary to authenticated;

-- Function to refresh analytics
create or replace function refresh_funnel_analytics()
returns void as $$
begin
  refresh materialized view concurrently public.funnel_analytics_summary;
end;
$$ language plpgsql security definer;

-- Grant execute on refresh function
grant execute on function refresh_funnel_analytics() to authenticated;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has team access to a resource
create or replace function has_team_access(
  p_user_id uuid,
  p_team_id uuid,
  p_required_role text default 'viewer'
)
returns boolean as $$
begin
  return exists (
    select 1 from team_members
    where account_owner_id = p_team_id
    and member_user_id = p_user_id
    and status = 'active'
    and case p_required_role
      when 'viewer' then role in ('viewer', 'editor', 'admin', 'owner')
      when 'editor' then role in ('editor', 'admin', 'owner')
      when 'admin' then role in ('admin', 'owner')
      when 'owner' then role = 'owner'
      else false
    end
  );
end;
$$ language plpgsql security definer stable;

-- ============================================
-- VACUUM AND ANALYZE
-- ============================================

-- Update table statistics for query planner (only for existing tables)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'users') then analyze public.users; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'funnels') then analyze public.funnels; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pages') then analyze public.pages; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'offers') then analyze public.offers; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'clicks') then analyze public.clicks; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'conversions') then analyze public.conversions; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then analyze public.leads; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'team_members') then analyze public.team_members; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'downloads') then analyze public.downloads; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'download_logs') then analyze public.download_logs; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_conversations') then analyze public.chat_conversations; end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_messages') then analyze public.chat_messages; end if;
end $$;

-- ============================================
-- COMMENTS
-- ============================================

comment on materialized view public.funnel_analytics_summary is 'Pre-aggregated funnel performance metrics for faster analytics queries. Refresh periodically.';
comment on function refresh_funnel_analytics() is 'Refreshes the funnel analytics materialized view. Call after bulk data changes.';
comment on function has_team_access(uuid, uuid, text) is 'Helper function to check if user has team access with required role level.';

-- Done
select 'RLS and performance optimization complete!' as status;
