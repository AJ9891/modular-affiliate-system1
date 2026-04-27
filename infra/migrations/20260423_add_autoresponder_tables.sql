-- Built-in autoresponder tables and compatibility bridge away from Sendshark naming.

-- Keep legacy column available for older dashboards/jobs that still read it.
alter table public.users
  add column if not exists sendshark_email text;

-- New provider-agnostic provisioning columns.
alter table public.users
  add column if not exists email_automation_provisioned boolean default false,
  add column if not exists email_automation_email text;

update public.users
set email_automation_provisioned = coalesce(sendshark_provisioned, false)
where email_automation_provisioned is null;

update public.users
set email_automation_email = coalesce(sendshark_email, email)
where email_automation_email is null;

comment on column public.users.email_automation_provisioned is 'Whether built-in email automation was provisioned for the user';
comment on column public.users.email_automation_email is 'Primary email used for built-in automation provisioning';

create table if not exists public.email_automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  trigger text not null check (trigger in ('signup', 'purchase', 'abandoned_cart', 'funnel_entry', 'custom')),
  config jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.email_subscribers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  email text not null,
  name text,
  list_name text not null default 'Launchpad List',
  tags text[] not null default '{}'::text[],
  custom_fields jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'unsubscribed', 'bounced')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, email, list_name)
);

create table if not exists public.email_autoresponder_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  automation_id uuid references public.email_automations(id) on delete set null,
  recipient_email text not null,
  recipient_name text,
  from_email text not null,
  from_name text,
  subject text not null,
  html text not null,
  text text,
  scheduled_for timestamp with time zone not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_email_automations_user_trigger
  on public.email_automations(user_id, trigger)
  where active = true;
create index if not exists idx_email_subscribers_user_email
  on public.email_subscribers(user_id, email);
create index if not exists idx_email_subscribers_list
  on public.email_subscribers(list_name);
create index if not exists idx_email_autoresponder_jobs_due
  on public.email_autoresponder_jobs(status, scheduled_for);
create index if not exists idx_email_autoresponder_jobs_user
  on public.email_autoresponder_jobs(user_id);
create index if not exists idx_email_autoresponder_jobs_automation
  on public.email_autoresponder_jobs(automation_id);

alter table public.email_automations enable row level security;
alter table public.email_subscribers enable row level security;
alter table public.email_autoresponder_jobs enable row level security;

drop policy if exists "Users can manage their own email automations" on public.email_automations;
create policy "Users can manage their own email automations"
  on public.email_automations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view global active email automations" on public.email_automations;
create policy "Users can view global active email automations"
  on public.email_automations for select
  using (user_id is null and active = true);

drop policy if exists "Service role can manage email automations" on public.email_automations;
create policy "Service role can manage email automations"
  on public.email_automations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can manage their own email subscribers" on public.email_subscribers;
create policy "Users can manage their own email subscribers"
  on public.email_subscribers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Service role can manage email subscribers" on public.email_subscribers;
create policy "Service role can manage email subscribers"
  on public.email_subscribers for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can view their own autoresponder jobs" on public.email_autoresponder_jobs;
create policy "Users can view their own autoresponder jobs"
  on public.email_autoresponder_jobs for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage autoresponder jobs" on public.email_autoresponder_jobs;
create policy "Service role can manage autoresponder jobs"
  on public.email_autoresponder_jobs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select, insert, update, delete on public.email_automations to authenticated, service_role;
grant select, insert, update, delete on public.email_subscribers to authenticated, service_role;
grant select, insert, update, delete on public.email_autoresponder_jobs to authenticated, service_role;
