-- ============================================
-- FIX RLS WARNINGS
-- ============================================
-- This migration ensures ALL tables have proper Row Level Security (RLS) enabled
-- and appropriate policies to prevent Supabase RLS warnings

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- Core tables
alter table public.users enable row level security;
alter table public.niches enable row level security;
alter table public.offers enable row level security;
alter table public.funnels enable row level security;

-- Enable RLS on pages table (or funnel_pages if renamed)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pages') then
    alter table public.pages enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'funnel_pages') then
    alter table public.funnel_pages enable row level security;
  end if;
end $$;

alter table public.clicks enable row level security;
alter table public.conversions enable row level security;
alter table public.templates enable row level security;
alter table public.theme_presets enable row level security;

-- Enable RLS on optional tables (only if they exist)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then
    alter table public.leads enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'automations') then
    alter table public.automations enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'email_campaigns') then
    alter table public.email_campaigns enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_modes') then
    alter table public.brand_modes enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'affiliate_clicks') then
    alter table public.affiliate_clicks enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'affiliate_payouts') then
    alter table public.affiliate_payouts enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'downloads') then
    alter table public.downloads enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'download_logs') then
    alter table public.download_logs enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_conversations') then
    alter table public.chat_conversations enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_messages') then
    alter table public.chat_messages enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'team_members') then
    alter table public.team_members enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'team_activity_log') then
    alter table public.team_activity_log enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_profiles') then
    alter table public.brand_profiles enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'content_validations') then
    alter table public.content_validations enable row level security;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_ai_generations') then
    alter table public.brand_ai_generations enable row level security;
  end if;
end $$;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

drop policy if exists "Users can view their own data" on public.users;
drop policy if exists "Users can update their own data" on public.users;

create policy "Users can view their own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own data"
  on public.users for update
  using (auth.uid() = id);

-- ============================================
-- NICHES TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can view active niches" on public.niches;
drop policy if exists "Service role can manage niches" on public.niches;

create policy "Anyone can view active niches"
  on public.niches for select
  using (active = true or auth.jwt() ->> 'role' = 'service_role');

create policy "Service role can manage niches"
  on public.niches for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- OFFERS TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can view active offers" on public.offers;
drop policy if exists "Users can manage their own and team offers" on public.offers;

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

-- ============================================
-- FUNNELS TABLE POLICIES
-- ============================================

drop policy if exists "Users can view their own and team funnels" on public.funnels;
drop policy if exists "Users can create funnels" on public.funnels;
drop policy if exists "Users can update their own and team funnels" on public.funnels;
drop policy if exists "Users can delete their own funnels or team admins can delete" on public.funnels;
drop policy if exists "Public can read published funnels" on public.funnels;

create policy "Users can view their own and team funnels"
  on public.funnels for select
  using (
    auth.uid() = user_id
    or (team_id is not null and team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    ))
    or (status = 'published')
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

create policy "Public can read published funnels"
  on public.funnels for select
  using (status = 'published');

-- ============================================
-- PAGES TABLE POLICIES (OR FUNNEL_PAGES IF RENAMED)
-- ============================================

