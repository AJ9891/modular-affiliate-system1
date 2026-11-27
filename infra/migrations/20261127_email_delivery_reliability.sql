alter table public.email_autoresponder_jobs
  add column if not exists idempotency_key text,
  add column if not exists message_type text not null default 'marketing',
  add column if not exists max_attempts integer not null default 5;

alter table public.email_autoresponder_jobs
  drop constraint if exists email_autoresponder_jobs_status_check;
alter table public.email_autoresponder_jobs
  add constraint email_autoresponder_jobs_status_check
  check (status in ('queued', 'sending', 'sent', 'failed', 'cancelled'));

alter table public.email_autoresponder_jobs
  drop constraint if exists email_autoresponder_jobs_message_type_check;
alter table public.email_autoresponder_jobs
  add constraint email_autoresponder_jobs_message_type_check
  check (message_type in ('marketing', 'transactional'));

alter table public.email_autoresponder_jobs
  drop constraint if exists email_autoresponder_jobs_max_attempts_check;
alter table public.email_autoresponder_jobs
  add constraint email_autoresponder_jobs_max_attempts_check
  check (max_attempts between 1 and 10);

create unique index if not exists idx_email_autoresponder_jobs_idempotency
  on public.email_autoresponder_jobs(idempotency_key);
create index if not exists idx_email_autoresponder_jobs_ready
  on public.email_autoresponder_jobs(scheduled_for, created_at)
  where status = 'queued';

create table if not exists public.email_suppressions (
  id uuid primary key default gen_random_uuid(),
  tenant_scope text not null,
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  reason text not null default 'unsubscribed'
    check (reason in ('unsubscribed', 'bounced', 'complaint')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_scope, email)
);

alter table public.email_suppressions enable row level security;
drop policy if exists "Service role manages email suppressions" on public.email_suppressions;
create policy "Service role manages email suppressions"
  on public.email_suppressions for all
  to service_role
  using (true)
  with check (true);

revoke all on public.email_suppressions from anon, authenticated;
grant all on public.email_suppressions to service_role;

drop function if exists public.claim_due_email_autoresponder_jobs(integer);

create or replace function public.claim_due_email_autoresponder_jobs(
  p_limit integer default 50,
  p_job_id uuid default null
)
returns setof public.email_autoresponder_jobs
language sql
security definer
set search_path = public, pg_temp
as $$
  with ready_jobs as (
    select id
    from public.email_autoresponder_jobs
    where status = 'queued'
      and scheduled_for <= now()
      and attempts < max_attempts
      and (p_job_id is null or id = p_job_id)
    order by scheduled_for, created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 50), 200))
  )
  update public.email_autoresponder_jobs as jobs
  set status = 'sending',
      attempts = jobs.attempts + 1,
      updated_at = now()
  from ready_jobs
  where jobs.id = ready_jobs.id
  returning jobs.*;
$$;

revoke all on function public.claim_due_email_autoresponder_jobs(integer, uuid) from public;
grant execute on function public.claim_due_email_autoresponder_jobs(integer, uuid) to service_role;
