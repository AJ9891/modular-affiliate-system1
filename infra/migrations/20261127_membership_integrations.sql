create table if not exists public.membership_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  automation_id uuid not null references public.email_automations(id) on delete restrict,
  api_key_hash text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_integration_events (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.membership_integrations(id) on delete cascade,
  external_event_id text not null,
  external_membership_id text not null,
  event_type text not null check (event_type in ('membership.enrolled', 'membership.cancelled')),
  email text,
  status text not null default 'processing'
    check (status in ('processing', 'processed', 'failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (integration_id, external_event_id)
);

create table if not exists public.membership_enrollments (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.membership_integrations(id) on delete cascade,
  external_membership_id text not null,
  email text,
  status text not null check (status in ('pending', 'active', 'cancelled')),
  updated_at timestamptz not null default now(),
  unique (integration_id, external_membership_id)
);

create index if not exists idx_membership_events_status_updated
  on public.membership_integration_events(status, updated_at);
create index if not exists idx_membership_enrollments_integration_status
  on public.membership_enrollments(integration_id, status);

alter table public.membership_integrations enable row level security;
alter table public.membership_integration_events enable row level security;
alter table public.membership_enrollments enable row level security;

drop policy if exists "Service role manages membership integrations" on public.membership_integrations;
create policy "Service role manages membership integrations"
  on public.membership_integrations for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages membership integration events" on public.membership_integration_events;
create policy "Service role manages membership integration events"
  on public.membership_integration_events for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service role manages membership enrollments" on public.membership_enrollments;
create policy "Service role manages membership enrollments"
  on public.membership_enrollments for all
  to service_role
  using (true)
  with check (true);

revoke all on public.membership_integrations from anon, authenticated;
revoke all on public.membership_integration_events from anon, authenticated;
revoke all on public.membership_enrollments from anon, authenticated;
grant all on public.membership_integrations to service_role;
grant all on public.membership_integration_events to service_role;
grant all on public.membership_enrollments to service_role;

create or replace function public.claim_membership_integration_event(
  p_integration_id uuid,
  p_external_event_id text,
  p_external_membership_id text,
  p_event_type text,
  p_email text
)
returns table(event_id uuid, should_process boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_event public.membership_integration_events%rowtype;
  v_inserted_id uuid;
begin
  insert into public.membership_integration_events (
    integration_id,
    external_event_id,
    external_membership_id,
    event_type,
    email,
    status
  )
  values (
    p_integration_id,
    p_external_event_id,
    p_external_membership_id,
    p_event_type,
    p_email,
    'processing'
  )
  on conflict (integration_id, external_event_id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is not null then
    return query select v_inserted_id, true;
    return;
  end if;

  select *
  into v_event
  from public.membership_integration_events e
  where e.integration_id = p_integration_id
    and e.external_event_id = p_external_event_id
  for update;

  if v_event.status = 'processed'
    or (v_event.status = 'processing' and v_event.updated_at > now() - interval '5 minutes') then
    return query select v_event.id, false;
    return;
  end if;

  update public.membership_integration_events
  set external_membership_id = p_external_membership_id,
      event_type = p_event_type,
      email = p_email,
      status = 'processing',
      updated_at = now()
  where id = v_event.id;

  return query select v_event.id, true;
end;
$$;

revoke all on function public.claim_membership_integration_event(uuid, text, text, text, text)
  from public;
grant execute on function public.claim_membership_integration_event(uuid, text, text, text, text)
  to service_role;