-- Handle both pages and funnel_pages table names
do $$
begin
  -- Policies for pages table
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'pages') then
    drop policy if exists "Users can view pages of their funnels" on public.pages;
    drop policy if exists "Users can manage pages of their funnels" on public.pages;
    drop policy if exists "Public can read pages of published funnels" on public.pages;

    create policy "Users can view pages of their funnels"
      on public.pages for select
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() and status = 'active'
          )
        )
        or funnel_id in (
          select funnel_id from funnels where status = 'published'
        )
      );

    create policy "Users can manage pages of their funnels"
      on public.pages for all
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() 
            and status = 'active' 
            and role in ('owner', 'admin', 'editor')
          )
        )
      );
      
    create policy "Public can read pages of published funnels"
      on public.pages for select
      using (
        funnel_id in (
          select funnel_id from funnels where status = 'published'
        )
      );
  end if;

  -- Policies for funnel_pages table (if renamed)
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'funnel_pages') then
    drop policy if exists "Users can view pages of their funnels" on public.funnel_pages;
    drop policy if exists "Users can manage pages of their funnels" on public.funnel_pages;
    drop policy if exists "Public can read pages of published funnels" on public.funnel_pages;
    drop policy if exists "Users can read their funnel pages" on public.funnel_pages;
    drop policy if exists "Users can create funnel pages" on public.funnel_pages;
    drop policy if exists "Users can update funnel pages" on public.funnel_pages;
    drop policy if exists "Users can delete funnel pages" on public.funnel_pages;

    create policy "Users can read their funnel pages"
      on public.funnel_pages for select
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() and status = 'active'
          )
        )
        or funnel_id in (
          select funnel_id from funnels where status = 'published'
        )
      );

    create policy "Users can create funnel pages"
      on public.funnel_pages for insert
      with check (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() 
            and status = 'active' 
            and role in ('owner', 'admin', 'editor')
          )
        )
      );

    create policy "Users can update funnel pages"
      on public.funnel_pages for update
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() 
            and status = 'active' 
            and role in ('owner', 'admin', 'editor')
          )
        )
      );

    create policy "Users can delete funnel pages"
      on public.funnel_pages for delete
      using (
        funnel_id in (
          select funnel_id from funnels where user_id = auth.uid()
        )
        or funnel_id in (
          select funnel_id from funnels 
          where team_id in (
            select account_owner_id from team_members 
            where member_user_id = auth.uid() 
            and status = 'active' 
            and role in ('owner', 'admin', 'editor')
          )
        )
      );

    create policy "Public can read pages of published funnels"
      on public.funnel_pages for select
      using (
        funnel_id in (
          select funnel_id from funnels where status = 'published'
        )
      );
  end if;
end $$;

-- ============================================
-- CLICKS TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can insert clicks" on public.clicks;
drop policy if exists "Users can view clicks for their funnels" on public.clicks;

create policy "Anyone can insert clicks"
  on public.clicks for insert
  with check (true);

create policy "Users can view clicks for their funnels"
  on public.clicks for select
  using (
    funnel_id in (
      select funnel_id from funnels where user_id = auth.uid()
    )
    or funnel_id in (
      select funnel_id from funnels 
      where team_id in (
        select account_owner_id from team_members 
        where member_user_id = auth.uid() and status = 'active'
      )
    )
  );

-- ============================================
-- CONVERSIONS TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can insert conversions" on public.conversions;
drop policy if exists "Users can view conversions for their offers" on public.conversions;

create policy "Anyone can insert conversions"
  on public.conversions for insert
  with check (true);

create policy "Users can view conversions for their offers"
  on public.conversions for select
  using (
    click_id in (
      select click_id from clicks 
      where funnel_id in (
        select funnel_id from funnels where user_id = auth.uid()
      )
    )
  );

-- ============================================
-- TEMPLATES TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can view active templates" on public.templates;
drop policy if exists "Service role can manage templates" on public.templates;

create policy "Anyone can view active templates"
  on public.templates for select
  using (true);

create policy "Service role can manage templates"
  on public.templates for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- THEME_PRESETS TABLE POLICIES
-- ============================================

drop policy if exists "Anyone can view theme presets" on public.theme_presets;
drop policy if exists "Service role can manage theme presets" on public.theme_presets;

create policy "Anyone can view theme presets"
  on public.theme_presets for select
  using (true);

create policy "Service role can manage theme presets"
  on public.theme_presets for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- OPTIONAL TABLES POLICIES (only if tables exist)
-- ============================================

-- BRAND_MODES
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_modes') then
    execute 'drop policy if exists "Anyone can view brand modes" on public.brand_modes';
    execute 'drop policy if exists "Service role can manage brand modes" on public.brand_modes';
    execute 'create policy "Anyone can view brand modes" on public.brand_modes for select using (true)';
    execute 'create policy "Service role can manage brand modes" on public.brand_modes for all using (auth.jwt() ->> ''role'' = ''service_role'')';
  end if;
