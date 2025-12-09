-- Team Collaboration Feature Migration
-- This migration adds team collaboration support for the Agency plan

-- Team members table
create table if not exists public.team_members (
  id uuid default gen_random_uuid() primary key,
  account_owner_id uuid references public.users(id) on delete cascade not null,
  member_user_id uuid references public.users(id) on delete cascade,
  member_email text not null,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')) default 'viewer',
  status text not null check (status in ('pending', 'active', 'declined')) default 'pending',
  invite_token text unique,
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure we don't have duplicate invites
  unique(account_owner_id, member_email)
);

-- Add team support to funnels
alter table public.funnels 
add column if not exists team_id uuid references public.users(id);

-- Add team support to offers
alter table public.offers 
add column if not exists user_id uuid references public.users(id),
add column if not exists team_id uuid references public.users(id);

-- Activity log for team actions
create table if not exists public.team_activity_log (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.users(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_team_members_owner on public.team_members(account_owner_id);
create index if not exists idx_team_members_user on public.team_members(member_user_id);
create index if not exists idx_team_members_status on public.team_members(status);
create index if not exists idx_funnels_team on public.funnels(team_id);
create index if not exists idx_offers_team on public.offers(team_id);
create index if not exists idx_team_activity_team on public.team_activity_log(team_id);

-- Row Level Security (RLS) policies

-- Team members: users can see teams they own or are part of
alter table public.team_members enable row level security;

create policy "Users can view their own team memberships"
  on public.team_members for select
  using (
    auth.uid() = account_owner_id 
    or auth.uid() = member_user_id
    or member_email = (select email from auth.users where id = auth.uid())
  );

create policy "Account owners can manage team members"
  on public.team_members for all
  using (auth.uid() = account_owner_id);

-- Funnels: team members can access team funnels based on role
create policy "Team members can view team funnels"
  on public.funnels for select
  using (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    )
  );

create policy "Team owners and editors can create funnels"
  on public.funnels for insert
  with check (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    )
  );

create policy "Team owners and editors can update funnels"
  on public.funnels for update
  using (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    )
  );

create policy "Team owners and admins can delete funnels"
  on public.funnels for delete
  using (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin')
    )
  );

-- Offers: similar policies for offers
create policy "Team members can view team offers"
  on public.offers for select
  using (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    )
  );

create policy "Team owners and editors can manage offers"
  on public.offers for all
  using (
    auth.uid() = user_id
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() 
      and status = 'active' 
      and role in ('owner', 'admin', 'editor')
    )
  );

-- Activity log: team members can view team activity
alter table public.team_activity_log enable row level security;

create policy "Team members can view team activity"
  on public.team_activity_log for select
  using (
    team_id = auth.uid()
    or team_id in (
      select account_owner_id from team_members 
      where member_user_id = auth.uid() and status = 'active'
    )
  );

create policy "System can insert activity logs"
  on public.team_activity_log for insert
  with check (true);

-- Function to log team activities
create or replace function log_team_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(NEW.team_id, NEW.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
  elsif TG_OP = 'UPDATE' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(NEW.team_id, NEW.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
  elsif TG_OP = 'DELETE' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(OLD.team_id, OLD.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- Triggers for activity logging
create trigger log_funnel_activity
  after insert or update or delete on funnels
  for each row execute function log_team_activity();

create trigger log_offer_activity
  after insert or update or delete on offers
  for each row execute function log_team_activity();

create trigger log_team_member_activity
  after insert or update or delete on team_members
  for each row execute function log_team_activity();
