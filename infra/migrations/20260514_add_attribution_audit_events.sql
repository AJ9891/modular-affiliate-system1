-- Immutable attribution and payout audit trail
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

alter table public.attribution_audit_events enable row level security;

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
  for each row
  execute function public.prevent_attribution_audit_events_mutation();

drop trigger if exists prevent_attribution_audit_events_delete on public.attribution_audit_events;
create trigger prevent_attribution_audit_events_delete
  before delete on public.attribution_audit_events
  for each row
  execute function public.prevent_attribution_audit_events_mutation();