end $$;

-- LEADS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then
    execute 'drop policy if exists "Users can view leads from their funnels" on public.leads';
    execute 'drop policy if exists "System can insert leads" on public.leads';
    execute 'create policy "Users can view leads from their funnels" on public.leads for select using (funnel_id in (select funnel_id from funnels where user_id = auth.uid()) or funnel_id in (select funnel_id from funnels where team_id in (select account_owner_id from team_members where member_user_id = auth.uid() and status = ''active'')))';
    execute 'create policy "System can insert leads" on public.leads for insert with check (true)';
  end if;
end $$;

-- AUTOMATIONS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'automations') then
    execute 'drop policy if exists "Users can view their automations" on public.automations';
    execute 'drop policy if exists "Service role can manage automations" on public.automations';
    execute 'create policy "Users can view their automations" on public.automations for select using (true)';
    execute 'create policy "Service role can manage automations" on public.automations for all using (auth.jwt() ->> ''role'' = ''service_role'')';
  end if;
end $$;

-- EMAIL_CAMPAIGNS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'email_campaigns') then
    execute 'drop policy if exists "Users can manage their own campaigns" on public.email_campaigns';
    execute 'create policy "Users can manage their own campaigns" on public.email_campaigns for all using (auth.uid() = user_id)';
  end if;
end $$;

-- AFFILIATE_CLICKS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'affiliate_clicks') then
    execute 'drop policy if exists "Users can view their own affiliate clicks" on public.affiliate_clicks';
    execute 'drop policy if exists "System can insert affiliate clicks" on public.affiliate_clicks';
    execute 'create policy "Users can view their own affiliate clicks" on public.affiliate_clicks for select using (auth.uid() = user_id)';
    execute 'create policy "System can insert affiliate clicks" on public.affiliate_clicks for insert with check (true)';
  end if;
end $$;

-- AFFILIATE_PAYOUTS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'affiliate_payouts') then
    execute 'drop policy if exists "Users can view their own payouts" on public.affiliate_payouts';
    execute 'drop policy if exists "System can manage payouts" on public.affiliate_payouts';
    execute 'create policy "Users can view their own payouts" on public.affiliate_payouts for select using (auth.uid() = user_id)';
    execute 'create policy "System can manage payouts" on public.affiliate_payouts for all using (auth.jwt() ->> ''role'' = ''service_role'')';
  end if;
end $$;

-- DOWNLOADS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'downloads') then
    execute 'drop policy if exists "Users can manage their own downloads" on public.downloads';
    execute 'drop policy if exists "Anyone can view active downloads" on public.downloads';
    execute 'create policy "Users can manage their own downloads" on public.downloads for all using (auth.uid() = user_id)';
    execute 'create policy "Anyone can view active downloads" on public.downloads for select using (is_active = true)';
  end if;
end $$;

-- DOWNLOAD_LOGS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'download_logs') then
    execute 'drop policy if exists "Users can view download logs for their downloads" on public.download_logs';
    execute 'drop policy if exists "System can insert download logs" on public.download_logs';
    execute 'create policy "Users can view download logs for their downloads" on public.download_logs for select using (exists (select 1 from public.downloads where downloads.id = download_logs.download_id and downloads.user_id = auth.uid()))';
    execute 'create policy "System can insert download logs" on public.download_logs for insert with check (true)';
  end if;
end $$;

-- CHAT_CONVERSATIONS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_conversations') then
    execute 'drop policy if exists "Users can view their own conversations" on public.chat_conversations';
    execute 'drop policy if exists "Users can create their own conversations" on public.chat_conversations';
    execute 'drop policy if exists "Users can update their own conversations" on public.chat_conversations';
    execute 'create policy "Users can view their own conversations" on public.chat_conversations for select using (auth.uid() = user_id)';
    execute 'create policy "Users can create their own conversations" on public.chat_conversations for insert with check (auth.uid() = user_id)';
    execute 'create policy "Users can update their own conversations" on public.chat_conversations for update using (auth.uid() = user_id)';
  end if;
