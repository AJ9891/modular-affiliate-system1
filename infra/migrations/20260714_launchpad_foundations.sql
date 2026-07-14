-- Canonical launchpad ownership, plan limits, and database-enforced invariants.

alter table public.users
  add column if not exists max_launchpads integer,
  add column if not exists onboarding_step integer not null default 1,
  add column if not exists onboarding_complete boolean not null default false,
  add column if not exists onboarding_seen boolean not null default false,
  add column if not exists email_automation_provisioned boolean not null default false;

update public.users
set plan = 'free'
where plan is null;

update public.users
set max_launchpads = case plan
  when 'free' then 0
  when 'starter' then 1
  when 'pro' then 20
  when 'agency' then 60
  else 0
end
where max_launchpads is null;

alter table public.users
  alter column plan set default 'free',
  alter column plan set not null,
  alter column max_launchpads set default 0,
  alter column max_launchpads set not null;

alter table public.users drop constraint if exists users_plan_check;
alter table public.users drop constraint if exists users_max_launchpads_check;

alter table public.users
  add constraint users_plan_check
    check (plan in ('free', 'starter', 'pro', 'agency')),
  add constraint users_max_launchpads_check
    check (max_launchpads >= 0);

create table if not exists public.launchpads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  niche text,
  funnel_type text,
  campaign_name text,
  traffic_goal text,
  intent text,
  selected_offer_id uuid references public.offers(id) on delete set null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  launchpad_stage integer not null default 1,
  preflight_complete boolean not null default false,
  startup_checklist_complete boolean not null default false,
  status text not null default 'draft',
  publish_status text not null default 'unpublished',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint launchpads_stage_check check (launchpad_stage between 1 and 4),
  constraint launchpads_status_check
    check (status in ('draft', 'ready', 'live', 'paused', 'archived')),
  constraint launchpads_publish_status_check
    check (publish_status in ('unpublished', 'queued', 'publishing', 'published', 'failed'))
);

create index if not exists idx_launchpads_user_id
  on public.launchpads(user_id);
create index if not exists idx_launchpads_active_user
  on public.launchpads(user_id) where status <> 'archived';

create table if not exists public.launchpad_milestones (
  id uuid primary key default gen_random_uuid(),
  launchpad_id uuid not null references public.launchpads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  stage integer not null check (stage between 1 and 4),
  event text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_launchpad_milestones_launchpad
  on public.launchpad_milestones(launchpad_id, created_at desc);

alter table public.launchpads enable row level security;
alter table public.launchpad_milestones enable row level security;

drop policy if exists launchpads_select_own on public.launchpads;
create policy launchpads_select_own
  on public.launchpads for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists launchpads_insert_own on public.launchpads;
create policy launchpads_insert_own
  on public.launchpads for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists launchpads_update_own on public.launchpads;
create policy launchpads_update_own
  on public.launchpads for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists launchpads_delete_own on public.launchpads;
create policy launchpads_delete_own
  on public.launchpads for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists launchpad_milestones_select_own on public.launchpad_milestones;
create policy launchpad_milestones_select_own
  on public.launchpad_milestones for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.enforce_launchpad_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_count integer;
  active_count integer;
begin
  select max_launchpads
  into allowed_count
  from public.users
  where id = new.user_id
  for update;

  if allowed_count is null then
    raise exception 'User profile not found';
  end if;

  select count(*)
  into active_count
  from public.launchpads
  where user_id = new.user_id
    and status <> 'archived'
    and (tg_op = 'INSERT' or id <> new.id);

  if new.status <> 'archived' and active_count >= allowed_count then
    raise exception 'Launchpad capacity reached'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_launchpad_capacity on public.launchpads;
create trigger enforce_launchpad_capacity
  before insert or update of user_id, status
  on public.launchpads
  for each row
  execute function public.enforce_launchpad_capacity();

create or replace function public.advance_launchpad_stage(
  p_launchpad_id uuid,
  p_expected_stage integer,
  p_next_stage integer,
  p_offer_id uuid default null,
  p_funnel_id uuid default null
)
returns public.launchpads
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_launchpad public.launchpads;
begin
  if p_next_stage <> p_expected_stage + 1 then
    raise exception 'Invalid launchpad stage transition';
  end if;

  if p_next_stage not between 1 and 4 then
    raise exception 'Launchpad stage must be between 1 and 4';
  end if;

  update public.launchpads
  set selected_offer_id = coalesce(p_offer_id, selected_offer_id),
      funnel_id = coalesce(p_funnel_id, funnel_id),
      launchpad_stage = p_next_stage,
      updated_at = now()
  where id = p_launchpad_id
    and user_id = (select auth.uid())
    and launchpad_stage = p_expected_stage
  returning * into updated_launchpad;

  if not found then
    raise exception 'Launchpad not found, unauthorized, or stage changed';
  end if;

  insert into public.launchpad_milestones (
    launchpad_id,
    user_id,
    stage,
    event
  ) values (
    p_launchpad_id,
    (select auth.uid()),
    p_next_stage,
    'stage_advanced'
  );

  return updated_launchpad;
end;
$$;

revoke all on function public.advance_launchpad_stage(uuid, integer, integer, uuid, uuid)
  from public, anon;
grant execute on function public.advance_launchpad_stage(uuid, integer, integer, uuid, uuid)
  to authenticated;

-- Browser sessions may update onboarding progress, but never billing,
-- administration, subscription, or provisioning facts.
revoke update on public.users from authenticated;
grant update (
  onboarding_step,
  onboarding_complete,
  onboarding_seen,
  updated_at
) on public.users to authenticated;

comment on table public.launchpads is
  'User-owned launch workflows. Launch-specific facts must not be stored on users.';
