-- Fix team_members RLS policy to avoid querying auth.users/public.users during policy evaluation.
-- This prevents cascaded permission errors (e.g., offers reads failing with "permission denied for table users").

alter table if exists public.team_members enable row level security;

drop policy if exists "Users can view their own team memberships" on public.team_members;

create policy "Users can view their own team memberships"
  on public.team_members
  for select
  using (
    auth.uid() = account_owner_id
    or auth.uid() = member_user_id
    or (
      member_email is not null
      and lower(member_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