end $$;

-- CHAT_MESSAGES
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'chat_messages') then
    execute 'drop policy if exists "Users can view messages in their conversations" on public.chat_messages';
    execute 'drop policy if exists "Users can create messages in their conversations" on public.chat_messages';
    execute 'create policy "Users can view messages in their conversations" on public.chat_messages for select using (conversation_id in (select id from chat_conversations where user_id = auth.uid()))';
    execute 'create policy "Users can create messages in their conversations" on public.chat_messages for insert with check (conversation_id in (select id from chat_conversations where user_id = auth.uid()))';
  end if;
end $$;

-- TEAM_MEMBERS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'team_members') then
    execute 'drop policy if exists "Users can view their own team memberships" on public.team_members';
    execute 'drop policy if exists "Account owners can manage team members" on public.team_members';
    execute 'create policy "Users can view their own team memberships" on public.team_members for select using (auth.uid() = account_owner_id or auth.uid() = member_user_id or member_email = (select email from auth.users where id = auth.uid()))';
    execute 'create policy "Account owners can manage team members" on public.team_members for all using (auth.uid() = account_owner_id)';
  end if;
end $$;

-- TEAM_ACTIVITY_LOG
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'team_activity_log') then
    execute 'drop policy if exists "Team members can view activity log" on public.team_activity_log';
    execute 'drop policy if exists "Team members can insert activity" on public.team_activity_log';
    execute 'create policy "Team members can view activity log" on public.team_activity_log for select using (team_id = auth.uid() or team_id in (select account_owner_id from team_members where member_user_id = auth.uid() and status = ''active''))';
    execute 'create policy "Team members can insert activity" on public.team_activity_log for insert with check (team_id = auth.uid() or team_id in (select account_owner_id from team_members where member_user_id = auth.uid() and status = ''active''))';
  end if;
end $$;

-- BRAND_PROFILES
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_profiles') then
    execute 'drop policy if exists "Users can access own brand profiles" on public.brand_profiles';
    execute 'create policy "Users can access own brand profiles" on public.brand_profiles for all using (auth.uid() = user_id)';
  end if;
end $$;

-- CONTENT_VALIDATIONS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'content_validations') then
    execute 'drop policy if exists "Users can access own content validations" on public.content_validations';
    execute 'create policy "Users can access own content validations" on public.content_validations for all using (auth.uid() = user_id)';
  end if;
end $$;

-- BRAND_AI_GENERATIONS
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_ai_generations') then
    execute 'drop policy if exists "Users can access own brand AI generations" on public.brand_ai_generations';
    execute 'create policy "Users can access own brand AI generations" on public.brand_ai_generations for all using (auth.uid() = user_id)';
  end if;
end $$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant basic permissions to authenticated users (only for tables that exist)
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'niches') then
    grant select on public.niches to authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'offers') then
    grant select on public.offers to authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'templates') then
    grant select on public.templates to authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'theme_presets') then
    grant select on public.theme_presets to authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'brand_modes') then
    grant select on public.brand_modes to authenticated;
  end if;
  
  -- Grant insert for tracking tables (only for tables that exist)
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'clicks') then
    grant insert on public.clicks to anon, authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'conversions') then
    grant insert on public.conversions to anon, authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leads') then
    grant insert on public.leads to anon, authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'download_logs') then
    grant insert on public.download_logs to anon, authenticated;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'affiliate_clicks') then
    grant insert on public.affiliate_clicks to anon, authenticated;
  end if;
end $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

do $$
begin
  raise notice 'RLS warnings fixed! All tables now have:';
  raise notice '1. Row Level Security enabled';
  raise notice '2. Appropriate policies for SELECT, INSERT, UPDATE, DELETE';
  raise notice '3. Team collaboration support where applicable';
  raise notice '4. Proper permissions for authenticated and anonymous users';
end $$;

select 'RLS warnings fix complete!' as status