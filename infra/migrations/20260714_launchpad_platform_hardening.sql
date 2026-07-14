-- Launchpad platform hardening: resumable jobs, audit events, optimistic
-- concurrency, workflow versioning, versioned funnels, and soft deletion.

alter table public.launchpads
  add column if not exists workflow_version integer,
  add column if not exists version integer not null default 1,
  add column if not exists preflight_data jsonb not null default '{}'::jsonb,
  add column if not exists preflight_saved_at timestamptz,
  add column if not exists preflight_completed_at timestamptz,
  add column if not exists checklist_data jsonb not null default '{}'::jsonb,
  add column if not exists checklist_saved_at timestamptz,
  add column if not exists checklist_completed_at timestamptz,
  add column if not exists funnel_setup_completed_at timestamptz,
  add column if not exists offer_setup_completed_at timestamptz,
  add column if not exists email_setup_completed_at timestamptz,
  add column if not exists preview_check_passed boolean not null default false,
  add column if not exists cta_check_passed boolean not null default false,
  add column if not exists checks_passed_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists deleted_at timestamptz;

-- Existing launchpads stay pinned to the legacy workflow. New launchpads use v3.
update public.launchpads
set workflow_version = 1
where workflow_version is null;

alter table public.launchpads
  alter column workflow_version set not null,
  alter column workflow_version set default 3;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'launchpads_workflow_version_check'
  ) then
    alter table public.launchpads
      add constraint launchpads_workflow_version_check
      check (workflow_version between 1 and 3);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'launchpads_version_check'
  ) then
    alter table public.launchpads
      add constraint launchpads_version_check check (version > 0);
  end if;
end
$$;

alter table public.funnels
  add column if not exists template_id uuid,
  add column if not exists template_version integer,
  add column if not exists theme jsonb not null default '{}'::jsonb,
  add column if not exists deleted_at timestamptz;

alter table public.offers
  add column if not exists deleted_at timestamptz;

