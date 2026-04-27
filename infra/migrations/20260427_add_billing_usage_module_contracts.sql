-- Fill missing Supabase contracts used by runtime APIs:
-- - Billing topups and credit ledger
-- - AI/image usage analytics + admin RPCs
-- - Module activation persistence

-- ---------------------------------------------
-- Module activation persistence
-- ---------------------------------------------
create table if not exists public.user_modules (
  user_id uuid not null references public.users(id) on delete cascade,
  module_id text not null,
  module_name text not null,
  activated_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.user_modules
  add column if not exists module_name text,
  add column if not exists activated_at timestamptz default now(),
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists idx_user_modules_module_id on public.user_modules(module_id);
create index if not exists idx_user_modules_user_active on public.user_modules(user_id, is_active);

alter table public.user_modules enable row level security;

drop policy if exists "Users can read own modules" on public.user_modules;
create policy "Users can read own modules"
  on public.user_modules
  for select
  using (user_id = auth.uid());

drop policy if exists "Users can upsert own modules" on public.user_modules;
create policy "Users can upsert own modules"
  on public.user_modules
  for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update own modules" on public.user_modules;
create policy "Users can update own modules"
  on public.user_modules
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own modules" on public.user_modules;
create policy "Users can delete own modules"
  on public.user_modules
  for delete
  using (user_id = auth.uid());

-- ---------------------------------------------
-- Billing and credit ledger
-- ---------------------------------------------
create table if not exists public.user_credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_credits
  add column if not exists credits integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.topups (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.users(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  credits_added integer not null check (credits_added >= 0),
  stripe_checkout_session text unique,
  stripe_payment_intent text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'canceled')),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.topups
  add column if not exists admin_id uuid references public.users(id) on delete set null,
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists amount numeric(12, 2),
  add column if not exists credits_added integer,
  add column if not exists stripe_checkout_session text,
  add column if not exists stripe_payment_intent text,
  add column if not exists status text default 'pending',
  add column if not exists processed_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists idx_topups_checkout_session on public.topups(stripe_checkout_session) where stripe_checkout_session is not null;
create index if not exists idx_topups_user_id on public.topups(user_id);
create index if not exists idx_topups_admin_id on public.topups(admin_id);
create index if not exists idx_topups_status on public.topups(status);
create index if not exists idx_topups_created_at on public.topups(created_at desc);

create table if not exists public.topup_logs (
  id uuid primary key default gen_random_uuid(),
  topup_id uuid not null references public.topups(id) on delete cascade,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.topup_logs
  add column if not exists topup_id uuid references public.topups(id) on delete cascade,
  add column if not exists event text,
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now();

create index if not exists idx_topup_logs_topup_id on public.topup_logs(topup_id);
create index if not exists idx_topup_logs_created_at on public.topup_logs(created_at desc);

alter table public.user_credits enable row level security;
alter table public.topups enable row level security;
alter table public.topup_logs enable row level security;

drop policy if exists "Users can read own credits" on public.user_credits;
create policy "Users can read own credits"
  on public.user_credits
  for select
  using (user_id = auth.uid());

drop policy if exists "Admins can read credits" on public.user_credits;
create policy "Admins can read credits"
  on public.user_credits
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid() and coalesce(u.is_admin, false)
    )
  );

drop policy if exists "Admins can insert topups" on public.topups;
create policy "Admins can insert topups"
  on public.topups
  for insert
  with check (
    admin_id = auth.uid()
    and exists (
      select 1
      from public.users u
      where u.id = auth.uid() and coalesce(u.is_admin, false)
    )
  );

drop policy if exists "Users and admins can read topups" on public.topups;
create policy "Users and admins can read topups"
  on public.topups
  for select
  using (
    user_id = auth.uid()
    or admin_id = auth.uid()
    or exists (
      select 1
      from public.users u
      where u.id = auth.uid() and coalesce(u.is_admin, false)
    )
  );

drop policy if exists "Service can manage topups" on public.topups;
create policy "Service can manage topups"
  on public.topups
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service can manage credits" on public.user_credits;
create policy "Service can manage credits"
  on public.user_credits
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Service can manage topup logs" on public.topup_logs;
create policy "Service can manage topup logs"
  on public.topup_logs
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users and admins can read topup logs" on public.topup_logs;
create policy "Users and admins can read topup logs"
  on public.topup_logs
  for select
  using (
    exists (
      select 1
      from public.topups t
      where t.id = topup_id
      and (
        t.user_id = auth.uid()
        or t.admin_id = auth.uid()
        or exists (
          select 1
          from public.users u
          where u.id = auth.uid() and coalesce(u.is_admin, false)
        )
      )
    )
  );

-- ---------------------------------------------
-- AI/image usage tracking and admin analytics
-- ---------------------------------------------
create table if not exists public.image_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  prompt text,
  model text,
  provider text,
  cost numeric(12, 6) not null default 0,
  external_id text,
  cached boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  action text,
  created_at timestamptz not null default now()
);

