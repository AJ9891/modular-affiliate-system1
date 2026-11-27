-- Public tracking may record traffic and lead events, but not authoritative revenue.

alter table public.leads
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists generation_id uuid,
  add column if not exists variant_id text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.clicks
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists generation_id uuid,
  add column if not exists variant_id text;

alter table public.conversions
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists funnel_id uuid references public.funnels(funnel_id) on delete set null,
  add column if not exists generation_id uuid,
  add column if not exists variant_id text,
  add column if not exists is_verified boolean not null default false;

update public.leads l
set user_id = f.user_id
from public.funnels f
where l.funnel_id = f.funnel_id
  and l.user_id is null;

update public.clicks c
set user_id = f.user_id
from public.funnels f
where c.funnel_id = f.funnel_id
  and c.user_id is null;

update public.conversions c
set user_id = f.user_id
from public.funnels f
where c.funnel_id = f.funnel_id
  and c.user_id is null;

create index if not exists idx_conversions_verified_funnel
  on public.conversions(funnel_id, converted_at desc)
  where is_verified = true;

drop policy if exists "Anyone can insert clicks" on public.clicks;
drop policy if exists "Public can track published funnel clicks" on public.clicks;
create policy "Public can track published funnel clicks"
  on public.clicks for insert
  with check (
    user_id is not null
    and exists (
      select 1
      from public.funnels f
      where f.funnel_id = clicks.funnel_id
        and f.user_id = clicks.user_id
        and f.status = 'published'
        and f.active = true
    )
  );

drop policy if exists "System can insert leads" on public.leads;
drop policy if exists "Public can capture leads for published funnels" on public.leads;
create policy "Public can capture leads for published funnels"
  on public.leads for insert
  with check (
    (
      funnel_id is not null
      and user_id is not null
      and exists (
        select 1
        from public.funnels f
        where f.funnel_id = leads.funnel_id
          and f.user_id = leads.user_id
          and f.status = 'published'
          and f.active = true
      )
    )
    or (funnel_id is null and user_id = auth.uid())
  );

drop policy if exists "analytics_events_insert_open" on public.analytics_events;
drop policy if exists "Public can track published funnel events" on public.analytics_events;
create policy "Public can track published funnel events"
  on public.analytics_events for insert
  with check (
    (
      funnel_id is not null
      and user_id is not null
      and exists (
        select 1
        from public.funnels f
        where f.funnel_id = analytics_events.funnel_id
          and f.user_id = analytics_events.user_id
          and f.status = 'published'
          and f.active = true
      )
    )
    or (funnel_id is null and (user_id is null or user_id = auth.uid()))
  );

drop policy if exists "Anyone can insert conversions" on public.conversions;
drop policy if exists "Service role can insert verified conversions" on public.conversions;
create policy "Service role can insert verified conversions"
  on public.conversions for insert
  to service_role
  with check (is_verified = true);

revoke insert on public.conversions from anon, authenticated;
grant insert on public.conversions to service_role;

create or replace function public.record_public_conversion_event(
  p_funnel_id uuid,
  p_click_id uuid,
  p_session_id text,
  p_path text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner_id uuid;
  v_event_id uuid;
begin
  select f.user_id
  into v_owner_id
  from public.funnels f
  where f.funnel_id = p_funnel_id
    and f.status = 'published'
    and f.active = true;

  if v_owner_id is null then
    return null;
  end if;

  if p_click_id is not null and not exists (
    select 1
    from public.clicks c
    where c.click_id = p_click_id
      and c.funnel_id = p_funnel_id
      and c.user_id = v_owner_id
  ) then
    return null;
  end if;

  insert into public.analytics_events (
    user_id,
    funnel_id,
    session_id,
    event_type,
    path,
    metadata,
    occurred_at
  )
  values (
    v_owner_id,
    p_funnel_id,
    left(p_session_id, 255),
    'conversion',
    left(p_path, 500),
    jsonb_build_object('revenue_verified', false),
    now()
  )
  returning event_id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.record_public_conversion_event(uuid, uuid, text, text)
  from public;
grant execute on function public.record_public_conversion_event(uuid, uuid, text, text)
  to anon, authenticated, service_role;

create or replace function public.record_public_download_lead(
  p_download_id uuid,
  p_email text,
  p_funnel_id uuid default null,
  p_generation_id uuid default null,
  p_variant_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner_id uuid;
  v_download_title text;
  v_lead_id uuid;
begin
  select d.user_id, d.title
  into v_owner_id, v_download_title
  from public.downloads d
  where d.id = p_download_id
    and d.is_active = true;

  if v_owner_id is null or p_email is null or length(trim(p_email)) = 0 then
    raise exception 'Active download and email are required';
  end if;

  if p_funnel_id is not null and not exists (
    select 1
    from public.funnels f
    where f.funnel_id = p_funnel_id
      and f.user_id = v_owner_id
      and f.status = 'published'
      and f.active = true
  ) then
    raise exception 'Funnel does not belong to the download owner or is not published';
  end if;

  insert into public.leads (
    email,
    user_id,
    funnel_id,
    generation_id,
    variant_id,
    source,
    metadata,
    created_at,
    updated_at
  )
  values (
    lower(trim(p_email)),
    v_owner_id,
    p_funnel_id,
    p_generation_id,
    p_variant_id,
    'download',
    jsonb_build_object(
      'download_id', p_download_id,
      'download_title', v_download_title
    ),
    now(),
    now()
  )
  returning id into v_lead_id;

  return v_lead_id;
end;
$$;

revoke all on function public.record_public_download_lead(uuid, text, uuid, uuid, text)
  from public;
grant execute on function public.record_public_download_lead(uuid, text, uuid, uuid, text)
  to anon, authenticated, service_role;