create table if not exists public.funnel_versions (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.funnels(funnel_id) on delete cascade,
  version integer not null check (version > 0),
  blocks jsonb not null,
  theme jsonb,
  name text,
  status text,
  change_type text not null default 'update'
    check (change_type in ('update', 'publish', 'restore', 'duplicate', 'rollback')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (funnel_id, version)
);

create index if not exists idx_funnel_versions_timeline
  on public.funnel_versions(funnel_id, version desc);
create index if not exists idx_launchpads_not_deleted
  on public.launchpads(user_id, updated_at desc) where deleted_at is null;
create index if not exists idx_funnels_not_deleted
  on public.funnels(user_id, updated_at desc) where deleted_at is null;

create table if not exists public.launchpad_events (
  id uuid primary key default gen_random_uuid(),
  launchpad_id uuid not null references public.launchpads(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  launchpad_version integer,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_launchpad_events_idempotency
  on public.launchpad_events(launchpad_id, event_type, idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_launchpad_events_timeline
  on public.launchpad_events(launchpad_id, created_at desc);
create index if not exists idx_launchpad_events_user
  on public.launchpad_events(user_id, created_at desc);

-- Consolidate the narrower milestone stream introduced by the foundation
-- migration into the canonical event stream.
insert into public.launchpad_events (
  launchpad_id,
  user_id,
  event_type,
  payload,
  created_at
)
select
  launchpad_id,
  user_id,
  event,
  jsonb_build_object('stage', stage),
  created_at
from public.launchpad_milestones;

drop table public.launchpad_milestones;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  launchpad_id uuid references public.launchpads(id) on delete cascade,
  type text not null check (
    type in (
      'lead_magnet_generation',
      'ai_launch_kit_creation',
      'email_provisioning',
      'report_generation',
      'image_generation',
      'bulk_funnel_cloning'
    )
  ),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error jsonb,
  progress integer not null default 0 check (progress between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  idempotency_key text,
  request_hash text,
  provider_job_id text,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create unique index if not exists idx_jobs_idempotency
  on public.jobs(user_id, type, idempotency_key)
  where idempotency_key is not null;
create index if not exists idx_jobs_worker_queue
  on public.jobs(status, available_at, created_at)
  where status = 'queued';
create index if not exists idx_jobs_user_timeline
  on public.jobs(user_id, created_at desc);

alter table public.launchpad_events enable row level security;
alter table public.funnel_versions enable row level security;
alter table public.jobs enable row level security;

drop policy if exists launchpad_events_select_own on public.launchpad_events;
create policy launchpad_events_select_own
  on public.launchpad_events for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists funnel_versions_select_own on public.funnel_versions;
create policy funnel_versions_select_own
  on public.funnel_versions for select to authenticated
  using (
    exists (
      select 1
      from public.funnels
      where funnels.funnel_id = funnel_versions.funnel_id
        and funnels.user_id = (select auth.uid())
    )
  );

drop policy if exists jobs_select_own on public.jobs;
create policy jobs_select_own
  on public.jobs for select to authenticated
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
    and deleted_at is null
    and status <> 'archived'
    and (tg_op = 'INSERT' or id <> new.id);

  if new.deleted_at is null
    and new.status <> 'archived'
    and active_count >= allowed_count then
    raise exception 'Launchpad capacity reached'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_launchpad_capacity on public.launchpads;
create trigger enforce_launchpad_capacity
  before insert or update of user_id, status, deleted_at
  on public.launchpads
  for each row
  execute function public.enforce_launchpad_capacity();

-- Recreate the transactional stage function with optimistic concurrency and
-- canonical event logging. Completion is explicit; data presence is not used.
drop function if exists public.advance_launchpad_stage(uuid, integer, integer, uuid, uuid);
create function public.advance_launchpad_stage(
  p_launchpad_id uuid,
  p_expected_stage integer,
  p_expected_version integer,
  p_next_stage integer,
  p_offer_id uuid default null,
  p_funnel_id uuid default null
)
returns public.launchpads
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_launchpad public.launchpads;
begin
  if p_next_stage <> p_expected_stage + 1 or p_next_stage not between 1 and 4 then
    raise exception 'Invalid launchpad stage transition';
  end if;

  update public.launchpads
  set selected_offer_id = coalesce(p_offer_id, selected_offer_id),
      funnel_id = coalesce(p_funnel_id, funnel_id),
      launchpad_stage = p_next_stage,
      version = version + 1,
      updated_at = now()
  where id = p_launchpad_id
    and user_id = (select auth.uid())
    and deleted_at is null
    and launchpad_stage = p_expected_stage
    and version = p_expected_version
  returning * into updated_launchpad;

  if not found then
    raise exception 'Launchpad changed in another session. Refresh before continuing.';
  end if;

  insert into public.launchpad_events (
    launchpad_id,
    user_id,
    event_type,
    payload,
    launchpad_version
  ) values (
    p_launchpad_id,
    (select auth.uid()),
    'stage_advanced',
    jsonb_build_object('fromStage', p_expected_stage, 'toStage', p_next_stage),
    updated_launchpad.version
  );

  return updated_launchpad;
end;
$$;

revoke all on function public.advance_launchpad_stage(uuid, integer, integer, integer, uuid, uuid)
  from public, anon;
grant execute on function public.advance_launchpad_stage(uuid, integer, integer, integer, uuid, uuid)
  to authenticated;

comment on table public.jobs is
  'Durable server-owned queue for slow launchpad and provider operations.';
comment on table public.launchpad_events is
  'Append-only launchpad event stream for support, recovery, analytics, and audit.';
comment on column public.launchpads.workflow_version is
  'Pins a launchpad to the workflow definition under which it was created.';
comment on column public.launchpads.version is
  'Optimistic concurrency counter incremented by every persistent workflow mutation.';

-- Verification queries: review these result sets after applying the migration.
select
  plan,
  count(*) as users,
  min(max_launchpads) as minimum_capacity,
  max(max_launchpads) as maximum_capacity
from public.users
group by plan
order by plan;

select
  workflow_version,
  count(*) as launchpads,
  min(version) as minimum_record_version
from public.launchpads
group by workflow_version
order by workflow_version;

select status, count(*) as jobs
from public.jobs
group by status
order by status;