alter table public.image_usage
  add column if not exists user_id uuid references public.users(id) on delete set null,
  add column if not exists prompt text,
  add column if not exists model text,
  add column if not exists provider text,
  add column if not exists cost numeric(12, 6) default 0,
  add column if not exists external_id text,
  add column if not exists cached boolean default false,
  add column if not exists details jsonb default '{}'::jsonb,
  add column if not exists action text,
  add column if not exists created_at timestamptz default now();

create index if not exists idx_image_usage_created_at on public.image_usage(created_at desc);
create index if not exists idx_image_usage_user_id on public.image_usage(user_id);
create index if not exists idx_image_usage_provider on public.image_usage(provider);

alter table public.image_usage enable row level security;

drop policy if exists "Users can read own image usage" on public.image_usage;
create policy "Users can read own image usage"
  on public.image_usage
  for select
  using (user_id = auth.uid());

drop policy if exists "Admins can read all image usage" on public.image_usage;
create policy "Admins can read all image usage"
  on public.image_usage
  for select
  using (
    exists (
      select 1
      from public.users u
      where u.id = auth.uid() and coalesce(u.is_admin, false)
    )
  );

drop policy if exists "Service can manage image usage" on public.image_usage;
create policy "Service can manage image usage"
  on public.image_usage
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can insert own image usage" on public.image_usage;
create policy "Users can insert own image usage"
  on public.image_usage
  for insert
  with check (user_id = auth.uid());

create or replace function public.log_image_usage(
  p_prompt text default null,
  p_model text default null,
  p_provider text default null,
  p_cost numeric default 0,
  p_external_id text default null,
  p_cached boolean default false,
  p_details jsonb default '{}'::jsonb,
  p_action text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_id uuid;
begin
  insert into public.image_usage (
    user_id,
    prompt,
    model,
    provider,
    cost,
    external_id,
    cached,
    details,
    action
  )
  values (
    auth.uid(),
    p_prompt,
    p_model,
    p_provider,
    coalesce(p_cost, 0),
    p_external_id,
    coalesce(p_cached, false),
    coalesce(p_details, '{}'::jsonb),
    p_action
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

create or replace function public.top_ai_users(p_limit integer default 10)
returns table (
  user_id uuid,
  email text,
  requests bigint,
  total_cost numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    iu.user_id,
    u.email,
    count(*)::bigint as requests,
    coalesce(sum(iu.cost), 0)::numeric as total_cost
  from public.image_usage iu
  left join public.users u on u.id = iu.user_id
  group by iu.user_id, u.email
  order by total_cost desc, requests desc
  limit greatest(coalesce(p_limit, 10), 1);
$$;

create or replace view public.usage_summary as
select
  date_trunc('month', created_at)::date as month,
  coalesce(provider, 'unknown') as provider,
  count(*)::bigint as requests,
  coalesce(sum(cost), 0)::numeric as total_cost
from public.image_usage
group by 1, 2
order by 1 desc, 2 asc;

create or replace function public.usage_summary()
returns table (
  month date,
  provider text,
  requests bigint,
  total_cost numeric
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select us.month, us.provider, us.requests, us.total_cost
  from public.usage_summary us;
$$;

-- ---------------------------------------------
-- Topup processing RPC
-- ---------------------------------------------
create or replace function public.apply_topup(
  t_id uuid,
  t_admin uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  topup_record public.topups%rowtype;
begin
  select *
  into topup_record
  from public.topups
  where id = t_id
  for update;

  if not found then
    raise exception 'Topup % not found', t_id;
  end if;

  if t_admin is not null and topup_record.admin_id is not null and topup_record.admin_id <> t_admin then
    raise exception 'Admin mismatch for topup %', t_id;
  end if;

  if topup_record.status = 'succeeded' then
    return true;
  end if;

  insert into public.user_credits (user_id, credits, updated_at)
  values (topup_record.user_id, coalesce(topup_record.credits_added, 0), now())
  on conflict (user_id)
  do update set
    credits = public.user_credits.credits + excluded.credits,
    updated_at = now();

  update public.topups
  set
    status = 'succeeded',
    processed_at = coalesce(processed_at, now()),
    updated_at = now()
  where id = t_id;

  insert into public.topup_logs (topup_id, event, payload)
  values (
    t_id,
    'apply_topup',
    jsonb_build_object('admin_id', t_admin, 'applied_at', now())
  );

  return true;
end;
$$;

grant execute on function public.log_image_usage(text, text, text, numeric, text, boolean, jsonb, text) to authenticated;
grant execute on function public.top_ai_users(integer) to authenticated;
grant execute on function public.usage_summary() to authenticated;
grant execute on function public.apply_topup(uuid, uuid) to service_role;
